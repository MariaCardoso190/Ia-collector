import fetch from "node-fetch";
import readline from "readline";
import dotenv from "dotenv";

// Carrega variáveis do .env
dotenv.config();

// Lê a API Key do arquivo .env
const apiKey = process.env.OPENROUTER_API_KEY;

// Verifica se a chave foi carregada
console.log(`🔑 API Key carregada: ${apiKey ? "✅ Encontrada" : "❌ Não encontrada"}`);

// Configuração do terminal interativo
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função principal para conversar com a IA
async function conversarComIA(mensagem) {
  try {
    const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "kwaipilot/kat-coder-pro:free",
        messages: [
          { role: "system", content: "Você é um assistente técnico que ajuda a desenvolver projetos de IA e sites com segurança e boas práticas." },
          { role: "user", content: mensagem }
        ]
      })
    });

    const data = await resposta.json();

    if (data.error) {
      console.error("❌ Erro ao conversar com a IA:", data);
      return;
    }

    const conteudo = data.choices?.[0]?.message?.content || "⚠️ Nenhuma resposta recebida.";
    console.log(`🤖 IA: ${conteudo}\n`);

  } catch (erro) {
    console.error("❌ Erro na requisição:", erro);
  }
}

// Função para iniciar o chat interativo
function iniciarChat() {
  console.log("\n💬 Chat IA iniciado! Digite sua mensagem ou 'sair' para encerrar.\n");
  
  rl.question("Você: ", async (mensagem) => {
    if (mensagem.toLowerCase() === "sair") {
      console.log("👋 Encerrando o chat. Até a próxima!");
      rl.close();
      return;
    }

    await conversarComIA(mensagem);
    iniciarChat(); // Chama novamente para continuar o chat
  });
}

// Inicia o chat
iniciarChat();
