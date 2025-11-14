import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";

// 🔐 Carregar variáveis do .env
dotenv.config();

// ✅ URL base do servidor local
const API_URL = "http://localhost:3000/api";

// 🧩 Função para carregar clientes do backend
async function carregarClientes() {
  const res = await fetch(`${API_URL}/clientes`);
  const data = await res.json();
  return data;
}

// 🤖 Função para gerar mensagens automáticas de cobrança com a IA
async function gerarMensagensAuto(clientes) {
  console.log("📨 Gerando mensagens automáticas de cobrança...\n");

  for (const cliente of clientes) {
    const prompt = `
      Gere uma mensagem de cobrança empática e clara para o cliente abaixo:
      - Nome: ${cliente.nome}
      - Valor devido: R$ ${cliente.valor.toFixed(2)}
      - Vencimento: ${cliente.vencimento}
      - Status: ${cliente.status}
      A mensagem deve soar profissional, gentil e conter opções de pagamento.
    `;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "kwaipilot/kat-coder-pro:free",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error(`❌ Erro do OpenRouter para ${cliente.nome}:`, data.error);
        continue;
      }

      const mensagem = data.choices?.[0]?.message?.content || "Erro ao gerar mensagem.";

      console.log(`💬 Mensagem para ${cliente.nome}:\n${mensagem}\n`);

      // 💾 Salvar no arquivo mensagens.json
      salvarMensagem({
        cliente: cliente.nome,
        mensagem,
        dataGeracao: new Date().toISOString(),
      });

    } catch (err) {
      console.error(`⚠️ Erro ao gerar mensagem para ${cliente.nome}:`, err);
    }
  }

  console.log("✅ Todas as mensagens foram processadas!\n");
}

// 💾 Função para salvar mensagens no arquivo
function salvarMensagem(mensagem) {
  const filePath = "./data/mensagens.json";
  let mensagens = [];

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf8");
    mensagens = JSON.parse(data);
  }

  mensagens.push(mensagem);
  fs.writeFileSync(filePath, JSON.stringify(mensagens, null, 2));
}

// 🚀 Execução principal
(async () => {
  try {
    const clientes = await carregarClientes();
    await gerarMensagensAuto(clientes);
  } catch (err) {
    console.error("Erro geral:", err);
  }
})();
