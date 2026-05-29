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

    ofertasMock.forEach(oferta => {

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
                    <button class="btn-editar">
                        Editar
                    </button>

                    <button class="btn-excluir">
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
    modalOferta.classList.add("ativo");
});

btnFecharModal.addEventListener("click", () => {
    modalOferta.classList.remove("ativo");
});

modalOferta.addEventListener("click", (evento) => {
    if(evento.target === modalOferta){
        modalOferta.classList.remove("ativo");
    }
});

tituloOferta.addEventListener("input", () => {
    slugOferta.value = gerarSlug(tituloOferta.value);
});

formOferta.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const novaOferta = {
        titulo: tituloOferta.value,
        status: "Ativa",
        inicio: formatarDataPainel(dataInicio.value),
        fim: formatarDataPainel(dataFim.value)
    };

    ofertasMock.push(novaOferta);

    renderizarOfertas();

    formOferta.reset();

    imagensSelecionadas = [];
    previewImagens.innerHTML = "";

    ativoOferta.checked = true;
    prioridadeOferta.value = 999;
    corOferta.value = "#c40000";

    modalOferta.classList.remove("ativo");
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
