const API_OFERTAS = "/api/ofertas";
const API_CONFIGURACOES = "/api/configuracoes";
const API_UPLOAD = "/api/upload";
const API_AUTH = "/api/auth";

const TOKEN_ADMIN_KEY = "tokenAdminPerola";
const CHAVE_CONFIG = "configuracoesOfertasPerola";

function obterTokenAdmin() {
  return sessionStorage.getItem(TOKEN_ADMIN_KEY);
}

function headersAdmin() {
  return {
    "Content-Type": "application/json",
    "x-admin-token": obterTokenAdmin()
  };
}

function mostrarErroLogin(mensagem) {
  const loginErro = document.getElementById("loginErro");

  loginErro.textContent = mensagem;
  loginErro.classList.add("ativo");
}

async function verificarLoginAdmin() {
  const token = obterTokenAdmin();
  const loginAdmin = document.getElementById("loginAdmin");

  if (token) {
    loginAdmin.classList.add("oculto");
    return true;
  }

  return new Promise((resolve) => {
    const formLoginAdmin = document.getElementById("formLoginAdmin");
    const senhaAdmin = document.getElementById("senhaAdmin");

    formLoginAdmin.addEventListener("submit", async (evento) => {
      evento.preventDefault();

      const senha = senhaAdmin.value;

if (!senha) {
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
            senha
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

        loginAdmin.classList.add("oculto");

        resolve(true);

      } catch (erro) {
        console.error("Erro no login:", erro);
        mostrarErroLogin("Erro ao fazer login. Tente novamente.");
      }
    });
  });
}

  const senha = prompt("Digite a senha do painel administrativo:");

  if (!senha) {
    document.body.innerHTML =
      "<h2 style='font-family:Arial;padding:30px'>Acesso não autorizado.</h2>";

    return false;
  }

  const resposta = await fetch(API_AUTH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      senha
    })
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    alert(dados.erro || "Senha incorreta.");

    document.body.innerHTML =
      "<h2 style='font-family:Arial;padding:30px'>Acesso não autorizado.</h2>";

    return false;
  }

  sessionStorage.setItem(TOKEN_ADMIN_KEY, dados.token);

  return true;
}

let ofertas = [];
let configuracoes = {};
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

    const resposta =
      await fetch(API_CONFIGURACOES);

    const dados =
      await resposta.json();

    if(!resposta.ok){
      throw new Error(
        dados.erro || "Erro ao carregar configurações"
      );
    }

    configuracoes = dados;

    preencherConfiguracoes();

  } catch(erro){

    console.error(
      "Erro ao carregar configurações:",
      erro
    );

  }

}
function trocarAba(nomeAba) {
  abas.forEach(aba => aba.classList.remove("ativa"));
  botoesMenu.forEach(botao => botao.classList.remove("active"));

  document.getElementById("aba-" + nomeAba).classList.add("ativa");
  document.querySelector(`[data-aba="${nomeAba}"]`).classList.add("active");
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
  if (!valor) return "-";

  const data = new Date(valor);
  return data.toLocaleDateString("pt-BR");
}

function atualizarCards() {
  const status = ofertas.map(oferta => {
    return calcularStatus(
      oferta.inicioOriginal,
      oferta.fimOriginal,
      oferta.ativo
    );
  });

  document.getElementById("totalOfertas").textContent = ofertas.length;
  document.getElementById("ativas").textContent = status.filter(item => item === "Ativa").length;
  document.getElementById("futuras").textContent = status.filter(item => item === "Futura").length;
  document.getElementById("encerradas").textContent = status.filter(item => item === "Encerrada").length;
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

function gerarLinhaOferta(oferta, index, modoDashboard = false) {
  const statusAtual = calcularStatus(
    oferta.inicioOriginal,
    oferta.fimOriginal,
    oferta.ativo
  );

  let classeStatus = "ativa";

  if (statusAtual === "Futura") classeStatus = "futura";
  if (statusAtual === "Encerrada") classeStatus = "encerrada";

  const tipoAtual = oferta.tipo || "oferta";

  if (modoDashboard) {
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

<td>
  ${gerarBadgePublicacao(oferta)}
</td>

<td>
  <span class="qtd-imagens">
    ${(oferta.imagens || []).length}
  </span>
</td>

<td>${oferta.prioridade || 999}</td>
      <td>${oferta.inicio}</td>
      <td>${oferta.fim}</td>

      <td>
       <button class="btn-preview" onclick="abrirPreviewOferta(${index})">
  Preview
</button>

<button class="btn-editar" onclick="editarOferta(${index})">
  Editar
</button>

<button class="btn-duplicar" onclick="duplicarOferta(${index})">
  Duplicar
</button>

<button class="btn-excluir" onclick="excluirOferta(${index})">
  Excluir
</button>
      </td>
    </tr>
  `;
}

function renderizarOfertas() {
  ofertas.sort((a, b) => Number(a.prioridade || 999) - Number(b.prioridade || 999));

  listaOfertas.innerHTML = "";
  listaOfertasDashboard.innerHTML = "";

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

  ofertasFiltradas.forEach((oferta) => {
    const indexReal = ofertas.indexOf(oferta);

    listaOfertas.innerHTML += gerarLinhaOferta(oferta, indexReal, false);
  });

  ofertas.slice(0, 5).forEach((oferta) => {
    const indexReal = ofertas.indexOf(oferta);

    listaOfertasDashboard.innerHTML += gerarLinhaOferta(oferta, indexReal, true);
  });

  atualizarCards();
}

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

    if(!resposta.ok){
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

  } catch(erro){

    console.error(erro);

    alert(
      "Erro ao salvar configurações."
    );

  }

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
  if (evento.target === modalOferta) {
    fecharModalOferta();
  }
});

tituloOferta.addEventListener("input", () => {
  slugOferta.value = gerarSlug(tituloOferta.value);
});

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

if (buscaOferta) {
  buscaOferta.addEventListener("input", renderizarOfertas);
}

if (filtroStatus) {
  filtroStatus.addEventListener("change", renderizarOfertas);
}

if (filtroTipo) {
  filtroTipo.addEventListener("change", renderizarOfertas);
}

verificarLoginAdmin().then((autorizado) => {
  if (autorizado) {
    carregarConfiguracoesApi();
    carregarOfertasApi();
  }
});
