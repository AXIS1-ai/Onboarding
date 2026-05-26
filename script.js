const STORAGE_KEY = "axis1_onboarding_v2";
const AXIS_WHATSAPP = "5516997424912";
const steps = Array.from(document.querySelectorAll(".form-step"));
const menuSteps = Array.from(document.querySelectorAll(".step"));
let current = 0;

const $ = (id) => document.getElementById(id);

function toast(msg){
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2500);
}

function collect(){
  const data = {};
  const form = $("onboardingForm");
  Array.from(form.elements).forEach(el=>{
    if(!el.name) return;
    if(el.type === "checkbox"){
      if(!data[el.name]) data[el.name] = [];
      if(el.checked) data[el.name].push(el.value);
      return;
    }
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
      if(k === "objetivos" && Array.isArray(v)){
        v.forEach(val=>{
          const el = Array.from(document.querySelectorAll('input[name="objetivos"]')).find(i=>i.value===val);
          if(el) el.checked = true;
        });
      } else {
        const el = document.querySelector(`[name="${k}"]`);
        if(el) el.value = v;
      }
    });
  }catch(e){}
}

function validate(){
  const required = Array.from(steps[current].querySelectorAll("[required]"));
  for(const input of required){
    if(!input.value.trim()){
      input.focus();
      toast("Preencha os campos obrigatórios.");
      return false;
    }
  }
  return true;
}

function update(){
  steps.forEach((s,i)=>s.classList.toggle("active", i===current));
  menuSteps.forEach((s,i)=>s.classList.toggle("active", i===current));
  $("stepCounter").textContent = `Etapa ${current+1} de ${steps.length}`;
  $("stepName").textContent = steps[current].dataset.title;
  $("progressFill").style.width = `${((current+1)/steps.length)*100}%`;
  $("prevBtn").style.visibility = current === 0 ? "hidden" : "visible";
  $("nextBtn").classList.toggle("hidden", current === steps.length-1);
  $("finishBtn").classList.toggle("hidden", current !== steps.length-1);
}

function summaryText(){
  const d = collect();
  return `ONBOARDING AXIS 1

DADOS DA EMPRESA
Empresa: ${d.empresa || "-"}
Responsável: ${d.responsavel || "-"}
Documento: ${d.documento || "-"}
Área: ${d.area || "-"}
WhatsApp: ${d.whatsapp || "-"}
E-mail: ${d.email || "-"}
Segmento: ${d.segmento || "-"}
Cidade: ${d.cidade || "-"}
Tempo de mercado: ${d.tempo || "-"}
Faturamento: ${d.faturamento || "-"}

IDENTIDADE VISUAL
Cores: ${d.cores || "-"}
Estilo: ${d.estilo || "-"}
Logo / arquivos: ${d.logo || "-"}
O que não deve parecer: ${d.naoParecer || "-"}

MERCADO E CONCORRÊNCIA
Concorrentes: ${d.concorrentes || "-"}
Marcas que admira: ${d.marcas || "-"}

OBJETIVOS
Objetivos: ${(d.objetivos || []).join(", ") || "-"}
Objetivo principal: ${d.objetivoPrincipal || "-"}

ACESSOS E CONTATOS
Envio de acessos: ${d.envioAcessos || "-"}
Responsável por aprovações: ${d.responsavelAprovacao || "-"}
Instagram: ${d.instagram || "-"}
Site: ${d.site || "-"}

REFERÊNCIAS
Referências visuais: ${d.referenciasVisuais || "-"}
Pasta de materiais: ${d.pastaMateriais || "-"}

INFORMAÇÕES ADICIONAIS
Serviços principais: ${d.servicos || "-"}
Cliente ideal: ${d.clienteIdeal || "-"}
Observações: ${d.observacoes || "-"}

Gerado em: ${new Date().toLocaleString("pt-BR")}`;
}

function download(filename, content){
  const blob = new Blob([content], {type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

$("nextBtn").onclick = () => {
  if(!validate()) return;
  save();
  current = Math.min(current+1, steps.length-1);
  update();
};

$("prevBtn").onclick = () => {
  save();
  current = Math.max(current-1, 0);
  update();
};

$("onboardingForm").onsubmit = (e) => {
  e.preventDefault();
  if(!validate()) return;
  save();
  $("summary").textContent = summaryText();
  toast("Resumo gerado.");
};

$("copyBtn").onclick = () => navigator.clipboard.writeText(summaryText()).then(()=>toast("Resumo copiado."));
$("downloadBtn").onclick = () => download("onboarding-axis1.txt", summaryText());
$("whatsappBtn").onclick = () => window.open(`https://wa.me/${AXIS_WHATSAPP}?text=${encodeURIComponent(summaryText())}`,"_blank");

document.querySelectorAll("input,textarea,select").forEach(el=>{
  el.addEventListener("input", save);
  el.addEventListener("change", save);
});

load();
update();
