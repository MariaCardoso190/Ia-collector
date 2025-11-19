import dotenv from "dotenv";
import fetch from "node-fetch";
import readline from "readline";

// Carrega as variáveis do .env
dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "kwaipilot/kat-coder-pro:free";

if (!API_KEY) {
  console.error("❌ Erro: nenhuma API Key encontrada. Configure no arquivo .env.");
  process.exit(1);
}

// Interface para o chat no terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🤖 Chat Interativo iniciado com o modelo:", MODEL);
console.log("Digite sua pergunta ou 'sair' para encerrar.\n");

async function conversar(pergunta) {
  const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: pergunta }],
    }),
  });

  const dados = await resposta.json();

  if (dados.error) {
    console.error("❌ Erro da IA:", dados.error.message);
  } else {
    const conteudo = dados.choices?.[0]?.message?.content;
    console.log(`\n💬 Resposta: ${conteudo}\n`);
  }
}

function iniciarChat() {
  rl.question("Você: ", async (input) => {
    if (input.toLowerCase() === "sair") {
      console.log("👋 Encerrando chat...");
      rl.close();
      process.exit(0);
    }
    await conversar(input);
    iniciarChat(); // continua o loop do chat
  });
}

iniciarChat();
