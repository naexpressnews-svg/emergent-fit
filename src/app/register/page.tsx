"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Conta criada! Agora entra no login.");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-white flex items-center justify-center p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <h1 className="text-2xl font-semibold">Criar conta</h1>

        <label className="mt-6 block text-sm text-white/70">Email</label>
        <input
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="mt-4 block text-sm text-white/70">Password</label>
        <input
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-white py-3 font-semibold text-black"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>

        <p className="mt-4 text-sm text-white/60">
          Já tens conta? <a className="underline" href="/login">Entrar</a>
        </p>
      </form>
    </div>
  );
}
