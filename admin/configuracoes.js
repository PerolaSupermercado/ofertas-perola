const configuracoesPadrao = {
    tituloSite: "Escolha uma categoria e confira nossas promoções",
    subtituloSite: "",
    linkGrupo: "https://chat.whatsapp.com/HCEt8q7P5vgDIPVq8B68Du?mode=gi_t",
    bannerPrincipal: "img/banner.jpg",
    placeholderImagem: "img/placeholder.png",
    tituloCompartilhamento: "Ofertas Pérola Supermercado",
    descricaoCompartilhamento: "Confira as promoções disponíveis no Pérola Supermercado.",
    imagemCompartilhamento: "img/preview-whatsapp.jpg"
};

const campos = {
    tituloSite: document.getElementById("tituloSite"),
    subtituloSite: document.getElementById("subtituloSite"),
    linkGrupo: document.getElementById("linkGrupo"),
    bannerPrincipal: document.getElementById("bannerPrincipal"),
    placeholderImagem: document.getElementById("placeholderImagem"),
    tituloCompartilhamento: document.getElementById("tituloCompartilhamento"),
    descricaoCompartilhamento: document.getElementById("descricaoCompartilhamento"),
    imagemCompartilhamento: document.getElementById("imagemCompartilhamento")
};

const btnSalvar =
document.getElementById("salvarConfiguracoes");

const mensagem =
document.getElementById("mensagem");

function carregarConfiguracoes(){

    const salvas =
    localStorage.getItem("configuracoesOfertas");

    const configuracoes =
    salvas ? JSON.parse(salvas) : configuracoesPadrao;

    Object.keys(campos).forEach((chave) => {
        campos[chave].value = configuracoes[chave] || "";
    });
}

function salvarConfiguracoes(){

    const novasConfiguracoes = {};

    Object.keys(campos).forEach((chave) => {
        novasConfiguracoes[chave] = campos[chave].value;
    });

    localStorage.setItem(
        "configuracoesOfertas",
        JSON.stringify(novasConfiguracoes)
    );

    mensagem.textContent =
    "Configurações salvas com sucesso no painel visual.";

    mensagem.classList.add("ativo");

    setTimeout(() => {
        mensagem.classList.remove("ativo");
    }, 3000);
}

btnSalvar.addEventListener("click", salvarConfiguracoes);

carregarConfiguracoes();
