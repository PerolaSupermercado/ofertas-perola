/* =========================================
   CONFIGURAÇÕES INICIAIS
========================================= */

document.getElementById("tituloSite").textContent =
  CONFIGURACOES.titulo;

document.getElementById("subtituloSite").textContent =
  CONFIGURACOES.subtitulo;

document.getElementById("bannerTopo").src =
  CONFIGURACOES.banner;

document.getElementById("linkGrupoFlutuante").href =
  CONFIGURACOES.linkGrupo;

/* =========================================
   CARREGAR OFERTAS DA PLANILHA
========================================= */

async function carregarOfertasDaPlanilha() {

  const resposta = await fetch(PLANILHA_OFERTAS);

  const textoCSV = await resposta.text();

  const linhas = textoCSV
    .trim()
    .split("\n")
    .map(linha => linha.split(","));

  const cabecalho = linhas[0].map(item => item.trim());

  const ofertasDaPlanilha = {};

  linhas.slice(1).forEach((linha) => {

    const item = {};

    cabecalho.forEach((coluna, index) => {

      item[coluna] = linha[index] ? linha[index].trim() : "";

    });

    if (item.ativo.toLowerCase() !== "sim") {
      return;
    }

    if (!item.categoria || !item.inicio || !item.fim) {
      return;
    }

    ofertasDaPlanilha[item.categoria] = {

      inicio: item.inicio,

      fim: item.fim,

      imagens: item.imagens
        ? item.imagens.split("|").map(imagem => imagem.trim())
        : []

    };

  });

  return ofertasDaPlanilha;

}

/* =========================================
   FILTRAR OFERTAS ATIVAS
========================================= */

const OFERTAS_ATIVAS = filtrarOfertasAtivas();

let categoriaAtual = Object.keys(OFERTAS_ATIVAS)[0];

if (!categoriaAtual) {

  categoriaAtual = "Sem ofertas";

  OFERTAS_ATIVAS[categoriaAtual] = [];

}

/* =========================================
   ESTADOS
========================================= */

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

const tituloCategoria =
  document.getElementById("tituloCategoria");

const imagemOferta =
  document.getElementById("imagemOferta");

const contador =
  document.getElementById("contador");

const miniaturas =
  document.getElementById("miniaturas");

const btnAnterior =
  document.getElementById("btnAnterior");

const btnProximo =
  document.getElementById("btnProximo");

/* ===== ZOOM ===== */

const modalZoom =
  document.getElementById("modalZoom");

const imagemZoom =
  document.getElementById("imagemZoom");

const btnFecharZoom =
  document.getElementById("btnFecharZoom");

const btnMaisZoom =
  document.getElementById("btnMaisZoom");

const btnMenosZoom =
  document.getElementById("btnMenosZoom");

const btnResetZoom =
  document.getElementById("btnResetZoom");

const btnTelaCheia =
  document.getElementById("btnTelaCheia");

const btnTopo =
  document.getElementById("btnTopo");
  

const linkGrupoFlutuante =
  document.getElementById("linkGrupoFlutuante");

  const linkSemOfertas =
  document.getElementById("linkSemOfertas");

  const grupoFlutuante =
  document.getElementById("grupoFlutuante");

const btnMinimizarGrupo =
  document.getElementById("btnMinimizarGrupo");

const btnAbrirGrupo =
  document.getElementById("btnAbrirGrupo");

  linkSemOfertas.href =
  CONFIGURACOES.linkGrupo;

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
   FILTRAR OFERTAS
========================================= */

function filtrarOfertasAtivas() {

  const agora = new Date();

  const ofertasAtivas = {};

  Object.keys(OFERTAS).forEach((nomeOferta) => {

    const oferta = OFERTAS[nomeOferta];

    if (!oferta || !oferta.imagens) {
      return;
    }

    const inicio = new Date(oferta.inicio);

    const fim = new Date(oferta.fim);

    const temImagens =
      oferta.imagens.length > 0;

    const estaNoPeriodo =
      agora >= inicio && agora <= fim;

    if (temImagens && estaNoPeriodo) {

      ofertasAtivas[nomeOferta] = {

        imagens: oferta.imagens,

        inicio: oferta.inicio,

        fim: oferta.fim

      };

    }

  });

  return ofertasAtivas;

}

/* =========================================
   FORMATAR PERÍODO
========================================= */

function formatarPeriodo(inicio, fim) {

  const dataInicio = new Date(inicio);

  const dataFim = new Date(fim);

  const diaInicio =
    String(dataInicio.getDate()).padStart(2, "0");

  const mesInicio =
    String(dataInicio.getMonth() + 1).padStart(2, "0");

  const diaFim =
    String(dataFim.getDate()).padStart(2, "0");

  const mesFim =
    String(dataFim.getMonth() + 1).padStart(2, "0");

  const inicioFormatado =
    diaInicio + "/" + mesInicio;

  const fimFormatado =
    diaFim + "/" + mesFim;

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

    const botao = document.createElement("button");

    botao.textContent =
      nomeOferta +
      " (" +
      formatarPeriodo(oferta.inicio, oferta.fim) +
      ")";

    botao.setAttribute("data-oferta", nomeOferta);

    botao.onclick = () => {

  categoriaAtual = nomeOferta;

  paginaAtual = 0;

  /* EVENTO ANALYTICS */
  if (typeof gtag === "function") {

    gtag("event", "abrir_categoria", {

      event_category: "Categorias",

      event_label: nomeOferta,

      value: 1

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

  const semOfertas =
    document.getElementById("semOfertas");

  /* ===== SEM OFERTAS ===== */

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

    tituloCategoria.textContent =
      "Sem ofertas no momento";

    document
      .querySelectorAll(".abas button")
      .forEach(botao => {

        botao.classList.remove("ativo");

      });

    return;

  }

  /* ===== OFERTAS ===== */

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

setTimeout(() => {

  imagemOferta.src = novaImagem;

}, 120);

  tituloCategoria.textContent =
    categoriaAtual +
    " (" +
    formatarPeriodo(oferta.inicio, oferta.fim) +
    ")";

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

  const botaoAtivo =
    document.querySelector(
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

  /* ===== BOTÃO ANTERIOR ===== */

  if (paginaAtual === 0) {

    btnAnterior.classList.add("desativada");

    btnAnterior.disabled = true;

  } else {

    btnAnterior.classList.remove("desativada");

    btnAnterior.disabled = false;

  }

  /* ===== BOTÃO PRÓXIMO ===== */

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

    img.src = imagem;

  });

}

/* =========================================
   NAVEGAÇÃO
========================================= */

function proximaPagina() {

  const oferta =
    OFERTAS_ATIVAS[categoriaAtual];

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

  imagemZoom.src =
    imagemOferta.src;

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

  const distanciaX =
    toque2.clientX - toque1.clientX;

  const distanciaY =
    toque2.clientY - toque1.clientY;

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

    distanciaInicialPinch =
      calcularDistanciaEntreDedos(evento.touches);

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

    const distanciaAtual =
      calcularDistanciaEntreDedos(evento.touches);

    const fatorZoom =
      distanciaAtual / distanciaInicialPinch;

    escalaZoom =
      escalaInicialPinch * fatorZoom;

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

  if (
    evento.touches &&
    evento.touches.length !== 1
  ) {
    return;
  }

  arrastando = true;

  imagemZoom.style.cursor = "grabbing";

  const ponto =
    evento.touches
      ? evento.touches[0]
      : evento;

  inicioArrasteX =
    ponto.clientX - posicaoX;

  inicioArrasteY =
    ponto.clientY - posicaoY;

}

/* =========================================
   MOVER ARRASTE
========================================= */

function moverArraste(evento) {

  if (!arrastando || escalaZoom <= 1) {
    return;
  }

  evento.preventDefault();

  const ponto =
    evento.touches
      ? evento.touches[0]
      : evento;

  posicaoX =
    ponto.clientX - inicioArrasteX;

  posicaoY =
    ponto.clientY - inicioArrasteY;

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

function compartilharSite() {

  const url = window.location.href;

  /* EVENTO ANALYTICS */
  if (typeof gtag === "function") {

  gtag("event", "compartilhar_ofertas", {

    event_category: "Engajamento",

    event_label: "Botão Compartilhar",

    value: 1

  });

}

  if (navigator.share) {

    navigator.share({

      title: CONFIGURACOES.titulo,

      text: "Confira nossas ofertas!",

      url: url

    });

  } else {

    navigator.clipboard.writeText(url);

    alert("Link copiado!");

  }

}

/* =========================================
   SWIPE
========================================= */

function detectarSwipe() {

  const distancia =
    fimToqueX - inicioToqueX;

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

/* ===== SETAS ===== */

btnProximo.onclick =
  proximaPagina;

btnAnterior.onclick =
  paginaAnterior;

/* ===== ABRIR ZOOM ===== */

imagemOferta.onclick =
  abrirZoom;

/* ===== FECHAR ZOOM ===== */

btnFecharZoom.onclick =
  fecharZoom;

/* ===== BOTÕES ZOOM ===== */

btnMaisZoom.onclick = () => {

  escalaZoom =
    Math.min(escalaZoom + 0.25, 4);

  aplicarTransformacaoZoom();

};

btnMenosZoom.onclick = () => {

  escalaZoom =
    Math.max(escalaZoom - 0.25, 1);

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

imagemZoom.addEventListener(
  "mousedown",
  iniciarArraste
);

window.addEventListener(
  "mousemove",
  moverArraste
);

window.addEventListener(
  "mouseup",
  pararArraste
);

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

imagemZoom.addEventListener(
  "touchend",
  pararArraste
);

/* ===== SWIPE MOBILE ===== */

imagemOferta.addEventListener(
  "touchstart",
  (evento) => {

    inicioToqueX =
      evento.changedTouches[0].screenX;

  }
);

imagemOferta.addEventListener(
  "touchend",
  (evento) => {

    fimToqueX =
      evento.changedTouches[0].screenX;

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

/* =========================================
   INICIAR
========================================= */

criarAbas();

atualizarCarrossel();
