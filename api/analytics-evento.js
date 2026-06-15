const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function enviarJson(res, status, dados) {
  res.setHeader("Content-Type", "application/json");
  res.status(status).send(JSON.stringify(dados));
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return enviarJson(res, 405, {
        erro: "Método não permitido"
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return enviarJson(res, 500, {
        erro: "Variáveis do Supabase não configuradas."
      });
    }

    const corpo = req.body || {};

    const evento = String(corpo.evento || "").trim();

    if (!evento) {
      return enviarJson(res, 400, {
        erro: "Evento não informado."
      });
    }

    const respostaSupabase = await fetch(
      `${SUPABASE_URL}/rest/v1/analytics_eventos`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
  evento: evento,
  oferta_slug: corpo.oferta_slug || null,
  oferta_titulo: corpo.oferta_titulo || null,
  oferta_inicio: corpo.oferta_inicio || null,
  oferta_fim: corpo.oferta_fim || null,
  pagina: corpo.pagina || null,
  sessao_id: corpo.sessao_id || null
})
      }
    );

    const textoSupabase = await respostaSupabase.text();

    if (!respostaSupabase.ok) {
      return enviarJson(res, 500, {
        erro: "Erro ao salvar no Supabase.",
        detalhe: textoSupabase
      });
    }

    return enviarJson(res, 200, {
      sucesso: true
    });

  } catch (erro) {
    return enviarJson(res, 500, {
      erro: "Erro interno na função.",
      detalhe: erro.message
    });
  }
}
