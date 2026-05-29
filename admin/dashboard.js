let ofertasMock = [
  {
    titulo: "Operação Fecha Mês",
    slug: "operacao-fecha-mes",
    ativo: true,
    inicioOriginal: "2026-05-29T00:00",
    fimOriginal: "2026-05-31T23:59",
    inicio: "29/05/2026",
    fim: "31/05/2026",
    prioridade: 1,
    cor: "#c40000",
    ocultar: false,
    imagens: []
  },
  {
    titulo: "Quinta Filé",
    slug: "quinta-file",
    ativo: true,
    inicioOriginal: "2026-05-21T00:00",
    fimOriginal: "2026-05-21T23:59",
    inicio: "21/05/2026",
    fim: "21/05/2026",
    prioridade: 2,
    cor: "#c40000",
    ocultar: false,
    imagens: []
  },
  {
    titulo: "Seleção de Ofertas",
    slug: "selecao-de-ofertas",
    ativo: true,
    inicioOriginal: "2026-05-21T00:00",
    fimOriginal: "2026-05-24T23:59",
    inicio: "21/05/2026",
    fim: "24/05/2026",
    prioridade: 3,
    cor: "#c40000",
    ocultar: false,
    imagens: []
  }
];

const tbody = document.getElementById("listaOfertas");

const modalOferta = document.getElementById("modalOferta");
const btnNovaOferta = document.getElementById("novaOferta");
const btnFecharModal = document.getElementById("fecharModal");
const formOferta = document.getElementById("formOferta");
const tipoOferta = document.getElementById("tipoOferta");

const tituloModalOferta = document.getElementById("tituloModalOferta");
const tituloOferta = document.getElementById("tituloOferta");
const slugOferta = document.getElementById("slugOferta");
const dataInicio = document.getElementById("dataInicio");
const dataFim = document.getElementById("dataFim");
const prioridadeOferta = document.getElementById("prioridadeOferta");
const corOferta = document.getElementById("corOferta");
const ativoOferta = document.getElementById("ativoOferta");
const ocultarOferta = document.getElementById("ocultarOferta");

const uploadArea = document.getElementById("uploadArea");
const imagensOferta = document.getElementById("imagensOferta");
const previewImagens = document.getElementById("previewImagens");

let imagensSelecionadas = [];
let indiceEditando = null;

function gerarSlug(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function calcularStatus(inicioValor, fimValor, ativo = true) {
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

function converterDataParaInput(dataBR) {
  if (!dataBR || dataBR === "-") return "";

  if (dataBR.includes("T")) {
    return dataBR.slice(0, 16);
  }

  const partes = dataBR.split("/");

  if (partes.length !== 3) return "";

  return `${partes[2]}-${partes[1]}-${partes[0]}T00:00`;
}

function atualizarCards() {
  const statusDasOfertas = ofertasMock.map((oferta) =>
    calcularStatus(
      oferta.inicioOriginal,
      oferta.fimOriginal,
      oferta.ativo
    )
  );

  document.getElementById("totalOfertas").textContent = ofertasMock.length;

  document.getElementById("ativas").textContent =
    statusDasOfertas.filter((status) => status === "Ativa").length;

  document.getElementById("futuras").textContent =
    statusDasOfertas.filter((status) => status === "Futura").length;

  document.getElementById("encerradas").textContent =
    statusDasOfertas.filter((status) => status === "Encerrada").length;
}

function renderizarOfertas() {
  tbody.innerHTML = "";

  ofertasMock.forEach((oferta, index) => {
    const statusAtual = calcularStatus(
      oferta.inicioOriginal,
      oferta.fimOriginal,
      oferta.ativo
    );

    let classeStatus = "ativa";

    if (statusAtual === "Futura") {
      classeStatus = "futura";
    }

    if (statusAtual === "Encerrada") {
      classeStatus = "encerrada";
    }

    tbody.innerHTML += `
      <tr>
        <td>${oferta.titulo}</td>

        <td>
          <span class="status ${classeStatus}">
            ${statusAtual}
          </span>
        </td>

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
  });

  atualizarCards();
}

function abrirModalNovaOferta() {
  tipoOferta.value = "oferta";
  indiceEditando = null;

  tituloModalOferta.textContent = "Nova Oferta";

  formOferta.reset();

  slugOferta.value = "";
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
  const oferta = ofertasMock[index];

  indiceEditando = index;
  tipoOferta.value = oferta.tipo || "oferta";

  tituloModalOferta.textContent = "Editar Oferta";

  tituloOferta.value = oferta.titulo || "";
  slugOferta.value = oferta.slug || gerarSlug(oferta.titulo || "");

  dataInicio.value = oferta.inicioOriginal || converterDataParaInput(oferta.inicio);
  dataFim.value = oferta.fimOriginal || converterDataParaInput(oferta.fim);

  prioridadeOferta.value = oferta.prioridade || 999;
  corOferta.value = oferta.cor || "#c40000";

  ativoOferta.checked = oferta.ativo !== false;
  ocultarOferta.checked = oferta.ocultar || false;

  imagensSelecionadas = oferta.imagens || [];

  renderizarPreviewImagens();

  modalOferta.classList.add("ativo");
}

function excluirOferta(index) {
  const oferta = ofertasMock[index];

  const confirmar = confirm(
    "Tem certeza que deseja excluir a oferta: " + oferta.titulo + "?"
  );

  if (!confirmar) return;

  ofertasMock.splice(index, 1);

  renderizarOfertas();
}

function adicionarImagens(arquivos) {
  const novosArquivos = Array.from(arquivos).filter((arquivo) =>
    arquivo.type && arquivo.type.startsWith("image/")
  );

  imagensSelecionadas = imagensSelecionadas.concat(novosArquivos);

  renderizarPreviewImagens();
}

function renderizarPreviewImagens() {
  previewImagens.innerHTML = "";

  imagensSelecionadas.forEach((arquivo, index) => {
    let urlTemporaria = "";

    if (arquivo instanceof File) {
      urlTemporaria = URL.createObjectURL(arquivo);
    } else if (typeof arquivo === "string") {
      urlTemporaria = arquivo;
    }

    const item = document.createElement("div");

    item.className = "preview-item";

    item.innerHTML = `
      <img src="${urlTemporaria}" alt="Imagem da oferta">

      <span>${index + 1}</span>

      <button type="button" onclick="removerImagem(${index})">
        ×
      </button>
    `;

    previewImagens.appendChild(item);
  });
}

function removerImagem(index) {
  imagensSelecionadas.splice(index, 1);
  renderizarPreviewImagens();
}

btnNovaOferta.addEventListener("click", abrirModalNovaOferta);

btnFecharModal.addEventListener("click", fecharModalOferta);

modalOferta.addEventListener("click", (evento) => {
  if (evento.target === modalOferta) {
    fecharModalOferta();
  }
});

tituloOferta.addEventListener("input", () => {
  slugOferta.value = gerarSlug(tituloOferta.value);
});

formOferta.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const ofertaSalva = {
    titulo: tituloOferta.value,
    slug: slugOferta.value,
    tipo: tipoOferta.value,
    ativo: ativoOferta.checked,
    inicioOriginal: dataInicio.value,
    fimOriginal: dataFim.value,
    inicio: formatarDataPainel(dataInicio.value),
    fim: formatarDataPainel(dataFim.value),
    prioridade: prioridadeOferta.value,
    cor: corOferta.value,
    ocultar: ocultarOferta.checked,
    imagens: imagensSelecionadas
  };

  if (indiceEditando !== null) {
    ofertasMock[indiceEditando] = ofertaSalva;
  } else {
    ofertasMock.push(ofertaSalva);
  }

  renderizarOfertas();
  fecharModalOferta();
});

uploadArea.addEventListener("click", () => {
  imagensOferta.click();
});

imagensOferta.addEventListener("change", (evento) => {
  adicionarImagens(evento.target.files);
});

uploadArea.addEventListener("dragover", (evento) => {
  evento.preventDefault();
  uploadArea.classList.add("ativo");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("ativo");
});

uploadArea.addEventListener("drop", (evento) => {
  evento.preventDefault();
  uploadArea.classList.remove("ativo");
  adicionarImagens(evento.dataTransfer.files);
});

renderizarOfertas();
