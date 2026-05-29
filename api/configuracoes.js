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
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return resposta(res, 500, {
        erro: "Variáveis SUPABASE_URL ou SUPABASE_SERVICE_KEY não configuradas."
      });
    }

    if (req.method === "GET") {
      const dados = await consultarSupabase(
        `${SUPABASE_URL}/rest/v1/ofertas_configuracoes?id=eq.1&select=*`
      );

      const config = dados[0];

      return resposta(res, 200, {
        tituloSite: config.titulo_site,
        subtituloSite: config.subtitulo_site,
        linkGrupo: config.link_grupo_whatsapp,
        bannerPrincipal: config.banner_url,
        placeholder: config.placeholder_url,
        imagemCompartilhamento: config.imagem_compartilhamento || "img/preview-whatsapp.jpg",
        tituloCompartilhamento: config.titulo_compartilhamento || "Ofertas Pérola Supermercado",
        descricaoCompartilhamento: config.descricao_compartilhamento || "Confira as promoções disponíveis no Pérola Supermercado."
      });
    }

    if (req.method === "PUT") {
      const config = req.body;

      await consultarSupabase(
        `${SUPABASE_URL}/rest/v1/ofertas_configuracoes?id=eq.1`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            titulo_site: config.tituloSite,
            subtitulo_site: config.subtituloSite,
            link_grupo_whatsapp: config.linkGrupo,
            banner_url: config.bannerPrincipal,
            placeholder_url: config.placeholder,
            imagem_compartilhamento: config.imagemCompartilhamento,
            titulo_compartilhamento: config.tituloCompartilhamento,
            descricao_compartilhamento: config.descricaoCompartilhamento,
            atualizado_em: new Date().toISOString()
          })
        }
      );

      return resposta(res, 200, {
        sucesso: true
      });
    }

    return resposta(res, 405, {
      erro: "Método não permitido"
    });

  } catch (erro) {
    return resposta(res, 500, {
      erro: erro.message
    });
  }
}
