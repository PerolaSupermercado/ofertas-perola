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

    alert("Oferta salva no painel visual. No próximo passo vamos ligar isso ao Supabase.");
});
