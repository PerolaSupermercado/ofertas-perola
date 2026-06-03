const API_OFERTAS = "/api/ofertas";
const API_CONFIGURACOES = "/api/configuracoes";
const API_UPLOAD = "/api/upload";
const API_AUTH = "/api/auth";

const TOKEN_ADMIN_KEY = "tokenAdminPerola";
const TOKEN_ADMIN_EXPIRA_KEY = "tokenAdminPerolaExpira";
const TEMPO_SESSAO_ADMIN = 24 * 60 * 60 * 1000;

let ofertas = [];
let configuracoes = {};
let imagensSelecionadas = [];
let indiceEditando = null;
let ofertaSelecionadaIndex = null;

/* ===============================
   SESSÃO / LOGIN
================================ */

function obterTokenAdmin() {
  const token = sessionStorage.getItem(TOKEN_ADMIN_KEY);
  const expiraEm = Number(sessionStorage.getItem(TOKEN_ADMIN_EXPIRA_KEY));

  if (!token || !expiraEm) {
    return null;
  }

  if (Date.now() > expiraEm) {
    limparSessaoAdmin();
    return null;
  }

  return token;
}

function limparSessaoAdmin() {
  sessionStorage.removeItem(TOKEN_ADMIN_KEY);
  sessionStorage.removeItem(TOKEN_ADMIN_EXPIRA_KEY);
}

function headersAdmin() {
  return {
    "Content-Type": "application/json",
    "x-admin-token": obterTokenAdmin()
  };
}

function mostrarErroLogin(mensagem) {
  const loginErro = document.getElementById("loginErro");

  if (!loginErro) {
    return;
  }

  loginErro.textContent = mensagem;
  loginErro.classList.add("ativo");
}

async function verificarLoginAdmin() {
  const token = obterTokenAdmin();

  const loginAdmin = document.getElementById("loginAdmin");
  const formLoginAdmin = document.getElementById("formLoginAdmin");
  const senhaAdmin = document.getElementById("senhaAdmin");
  const layoutAdmin = document.getElementById("layoutAdmin");

  if (token) {
    loginAdmin.classList.add("oculto");
    layoutAdmin.classList.remove("painel-bloqueado");
    layoutAdmin.classList.add("painel-liberado");

    return true;
  }

  loginAdmin.classList.remove("oculto");

  return new Promise((resolve) => {
    formLoginAdmin.onsubmit = async function(evento) {
      evento.preventDefault();

      const senha = senhaAdmin.value;

      if (senha === "") {
        mostrarErroLogin("Digite a senha para continuar.");
        return;
      }

      try {
        const resposta = await fetch(API_AUTH, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            senha: senha
          })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          mostrarErroLogin(dados.erro || "Senha incorreta.");
          senhaAdmin.value = "";
          senhaAdmin.focus();
          return;
        }

        sessionStorage.setItem(TOKEN_ADMIN_KEY, dados.token);

        sessionStorage.setItem(
          TOKEN_ADMIN_EXPIRA_KEY,
          String(Date.now() + TEMPO_SESSAO_ADMIN)
        );

        loginAdmin.classList.add("oculto");
        layoutAdmin.classList.remove("painel-bloqueado");
        layoutAdmin.classList.add("painel-liberado");

        resolve(true);

      } catch (erro) {
        console.error("Erro no login:", erro);
        mostrarErroLogin("Erro ao conectar com o login.");
      }
    };
  });
}

/* ===============================
   ELEMENTOS
================================ */

const abas = document.querySelectorAll(".aba");
const botoesMenu = document.querySelectorAll(".menu-btn");

const listaOfertas = document.getElementById("listaOfertas");
const listaOfertasDashboard = document.getElementById("listaOfertasDashboard");
const listaEstatisticas = document.getElementById("listaEstatisticas");
const detalhesOferta = document.getElementById("detalhesOferta");

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

const buscaOferta = document.getElementById("buscaOferta");
const filtroStatus = document.getElementById("filtroStatus");
const filtroTipo = document.getElementById("filtroTipo");

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
const btnSairAdmin = document.getElementById("btnSairAdmin");

/* ===============================
   API
================================ */

async function carregarOfertasApi() {
  try {
    const resposta = await fetch(API_OFERTAS);
    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Erro ao carregar ofertas");
    }

    ofertas = Array.isArray(dados) ? dados : [];

    renderizarOfertas();

  } catch (erro) {
    console.error("Erro ao carregar ofertas:", erro);
    alert("Erro ao carregar ofertas do Supabase.");
  }
}

async function salvarOfertaApi(oferta) {
  const metodo = oferta.id ? "PUT" : "POST";

  const resposta = await fetch(API_OFERTAS, {
    method: metodo,
    headers: headersAdmin(),
    body: JSON.stringify(oferta)
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || "Erro ao salvar oferta");
  }

  return dados;
}

async function carregarConfiguracoesApi() {
  try {
    const resposta = await fetch(API_CONFIGURACOES);
    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Erro ao carregar configurações");
    }

    configuracoes = dados;

    preencherConfiguracoes();

  } catch (erro) {
    console.error("Erro ao carregar configurações:", erro);
  }
}

/* ===============================
   FUNÇÕES AUXILIARES
================================ */

function trocarAba(nomeAba) {
  abas.forEach(aba => aba.classList.remove("ativa"));
  botoesMenu.forEach(botao => botao.classList.remove("active"));

  const abaAtual = document.getElementById("aba-" + nomeAba);
  const botaoAtual = document.querySelector(`[data-aba="${nomeAba}"]`);

  if (abaAtual) {
    abaAtual.classList.add("ativa");
  }

  if (botaoAtual) {
    botaoAtual.classList.add("active");
  }
}

function gerarSlug(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function calcularStatus(inicioValor, fimValor, ativo) {
  if (!ativo) return "Encerrada";
  if (!inicioValor || !fimValor) return "Encerrada";

  const agora = new Date();
  const inicio = new Date(inicioValor);
  const fim = new Date(fimValor);

  if (agora < inicio) return "Futura";
  if (agora > fim) return "Encerrada";

  return "Ativa";
}

function formatarDataPainel(valor) {
  if (!valor) {
    return "-";
  }

  const data = new Date(valor);

  return data.toLocaleDateString("pt-BR");
}

function gerarUrlOfertaPainel(oferta) {
  const dominio = window.location.origin;
  const slug = oferta.slug || gerarSlug(oferta.titulo || "");

  return dominio + "/" + slug;
}

function obterCapaOferta(oferta) {
  if (!oferta || !oferta.imagens || oferta.imagens.length === 0) {
    return "";
  }

  return oferta.imagens[0];
}

function obterClasseStatus(statusAtual) {
  if (statusAtual === "Futura") return "futura";
  if (statusAtual === "Encerrada") return "encerrada";
  return "ativa";
}

function obterRotuloTipo(tipo) {
  return tipo === "banner" ? "Banner" : "Oferta";
}

function encerraHoje(fimValor) {
  if (!fimValor) {
    return false;
  }

  const hoje = new Date();
  const fim = new Date(fimValor);

  return (
    hoje.getFullYear() === fim.getFullYear() &&
    hoje.getMonth() === fim.getMonth() &&
    hoje.getDate() === fim.getDate()
  );
}

function copiarLinkOferta(index) {
  const oferta = ofertas[index];
  const url = gerarUrlOfertaPainel(oferta);

  navigator.clipboard.writeText(url).then(() => {
    alert("Link copiado com sucesso!");
  }).catch(() => {
    prompt("Copie o link abaixo:", url);
  });
}

function abrirOfertaSite(index) {
  const oferta = ofertas[index];
  const url = gerarUrlOfertaPainel(oferta);

  window.open(url, "_blank");
}

function abrirQrCodeOferta(index) {
  const oferta = ofertas[index];
  const url = gerarUrlOfertaPainel(oferta);

  const qrUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=" +
    encodeURIComponent(url);

  window.open(qrUrl, "_blank");
}

function selecionarOferta(index) {
  ofertaSelecionadaIndex = index;

  renderizarOfertas();
  renderizarDetalhesOferta(index);
}

function criarThumbOferta(oferta) {
  const capa = obterCapaOferta(oferta);

  if (!capa) {
    return `
      <div class="oferta-thumb">
        <div style="height:100%;display:flex;align-items:center;justify-content:center;color:#999;font-size:24px;">
          🏷️
        </div>
      </div>
    `;
  }

  return `
    <div class="oferta-thumb">
      <img src="${capa}" alt="${oferta.titulo}">
    </div>
  `;
}

/* ===============================
   CARDS / BADGES
================================ */

function atualizarCards() {
  const status = ofertas.map(oferta => {
    return calcularStatus(
      oferta.inicioOriginal,
      oferta.fimOriginal,
      oferta.ativo
    );
  });

  const totalOfertas = document.getElementById("totalOfertas");
  const ativas = document.getElementById("ativas");
  const futuras = document.getElementById("futuras");
  const encerradas = document.getElementById("encerradas");

  if (totalOfertas) totalOfertas.textContent = ofertas.length;
  if (ativas) ativas.textContent = status.filter(item => item === "Ativa").length;
  if (futuras) futuras.textContent = status.filter(item => item === "Futura").length;
  if (encerradas) encerradas.textContent = status.filter(item => item === "Encerrada").length;
}

function gerarBadgePublicacao(oferta) {
  if (oferta.ativo === false) {
    return `
      <span class="publicacao-badge desativada">
        Desativada
      </span>
    `;
  }

  if (oferta.ocultar === true) {
    return `
      <span class="publicacao-badge oculta">
        Oculta
      </span>
    `;
  }

  return `
    <span class="publicacao-badge publicada">
      Publicada
    </span>
  `;
}

function gerarLinhaOfertaDashboard(oferta, index) {
  const statusAtual = calcularStatus(
    oferta.inicioOriginal,
    oferta.fimOriginal,
    oferta.ativo
  );

  const classeStatus = obterClasseStatus(statusAtual);
  const tipoAtual = oferta.tipo || "oferta";

  return `
    <tr>
      <td>
        <strong>${oferta.titulo}</strong>
      </td>

      <td>
        <span class="status ${classeStatus}">
          ${statusAtual}
        </span>
      </td>

      <td>
        <span class="tipo-badge ${tipoAtual}">
          ${obterRotuloTipo(tipoAtual)}
        </span>
      </td>

      <td>${oferta.inicio}</td>
      <td>${oferta.fim}</td>

      <td>
        <button class="btn-preview" onclick="selecionarOferta(${index}); trocarAba('ofertas');">
          Ver detalhes
        </button>
      </td>
    </tr>
  `;
}

/* ===============================
   LISTA ESTILO META
================================ */

function gerarItemOferta(oferta, index) {
  const statusAtual = calcularStatus(
    oferta.inicioOriginal,
    oferta.fimOriginal,
    oferta.ativo
  );

  const classeStatus = obterClasseStatus(statusAtual);
  const tipoAtual = oferta.tipo || "oferta";
  const ativo = ofertaSelecionadaIndex === index ? "ativo" : "";

  return `
    <div
      class="oferta-item ${ativo}"
      onclick="selecionarOferta(${index})">

      ${criarThumbOferta(oferta)}

      <div class="oferta-info">
        <h3>${oferta.titulo}</h3>

        <div class="oferta-meta">
          <span class="status ${classeStatus}">
            ${statusAtual}
          </span>

          <span>
            ${obterRotuloTipo(tipoAtual)}
          </span>

          <span>
            ${(oferta.imagens || []).length} páginas
          </span>

          <span>
            ${oferta.inicio} a ${oferta.fim}
          </span>
        </div>
      </div>

      <div
        class="oferta-item-acoes"
        onclick="event.stopPropagation();">

        <button
          class="btn-mini"
          title="Abrir oferta"
          onclick="abrirOfertaSite(${index})">

          ↗

        </button>

        <button
          class="btn-mini"
          title="Copiar link"
          onclick="copiarLinkOferta(${index})">

          ⧉

        </button>

      </div>

    </div>
  `;
}

function gerarGaleriaPaginasOferta(oferta) {
  const imagens = oferta.imagens || [];

  if (imagens.length <= 1) {
    return "";
  }

  return `
    <div class="galeria-paginas">
      <div class="galeria-paginas-topo">
        <strong>Páginas da oferta</strong>
        <span>${imagens.length} páginas</span>
      </div>

      <div class="galeria-paginas-lista">
        ${imagens.map((imagem, index) => {
          return `
            <button
              type="button"
              class="galeria-pagina ${index === 0 ? "ativa" : ""}"
             data-imagem="${imagem}"
onclick="trocarImagemDetalheOferta(this)"

              <img
                src="${imagem}"
                alt="Página ${index + 1}">

              <span>${index + 1}</span>

            </button>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function trocarImagemDetalheOferta(botaoClicado) {
  const imagemDetalhe = document.getElementById("imagemDetalheOferta");

  if (!imagemDetalhe || !botaoClicado) {
    return;
  }

  const urlImagem = botaoClicado.getAttribute("data-imagem");

  if (!urlImagem) {
    return;
  }

  imagemDetalhe.src = urlImagem;

  document
    .querySelectorAll(".galeria-pagina")
    .forEach(botao => botao.classList.remove("ativa"));

  botaoClicado.classList.add("ativa");
}

function renderizarDetalhesOferta(index) {
  if (!detalhesOferta) {
    return;
  }

  const oferta = ofertas[index];

  if (!oferta) {
    detalhesOferta.innerHTML = `
      <div class="detalhes-vazio">
        <div class="detalhes-vazio-icone">
          🏷️
        </div>

        <h2>Selecione uma oferta</h2>

        <p>
          Clique em uma campanha na lista para visualizar informações,
          link, QR Code e ações rápidas.
        </p>
      </div>
    `;

    return;
  }

  const statusAtual = calcularStatus(
    oferta.inicioOriginal,
    oferta.fimOriginal,
    oferta.ativo
  );

  const classeStatus = obterClasseStatus(statusAtual);
  const tipoAtual = oferta.tipo || "oferta";
  const capa = obterCapaOferta(oferta);
  const url = gerarUrlOfertaPainel(oferta);

  detalhesOferta.innerHTML = `
    <div class="detalhe-capa">
  ${
    capa
      ? `<img id="imagemDetalheOferta" src="${capa}" alt="${oferta.titulo}">`
      : `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:#999;font-size:48px;">🏷️</div>`
  }
</div>

${gerarGaleriaPaginasOferta(oferta)}

    <div class="detalhe-topo">
      <h2>${oferta.titulo}</h2>

      <div class="detalhe-tags">
        <span class="status ${classeStatus}">
          ${statusAtual}
        </span>

        <span class="tipo-badge ${tipoAtual}">
          ${obterRotuloTipo(tipoAtual)}
        </span>

        ${gerarBadgePublicacao(oferta)}
      </div>
    </div>

    <div class="detalhe-info-grid">
      <div class="info-box">
        <span>Início</span>
        <strong>${oferta.inicio}</strong>
      </div>

      <div class="info-box">
        <span>Fim</span>
        <strong>${oferta.fim}</strong>
      </div>

      <div class="info-box">
        <span>Páginas</span>
        <strong>${(oferta.imagens || []).length}</strong>
      </div>

      <div class="info-box">
        <span>Prioridade</span>
        <strong>${oferta.prioridade || 999}</strong>
      </div>
    </div>

    <div class="detalhe-link-box">
      <span>Link público</span>
      <code>${url}</code>
    </div>

    <div class="qr-detalhe-box">

  <div class="qr-detalhe-topo">
    <strong>QR Code da oferta</strong>
    <span>Escaneie para acessar</span>
  </div>

  <div class="qr-detalhe-imagem">
    <img
      src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}"
      alt="QR Code da oferta">
  </div>

</div>

   <div class="detalhe-acoes acao-grid-premium">

  <button
    class="acao-premium acao-destaque"
    onclick="abrirPreviewOferta(${index})">

    <span>👁️</span>
    <strong>Preview</strong>
    <small>Ver oferta</small>

  </button>

  <button
    class="acao-premium"
    onclick="abrirOfertaSite(${index})">

    <span>🔗</span>
    <strong>Abrir</strong>
    <small>Link público</small>

  </button>

  <button
    class="acao-premium"
    onclick="copiarLinkOferta(${index})">

    <span>📋</span>
    <strong>Copiar</strong>
    <small>URL da oferta</small>

  </button>

  <button
    class="acao-premium"
    onclick="abrirQrCodeOferta(${index})">

    <span>📱</span>
    <strong>Abrir QR</strong>
<small>Em nova aba</small>

  </button>

  <button
    class="acao-premium"
    onclick="editarOferta(${index})">

    <span>✏️</span>
    <strong>Editar</strong>
    <small>Alterar dados</small>

  </button>

  <button
    class="acao-premium"
    onclick="duplicarOferta(${index})">

    <span>📄</span>
    <strong>Duplicar</strong>
    <small>Criar cópia</small>

  </button>

  <button
    class="acao-premium acao-perigo"
    onclick="excluirOferta(${index})">

    <span>🗑️</span>
    <strong>Excluir</strong>
    <small>Remover oferta</small>

  </button>

</div>
  `;
}

/* ===============================
   ESTATÍSTICAS
================================ */

function renderizarEstatisticasOperacionais() {
  if (!listaEstatisticas) {
    return;
  }

  const statusLista = ofertas.map((oferta) => {
    return calcularStatus(
      oferta.inicioOriginal,
      oferta.fimOriginal,
      oferta.ativo
    );
  });

  const totalAtivas = statusLista.filter(status => status === "Ativa").length;
  const totalAgendadas = statusLista.filter(status => status === "Futura").length;

  const totalPaginas = ofertas.reduce((total, oferta) => {
    return total + ((oferta.imagens || []).length);
  }, 0);

  const totalEncerramHoje = ofertas.filter((oferta) => {
    const status = calcularStatus(
      oferta.inicioOriginal,
      oferta.fimOriginal,
      oferta.ativo
    );

    return status === "Ativa" && encerraHoje(oferta.fimOriginal);
  }).length;

  const estatAtivas = document.getElementById("estatAtivas");
  const estatAgendadas = document.getElementById("estatAgendadas");
  const estatPaginas = document.getElementById("estatPaginas");
  const estatEncerramHoje = document.getElementById("estatEncerramHoje");

  if (estatAtivas) estatAtivas.textContent = totalAtivas;
  if (estatAgendadas) estatAgendadas.textContent = totalAgendadas;
  if (estatPaginas) estatPaginas.textContent = totalPaginas;
  if (estatEncerramHoje) estatEncerramHoje.textContent = totalEncerramHoje;

  listaEstatisticas.innerHTML = "";

  ofertas.forEach((oferta, index) => {
    const statusAtual = calcularStatus(
      oferta.inicioOriginal,
      oferta.fimOriginal,
      oferta.ativo
    );

    const classeStatus = obterClasseStatus(statusAtual);

    listaEstatisticas.innerHTML += `
      <tr>
        <td>
          <strong>${oferta.titulo}</strong>
        </td>

        <td>
          <span class="status ${classeStatus}">
            ${statusAtual}
          </span>
        </td>

        <td>${oferta.inicio} a ${oferta.fim}</td>

        <td>
          <span class="qtd-imagens">
            ${(oferta.imagens || []).length}
          </span>
        </td>

        <td>
          <button class="btn-preview" onclick="copiarLinkOferta(${index})">
            Copiar Link
          </button>

          <button class="btn-editar" onclick="abrirOfertaSite(${index})">
            Abrir
          </button>

          <button class="btn-duplicar" onclick="abrirQrCodeOferta(${index})">
            QR Code
          </button>
        </td>
      </tr>
    `;
  });
}

/* ===============================
   RENDERIZAR OFERTAS
================================ */

function renderizarOfertas() {
  ofertas.sort((a, b) => Number(a.prioridade || 999) - Number(b.prioridade || 999));

  if (listaOfertas) {
    listaOfertas.innerHTML = "";
  }

  if (listaOfertasDashboard) {
    listaOfertasDashboard.innerHTML = "";
  }

  const termoBusca = buscaOferta
    ? buscaOferta.value.trim().toLowerCase()
    : "";

  const statusSelecionado = filtroStatus
    ? filtroStatus.value
    : "todos";

  const tipoSelecionado = filtroTipo
    ? filtroTipo.value
    : "todos";

  const ofertasFiltradas = ofertas.filter((oferta) => {
    const statusAtual = calcularStatus(
      oferta.inicioOriginal,
      oferta.fimOriginal,
      oferta.ativo
    );

    const tipoAtual = oferta.tipo || "oferta";

    const passaBusca =
      !termoBusca ||
      String(oferta.titulo || "").toLowerCase().includes(termoBusca);

    const passaStatus =
      statusSelecionado === "todos" ||
      statusSelecionado === statusAtual;

    const passaTipo =
      tipoSelecionado === "todos" ||
      tipoSelecionado === tipoAtual;

    return passaBusca && passaStatus && passaTipo;
  });

  if (listaOfertas) {
    if (ofertasFiltradas.length === 0) {
      listaOfertas.innerHTML = `
        <div class="detalhes-vazio" style="min-height:300px;">
          <div class="detalhes-vazio-icone">
            🔎
          </div>

          <h2>Nenhuma oferta encontrada</h2>

          <p>
            Tente alterar os filtros ou cadastrar uma nova oferta.
          </p>
        </div>
      `;
    } else {
      ofertasFiltradas.forEach((oferta) => {
        const indexReal = ofertas.indexOf(oferta);

        listaOfertas.innerHTML += gerarItemOferta(oferta, indexReal);
      });
    }
  }

  if (listaOfertasDashboard) {
    ofertas.slice(0, 5).forEach((oferta) => {
      const indexReal = ofertas.indexOf(oferta);

      listaOfertasDashboard.innerHTML += gerarLinhaOfertaDashboard(oferta, indexReal);
    });
  }

  if (
    ofertaSelecionadaIndex === null &&
    ofertas.length > 0
  ) {
    ofertaSelecionadaIndex = 0;
  }

  if (
    ofertaSelecionadaIndex !== null &&
    ofertas[ofertaSelecionadaIndex]
  ) {
    renderizarDetalhesOferta(ofertaSelecionadaIndex);
  } else {
    renderizarDetalhesOferta(null);
  }

  atualizarCards();
  renderizarEstatisticasOperacionais();
}

/* ===============================
   MODAL / FORMULÁRIO
================================ */

function abrirModalNovaOferta() {
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

function fecharModalOferta() {
  modalOferta.classList.remove("ativo");

  indiceEditando = null;

  formOferta.reset();

  imagensSelecionadas = [];
  previewImagens.innerHTML = "";
}

function editarOferta(index) {
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

async function excluirOferta(index) {
  const oferta = ofertas[index];

  if (!oferta.id) {
    alert("Essa oferta ainda não possui ID no Supabase.");
    return;
  }

  const confirmar = confirm(
    "Tem certeza que deseja excluir a oferta: " + oferta.titulo + "?"
  );

  if (!confirmar) return;

  try {
    const resposta = await fetch(`${API_OFERTAS}?id=${oferta.id}`, {
      method: "DELETE",
      headers: {
        "x-admin-token": obterTokenAdmin()
      }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Erro ao excluir oferta");
    }

    ofertaSelecionadaIndex = null;

    await carregarOfertasApi();

  } catch (erro) {
    console.error("Erro ao excluir oferta:", erro);
    alert("Erro ao excluir oferta no Supabase.");
  }
}

function arquivoParaBase64(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => resolve(leitor.result);
    leitor.onerror = reject;

    leitor.readAsDataURL(arquivo);
  });
}

async function adicionarImagens(arquivos) {
  const novosArquivos = Array.from(arquivos).filter(arquivo => {
    return arquivo.type && arquivo.type.startsWith("image/");
  });

  for (const arquivo of novosArquivos) {
    const base64 = await arquivoParaBase64(arquivo);

    const resposta = await fetch(API_UPLOAD, {
      method: "POST",
      headers: headersAdmin(),
      body: JSON.stringify({
        arquivoBase64: base64,
        nomeArquivo: arquivo.name
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      alert("Erro ao enviar imagem.");
      console.error(dados);
      continue;
    }

    imagensSelecionadas.push(dados.url);
  }

  renderizarPreviewImagens();
}

function renderizarPreviewImagens() {
  previewImagens.innerHTML = "";

  imagensSelecionadas.forEach((imagem, index) => {
    const url = typeof imagem === "string"
      ? imagem
      : imagem.url;

    const item = document.createElement("div");

    item.className = "preview-item";

    item.innerHTML = `
      <img src="${url}" alt="Imagem da oferta">

      <span>${index + 1}</span>

      <div class="preview-acoes">
        <button type="button" onclick="moverImagem(${index}, -1)">
          ↑
        </button>

        <button type="button" onclick="moverImagem(${index}, 1)">
          ↓
        </button>

        <button type="button" onclick="removerImagem(${index})">
          ×
        </button>
      </div>
    `;

    previewImagens.appendChild(item);
  });
}

function removerImagem(index) {
  imagensSelecionadas.splice(index, 1);
  renderizarPreviewImagens();
}

function moverImagem(index, direcao) {
  const novoIndex = index + direcao;

  if (novoIndex < 0 || novoIndex >= imagensSelecionadas.length) {
    return;
  }

  const imagemAtual = imagensSelecionadas[index];

  imagensSelecionadas[index] = imagensSelecionadas[novoIndex];
  imagensSelecionadas[novoIndex] = imagemAtual;

  renderizarPreviewImagens();
}

/* ===============================
   CONFIGURAÇÕES
================================ */

function preencherConfiguracoes() {
  camposConfig.tituloSite.value = configuracoes.tituloSite || "";
  camposConfig.subtituloSite.value = configuracoes.subtituloSite || "";
  camposConfig.linkGrupo.value = configuracoes.linkGrupo || "";
  camposConfig.bannerPrincipal.value = configuracoes.bannerPrincipal || "";
  camposConfig.placeholder.value = configuracoes.placeholder || "";
  camposConfig.imagemCompartilhamento.value = configuracoes.imagemCompartilhamento || "";
  camposConfig.tituloCompartilhamento.value = configuracoes.tituloCompartilhamento || "";
  camposConfig.descricaoCompartilhamento.value = configuracoes.descricaoCompartilhamento || "";
}

async function salvarConfiguracoesPainel() {
  try {
    const configuracaoAtualizada = {
      tituloSite:
        camposConfig.tituloSite.value,

      subtituloSite:
        camposConfig.subtituloSite.value,

      linkGrupo:
        camposConfig.linkGrupo.value,

      bannerPrincipal:
        camposConfig.bannerPrincipal.value,

      placeholder:
        camposConfig.placeholder.value,

      imagemCompartilhamento:
        camposConfig.imagemCompartilhamento.value,

      tituloCompartilhamento:
        camposConfig.tituloCompartilhamento.value,

      descricaoCompartilhamento:
        camposConfig.descricaoCompartilhamento.value
    };

    const resposta =
      await fetch(
        API_CONFIGURACOES,
        {
          method: "PUT",
          headers: headersAdmin(),
          body: JSON.stringify(
            configuracaoAtualizada
          )
        }
      );

    const dados =
      await resposta.json();

    if (!resposta.ok) {
      throw new Error(
        dados.erro || "Erro ao salvar"
      );
    }

    mensagemConfig.textContent =
      "Configurações salvas com sucesso.";

    mensagemConfig.classList.add(
      "ativo"
    );

    setTimeout(() => {
      mensagemConfig.classList.remove(
        "ativo"
      );
    }, 3000);

  } catch (erro) {
    console.error(erro);

    alert(
      "Erro ao salvar configurações."
    );
  }
}

/* ===============================
   OUTRAS AÇÕES
================================ */

function abrirPreviewOferta(index) {
  const oferta = ofertas[index];

  const url = `/ofertas-preview.html?id=${encodeURIComponent(oferta.id)}`;

  window.open(url, "_blank");
}

async function duplicarOferta(index) {
  const ofertaOriginal = ofertas[index];

  const confirmar = confirm(
    "Deseja duplicar a oferta: " + ofertaOriginal.titulo + "?"
  );

  if (!confirmar) {
    return;
  }

  const copia = {
    titulo: ofertaOriginal.titulo + " - Cópia",
    slug: gerarSlug(ofertaOriginal.titulo + "-copia-" + Date.now()),
    tipo: ofertaOriginal.tipo || "oferta",
    ativo: false,
    ocultar: true,
    inicioOriginal: ofertaOriginal.inicioOriginal,
    fimOriginal: ofertaOriginal.fimOriginal,
    inicio: ofertaOriginal.inicio,
    fim: ofertaOriginal.fim,
    prioridade: Number(ofertaOriginal.prioridade || 999) + 1,
    cor: ofertaOriginal.cor || "#c40000",
    imagens: ofertaOriginal.imagens || []
  };

  try {
    await salvarOfertaApi(copia);
    await carregarOfertasApi();

    alert("Oferta duplicada com sucesso!");

  } catch (erro) {
    console.error("Erro ao duplicar oferta:", erro);
    alert("Erro ao duplicar oferta.");
  }
}

/* ===============================
   EVENTOS
================================ */

botoesMenu.forEach(botao => {
  botao.addEventListener("click", () => {
    trocarAba(botao.dataset.aba);
  });
});

if (btnNovaOferta) {
  btnNovaOferta.addEventListener("click", abrirModalNovaOferta);
}

if (btnNovaOfertaDashboard) {
  btnNovaOfertaDashboard.addEventListener("click", abrirModalNovaOferta);
}

if (btnFecharModal) {
  btnFecharModal.addEventListener("click", fecharModalOferta);
}

if (modalOferta) {
  modalOferta.addEventListener("click", evento => {
    if (evento.target === modalOferta) {
      fecharModalOferta();
    }
  });
}

if (tituloOferta) {
  tituloOferta.addEventListener("input", () => {
    slugOferta.value = gerarSlug(tituloOferta.value);
  });
}

if (formOferta) {
  formOferta.addEventListener("submit", async evento => {
    evento.preventDefault();

    const ofertaEditando =
      indiceEditando !== null ? ofertas[indiceEditando] : null;

    const ofertaSalva = {
      id: ofertaEditando ? ofertaEditando.id : null,
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

    try {
      await salvarOfertaApi(ofertaSalva);
      await carregarOfertasApi();

      fecharModalOferta();

      alert("Oferta salva com sucesso!");

    } catch (erro) {
      console.error("Erro ao salvar oferta:", erro);
      alert("Erro ao salvar oferta no Supabase.");
    }
  });
}

if (uploadArea) {
  uploadArea.addEventListener("click", () => {
    imagensOferta.click();
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
}

if (imagensOferta) {
  imagensOferta.addEventListener("change", evento => {
    adicionarImagens(evento.target.files);
  });
}

if (btnSalvarConfiguracoes) {
  btnSalvarConfiguracoes.addEventListener(
    "click",
    salvarConfiguracoesPainel
  );
}

if (buscaOferta) {
  buscaOferta.addEventListener("input", renderizarOfertas);
}

if (filtroStatus) {
  filtroStatus.addEventListener("change", renderizarOfertas);
}

if (filtroTipo) {
  filtroTipo.addEventListener("change", renderizarOfertas);
}

if (btnSairAdmin) {
  btnSairAdmin.addEventListener("click", () => {
    limparSessaoAdmin();
    location.reload();
  });
}

/* ===============================
   INICIAR
================================ */

verificarLoginAdmin().then((autorizado) => {
  if (autorizado) {
    carregarConfiguracoesApi();
    carregarOfertasApi();
  }
});
