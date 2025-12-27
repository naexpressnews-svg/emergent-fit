import { NextResponse } from "next/server";
import { aiOrchestrator } from "@/services/ai/orchestrator";

// Esta linha é OBRIGATÓRIA para evitar erros de compilação/build
export const dynamic = 'force-dynamic'; 

export async function POST(req: Request) {
  try {
    // 1. Recebe os dados do Dashboard
    const { prompt, agentId } = await req.json();

    // Validação básica
    if (!prompt || !agentId) {
      return NextResponse.json(
        { message: "Dados insuficientes (prompt ou agentId em falta)." },
        { status: 400 }
      );
    }

    // 2. Chama o Orquestrador
    // O 'result' aqui já é a string com a resposta da IA
    const result = await aiOrchestrator(prompt, agentId);

    // 3. Devolve a resposta para o chat no Dashboard
    return NextResponse.json({ 
      reply: result, 
      status: "success"
    });

  } catch (error) {
    console.error("Erro na API Route:", error);
    return NextResponse.json(
      { message: "Erro interno no servidor de IA." },
      { status: 500 }
    );
  }
}