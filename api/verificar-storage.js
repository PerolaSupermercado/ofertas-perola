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

    // 1. Buscar imagens cadastradas no banco
    const imagensBanco = await supabaseFetch(
      `${SUPABASE_URL}/rest/v1/ofertas_imagens?select=imagem_url`
    );

    const arquivosBanco = imagensBanco.map(item => {
      return item.imagem_url.split("/ofertas-imagens/")[1];
    });

    // 2. Listar arquivos do Storage
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

    const listaStorage = arquivosStorage.map(item => ({
      nome: item.name,
      tamanho: item.metadata?.size || 0
    }));

    const orfaos = listaStorage.filter(item => {
      return !arquivosBanco.includes(`ofertas/${item.nome}`);
    });

    const tamanhoTotalOrfaos = orfaos.reduce((total, item) => {
      return total + Number(item.tamanho || 0);
    }, 0);

    return res.status(200).json({
      imagensBanco: arquivosBanco.length,
      arquivosStorage: listaStorage.length,
      arquivosOrfaos: orfaos.length,
      espacoOrfaoMB: (
        tamanhoTotalOrfaos / 1024 / 1024
      ).toFixed(2),
      listaOrfaos: orfaos
    });

  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
}
