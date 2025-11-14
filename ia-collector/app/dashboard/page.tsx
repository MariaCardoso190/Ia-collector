"use client";

import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Page() {
  const [mensagem, setMensagem] = useState("");
  const [respostaIA, setRespostaIA] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem.trim()) return;

    setCarregando(true);
    setRespostaIA("");

    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Atue como um assistente de cobrança profissional. Gere uma mensagem educada e eficaz de cobrança baseada no seguinte texto: "${mensagem}".`;

      const result = await model.generateContent(prompt);
      const resposta = await result.response.text();

      setRespostaIA(resposta);
    } catch (err) {
      console.error(err);
      setRespostaIA("⚠️ Erro ao conectar à IA. Verifique sua chave de API.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-blue-700 text-white p-6">
        <h2 className="text-2xl font-bold mb-8">IA Collector</h2>
        <ul className="space-y-4">
          <li><a href="#" className="hover:underline">Início</a></li>
          <li><a href="#" className="hover:underline">Cobranças</a></li>
          <li><a href="#" className="hover:underline">Relatórios</a></li>
          <li><a href="#" className="hover:underline">Configurações</a></li>
        </ul>
      </aside>

      <main className="flex-1 p-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Painel de Cobranças Inteligentes
        </h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md">
          <label className="block text-gray-700 font-semibold mb-2">
            Digite a mensagem base para o cliente:
          </label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={4}
            placeholder="Ex: Olá, estamos entrando em contato para regularizar seu débito..."
          />
          <button
            type="submit"
            disabled={carregando}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {carregando ? "Gerando..." : "Gerar Mensagem com IA"}
          </button>
        </form>

        {respostaIA && (
          <div className="mt-6 bg-green-100 border-l-4 border-green-600 p-4 rounded-lg">
            <p className="text-gray-800 whitespace-pre-line">{respostaIA}</p>
          </div>
        )}
      </main>
    </div>
  );
}
