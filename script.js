const AXIS_WHATSAPP = "5516997424912";
const STORAGE_KEY = "axis1_onboarding_simples_v1";
const form = document.getElementById("onboardingForm");
const result = document.getElementById("result");
const summary = document.getElementById("summary");
const toast = document.getElementById("toast");

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2500);
}

function collect(){
  const data = {};
  Array.from(form.elements).forEach(el=>{
    if(!el.name) return;
    data[el.name] = el.value || "";
  });
  return data;
}

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collect()));
}

function load(){
  try{
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    Object.entries(data).forEach(([k,v])=>{
      const el = form.elements[k];
      if(el) el.value = v;
    });
  }catch(e){}
}


function hasRequiredData(){
  const d = collect();
  return Boolean((d.nome || "").trim() && (d.email || "").trim() && (d.whatsapp || "").trim() && (d.empresa || "").trim());
}

function ensureReady(){
  if(!hasRequiredData()){
    showToast("Finalize o onboarding preenchendo os campos obrigatórios antes de usar essa opção.");
    return false;
  }
  return true;
}

function buildSummary(){
  const d = collect();
  return `ONBOARDING AXIS 1

Nome: ${d.nome || "-"}
E-mail: ${d.email || "-"}
WhatsApp: ${d.whatsapp || "-"}
Empresa / Marca: ${d.empresa || "-"}
Site / Instagram: ${d.site || "-"}
Segmento: ${d.segmento || "-"}
Objetivo principal: ${d.objetivo || "-"}

Gerado em: ${new Date().toLocaleString("pt-BR")}`;
}

function downloadTxt(){
  const blob = new Blob([buildSummary()], {type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "onboarding-axis1.txt";
  a.click();
  URL.revokeObjectURL(a.href);
}

form.addEventListener("input", save);

form.addEventListener("submit", e=>{
  e.preventDefault();
  save();
  summary.textContent = buildSummary();
  result.classList.remove("hidden");
  const finalActions = document.getElementById("finalActions");
  if(finalActions) finalActions.classList.remove("hidden");
  result.scrollIntoView({behavior:"smooth"});
  showToast("Onboarding gerado com sucesso.");
});

document.getElementById("copyBtn").onclick = () => {
  if(!ensureReady()) return;
  navigator.clipboard.writeText(buildSummary()).then(()=>showToast("Resumo copiado."));
};

document.getElementById("downloadBtn").onclick = () => { if(!ensureReady()) return; downloadTxt(); };

document.getElementById("whatsappBtn").onclick = () => {
  if(!ensureReady()) return;
  window.open(`https://wa.me/${AXIS_WHATSAPP}?text=${encodeURIComponent(buildSummary())}`, "_blank");
};

load();
