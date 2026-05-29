const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function resposta(res, status, dados) {
  res.status(status).json(dados);
}

function getExtensao(base64, nome) {
  if (nome && nome.includes(".")) {
    return nome.split(".").pop();
  }

  if (base64.includes("image/png")) return "png";
  if (base64.includes("image/webp")) return "webp";
  return "jpg";
}

function base64ParaBuffer(base64) {
  const partes = base64.split(",");
  return Buffer.from(partes[1], "base64");
}

async function uploadImagem(imagem, ofertaId, index) {
  const extensao = getExtensao(imagem.url, imagem.nome);
  const nomeArquivo = `${ofertaId}/${Date.now()}-${index}.${extensao}`;

  const buffer = base64ParaBuffer(imagem.url);

  const respostaUpload = await fetch(
    `${SUPABASE_URL}/storage/v1/object/ofertas-imagens/${nomeArquivo}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": `image/${extensao}`,
        "x-upsert": "true"
      },
      body: buffer
    }
  );

  if (!respostaUpload.ok) {
    throw new Error("Erro ao subir imagem");
  }

  return `${SUPABASE_URL}/storage/v1/object/public/ofertas-imagens/${nomeArquivo}`;
}

export default async function handler(req, res) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return resposta(res, 500, {
        erro: "Variáveis SUPABASE_URL ou SUPABASE_SERVICE_KEY não configuradas."
      });
    }

    if (req.method === "GET") {
      const respostaOfertas = await fetch(
        `${SUPABASE_URL}/rest/v1/ofertas_items?select=*&order=prioridade.asc`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        }
      );

      const ofertas = await respostaOfertas.json();

      const respostaImagens = await fetch(
        `${SUPABASE_URL}/rest/v1/ofertas_imagens?select=*&order=ordem.asc`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        }
      );

      const imagens = await respostaImagens.json();

      const resultado = ofertas.map((oferta) => {
        return {
          id: oferta.id,
          titulo: oferta.titulo,
          slug: oferta.slug,
          tipo: oferta.tipo,
          ativo: oferta.ativo,
          ocultar: oferta.ocultar,
          inicioOriginal: oferta.data_inicio?.slice(0, 16),
          fimOriginal: oferta.data_fim?.slice(0, 16),
          inicio: new Date(oferta.data_inicio).toLocaleDateString("pt-BR"),
          fim: new Date(oferta.data_fim).toLocaleDateString("pt-BR"),
          prioridade: oferta.prioridade,
          cor: oferta.cor,
          imagens: imagens
            .filter((img) => img.oferta_id === oferta.id)
            .map((img) => img.imagem_url)
        };
      });

      return resposta(res, 200, resultado);
    }

    if (req.method === "POST") {
      const oferta = req.body;

      const respostaInsert = await fetch(
        `${SUPABASE_URL}/rest/v1/ofertas_items`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation"
          },
          body: JSON.stringify({
            titulo: oferta.titulo,
            slug: oferta.slug,
            tipo: oferta.tipo,
            ativo: oferta.ativo,
            ocultar: oferta.ocultar,
            data_inicio: oferta.inicioOriginal,
            data_fim: oferta.fimOriginal,
            prioridade: Number(oferta.prioridade || 999),
            cor: oferta.cor
          })
        }
      );

      const ofertaCriada = await respostaInsert.json();

      if (!respostaInsert.ok) {
        return resposta(res, 400, ofertaCriada);
      }

      const ofertaId = ofertaCriada[0].id;

      for (let i = 0; i < oferta.imagens.length; i++) {
        const imagem = oferta.imagens[i];

        let urlImagem = typeof imagem === "string" ? imagem : imagem.url;

        if (urlImagem.startsWith("data:image")) {
          urlImagem = await uploadImagem(imagem, ofertaId, i);
        }

        await fetch(`${SUPABASE_URL}/rest/v1/ofertas_imagens`, {
          method: "POST",
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            oferta_id: ofertaId,
            imagem_url: urlImagem,
            ordem: i
          })
        });
      }

      return resposta(res, 200, {
        sucesso: true
      });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;

      await fetch(
        `${SUPABASE_URL}/rest/v1/ofertas_items?id=eq.${id}`,
        {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`
          }
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
