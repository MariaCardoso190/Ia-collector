// server.js (substitua TODO o conteúdo por este)
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

// Caminho absoluto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// garante que a pasta data exista
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// arquivos
const clientesFile = path.join(dataDir, "clientes.json");
const mensagensFile = path.join(dataDir, "mensagens.json");

// cria arquivos vazios caso não existam
if (!fs.existsSync(clientesFile)) {
  fs.writeFileSync(clientesFile, JSON.stringify([], null, 2), "utf8");
}
if (!fs.existsSync(mensagensFile)) {
  fs.writeFileSync(mensagensFile, JSON.stringify([], null, 2), "utf8");
}

// servir estáticos do front-end
app.use(express.static(path.join(__dirname, "web-chat")));

/* -------------------------
   ROTAS DE CLIENTES E MENSAGENS
   ------------------------- */

// GET /api/clientes -> lista clientes do data/clientes.json
app.get("/api/clientes", (req, res) => {
  try {
    const raw = fs.readFileSync(clientesFile, "utf8");
    const clientes = JSON.parse(raw);
    return res.json(clientes);
  } catch (err) {
    console.error("Erro /api/clientes:", err);
    return res.status(500).json({ error: "Erro ao carregar clientes." });
  }
});

// GET /api/mensagens -> lista mensagens geradas (histórico)
app.get("/api/mensagens", (req, res) => {
  try {
    const raw = fs.readFileSync(mensagensFile, "utf8");
    const msgs = JSON.parse(raw);
    return res.json(msgs);
  } catch (err) {
    console.error("Erro /api/mensagens (GET):", err);
    return res.status(500).json({ error: "Erro ao ler mensagens." });
  }
});

// POST /api/mensagens -> salvar manualmente uma mensagem
app.post("/api/mensagens", (req, res) => {
  try {
    const { clienteId, nome, mensagem, tipo } = req.body;
    if (!nome || !mensagem) {
      return res.status(400).json({ error: "nome e mensagem são obrigatórios." });
    }
    const raw = fs.readFileSync(mensagensFile, "utf8");
    const msgs = JSON.parse(raw);
    const nextId = msgs.length ? Math.max(...msgs.map(m => m.id)) + 1 : 1;
    const novo = {
      id: nextId,
      clienteId: clienteId || null,
      nome,
      mensagem,
      tipo: tipo || "lembrete",
      criadoEm: new Date().toISOString()
    };
    msgs.push(novo);
    fs.writeFileSync(mensagensFile, JSON.stringify(msgs, null, 2), "utf8");
    return res.status(201).json(novo);
  } catch (err) {
    console.error("Erro /api/mensagens (POST):", err);
    return res.status(500).json({ error: "Erro ao salvar mensagem." });
  }
});

/* -------------------------
   ROTA: GERAR MENSAGENS VIA IA (chamada pelo frontend)
   POST /api/generate-mensagens
   ------------------------- */
/*
  Quando chamada, essa rota:
   1) lê clientes do clientes.json
   2) filtra os relevantes (pendente/atrasado/valor>0)
   3) gera prompt e chama OpenRouter para produzir JSON com mensagens
   4) salva cada mensagem em mensagens.json
   5) retorna o array de mensagens salvas ao cliente HTTP
*/
app.post("/api/generate-mensagens", async (req, res) => {
  try {
    // 1) ler clientes
    const raw = fs.readFileSync(clientesFile, "utf8");
    const clientes = JSON.parse(raw);

    // 2) filtrar relevantes
    const relevantes = clientes.filter(c => {
      const status = (c.status || "").toString().toLowerCase();
      return status.includes("pendente") || status.includes("atrasado") || Number(c.valor) > 0;
    });

    if (!Array.isArray(relevantes) || relevantes.length === 0) {
      return res.status(200).json({ message: "Nenhum cliente pendente/atrasado encontrado.", created: [] });
    }

    // 3) criar contexto legível
    const contexto = relevantes.map(c =>
      `${c.id} | ${c.nome} | R$ ${Number(c.valor).toFixed(2)} | Venc: ${c.vencimento} | Status: ${c.status}`
    ).join("\n");

    // 4) montar instrução pedindo JSON estrito
    const prompt = `
Você é a IA Collector. Gere um ARRAY JSON com mensagens de cobrança personalizadas para cada cliente listado.
Cada item deve ter: clienteId (número), nome (string), mensagem (string curta) e tipo ("lembrete"|"ultima-notificacao"|"negociacao").
Responda APENAS com o JSON (sem explicações).
Lista:
${contexto}
Exemplo:
[
  {"clienteId":1,"nome":"Carlos","mensagem":"Olá Carlos...","tipo":"lembrete"},
  ...
]
`.trim();

    // 5) chamada para OpenRouter
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "kwaipilot/kat-coder-pro:free",
        messages: [
          { role: "system", content: "Você gera mensagens de cobrança no formato JSON estrito." },
          { role: "user", content: prompt }
        ],
      }),
    });

    const aiData = await aiRes.json();
    const text = aiData?.choices?.[0]?.message?.content || aiData?.choices?.[0]?.text || null;
    if (!text) {
      console.warn("IA não retornou texto:", aiData);
    }

    // 6) tentar parsear JSON da resposta
    let mensagensGeradas = null;
    try {
      mensagensGeradas = JSON.parse(text);
    } catch (e) {
      // tenta extrair trecho JSON entre colchetes
      const match = text ? text.match(/\[.*\]/s) : null;
      if (match) {
        try {
          mensagensGeradas = JSON.parse(match[0]);
        } catch (e2) {
          console.error("Falha ao parsear JSON da IA:", e2);
        }
      }
    }

    // fallback simples caso IA não retorne JSON válido
    if (!Array.isArray(mensagensGeradas)) {
      mensagensGeradas = relevantes.map(c => ({
        clienteId: c.id,
        nome: c.nome,
        mensagem: `Olá ${c.nome}, identificamos um débito de R$ ${Number(c.valor).toFixed(2)} com vencimento em ${c.vencimento}. Entre em contato para negociar.`,
        tipo: "lembrete"
      }));
    }

    // 7) salvar cada mensagem no mensagens.json
    const rawMsgs = fs.readFileSync(mensagensFile, "utf8");
    const msgs = JSON.parse(rawMsgs);
    let nextId = msgs.length ? Math.max(...msgs.map(m => m.id)) + 1 : 1;
    const saved = [];
    for (const m of mensagensGeradas) {
      const novo = {
        id: nextId++,
        clienteId: m.clienteId || null,
        nome: m.nome || "Cliente",
        mensagem: m.mensagem || m.msg || "Mensagem automática",
        tipo: m.tipo || "lembrete",
        criadoEm: new Date().toISOString()
      };
      msgs.push(novo);
      saved.push(novo);
    }
    fs.writeFileSync(mensagensFile, JSON.stringify(msgs, null, 2), "utf8");

    // 8) retornar as mensagens salvas
    return res.status(201).json({ message: "Mensagens geradas e salvas.", created: saved });
  } catch (err) {
    console.error("Erro /api/generate-mensagens:", err);
    return res.status(500).json({ error: "Erro ao gerar mensagens." });
  }
});


/* -------------------------
   ROTA DE CHAT (mantemos)
   ------------------------- */
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "kwaipilot/kat-coder-pro:free",
        messages: [
          {
            role: "system",
            content: "Você é a IA Collector, assistente de cobrança. Ajude com mensagens de cobrança e negociações de forma empática e profissional."
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "Erro ao gerar resposta 😅";
    res.json({ reply });
  } catch (err) {
    console.error("Erro ao conversar com a IA:", err);
    res.status(500).json({ reply: "Erro no servidor 😞" });
  }
});

/* -------------------------
   INICIA SERVIDOR
   ------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
