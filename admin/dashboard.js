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

    tbody.innerHTML += `
        <tr>

            <td>${oferta.titulo}</td>

            <td>${oferta.status}</td>

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
