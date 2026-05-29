export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido"
    });
  }

  return res.status(200).json({
    sucesso: true,
    mensagem: "API de upload funcionando."
  });
}
