/* =========================================
   CONFIGURAÇÕES INICIAIS
========================================= */

const API_OFERTAS = "/api/ofertas";
const API_CONFIGURACOES = "/api/configuracoes";

let CONFIG_SITE = {
  titulo: "Escolha uma categoria e confira nossas promoções",
  subtitulo: "",
  bannerPadrao: "img/banner.jpg",
  placeholder: "img/placeholder.png",
  linkGrupo: "#"
};

/* =========================================
   VARIÁVEIS GERAIS
========================================= */

let OFERTAS_ATIVAS = {};
let BANNER_ATIVO = "";
let categoriaAtual = "";
let paginaAtual = 0;

/* ===== ZOOM ===== */
let escalaZoom = 1;
let posicaoX = 0;
let posicaoY = 0;

/* ===== SWIPE ===== */
let inicioToqueX = 0;
let fimToqueX = 0;

/* ===== PINCH ===== */
let distanciaInicialPinch = 0;
let escalaInicialPinch = 1;

/* ===== ARRASTE ===== */
let inicioArrasteX = 0;
let inicioArrasteY = 0;
let arrastando = false;

/* =========================================
   ELEMENTOS DOM
========================================= */

const abas = document.getElementById("abas");
const tituloCategoria = document.getElementById("tituloCategoria");
const imagemOferta = document.getElementById("imagemOferta");
const contador = document.getElementById("contador");
const miniaturas = document.getElementById("miniaturas");
const btnAnterior = document.getElementById("btnAnterior");
const btnProximo = document.getElementById("btnProximo");
const bannerTopo = document.getElementById("bannerTopo");
const semOfertas = document.getElementById("semOfertas");

/* ===== ZOOM ===== */
const modalZoom = document.getElementById("modalZoom");
const imagemZoom = document.getElementById("imagemZoom");
const btnFecharZoom = document.getElementById("btnFecharZoom");
const btnMaisZoom = document.getElementById("btnMaisZoom");
const btnMenosZoom = document.getElementById("btnMenosZoom");
const btnResetZoom = document.getElementById("btnResetZoom");
const btnTelaCheia = document.getElementById("btnTelaCheia");
const btnTopo = document.getElementById("btnTopo");

const linkGrupoFlutuante = document.getElementById("linkGrupoFlutuante");
const linkSemOfertas = document.getElementById("linkSemOfertas");
const grupoFlutuante = document.getElementById("grupoFlutuante");
const btnMinimizarGrupo = document.getElementById("btnMinimizarGrupo");
const btnAbrirGrupo = document.getElementById("btnAbrirGrupo");

linkSemOfertas.href = CONFIG_SITE.linkGrupo;

/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function normalizarTexto(texto) {
  return String(texto || "").trim().toLowerCase();
}

function valorEhSim(valor) {
  return normalizarTexto(valor) === "sim";
}

function valorEhNao(valor) {
  const texto = normalizarTexto(valor);
  return texto === "não" || texto === "nao" || texto === "";
}

function converterData(valor) {
  if (!valor) {
    return null;
  }

  const texto = String(valor).trim();

  if (texto.includes("T")) {
    return new Date(texto);
  }

  if (texto.includes("/")) {
    const partes = texto.split("/");

    const dia = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const ano = Number(partes[2]);

    return new Date(ano, mes, dia);
  }

  return new Date(texto);
}

function converterDataFim(valor) {
  const data = converterData(valor);

  if (!data) {
    return null;
  }

  if (!String(valor).includes("T")) {
    data.setHours(23, 59, 59, 999);
  }

  return data;
}

function estaDentroDoPeriodo(inicio, fim) {
  const agora = new Date();
  const dataInicio = converterData(inicio);
  const dataFim = converterDataFim(fim);

  if (!dataInicio || !dataFim) {
    return false;
  }

  return agora >= dataInicio && agora <= dataFim;
}

function aplicarPlaceholderNaImagem(elemento) {
  elemento.onerror = () => {
    elemento.onerror = null;
    elemento.src = CONFIG_SITE.placeholder;
  };
}

/* =========================================
   CARREGAR DADOS DA API
========================================= */
async function carregarConfiguracoesDaApi() {
  const resposta = await fetch(API_CONFIGURACOES);
  const config = await resposta.json();

  if (!resposta.ok) {
    throw new Error("Erro ao carregar configurações");
  }

  CONFIG_SITE = {
    titulo: config.tituloSite || CONFIG_SITE.titulo,
    subtitulo: config.subtituloSite || "",
    bannerPadrao: config.bannerPrincipal || CONFIG_SITE.bannerPadrao,
    placeholder: config.placeholder || CONFIG_SITE.placeholder,
    linkGrupo: config.linkGrupo || CONFIG_SITE.linkGrupo
  };

  document.getElementById("tituloSite").textContent =
    CONFIG_SITE.titulo;

  document.getElementById("subtituloSite").textContent =
    CONFIG_SITE.subtitulo;

  document.getElementById("linkGrupoFlutuante").href =
    CONFIG_SITE.linkGrupo;

  document.getElementById("linkSemOfertas").href =
    CONFIG_SITE.linkGrupo;
}

async function carregarDadosDaApi() {
  const resposta = await fetch(API_OFERTAS);
  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error("Erro ao carregar ofertas");
  }

  const parametros = new URLSearchParams(window.location.search);
  const idPreview = parametros.get("id");
  const slugPreview = parametros.get("oferta");

  const ofertas = {};
  let banner = "";

  dados.forEach((item) => {
    const categoria = item.titulo;
    const inicio = item.inicioOriginal;
    const fim = item.fimOriginal;
    const imagens = item.imagens || [];
    const ativo = item.ativo;
    const ocultar = item.ocultar;
    const tipo = normalizarTexto(item.tipo || "oferta");
    const prioridade = Number(item.prioridade || 999);
    const cor = item.cor || "";

    const ehPreviewDireto =
      (idPreview && String(item.id) === String(idPreview)) ||
      (slugPreview && String(item.slug) === String(slugPreview));

    if (!ehPreviewDireto) {
      if (!ativo) return;
      if (ocultar) return;
      if (!inicio || !fim) return;
      if (!estaDentroDoPeriodo(inicio, fim)) return;
    }

    if (tipo === "banner") {
      if (imagens.length > 0 && !banner) {
        banner = imagens[0];
      }

      return;
    }

    if (!categoria || imagens.length === 0) {
      return;
    }

    ofertas[categoria] = {
      id: item.id,
      slug: item.slug,
      inicio,
      fim,
      imagens,
      prioridade,
      cor
    };
  });

  const ofertasOrdenadas = Object.entries(ofertas)
    .sort((a, b) => a[1].prioridade - b[1].prioridade)
    .reduce((objetoFinal, [nome, dadosOferta]) => {
      objetoFinal[nome] = dadosOferta;
      return objetoFinal;
    }, {});

  return {
    ofertas: ofertasOrdenadas,
    banner
  };
}

/* =========================================
   INICIAR SITE
========================================= */

async function iniciarSite() {
  try {
    await carregarConfiguracoesDaApi();

const dadosApi = await carregarDadosDaApi();

OFERTAS_ATIVAS = dadosApi.ofertas;
BANNER_ATIVO = dadosApi.banner;

    if (BANNER_ATIVO) {
      aplicarPlaceholderNaImagem(bannerTopo);
      bannerTopo.src = BANNER_ATIVO;
    } else {
      aplicarPlaceholderNaImagem(bannerTopo);
      bannerTopo.src = CONFIG_SITE.bannerPadrao;
    }
  } catch (erro) {
    console.error("Erro ao carregar planilha:", erro);
    OFERTAS_ATIVAS = {};

    aplicarPlaceholderNaImagem(bannerTopo);
    bannerTopo.src = CONFIG_SITE.bannerPadrao;
  }

  categoriaAtual = Object.keys(OFERTAS_ATIVAS)[0];

  if (!categoriaAtual) {
    categoriaAtual = "Sem ofertas";
    OFERTAS_ATIVAS[categoriaAtual] = [];
  }

  abrirOfertaPelaUrl();
criarAbas();
atualizarCarrossel();
}

/* =========================================
   FORMATAR PERÍODO
========================================= */

function formatarPeriodo(inicio, fim) {
  const dataInicio = converterData(inicio);
  const dataFim = converterDataFim(fim);

  if (!dataInicio || !dataFim) {
    return "";
  }

  const diaInicio = String(dataInicio.getDate()).padStart(2, "0");
  const mesInicio = String(dataInicio.getMonth() + 1).padStart(2, "0");

  const diaFim = String(dataFim.getDate()).padStart(2, "0");
  const mesFim = String(dataFim.getMonth() + 1).padStart(2, "0");

  const inicioFormatado = diaInicio + "/" + mesInicio;
  const fimFormatado = diaFim + "/" + mesFim;

  if (inicioFormatado === fimFormatado) {
    return inicioFormatado;
  }

  return inicioFormatado + " a " + fimFormatado;
}

/* =========================================
   CRIAR ABAS
========================================= */

function criarAbas() {
  abas.innerHTML = "";

  Object.keys(OFERTAS_ATIVAS).forEach((nomeOferta) => {
    const oferta = OFERTAS_ATIVAS[nomeOferta];

    if (!oferta || !oferta.imagens) {
      return;
    }

    const botao = document.createElement("button");

    botao.textContent =
      nomeOferta +
      " (" +
      formatarPeriodo(oferta.inicio, oferta.fim) +
      ")";

    botao.setAttribute("data-oferta", nomeOferta);

    if (oferta.cor) {
      botao.style.borderColor = oferta.cor;
    }

    botao.onclick = () => {
      categoriaAtual = nomeOferta;
      paginaAtual = 0;

      if (typeof gtag === "function") {
      gtag("event", "abrir_categoria", {

       categoria: nomeOferta

        });
      }

      atualizarCarrossel();
    };

    abas.appendChild(botao);
  });
}

/* =========================================
   ATUALIZAR CARROSSEL
========================================= */

function atualizarCarrossel() {
  const oferta = OFERTAS_ATIVAS[categoriaAtual];

  if (
    !oferta ||
    !oferta.imagens ||
    oferta.imagens.length === 0
  ) {
    imagemOferta.style.display = "none";
    btnAnterior.style.display = "none";
    btnProximo.style.display = "none";
    contador.style.display = "none";
    miniaturas.style.display = "none";
    semOfertas.style.display = "block";

    tituloCategoria.textContent = "Sem ofertas no momento";

    document
      .querySelectorAll(".abas button")
      .forEach(botao => {
        botao.classList.remove("ativo");
      });

    return;
  }

  const imagens = oferta.imagens;

  semOfertas.style.display = "none";
  imagemOferta.style.display = "block";

  const carrossel = document.querySelector(".carrossel");

  imagemOferta.classList.add("trocando");
  imagemOferta.classList.add("carregando");
  carrossel.classList.add("carregando");

  const novaImagem = imagens[paginaAtual];

  imagemOferta.onload = () => {
    imagemOferta.classList.remove("trocando");
    imagemOferta.classList.remove("carregando");
    carrossel.classList.remove("carregando");
  };

  aplicarPlaceholderNaImagem(imagemOferta);

  setTimeout(() => {
    imagemOferta.src = novaImagem;
  }, 120);

  tituloCategoria.textContent =
    categoriaAtual +
    " (" +
    formatarPeriodo(oferta.inicio, oferta.fim) +
    ")";

  if (oferta.cor) {
    tituloCategoria.style.color = oferta.cor;
  } else {
    tituloCategoria.style.color = "";
  }

  contador.textContent =
    "Página " +
    (paginaAtual + 1) +
    " de " +
    imagens.length;

  document
    .querySelectorAll(".abas button")
    .forEach(botao => {
      botao.classList.remove("ativo");
    });

  const botaoAtivo = document.querySelector(
    '[data-oferta="' + categoriaAtual + '"]'
  );

  if (botaoAtivo) {
    botaoAtivo.classList.add("ativo");
  }

  atualizarSetas(imagens);
  criarMiniaturas(imagens);
  preCarregarImagens(imagens);
}

/* =========================================
   ATUALIZAR SETAS
========================================= */

function atualizarSetas(imagens) {
  if (imagens.length <= 1) {
    btnAnterior.style.display = "none";
    btnProximo.style.display = "none";
    contador.style.display = "none";
    miniaturas.style.display = "none";
    return;
  }

  btnAnterior.style.display = "block";
  btnProximo.style.display = "block";
  contador.style.display = "block";
  miniaturas.style.display = "flex";

  if (paginaAtual === 0) {
    btnAnterior.classList.add("desativada");
    btnAnterior.disabled = true;
  } else {
    btnAnterior.classList.remove("desativada");
    btnAnterior.disabled = false;
  }

  if (paginaAtual === imagens.length - 1) {
    btnProximo.classList.add("desativada");
    btnProximo.disabled = true;
  } else {
    btnProximo.classList.remove("desativada");
    btnProximo.disabled = false;
  }
}

/* =========================================
   MINIATURAS
========================================= */

function criarMiniaturas(imagens) {
  miniaturas.innerHTML = "";

  if (imagens.length <= 1) {
    return;
  }

  imagens.forEach((imagem, index) => {
    const thumb = document.createElement("img");

    aplicarPlaceholderNaImagem(thumb);
    thumb.src = imagem;

    if (index === paginaAtual) {
      thumb.classList.add("ativa");
    }

    thumb.onclick = () => {
      paginaAtual = index;
      atualizarCarrossel();
    };

    miniaturas.appendChild(thumb);
  });
}

/* =========================================
   PRELOAD IMAGENS
========================================= */

function preCarregarImagens(imagens) {
  imagens.forEach((imagem) => {
    const img = new Image();

    aplicarPlaceholderNaImagem(img);
    img.src = imagem;
  });
}

/* =========================================
   NAVEGAÇÃO
========================================= */

function proximaPagina() {
  const oferta = OFERTAS_ATIVAS[categoriaAtual];

  if (!oferta || !oferta.imagens) {
    return;
  }

  const imagens = oferta.imagens;

  if (paginaAtual < imagens.length - 1) {
    paginaAtual++;
    atualizarCarrossel();
  }
}

function paginaAnterior() {
  if (paginaAtual > 0) {
    paginaAtual--;
    atualizarCarrossel();
  }
}

/* =========================================
   ABRIR ZOOM
========================================= */

function abrirZoom() {
  if (!imagemOferta.src) {
    return;
  }

  escalaZoom = 1;
  posicaoX = 0;
  posicaoY = 0;

  aplicarPlaceholderNaImagem(imagemZoom);
  imagemZoom.src = imagemOferta.src;

  aplicarTransformacaoZoom();

  modalZoom.classList.add("ativo");
  document.body.style.overflow = "hidden";
}

/* =========================================
   FECHAR ZOOM
========================================= */

function fecharZoom() {
  modalZoom.classList.remove("ativo");
  document.body.style.overflow = "";
  arrastando = false;

  if (document.fullscreenElement) {
    document.exitFullscreen();
  }
}

/* =========================================
   APLICAR TRANSFORMAÇÃO
========================================= */

function aplicarTransformacaoZoom() {
  imagemZoom.style.transform =
    "translate(" +
    posicaoX +
    "px, " +
    posicaoY +
    "px) scale(" +
    escalaZoom +
    ")";
}

/* =========================================
   DISTÂNCIA PINCH
========================================= */

function calcularDistanciaEntreDedos(toques) {
  const toque1 = toques[0];
  const toque2 = toques[1];

  const distanciaX = toque2.clientX - toque1.clientX;
  const distanciaY = toque2.clientY - toque1.clientY;

  return Math.sqrt(
    distanciaX * distanciaX +
    distanciaY * distanciaY
  );
}

/* =========================================
   PINCH START
========================================= */

function iniciarPinchZoom(evento) {
  if (evento.touches.length === 2) {
    distanciaInicialPinch = calcularDistanciaEntreDedos(evento.touches);
    escalaInicialPinch = escalaZoom;
    arrastando = false;
  }
}

/* =========================================
   PINCH MOVE
========================================= */

function moverPinchZoom(evento) {
  if (evento.touches.length === 2) {
    evento.preventDefault();

    const distanciaAtual = calcularDistanciaEntreDedos(evento.touches);
    const fatorZoom = distanciaAtual / distanciaInicialPinch;

    escalaZoom = escalaInicialPinch * fatorZoom;

    if (escalaZoom < 1) {
      escalaZoom = 1;
    }

    if (escalaZoom > 4) {
      escalaZoom = 4;
    }

    if (escalaZoom === 1) {
      posicaoX = 0;
      posicaoY = 0;
    }

    aplicarTransformacaoZoom();
  }
}

/* =========================================
   INICIAR ARRASTE
========================================= */

function iniciarArraste(evento) {
  if (escalaZoom <= 1) {
    return;
  }

  if (evento.touches && evento.touches.length !== 1) {
    return;
  }

  arrastando = true;
  imagemZoom.style.cursor = "grabbing";

  const ponto = evento.touches ? evento.touches[0] : evento;

  inicioArrasteX = ponto.clientX - posicaoX;
  inicioArrasteY = ponto.clientY - posicaoY;
}

/* =========================================
   MOVER ARRASTE
========================================= */

function moverArraste(evento) {
  if (!arrastando || escalaZoom <= 1) {
    return;
  }

  evento.preventDefault();

  const ponto = evento.touches ? evento.touches[0] : evento;

  posicaoX = ponto.clientX - inicioArrasteX;
  posicaoY = ponto.clientY - inicioArrasteY;

  aplicarTransformacaoZoom();
}

/* =========================================
   PARAR ARRASTE
========================================= */

function pararArraste() {
  arrastando = false;
  imagemZoom.style.cursor = "grab";
}

/* =========================================
   COMPARTILHAR SITE
========================================= */

function gerarSlug(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function gerarUrlDaOferta(nomeOferta) {
  const dominio = window.location.origin;
  const slug = gerarSlug(nomeOferta);

  return dominio + "/" + slug;
}

function compartilharSite() {
  const url = gerarUrlDaOferta(categoriaAtual);

  if (typeof gtag === "function") {
    gtag("event", "compartilhar_ofertas", {
      event_category: "Engajamento",
      event_label: categoriaAtual,
      value: 1
    });
  }

  if (navigator.share) {
    navigator.share({
      title: "Ofertas Pérola Supermercado",
      text: "Confira essa oferta do Pérola!",
      url: url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert("Link da oferta copiado!");
  }
}

/* =========================================
   SWIPE
========================================= */

function detectarSwipe() {
  const distancia = fimToqueX - inicioToqueX;

  if (distancia > 60) {
    paginaAnterior();
  }

  if (distancia < -60) {
    proximaPagina();
  }
}

/* =========================================
   EVENTOS
========================================= */

btnProximo.onclick = proximaPagina;
btnAnterior.onclick = paginaAnterior;
imagemOferta.onclick = abrirZoom;
btnFecharZoom.onclick = fecharZoom;

/* ===== BOTÕES ZOOM ===== */

btnMaisZoom.onclick = () => {
  escalaZoom = Math.min(escalaZoom + 0.25, 4);
  aplicarTransformacaoZoom();
};

btnMenosZoom.onclick = () => {
  escalaZoom = Math.max(escalaZoom - 0.25, 1);

  if (escalaZoom === 1) {
    posicaoX = 0;
    posicaoY = 0;
  }

  aplicarTransformacaoZoom();
};

btnResetZoom.onclick = () => {
  escalaZoom = 1;
  posicaoX = 0;
  posicaoY = 0;
  aplicarTransformacaoZoom();
};

/* ===== TELA CHEIA ===== */

btnTelaCheia.onclick = () => {
  if (!document.fullscreenElement) {
    modalZoom.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

/* ===== FECHAR MODAL ===== */

modalZoom.onclick = (evento) => {
  if (evento.target === modalZoom) {
    fecharZoom();
  }
};

/* ===== TOUCH PINCH ===== */

modalZoom.addEventListener(
  "touchstart",
  iniciarPinchZoom,
  { passive: false }
);

modalZoom.addEventListener(
  "touchmove",
  moverPinchZoom,
  { passive: false }
);

/* ===== ARRASTE MOUSE ===== */

imagemZoom.addEventListener("mousedown", iniciarArraste);
window.addEventListener("mousemove", moverArraste);
window.addEventListener("mouseup", pararArraste);

/* ===== ARRASTE TOUCH ===== */

imagemZoom.addEventListener(
  "touchstart",
  iniciarArraste,
  { passive: false }
);

imagemZoom.addEventListener(
  "touchmove",
  moverArraste,
  { passive: false }
);

imagemZoom.addEventListener("touchend", pararArraste);

/* ===== SWIPE MOBILE ===== */

imagemOferta.addEventListener(
  "touchstart",
  (evento) => {
    inicioToqueX = evento.changedTouches[0].screenX;
  }
);

imagemOferta.addEventListener(
  "touchend",
  (evento) => {
    fimToqueX = evento.changedTouches[0].screenX;
    detectarSwipe();
  }
);

/* ===== SCROLL ZOOM ===== */

modalZoom.addEventListener(
  "wheel",
  (evento) => {
    if (!modalZoom.classList.contains("ativo")) {
      return;
    }

    evento.preventDefault();

    const velocidadeZoom = 0.12;

    if (evento.deltaY < 0) {
      escalaZoom += velocidadeZoom;
    } else {
      escalaZoom -= velocidadeZoom;
    }

    if (escalaZoom < 1) {
      escalaZoom = 1;
      posicaoX = 0;
      posicaoY = 0;
    }

    if (escalaZoom > 4) {
      escalaZoom = 4;
    }

    aplicarTransformacaoZoom();
  },
  { passive: false }
);

/* ===== TECLADO ===== */

document.addEventListener(
  "keydown",
  (evento) => {
    if (evento.key === "ArrowRight") {
      proximaPagina();
    }

    if (evento.key === "ArrowLeft") {
      paginaAnterior();
    }

    if (evento.key === "Escape") {
      fecharZoom();
    }
  }
);

/* ===== EVENTO GRUPO WHATSAPP ===== */

linkGrupoFlutuante.addEventListener(
  "click",
  () => {
    if (typeof gtag === "function") {
      gtag("event", "entrar_grupo", {
        event_category: "Engajamento",
        event_label: "Grupo WhatsApp",
        value: 1
      });
    }
  }
);

/* ===== EVENTO GRUPO WHATSAPP - SEM OFERTAS ===== */

linkSemOfertas.addEventListener(
  "click",
  () => {
    if (typeof gtag === "function") {
      gtag("event", "entrar_grupo_sem_ofertas", {
        event_category: "Engajamento",
        event_label: "Botão Sem Ofertas",
        value: 1
      });
    }
  }
);

/* =========================================
   GRUPO FLUTUANTE MINIMIZÁVEL
========================================= */

btnMinimizarGrupo.addEventListener(
  "click",
  () => {
    grupoFlutuante.classList.add("minimizado");
  }
);

btnAbrirGrupo.addEventListener(
  "click",
  () => {
    grupoFlutuante.classList.remove("minimizado");
  }
);

/* =========================================
   BOTÃO VOLTAR AO TOPO
========================================= */

window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 300) {
      btnTopo.classList.add("visivel");
    } else {
      btnTopo.classList.remove("visivel");
    }
  }
);

btnTopo.addEventListener(
  "click",
  () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
);

function abrirOfertaPelaUrl() {
  const parametros = new URLSearchParams(window.location.search);

  const idQuery = parametros.get("id");
  const slugQuery = parametros.get("oferta");

  const nomesOfertas = Object.keys(OFERTAS_ATIVAS);

  if (!idQuery && !slugQuery) {
    categoriaAtual = nomesOfertas[0];
    paginaAtual = 0;
    return;
  }

  const ofertaEncontrada = nomesOfertas.find((nomeOferta) => {
    const oferta = OFERTAS_ATIVAS[nomeOferta];

    const mesmoId =
      idQuery && String(oferta.id) === String(idQuery);

    const mesmoSlug =
      slugQuery && String(oferta.slug) === String(slugQuery);

    return mesmoId || mesmoSlug;
  });

  categoriaAtual = ofertaEncontrada || nomesOfertas[0];
  paginaAtual = 0;
}

  const ofertaEncontrada = nomesOfertas.find((nomeOferta) => {
    const oferta = OFERTAS_ATIVAS[nomeOferta];

    const mesmoId =
      idQuery && String(oferta.id) === String(idQuery);

    const mesmoSlug =
      slugQuery && String(oferta.slug) === String(slugQuery);

    return mesmoId || mesmoSlug;
  });

  categoriaAtual = ofertaEncontrada || nomesOfertas[0];
  paginaAtual = 0;
}

/* =========================================
   INICIAR
========================================= */

iniciarSite();
