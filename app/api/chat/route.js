import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message } = await req.json();

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um assistente que ajuda com cobranças, finanças e gestão." },
          { role: "user", content: message }
        ],
      }),
    });

    const data = await completion.json();
    const resposta = data.choices?.[0]?.message?.content || "Erro ao gerar resposta.";

    return NextResponse.json({ response: resposta });
  } catch (e) {
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
