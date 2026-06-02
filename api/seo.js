const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function escaparHtml(texto) {
  return String(texto || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function consultarSupabase(url) {
  const resposta = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  });

  const texto = await resposta.text();

  if (!resposta.ok) {
    throw new Error(texto);
  }

  return texto ? JSON.parse(texto) : [];
}

export default async function handler(req, res) {
  try {
    const slug = String(req.query.slug || "").trim();

    const urlPadrao = "https://ofertas.perolagrupo.com.br";
    const imagemPadrao =
      "https://ofertas.perolagrupo.com.br/img/preview-whatsapp.jpg";

    if (!slug) {
      return res.redirect(302, urlPadrao);
    }

    const ofertas = await consultarSupabase(
      `${SUPABASE_URL}/rest/v1/ofertas_items?slug=eq.${encodeURIComponent(slug)}&select=*`
    );

    const oferta = ofertas[0];

    if (!oferta) {
      return res.redirect(302, urlPadrao);
    }

    const imagens = await consultarSupabase(
      `${SUPABASE_URL}/rest/v1/ofertas_imagens?oferta_id=eq.${oferta.id}&select=*&order=ordem.asc&limit=1`
    );

    const imagemOferta =
      imagens[0] && imagens[0].imagem_url
        ? imagens[0].imagem_url
        : imagemPadrao;

    const titulo =
      `${oferta.titulo || "Ofertas"} | Pérola Supermercado`;

    const descricao =
      "Confira essa seleção de ofertas do Pérola Supermercado.";

    const urlOferta =
      `${urlPadrao}/${slug}`;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escaparHtml(titulo)}</title>

  <meta name="description" content="${escaparHtml(descricao)}">

  <meta property="og:title" content="${escaparHtml(titulo)}">
  <meta property="og:description" content="${escaparHtml(descricao)}">
  <meta property="og:image" content="${escaparHtml(imagemOferta)}">
  <meta property="og:url" content="${escaparHtml(urlOferta)}">
  <meta property="og:type" content="website">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escaparHtml(titulo)}">
  <meta name="twitter:description" content="${escaparHtml(descricao)}">
  <meta name="twitter:image" content="${escaparHtml(imagemOferta)}">

  <meta http-equiv="refresh" content="0;url=${escaparHtml(urlOferta)}">
</head>
<body>
  <p>Redirecionando para ${escaparHtml(titulo)}...</p>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);

  } catch (erro) {
    res.status(500).send("Erro ao gerar SEO da oferta.");
  }
}
