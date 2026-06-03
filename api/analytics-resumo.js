const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function enviarJson(res, status, dados) {
  res.setHeader("Content-Type", "application/json");
  res.status(status).send(JSON.stringify(dados));
}

async function consultarSupabase(url, opcoes = {}) {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      ...(opcoes.headers || {})
    }
  });

  const texto = await resposta.text();

  let json;

  try {
    json = texto ? JSON.parse(texto) : [];
  } catch {
    json = [];
  }

  if (!resposta.ok) {
    throw new Error(texto);
  }

  return json;
}

function inicioDoDiaISO() {
  const data = new Date();

  data.setHours(0, 0, 0, 0);

  return data.toISOString();
}

function seteDiasAtrasISO() {
  const data = new Date();

  data.setDate(data.getDate() - 7);
  data.setHours(0, 0, 0, 0);

  return data.toISOString();
}

function contarPorEvento(eventos, nomeEvento) {
  return eventos.filter((item) => item.evento === nomeEvento).length;
}

function contarSessoesUnicas(eventos) {
  const sessoes = new Set();

  eventos.forEach((item) => {
    if (item.sessao_id) {
      sessoes.add(item.sessao_id);
    }
  });

  return sessoes.size;
}

function encontrarOfertaCampea(eventos) {
  const mapa = {};

  eventos
    .filter((item) => item.evento === "oferta_aberta")
    .forEach((item) => {
      const chave = item.oferta_slug || item.oferta_titulo || "sem-identificacao";

      if (!mapa[chave]) {
        mapa[chave] = {
          slug: item.oferta_slug,
          titulo: item.oferta_titulo || item.oferta_slug || "Sem título",
          visualizacoes: 0
        };
      }

      mapa[chave].visualizacoes++;
    });

  const ranking = Object.values(mapa).sort((a, b) => {
    return b.visualizacoes - a.visualizacoes;
  });

  return ranking[0] || null;
}

function montarRankingOfertas(eventos) {
  const mapa = {};

  eventos.forEach((item) => {
    const chave = item.oferta_slug || item.oferta_titulo || "sem-identificacao";

    if (!mapa[chave]) {
      mapa[chave] = {
        slug: item.oferta_slug,
        titulo: item.oferta_titulo || item.oferta_slug || "Sem título",
        visualizacoes: 0,
        visitantes: new Set(),
        trocasPagina: 0,
        compartilhamentos: 0,
        cliquesWhatsapp: 0
      };
    }

    if (item.evento === "oferta_aberta") {
      mapa[chave].visualizacoes++;
    }

    if (item.sessao_id) {
      mapa[chave].visitantes.add(item.sessao_id);
    }

    if (item.evento === "trocar_pagina") {
      mapa[chave].trocasPagina++;
    }

    if (item.evento === "clique_compartilhar") {
      mapa[chave].compartilhamentos++;
    }

    if (item.evento === "clique_grupo_whatsapp") {
      mapa[chave].cliquesWhatsapp++;
    }
  });

  return Object.values(mapa)
    .map((item) => {
      return {
        slug: item.slug,
        titulo: item.titulo,
        visualizacoes: item.visualizacoes,
        visitantes: item.visitantes.size,
        trocasPagina: item.trocasPagina,
        compartilhamentos: item.compartilhamentos,
        cliquesWhatsapp: item.cliquesWhatsapp
      };
    })
    .sort((a, b) => b.visualizacoes - a.visualizacoes)
    .slice(0, 10);
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return enviarJson(res, 405, {
        erro: "Método não permitido"
      });
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return enviarJson(res, 500, {
        erro: "Variáveis do Supabase não configuradas."
      });
    }

    const inicioHoje = inicioDoDiaISO();
    const inicioSemana = seteDiasAtrasISO();

    const eventosHoje = await consultarSupabase(
      `${SUPABASE_URL}/rest/v1/analytics_eventos?select=*&created_at=gte.${encodeURIComponent(inicioHoje)}`
    );

    const eventosSemana = await consultarSupabase(
      `${SUPABASE_URL}/rest/v1/analytics_eventos?select=*&created_at=gte.${encodeURIComponent(inicioSemana)}`
    );

    const ofertaCampea = encontrarOfertaCampea(eventosSemana);
    const rankingOfertas = montarRankingOfertas(eventosSemana);

    return enviarJson(res, 200, {
      visualizacoesHoje: contarPorEvento(eventosHoje, "oferta_aberta"),
      visitantesHoje: contarSessoesUnicas(eventosHoje),
      visualizacoesSemana: contarPorEvento(eventosSemana, "oferta_aberta"),
      visitantesSemana: contarSessoesUnicas(eventosSemana),
      trocasPaginaSemana: contarPorEvento(eventosSemana, "trocar_pagina"),
      compartilhamentosSemana: contarPorEvento(eventosSemana, "clique_compartilhar"),
      cliquesWhatsappSemana: contarPorEvento(eventosSemana, "clique_grupo_whatsapp"),
      ofertaCampea: ofertaCampea,
      rankingOfertas: rankingOfertas
    });

  } catch (erro) {
    return enviarJson(res, 500, {
      erro: "Erro ao carregar resumo de analytics.",
      detalhe: erro.message
    });
  }
}
