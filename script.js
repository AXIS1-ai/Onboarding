const AXIS_WHATSAPP = "5516997424912";
const STORAGE_KEY = "axis1_onboarding_draft_v1";
const $ = (id) => document.getElementById(id);
const steps = Array.from(document.querySelectorAll(".step"));
let currentStep = 1;
let lastSummary = "";

function toast(message){
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3200);
}

function collectData(){
  const form = $("onboardingForm");
  const data = {};
  Array.from(form.elements).forEach(el => {
    if(!el.name) return;
    if(el.type === "checkbox"){
      if(!data[el.name]) data[el.name] = [];
      if(el.checked) data[el.name].push(el.value);
      return;
    }
    data[el.name] = el.value.trim();
  });
  data.geradoEm = new Date().toLocaleString("pt-BR");
  return data;
}

function saveDraft(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collectData()));
}

function loadDraft(){
  try{
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    Object.entries(data).forEach(([key, value]) => {
      if(key === "objetivos" && Array.isArray(value)){
        value.forEach(v => {
          const el = Array.from(document.querySelectorAll('input[name="objetivos"]')).find(input => input.value === v);
          if(el) el.checked = true;
        });
        return;
      }
      const el = document.querySelector(`[name="${key}"]`);
      if(el) el.value = value;
    });
  }catch{}
}

function updateStep(){
  steps.forEach(step => step.classList.toggle("active", Number(step.dataset.step) === currentStep));
  const active = steps[currentStep - 1];
  $("stepLabel").textContent = `Etapa ${currentStep} de ${steps.length}`;
  $("stepTitle").textContent = active.dataset.title;
  $("progressFill").style.width = `${(currentStep / steps.length) * 100}%`;
  $("prevBtn").disabled = currentStep === 1;
  $("prevBtn").style.opacity = currentStep === 1 ? ".45" : "1";
  $("nextBtn").classList.toggle("hidden", currentStep === steps.length);
  $("finishBtn").classList.toggle("hidden", currentStep !== steps.length);
  window.scrollTo({top:0, behavior:"smooth"});
}

function validateCurrentStep(){
  const active = steps[currentStep - 1];
  const required = Array.from(active.querySelectorAll("[required]"));
  for(const input of required){
    if(!input.value.trim()){
      input.focus();
      toast("Preencha os campos obrigatórios antes de continuar.");
      return false;
    }
  }
  const email = $("email").value.trim();
  if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    $("email").focus();
    toast("Informe um e-mail válido.");
    return false;
  }
  return true;
}

function formatLine(label, value){
  if(Array.isArray(value)) value = value.length ? value.join(", ") : "-";
  return `${label}: ${value || "-"}`;
}

function buildSummary(data){
  return `ONBOARDING DE CLIENTE — AXIS 1

DADOS DA EMPRESA
${formatLine("Empresa / marca", data.empresa)}
${formatLine("Responsável", data.responsavel)}
${formatLine("CNPJ / CPF", data.documento)}
${formatLine("Segmento", data.segmento)}
${formatLine("WhatsApp", data.whatsapp)}
${formatLine("E-mail", data.email)}

PRESENÇA DIGITAL
${formatLine("Instagram", data.instagram)}
${formatLine("Site", data.site)}
${formatLine("Google Meu Negócio", data.google)}
${formatLine("LinkedIn / outro canal", data.linkedin)}

MARCA E IDENTIDADE
${formatLine("Cores principais", data.cores)}
${formatLine("Fontes / estilo visual", data.fontes)}
${formatLine("Logo / arquivos", data.logo)}
${formatLine("Referências visuais", data.referenciasVisuais)}
${formatLine("O que não deve parecer", data.naoParecer)}

PÚBLICO E POSICIONAMENTO
${formatLine("Cliente ideal", data.clienteIdeal)}
${formatLine("Diferencial", data.diferencial)}
${formatLine("Produtos / serviços", data.servicos)}
${formatLine("Ticket médio", data.ticket)}

OBJETIVOS
${formatLine("Prioridades", data.objetivos)}
${formatLine("Objetivo principal", data.objetivoPrincipal)}

CONCORRENTES E REFERÊNCIAS
${formatLine("Concorrentes", data.concorrentes)}
${formatLine("Marcas que admira", data.marcasAdmira)}

ACESSOS E MATERIAIS
${formatLine("Envio de acessos", data.envioAcessos)}
${formatLine("Pasta de materiais", data.pastaMateriais)}
${formatLine("Fotos profissionais", data.fotosProfissionais)}
${formatLine("Responsável por aprovações", data.responsavelAprovacao)}

OBSERVAÇÕES
${formatLine("Observações finais", data.observacoes)}

Gerado em: ${data.geradoEm}`;
}

function downloadFile(filename, content, type="text/plain"){
  const blob = new Blob([content], {type});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function finishOnboarding(e){
  e.preventDefault();
  if(!validateCurrentStep()) return;
  const data = collectData();
  lastSummary = buildSummary(data);
  $("summaryOutput").textContent = lastSummary;
  $("resultPanel").classList.remove("hidden");
  $("resultPanel").scrollIntoView({behavior:"smooth", block:"start"});
  saveDraft();
  toast("Onboarding gerado com sucesso.");
}

function exportJson(){
  const data = collectData();
  const name = (data.empresa || "cliente").toLowerCase().replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"");
  downloadFile(`onboarding-axis1-${name || "cliente"}.json`, JSON.stringify(data, null, 2), "application/json");
  toast("Arquivo JSON exportado.");
}

function downloadTxt(){
  const content = lastSummary || buildSummary(collectData());
  const data = collectData();
  const name = (data.empresa || "cliente").toLowerCase().replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"");
  downloadFile(`onboarding-axis1-${name || "cliente"}.txt`, content, "text/plain");
}

function sendWhatsapp(){
  const content = lastSummary || buildSummary(collectData());
  const msg = encodeURIComponent(content);
  window.open(`https://wa.me/${AXIS_WHATSAPP}?text=${msg}`, "_blank");
}

function copySummary(){
  const content = lastSummary || buildSummary(collectData());
  navigator.clipboard.writeText(content).then(
    () => toast("Resumo copiado."),
    () => toast("Não foi possível copiar automaticamente.")
  );
}

function resetForm(){
  if(!confirm("Deseja limpar o onboarding preenchido?")) return;
  $("onboardingForm").reset();
  localStorage.removeItem(STORAGE_KEY);
  $("resultPanel").classList.add("hidden");
  lastSummary = "";
  currentStep = 1;
  updateStep();
  toast("Formulário limpo.");
}

$("nextBtn").addEventListener("click", () => {
  if(!validateCurrentStep()) return;
  saveDraft();
  currentStep = Math.min(currentStep + 1, steps.length);
  updateStep();
});

$("prevBtn").addEventListener("click", () => {
  saveDraft();
  currentStep = Math.max(currentStep - 1, 1);
  updateStep();
});

$("onboardingForm").addEventListener("submit", finishOnboarding);
$("exportJson").addEventListener("click", exportJson);
$("downloadTxt").addEventListener("click", downloadTxt);
$("sendWhatsapp").addEventListener("click", sendWhatsapp);
$("copySummary").addEventListener("click", copySummary);
$("resetForm").addEventListener("click", resetForm);

document.querySelectorAll("input, textarea, select").forEach(el => {
  el.addEventListener("input", saveDraft);
  el.addEventListener("change", saveDraft);
});

loadDraft();
updateStep();
