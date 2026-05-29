const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function base64ParaBuffer(base64) {
  const partes = base64.split(",");
  return Buffer.from(partes[1], "base64");
}

function pegarExtensao(nomeArquivo, base64) {
  if (nomeArquivo && nomeArquivo.includes(".")) {
    return nomeArquivo.split(".").pop().toLowerCase();
  }

  if (base64.includes("image/png")) return "png";
  if (base64.includes("image/webp")) return "webp";

  return "jpg";
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        erro: "Método não permitido"
      });
    }

    const { arquivoBase64, nomeArquivo } = req.body;

    if (!arquivoBase64) {
      return res.status(400).json({
        erro: "Arquivo não enviado."
      });
    }

    const extensao = pegarExtensao(nomeArquivo, arquivoBase64);

    const nomeFinal =
      `ofertas/${Date.now()}-${Math.random().toString(36).slice(2)}.${extensao}`;

    const buffer = base64ParaBuffer(arquivoBase64);

    const respostaUpload = await fetch(
      `${SUPABASE_URL}/storage/v1/object/ofertas-imagens/${nomeFinal}`,
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
      return res.status(500).json({
        erro: texto
      });
    }

    const urlPublica =
      `${SUPABASE_URL}/storage/v1/object/public/ofertas-imagens/${nomeFinal}`;

    return res.status(200).json({
      sucesso: true,
      url: urlPublica
    });

  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
}
