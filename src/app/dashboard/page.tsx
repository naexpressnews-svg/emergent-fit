"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [agents, setAgents] = useState<any[]>([]); 
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAgents, setFetchingAgents] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- CARREGAR AGENTES DINAMICAMENTE DO SUPABASE ---
  useEffect(() => {
    async function loadAgents() {
      try {
        setFetchingAgents(true);
        // Ajustado para o nome da tua tabela no Supabase: 'emergent-fit'
        const { data, error } = await supabase
          .from('emergent-fit') 
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error("Erro do Supabase:", error.message);
          throw error;
        }
        
        setAgents(data || []);
      } catch (err) {
        console.error("Erro ao carregar agentes:", err);
      } finally {
        setFetchingAgents(false);
      }
    }
    loadAgents();
  }, []);

  // Scroll automático para a última mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedAgent || loading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg, agentId: selectedAgent.id }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || data.message || "Sem resposta." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro na ligação com o servidor." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-[#e9eefc] p-6 font-sans">
      <header className="max-w-7xl mx-auto mb-8 border-b border-white/5 pb-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#6c8cff] to-[#a2b6ff] bg-clip-text text-transparent">
          Emergent.fit AI
        </h1>
        <p className="text-[#a9b6da] mt-2">Escolha o seu especialista e comece a criar.</p>
      </header>

      {/* Grid de Agentes Dinâmico */}
      {fetchingAgents ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6c8cff]"></div>
          <span className="ml-3 mt-4 opacity-50">A ligar ao Supabase...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
          {agents.length > 0 ? (
            agents.map((agent) => (
              <div 
                key={agent.id}
                onClick={() => { setSelectedAgent(agent); setMessages([]); }}
                className="bg-[#101a33] border border-white/10 p-6 rounded-3xl cursor-pointer hover:bg-[#162245] hover:border-[#6c8cff]/40 transition-all duration-300 group"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6c8cff] mb-2 block opacity-70">
                  {agent.group || "Geral"}
                </span>
                <h3 className="text-lg font-bold group-hover:text-white transition-colors">{agent.name || "Sem Nome"}</h3>
                <p className="text-sm text-[#a9b6da] mt-2 leading-relaxed line-clamp-2">
                  {agent.description || "Sem descrição disponível."}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 opacity-50 border border-dashed border-white/10 rounded-xl">
              Nenhum agente encontrado na tabela 'emergent-fit'.
            </div>
          )}
        </div>
      )}

      {/* Modal de Chat */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1730] w-full max-w-4xl h-[85vh] rounded-[2.5rem] border border-white/10 flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#6c8cff]/20 flex items-center justify-center text-[#6c8cff] font-bold border border-[#6c8cff]/30 text-xl">
                  {selectedAgent.name ? selectedAgent.name.charAt(0) : "?"}
                </div>
                <div>
                  <h2 className="font-bold text-xl">{selectedAgent.name || "Especialista"}</h2>
                  <p className="text-xs text-green-400 font-mono">● Agente Ativo</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAgent(null)} 
                className="w-10 h-10 hover:bg-white/10 flex items-center justify-center rounded-full text-2xl transition-all"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-[#6c8cff] text-white shadow-lg' 
                      : 'bg-[#1a2544] border border-white/5 text-[#e9eefc]'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-[#6c8cff] animate-pulse">
                  <span className="w-2 h-2 bg-[#6c8cff] rounded-full"></span>
                  O especialista está a processar...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 border-t border-white/10 bg-black/10">
              <div className="flex gap-3">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder={`Escreva a sua dúvida para ${selectedAgent.name}...`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#6c8cff] resize-none h-16 transition-all"
                />
                <button 
                  onClick={sendMessage}
                  disabled={loading}
                  className="bg-[#6c8cff] text-white px-8 rounded-2xl font-bold hover:bg-[#5a7ae6] disabled:opacity-50 transition-all"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}