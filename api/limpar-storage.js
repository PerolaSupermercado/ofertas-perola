const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function supabaseFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      ...(options.headers || {})
    }
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export default async function handler(req, res) {
  try {

    const imagensBanco = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/ofertas_imagens?select=imagem_url`
    );

    const arquivosBanco = imagensBanco.map(item => {
      return item.imagem_url.split("/ofertas-imagens/")[1];
    });

    const arquivosStorage = await supabaseFetch(
      `${SUPABASE_URL}/storage/v1/object/list/ofertas-imagens`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prefix: "ofertas"
        })
      }
    );

    const orfaos = arquivosStorage.filter(item => {
      return !arquivosBanco.includes(`ofertas/${item.name}`);
    });

    const arquivosParaApagar = orfaos.map(item => {
      return `ofertas/${item.name}`;
    });

    let apagados = 0;

    if (arquivosParaApagar.length > 0) {

      await supabaseFetch(
        `${SUPABASE_URL}/storage/v1/object/ofertas-imagens`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prefixes: arquivosParaApagar
          })
        }
      );

      apagados = arquivosParaApagar.length;
    }

    return res.status(200).json({
      sucesso: true,
      apagados
    });

  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
}
