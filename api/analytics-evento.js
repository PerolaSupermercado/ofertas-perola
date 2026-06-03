const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function resposta(res, status, dados) {
  res.status(status).json(dados);
}

async function consultarSupabase(url, opcoes = {}) {
  const respostaApi = await fetch(url, {
    ...opcoes,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      ...(opcoes.headers || {})
    }
  });

  const texto = await respostaApi.text();

  let json;

  try {
    json = texto ? JSON.parse(texto) : null;
  } catch {
    json = {
      resposta_bruta: texto
    };
  }

  if (!respostaApi.ok) {
    throw new Error(JSON.stringify(json));
  }

  return json;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return resposta(res, 405, {
        erro: "Método não permitido"
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return resposta(res, 500, {
        erro: "Variáveis do Supabase não configuradas."
      });
    }

    const corpo = req.body || {};

    const evento = String(corpo.evento || "").trim();

    if (!evento) {
      return resposta(res, 400, {
        erro: "Evento não informado."
      });
    }

    await consultarSupabase(
      `${SUPABASE_URL}/rest/v1/analytics_eventos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          evento: evento,
          oferta_slug: corpo.oferta_slug || null,
          oferta_titulo: corpo.oferta_titulo || null,
          pagina: corpo.pagina || null
        })
      }
    );

    return resposta(res, 200, {
      sucesso: true
    });

  } catch (erro) {
    console.error("Erro analytics-evento:", erro);

    return resposta(res, 500, {
      erro: "Erro ao registrar evento."
    });
  }
}
