import 'dotenv/config';
import fetch from 'node-fetch';

const apiKey = process.env.OPENROUTER_API_KEY;

async function listarModelos() {
  console.log("🔍 Consultando modelos disponíveis via OpenRouter...");

  try {
    const resposta = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    const dados = await resposta.json();
    console.log("📦 Resposta completa da API:\n", JSON.stringify(dados, null, 2));

    if (dados.data) {
      console.log("\n✅ Modelos disponíveis:");
      dados.data.forEach(modelo => console.log(" - " + modelo.id));
    } else {
      console.log("⚠️ Nenhum modelo encontrado na resposta.");
    }
  } catch (erro) {
    console.error("❌ Erro ao listar modelos:", erro);
  }
}

listarModelos();
