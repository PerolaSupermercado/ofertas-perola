const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido"
    });
  }

  const { senha } = req.body;

  if (!ADMIN_PASSWORD || !ADMIN_TOKEN) {
    return res.status(500).json({
      erro: "Login não configurado."
    });
  }

  if (senha !== ADMIN_PASSWORD) {
    return res.status(401).json({
      erro: "Senha incorreta."
    });
  }

  return res.status(200).json({
    sucesso: true,
    token: ADMIN_TOKEN
  });
}
