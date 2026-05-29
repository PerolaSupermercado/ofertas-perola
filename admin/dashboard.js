const ofertasMock = [

    {
        titulo:"Operação Fecha Mês",
        status:"Ativa",
        inicio:"29/05/2026",
        fim:"31/05/2026"
    },

    {
        titulo:"Quinta Filé",
        status:"Ativa",
        inicio:"21/05/2026",
        fim:"21/05/2026"
    },

    {
        titulo:"Seleção de Ofertas",
        status:"Ativa",
        inicio:"21/05/2026",
        fim:"24/05/2026"
    }

];

const tbody =
document.getElementById("listaOfertas");

function renderizarOfertas(){

    tbody.innerHTML = "";

    ofertasMock.forEach((oferta, index) => {

        let classeStatus = "ativa";

        if(oferta.status === "Futura"){
            classeStatus = "futura";
        }

        if(oferta.status === "Encerrada"){
            classeStatus = "encerrada";
        }

        tbody.innerHTML += `
            <tr>
                <td>${oferta.titulo}</td>

                <td>
                    <span class="status ${classeStatus}">
                        ${oferta.status}
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

document.getElementById("totalOfertas").textContent =
ofertasMock.length;

document.getElementById("ativas").textContent =
ofertasMock.length;

document.getElementById("futuras").textContent =
0;

document.getElementById("encerradas").textContent =
0;

const modalOferta =
document.getElementById("modalOferta");

const tituloModalOferta =
document.getElementById("tituloModalOferta");

const dataInicio =
document.getElementById("dataInicio");

const dataFim =
document.getElementById("dataFim");

const prioridadeOferta =
document.getElementById("prioridadeOferta");

const corOferta =
document.getElementById("corOferta");

const ativoOferta =
document.getElementById("ativoOferta");

const ocultarOferta =
document.getElementById("ocultarOferta");

let indiceEditando = null;

const btnNovaOferta =
document.getElementById("novaOferta");

const btnFecharModal =
document.getElementById("fecharModal");

const formOferta =
document.getElementById("formOferta");

const tituloOferta =
document.getElementById("tituloOferta");

const slugOferta =
document.getElementById("slugOferta");

function gerarSlug(texto){
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

btnNovaOferta.addEventListener("click", () => {
    abrirModalNovaOferta();
});

btnFecharModal.addEventListener("click", () => {
    fecharModalOferta();
});

modalOferta.addEventListener("click", (evento) => {
    if(evento.target === modalOferta){
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
        status: ativoOferta.checked
    ? calcularStatus(dataInicio.value, dataFim.value)
    : "Encerrada",
        inicio: formatarDataPainel(dataInicio.value),
        fim: formatarDataPainel(dataFim.value),
        prioridade: prioridadeOferta.value,
        cor: corOferta.value,
        ocultar: ocultarOferta.checked,
        imagens: imagensSelecionadas
    };

    if(indiceEditando !== null){
        ofertasMock[indiceEditando] = ofertaSalva;
    } else {
        ofertasMock.push(ofertaSalva);
    }

    renderizarOfertas();
    fecharModalOferta();
});

const uploadArea =
document.getElementById("uploadArea");

const imagensOferta =
document.getElementById("imagensOferta");

const previewImagens =
document.getElementById("previewImagens");

let imagensSelecionadas = [];

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

function adicionarImagens(arquivos){

    const novosArquivos =
    Array.from(arquivos).filter(arquivo =>
        arquivo.type.startsWith("image/")
    );

    imagensSelecionadas =
    imagensSelecionadas.concat(novosArquivos);

    renderizarPreviewImagens();
}

function renderizarPreviewImagens(){

    previewImagens.innerHTML = "";

    imagensSelecionadas.forEach((arquivo, index) => {

        const urlTemporaria =
        URL.createObjectURL(arquivo);

        const item =
        document.createElement("div");

        item.className = "preview-item";

        item.innerHTML = `
            <img src="${urlTemporaria}" alt="Imagem da oferta">

            <span>
                ${index + 1}
            </span>

            <button type="button" onclick="removerImagem(${index})">
                ×
            </button>
        `;

        previewImagens.appendChild(item);

    });

}

function removerImagem(index){

    imagensSelecionadas.splice(index, 1);

    renderizarPreviewImagens();
}

function atualizarCards(){

    document.getElementById("totalOfertas").textContent =
    ofertasMock.length;

    document.getElementById("ativas").textContent =
    ofertasMock.filter(oferta => oferta.status === "Ativa").length;

    document.getElementById("futuras").textContent =
    ofertasMock.filter(oferta => oferta.status === "Futura").length;

    document.getElementById("encerradas").textContent =
    ofertasMock.filter(oferta => oferta.status === "Encerrada").length;
}

function formatarDataPainel(valor){

    if(!valor){
        return "-";
    }

    const data = new Date(valor);

    return data.toLocaleDateString("pt-BR");
}

renderizarOfertas();
function excluirOferta(index){

    const oferta =
    ofertasMock[index];

    const confirmar =
    confirm(
        "Tem certeza que deseja excluir a oferta: " +
        oferta.titulo +
        "?"
    );

    if(!confirmar){
        return;
    }

    ofertasMock.splice(index, 1);

    renderizarOfertas();
}

function abrirModalNovaOferta(){

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

function editarOferta(index){

    const oferta =
    ofertasMock[index];

    indiceEditando = index;

    tituloModalOferta.textContent = "Editar Oferta";

    tituloOferta.value = oferta.titulo || "";
    slugOferta.value = oferta.slug || gerarSlug(oferta.titulo || "");

    dataInicio.value = converterDataParaInput(oferta.inicio);
    dataFim.value = converterDataParaInput(oferta.fim);

    prioridadeOferta.value = oferta.prioridade || 999;
    corOferta.value = oferta.cor || "#c40000";

    ativoOferta.checked =
    oferta.status === "Ativa";

    ocultarOferta.checked =
    oferta.ocultar || false;

    imagensSelecionadas =
    oferta.imagens || [];

    renderizarPreviewImagens();

    modalOferta.classList.add("ativo");
}

function fecharModalOferta(){

    modalOferta.classList.remove("ativo");

    indiceEditando = null;

    formOferta.reset();

    imagensSelecionadas = [];
    previewImagens.innerHTML = "";
}

function converterDataParaInput(dataBR){

    if(!dataBR || dataBR === "-"){
        return "";
    }

    if(dataBR.includes("T")){
        return dataBR.slice(0, 16);
    }

    const partes =
    dataBR.split("/");

    if(partes.length !== 3){
        return "";
    }

    const dia = partes[0];
    const mes = partes[1];
    const ano = partes[2];

    return `${ano}-${mes}-${dia}T00:00`;
}

function calcularStatus(dataInicioValor, dataFimValor){

    const agora = new Date();

    const inicio =
    new Date(dataInicioValor);

    const fim =
    new Date(dataFimValor);

    if(!dataInicioValor || !dataFimValor){
        return "Encerrada";
    }

    if(agora < inicio){
        return "Futura";
    }

    if(agora > fim){
        return "Encerrada";
    }

    return "Ativa";
}
