// testGemini.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("🔑 Chave carregada:", process.env.GEMINI_API_KEY);

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // ✅ Modelo correto e atualizado
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const result = await model.generateContent("Olá Gemini! O que é inteligência artificial?");
    console.log("✅ Resposta da IA:", result.response.text());
  } catch (error) {
    console.error("❌ Erro ao conectar à IA:", error);
  }
}

testGemini();
