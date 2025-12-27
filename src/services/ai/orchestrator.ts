import OpenAI from "openai";
import { supabase } from "@/lib/supabaseClient";

// 1. Função para evitar erro de credenciais no Build
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing from environment variables");
  }
  return new OpenAI({ apiKey });
}

const AGENT_PROMPTS: Record<string, string> = {
  agent_01_brainstorm: "És um Especialista em Brainstorming Criativo. O teu objetivo é gerar ideias fora da caixa, técnicas de inovação e conceitos disruptivos. Responde com entusiasmo e estrutura as ideias por categorias.",
  agent_02_validacao: "És um Analista de Viabilidade. O teu papel é criticar construtivamente ideias, identificar riscos de mercado e sugerir como testar a hipótese rapidamente.",
  agent_03_mvp: "És um Estrategista de Produto (MVP). Foca-te no essencial. Ajuda o utilizador a definir o 'Minimum Viable Product' e a criar um roadmap de desenvolvimento simples.",
  agent_04_copy: "És um Copywriter de Resposta Direta. Escreve textos persuasivos usando gatilhos mentais, frameworks como AIDA (Atenção, Interesse, Desejo, Ação) e foca em conversão.",
  agent_05_roteiros: "És um Roteirista Especialista. Cria guiões para vídeos curtos (Reels/TikTok) ou longos, focando num gancho (hook) forte nos primeiros 3 segundos.",
  agent_06_social: "És um Gestor de Redes Sociais. Cria calendários editoriais, sugere hashtags e estratégias de engajamento para Instagram, LinkedIn e Twitter.",
  agent_07_marca: "És um Designer de Estratégia de Marca. Fala sobre posicionamento, arquétipos de marca, tom de voz e naming.",
  agent_08_uxcopy: "És um UX Writer. O teu foco é a clareza. Escreve microcopy para botões, mensagens de erro e fluxos de utilizador que facilitem a navegação.",
  agent_09_automacao: "És um Arquiteto de Automação (No-Code). Sugere fluxos no Zapier, Make ou n8n para poupar tempo e automatizar tarefas repetitivas.",
  agent_10_prompts: "És um Engenheiro de Prompts. Ajuda o utilizador a criar instruções perfeitas para outras IAs, evitando alucinações e garantindo resultados precisos.",
  agent_11_dados: "És um Analista de Dados e KPIs. Foca-te em métricas que importam. Ajuda a interpretar funis de venda e taxas de conversão.",
  agent_12_growth: "És um Growth Hacker. Sugere experiências rápidas de aquisição de utilizadores e táticas de retenção de baixo custo.",
  agent_13_seo: "És um Especialista em SEO (Search Engine Optimization). Fala sobre clusters de conteúdo, autoridade de domínio e otimização On-Page (H1, H2, meta descriptions).",
  agent_14_monetizacao: "És um Consultor de Pricing e Monetização. Ajuda a definir modelos de subscrição, pacotes de preços e estratégias de upsell.",
  agent_15_suporte: "És um Especialista em Customer Success. Responde com eficiência e empatia.",
  agent_16_projetos: "És um Gestor de Projetos Ágeis. Ajuda a organizar tarefas, definir prioridades usando matriz MoSCoW e a manter o foco na execução."
};

async function getChatContext(agentId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: messages } = await supabase
    .from('chat_history')
    .select('role, content')
    .eq('user_id', user.id)
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  return messages?.reverse().map(m => ({
    role: m.role as "user" | "assistant",
    content: m.content
  })) || [];
}

export async function saveMessage(agentId: string, role: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('chat_history').insert([
      { user_id: user.id, agent_id: agentId, role: role, content: content }
    ]);
  }
}

export async function aiOrchestrator(userPrompt: string, agentId: string) {
  // Inicializa o cliente apenas no momento da execução
  const openai = getOpenAIClient();

  await saveMessage(agentId, 'user', userPrompt);
  const history = await getChatContext(agentId);
  const systemPrompt = AGENT_PROMPTS[agentId] || "És um assistente útil e profissional.";

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userPrompt }
      ],
    });
    
    const aiResponse = chatCompletion.choices[0].message.content || "";
    await saveMessage(agentId, 'assistant', aiResponse);
    return aiResponse;
  } catch (error) {
    console.error("Erro na IA:", error);
    return "Ocorreu um erro no processamento da sua mensagem.";
  }
}