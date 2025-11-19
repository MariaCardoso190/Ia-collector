import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

async function testarOpenRouter() {
  const resposta = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost",
      "X-Title": "ia-collector"
    }
  });

  const dados = await resposta.json();

  if (resposta.ok) {
    console.log("✅ Conexão bem-sucedida!");
    console.log("📦 Modelos disponíveis:");
    dados.data.forEach(modelo => console.log("-", modelo.id));
  } else {
    console.error("❌ Erro ao conectar:", dados);
  }
}

testarOpenRouter();
