const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function tokenAdminValido(req) {
  const tokenRecebido = req.headers["x-admin-token"];
  return tokenRecebido && tokenRecebido === process.env.ADMIN_TOKEN;
}

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

function extrairCaminhoStorage(urlImagem) {
  if (!urlImagem) {
    return null;
  }

  const marcador = "/storage/v1/object/public/ofertas-imagens/";
  const partes = String(urlImagem).split(marcador);

  if (!partes[1]) {
    return null;
  }

  return partes[1];
}

function imagemEhDoStorage(urlImagem) {
  return String(urlImagem || "").includes(
    "/storage/v1/object/public/ofertas-imagens/"
  );
}

async function excluirImagensStorage(urlsImagens = []) {
  const caminhos = urlsImagens
    .map(extrairCaminhoStorage)
    .filter(Boolean);

  if (caminhos.length === 0) {
    return;
  }

  const respostaStorage = await fetch(
    `${SUPABASE_URL}/storage/v1/object/ofertas-imagens`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prefixes: caminhos
      })
    }
  );

  const texto = await respostaStorage.text();

  if (!respostaStorage.ok) {
    throw new Error(texto);
  }
}

function extrairCaminhoStorage(urlImagem) {
  if (!urlImagem) {
    return null;
  }

  const marcador = "/storage/v1/object/public/ofertas-imagens/";

  const partes = String(urlImagem).split(marcador);

  if (!partes[1]) {
    return null;
  }

  return partes[1];
}

async function excluirImagensStorage(urlsImagens = []) {
  const caminhos = urlsImagens
    .map(extrairCaminhoStorage)
    .filter(Boolean);

  if (caminhos.length === 0) {
    return;
  }

  const respostaStorage = await fetch(
    `${SUPABASE_URL}/storage/v1/object/ofertas-imagens`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prefixes: caminhos
      })
    }
  );

  const texto = await respostaStorage.text();

  if (!respostaStorage.ok) {
    throw new Error(texto);
  }
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

  const texto = await respostaUpload.text();

  if (!respostaUpload.ok) {
    throw new Error(texto);
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
      const ofertas = await consultarSupabase(
        `${SUPABASE_URL}/rest/v1/ofertas_items?select=*&order=prioridade.asc`
      );

      const imagens = await consultarSupabase(
        `${SUPABASE_URL}/rest/v1/ofertas_imagens?select=*&order=ordem.asc`
      );

      if (!Array.isArray(ofertas)) {
        return resposta(res, 500, {
          erro: "Resposta de ofertas_items não veio como lista.",
          retorno: ofertas
        });
      }

      if (!Array.isArray(imagens)) {
        return resposta(res, 500, {
          erro: "Resposta de ofertas_imagens não veio como lista.",
          retorno: imagens
        });
      }

      if (
  ["POST", "PUT", "DELETE"].includes(req.method) &&
  !tokenAdminValido(req)
) {
  return resposta(res, 401, {
    erro: "Acesso não autorizado."
  });
}
   
      const resultado = ofertas.map((oferta) => {
        return {
          id: oferta.id,
          titulo: oferta.titulo,
          slug: oferta.slug,
          tipo: oferta.tipo,
          ativo: oferta.ativo,
          ocultar: oferta.ocultar,
          inicioOriginal: oferta.data_inicio ? oferta.data_inicio.slice(0, 16) : "",
          fimOriginal: oferta.data_fim ? oferta.data_fim.slice(0, 16) : "",
          inicio: oferta.data_inicio ? new Date(oferta.data_inicio).toLocaleDateString("pt-BR") : "-",
          fim: oferta.data_fim ? new Date(oferta.data_fim).toLocaleDateString("pt-BR") : "-",
          prioridade: oferta.prioridade,
          cor: oferta.cor,
          imagens: imagens
            .filter((img) => img.oferta_id === oferta.id)
            .map((img) => img.imagem_url)
        };
      });

      return resposta(res, 200, resultado);
    }

if (req.method === "PUT") {
  const oferta = req.body;

  if (!oferta.id) {
    return resposta(res, 400, {
      erro: "ID da oferta não informado."
    });
  }

  await consultarSupabase(
    `${SUPABASE_URL}/rest/v1/ofertas_items?id=eq.${oferta.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
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

const imagensAntigas = await consultarSupabase(
  `${SUPABASE_URL}/rest/v1/ofertas_imagens?oferta_id=eq.${oferta.id}&select=imagem_url`
);

await excluirImagensStorage(
  imagensAntigas.map((imagem) => imagem.imagem_url)
);

const imagensAntigas = await consultarSupabase(
  `${SUPABASE_URL}/rest/v1/ofertas_imagens?oferta_id=eq.${oferta.id}&select=imagem_url`
);

const urlsAntigas = imagensAntigas.map((imagem) => imagem.imagem_url);

const urlsAtuais = (oferta.imagens || [])
  .map((imagem) => typeof imagem === "string" ? imagem : imagem.url)
  .filter(Boolean);

const urlsRemovidas = urlsAntigas.filter((urlAntiga) => {
  return (
    imagemEhDoStorage(urlAntiga) &&
    !urlsAtuais.includes(urlAntiga)
  );
});

await excluirImagensStorage(urlsRemovidas);
  
  await consultarSupabase(
    `${SUPABASE_URL}/rest/v1/ofertas_imagens?oferta_id=eq.${oferta.id}`,
    {
      method: "DELETE"
    }
  );

  for (let i = 0; i < oferta.imagens.length; i++) {
    const imagem = oferta.imagens[i];

    let urlImagem = typeof imagem === "string" ? imagem : imagem.url;

    if (urlImagem.startsWith("data:image")) {
      urlImagem = await uploadImagem(imagem, oferta.id, i);
    }

    await consultarSupabase(
      `${SUPABASE_URL}/rest/v1/ofertas_imagens`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          oferta_id: oferta.id,
          imagem_url: urlImagem,
          ordem: i
        })
      }
    );
  }

  return resposta(res, 200, {
    sucesso: true
  });
}
    
    if (req.method === "POST") {
      const oferta = req.body;

      const ofertaCriada = await consultarSupabase(
        `${SUPABASE_URL}/rest/v1/ofertas_items`,
        {
          method: "POST",
          headers: {
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

      const ofertaId = ofertaCriada[0].id;

      for (let i = 0; i < oferta.imagens.length; i++) {
        const imagem = oferta.imagens[i];

        let urlImagem = typeof imagem === "string" ? imagem : imagem.url;

        if (urlImagem.startsWith("data:image")) {
          urlImagem = await uploadImagem(imagem, ofertaId, i);
        }

        await consultarSupabase(
          `${SUPABASE_URL}/rest/v1/ofertas_imagens`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              oferta_id: ofertaId,
              imagem_url: urlImagem,
              ordem: i
            })
          }
        );
      }

      return resposta(res, 200, {
        sucesso: true
      });
    }

    if (req.method === "DELETE") {
  const { id } = req.query;

  const imagensOferta = await consultarSupabase(
    `${SUPABASE_URL}/rest/v1/ofertas_imagens?oferta_id=eq.${id}&select=imagem_url`
  );

  await excluirImagensStorage(
    imagensOferta.map((imagem) => imagem.imagem_url)
  );

  await consultarSupabase(
    `${SUPABASE_URL}/rest/v1/ofertas_items?id=eq.${id}`,
    {
      method: "DELETE"
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
