const CHAVE_OFERTAS = "painelOfertasPerola";
const CHAVE_CONFIG = "configuracoesOfertasPerola";

let ofertas = carregarOfertas();
let configuracoes = carregarConfiguracoes();

let imagensSelecionadas = [];
let indiceEditando = null;

const abas = document.querySelectorAll(".aba");
const botoesMenu = document.querySelectorAll(".menu-btn");

const listaOfertas = document.getElementById("listaOfertas");
const listaOfertasDashboard = document.getElementById("listaOfertasDashboard");

const modalOferta = document.getElementById("modalOferta");
const formOferta = document.getElementById("formOferta");
const tituloModalOferta = document.getElementById("tituloModalOferta");

const btnNovaOferta = document.getElementById("novaOferta");
const btnNovaOfertaDashboard = document.getElementById("novaOfertaDashboard");
const btnFecharModal = document.getElementById("fecharModal");

const tituloOferta = document.getElementById("tituloOferta");
const slugOferta = document.getElementById("slugOferta");
const tipoOferta = document.getElementById("tipoOferta");
const dataInicio = document.getElementById("dataInicio");
const dataFim = document.getElementById("dataFim");
const prioridadeOferta = document.getElementById("prioridadeOferta");
const corOferta = document.getElementById("corOferta");
const ativoOferta = document.getElementById("ativoOferta");
const ocultarOferta = document.getElementById("ocultarOferta");

const uploadArea = document.getElementById("uploadArea");
const imagensOferta = document.getElementById("imagensOferta");
const previewImagens = document.getElementById("previewImagens");

const camposConfig = {
  tituloSite: document.getElementById("configTituloSite"),
  subtituloSite: document.getElementById("configSubtituloSite"),
  linkGrupo: document.getElementById("configLinkGrupo"),
  bannerPrincipal: document.getElementById("configBannerPrincipal"),
  placeholder: document.getElementById("configPlaceholder"),
  imagemCompartilhamento: document.getElementById("configImagemCompartilhamento"),
  tituloCompartilhamento: document.getElementById("configTituloCompartilhamento"),
  descricaoCompartilhamento: document.getElementById("configDescricaoCompartilhamento")
};

const btnSalvarConfiguracoes = document.getElementById("salvarConfiguracoes");
const mensagemConfig = document.getElementById("mensagemConfig");

function carregarOfertas(){
  const salvas = localStorage.getItem(CHAVE_OFERTAS);

  if(salvas){
    return JSON.parse(salvas);
  }

  return [
    {
      titulo:"Operação Fecha Mês",
      slug:"operacao-fecha-mes",
      tipo:"oferta",
      ativo:true,
      ocultar:false,
      inicioOriginal:"2026-05-29T00:00",
      fimOriginal:"2026-05-31T23:59",
      inicio:"29/05/2026",
      fim:"31/05/2026",
      prioridade:1,
      cor:"#c40000",
      imagens:[]
    },
    {
      titulo:"Quinta Filé",
      slug:"quinta-file",
      tipo:"oferta",
      ativo:true,
      ocultar:false,
      inicioOriginal:"2026-05-21T00:00",
      fimOriginal:"2026-05-21T23:59",
      inicio:"21/05/2026",
      fim:"21/05/2026",
      prioridade:2,
      cor:"#c40000",
      imagens:[]
    },
    {
      titulo:"Seleção de Ofertas",
      slug:"selecao-de-ofertas",
      tipo:"oferta",
      ativo:true,
      ocultar:false,
      inicioOriginal:"2026-05-21T00:00",
      fimOriginal:"2026-05-24T23:59",
      inicio:"21/05/2026",
      fim:"24/05/2026",
      prioridade:3,
      cor:"#c40000",
      imagens:[]
    }
  ];
}

function salvarOfertas(){
  localStorage.setItem(
    CHAVE_OFERTAS,
    JSON.stringify(ofertas)
  );
}

function carregarConfiguracoes(){
  const salvas = localStorage.getItem(CHAVE_CONFIG);

  if(salvas){
    return JSON.parse(salvas);
  }

  return {
    tituloSite:"Escolha uma categoria e confira nossas promoções",
    subtituloSite:"",
    linkGrupo:"https://chat.whatsapp.com/HCEt8q7P5vgDIPVq8B68Du?mode=gi_t",
    bannerPrincipal:"img/banner.jpg",
    placeholder:"img/placeholder.png",
    imagemCompartilhamento:"img/preview-whatsapp.jpg",
    tituloCompartilhamento:"Ofertas Pérola Supermercado",
    descricaoCompartilhamento:"Confira as promoções disponíveis no Pérola Supermercado."
  };
}

function salvarConfiguracoesLocal(){
  localStorage.setItem(
    CHAVE_CONFIG,
    JSON.stringify(configuracoes)
  );
}

function trocarAba(nomeAba){
  abas.forEach(aba => {
    aba.classList.remove("ativa");
  });

  botoesMenu.forEach(botao => {
    botao.classList.remove("active");
  });

  document
    .getElementById("aba-" + nomeAba)
    .classList.add("ativa");

  document
    .querySelector(`[data-aba="${nomeAba}"]`)
    .classList.add("active");
}

function gerarSlug(texto){
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/ç/g,"c")
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-+|-+$/g,"");
}

function calcularStatus(inicioValor, fimValor, ativo){
  if(!ativo){
    return "Encerrada";
  }

  if(!inicioValor || !fimValor){
    return "Encerrada";
  }

  const agora = new Date();
  const inicio = new Date(inicioValor);
  const fim = new Date(fimValor);

  if(agora < inicio){
    return "Futura";
  }

  if(agora > fim){
    return "Encerrada";
  }

  return "Ativa";
}

function formatarDataPainel(valor){
  if(!valor){
    return "-";
  }

  const data = new Date(valor);

  return data.toLocaleDateString("pt-BR");
}

function atualizarCards(){
  const status = ofertas.map(oferta => {
    return calcularStatus(
      oferta.inicioOriginal,
      oferta.fimOriginal,
      oferta.ativo
    );
  });

  document.getElementById("totalOfertas").textContent =
    ofertas.length;

  document.getElementById("ativas").textContent =
    status.filter(item => item === "Ativa").length;

  document.getElementById("futuras").textContent =
    status.filter(item => item === "Futura").length;

  document.getElementById("encerradas").textContent =
    status.filter(item => item === "Encerrada").length;
}

function gerarLinhaOferta(oferta, index, modoDashboard = false){
  const statusAtual = calcularStatus(
    oferta.inicioOriginal,
    oferta.fimOriginal,
    oferta.ativo
  );

  let classeStatus = "ativa";

  if(statusAtual === "Futura"){
    classeStatus = "futura";
  }

  if(statusAtual === "Encerrada"){
    classeStatus = "encerrada";
  }

  const tipoAtual = oferta.tipo || "oferta";

  if(modoDashboard){
    return `
      <tr>
        <td>${oferta.titulo}</td>

        <td>
          <span class="status ${classeStatus}">
            ${statusAtual}
          </span>
        </td>

        <td>
          <span class="tipo-badge ${tipoAtual}">
            ${tipoAtual === "banner" ? "Banner" : "Oferta"}
          </span>
        </td>

        <td>${oferta.inicio}</td>
        <td>${oferta.fim}</td>

        <td>
          <button class="btn-editar" onclick="editarOferta(${index})">
            Editar
          </button>
        </td>
      </tr>
    `;
  }

  return `
    <tr>
      <td>${oferta.titulo}</td>

      <td>
        <span class="status ${classeStatus}">
          ${statusAtual}
        </span>
      </td>

      <td>
        <span class="tipo-badge ${tipoAtual}">
          ${tipoAtual === "banner" ? "Banner" : "Oferta"}
        </span>
      </td>

      <td>${oferta.prioridade || 999}</td>
      <td>${oferta.inicio}</td>
      <td>${oferta.fim}</td>

      <td>
        <button class="btn-editar" onclick="editarOferta(${index})">
          Editar
        </button>

        <button class="btn-excluir" onclick="excluirOferta(${index})">
          Excluir
        </button>
      </td>
    </tr>
  `;
}

function renderizarOfertas(){
  ofertas.sort((a,b) => {
    return Number(a.prioridade || 999) - Number(b.prioridade || 999);
  });

  listaOfertas.innerHTML = "";
  listaOfertasDashboard.innerHTML = "";

  ofertas.forEach((oferta, index) => {
    listaOfertas.innerHTML += gerarLinhaOferta(oferta, index, false);

    if(index < 5){
      listaOfertasDashboard.innerHTML += gerarLinhaOferta(oferta, index, true);
    }
  });

  atualizarCards();
}

function abrirModalNovaOferta(){
  indiceEditando = null;

  tituloModalOferta.textContent = "Nova Oferta";

  formOferta.reset();

  slugOferta.value = "";
  tipoOferta.value = "oferta";
  prioridadeOferta.value = 999;
  corOferta.value = "#c40000";
  ativoOferta.checked = true;
  ocultarOferta.checked = false;

  imagensSelecionadas = [];
  previewImagens.innerHTML = "";

  modalOferta.classList.add("ativo");
}

function fecharModalOferta(){
  modalOferta.classList.remove("ativo");

  indiceEditando = null;

  formOferta.reset();

  imagensSelecionadas = [];
  previewImagens.innerHTML = "";
}

function editarOferta(index){
  const oferta = ofertas[index];

  indiceEditando = index;

  tituloModalOferta.textContent = "Editar Oferta";

  tituloOferta.value = oferta.titulo || "";
  slugOferta.value = oferta.slug || gerarSlug(oferta.titulo || "");
  tipoOferta.value = oferta.tipo || "oferta";

  dataInicio.value = oferta.inicioOriginal || "";
  dataFim.value = oferta.fimOriginal || "";

  prioridadeOferta.value = oferta.prioridade || 999;
  corOferta.value = oferta.cor || "#c40000";

  ativoOferta.checked = oferta.ativo !== false;
  ocultarOferta.checked = oferta.ocultar || false;

  imagensSelecionadas = oferta.imagens || [];

  renderizarPreviewImagens();

  modalOferta.classList.add("ativo");
}

function excluirOferta(index){
  const oferta = ofertas[index];

  const confirmar = confirm(
    "Tem certeza que deseja excluir a oferta: " + oferta.titulo + "?"
  );

  if(!confirmar){
    return;
  }

  ofertas.splice(index,1);

  salvarOfertas();
  renderizarOfertas();
}

function arquivoParaBase64(arquivo){
  return new Promise((resolve,reject) => {
    const leitor = new FileReader();

    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = reject;

    leitor.readAsDataURL(arquivo);
  });
}

async function adicionarImagens(arquivos){
  const novosArquivos = Array.from(arquivos).filter(arquivo => {
    return arquivo.type && arquivo.type.startsWith("image/");
  });

  for(const arquivo of novosArquivos){
    const base64 = await arquivoParaBase64(arquivo);

    imagensSelecionadas.push({
      nome: arquivo.name,
      url: base64
    });
  }

  renderizarPreviewImagens();
}

function renderizarPreviewImagens(){
  previewImagens.innerHTML = "";

  imagensSelecionadas.forEach((imagem,index) => {
    const url = typeof imagem === "string"
      ? imagem
      : imagem.url;

    const item = document.createElement("div");

    item.className = "preview-item";

    item.innerHTML = `
      <img src="${url}" alt="Imagem da oferta">

      <span>${index + 1}</span>

      <button type="button" onclick="removerImagem(${index})">
        ×
      </button>
    `;

    previewImagens.appendChild(item);
  });
}

function removerImagem(index){
  imagensSelecionadas.splice(index,1);
  renderizarPreviewImagens();
}

function preencherConfiguracoes(){
  camposConfig.tituloSite.value = configuracoes.tituloSite || "";
  camposConfig.subtituloSite.value = configuracoes.subtituloSite || "";
  camposConfig.linkGrupo.value = configuracoes.linkGrupo || "";
  camposConfig.bannerPrincipal.value = configuracoes.bannerPrincipal || "";
  camposConfig.placeholder.value = configuracoes.placeholder || "";
  camposConfig.imagemCompartilhamento.value = configuracoes.imagemCompartilhamento || "";
  camposConfig.tituloCompartilhamento.value = configuracoes.tituloCompartilhamento || "";
  camposConfig.descricaoCompartilhamento.value = configuracoes.descricaoCompartilhamento || "";
}

function salvarConfiguracoesPainel(){
  configuracoes = {
    tituloSite: camposConfig.tituloSite.value,
    subtituloSite: camposConfig.subtituloSite.value,
    linkGrupo: camposConfig.linkGrupo.value,
    bannerPrincipal: camposConfig.bannerPrincipal.value,
    placeholder: camposConfig.placeholder.value,
    imagemCompartilhamento: camposConfig.imagemCompartilhamento.value,
    tituloCompartilhamento: camposConfig.tituloCompartilhamento.value,
    descricaoCompartilhamento: camposConfig.descricaoCompartilhamento.value
  };

  salvarConfiguracoesLocal();

  mensagemConfig.textContent =
    "Configurações salvas com sucesso.";

  mensagemConfig.classList.add("ativo");

  setTimeout(() => {
    mensagemConfig.classList.remove("ativo");
  },3000);
}

botoesMenu.forEach(botao => {
  botao.addEventListener("click", () => {
    trocarAba(botao.dataset.aba);
  });
});

btnNovaOferta.addEventListener("click", abrirModalNovaOferta);
btnNovaOfertaDashboard.addEventListener("click", abrirModalNovaOferta);

btnFecharModal.addEventListener("click", fecharModalOferta);

modalOferta.addEventListener("click", evento => {
  if(evento.target === modalOferta){
    fecharModalOferta();
  }
});

tituloOferta.addEventListener("input", () => {
  slugOferta.value = gerarSlug(tituloOferta.value);
});

formOferta.addEventListener("submit", evento => {
  evento.preventDefault();

  const ofertaSalva = {
    titulo: tituloOferta.value,
    slug: slugOferta.value,
    tipo: tipoOferta.value,
    ativo: ativoOferta.checked,
    ocultar: ocultarOferta.checked,
    inicioOriginal: dataInicio.value,
    fimOriginal: dataFim.value,
    inicio: formatarDataPainel(dataInicio.value),
    fim: formatarDataPainel(dataFim.value),
    prioridade: prioridadeOferta.value || 999,
    cor: corOferta.value || "#c40000",
    imagens: imagensSelecionadas
  };

  if(indiceEditando !== null){
    ofertas[indiceEditando] = ofertaSalva;
  } else {
    ofertas.push(ofertaSalva);
  }

  salvarOfertas();
  renderizarOfertas();
  fecharModalOferta();
});

uploadArea.addEventListener("click", () => {
  imagensOferta.click();
});

imagensOferta.addEventListener("change", evento => {
  adicionarImagens(evento.target.files);
});

uploadArea.addEventListener("dragover", evento => {
  evento.preventDefault();
  uploadArea.classList.add("ativo");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("ativo");
});

uploadArea.addEventListener("drop", evento => {
  evento.preventDefault();
  uploadArea.classList.remove("ativo");
  adicionarImagens(evento.dataTransfer.files);
});

btnSalvarConfiguracoes.addEventListener(
  "click",
  salvarConfiguracoesPainel
);

preencherConfiguracoes();
renderizarOfertas();
