"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // Função para Login Social (Google/Github)
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      {/* Coluna Esquerda: Formulário */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 lg:p-24">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold mb-4 text-[#4ade80]">e</div>
            <h1 className="text-3xl font-semibold text-center leading-tight">
              Crie Aplicativos Full-Stack <br />
              <span className="text-[#4ade80]">Web e Mobile em minutos</span>
            </h1>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleSocialLogin('google')}
              className="w-full py-3 px-4 bg-white text-black rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-200 transition"
            >
              <span>G</span> Continuar com Google
            </button>
            <div className="flex gap-4">
              <button 
                onClick={() => handleSocialLogin('github')}
                className="flex-1 py-3 px-4 bg-[#1a1a1a] border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-[#252525] transition"
              >
                Github
              </button>
              <button className="flex-1 py-3 px-4 bg-[#1a1a1a] border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-[#252525] transition opacity-50 cursor-not-allowed">
                Apple
              </button>
            </div>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0a0a0a] px-2 text-gray-500">ou</span></div>
          </div>

          <button 
            onClick={() => router.push('/dashboard')} // Atalho temporário para ver o Dashboard
            className="w-full py-3 bg-[#1a1a1a] border border-white/10 rounded-xl hover:bg-[#252525] transition text-sm text-gray-400"
          >
            Entrar como Convidado (Dashboard)
          </button>
        </div>
      </div>

      {/* Coluna Direita: CORRIGIDO (Sem erro 404) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#111] to-[#000] items-center justify-center p-12">
        <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center bg-[#0d0d0d]">
            {/* Removido o img src que dava erro 404 e colocado um fundo decorativo */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:20px_20px]"></div>
            
            <div className="relative z-10 bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 text-center">
                <p className="text-[#4ade80] font-mono text-lg mb-2">Emergent AI Futures</p>
                <p className="text-gray-500 text-sm">O futuro da automação começa aqui.</p>
            </div>
        </div>
      </div>
    </div>
  );
}