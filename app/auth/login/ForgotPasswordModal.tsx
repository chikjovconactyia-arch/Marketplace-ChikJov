"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Mail, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    setLoading(false);

    if (resetErr) {
      setError(traduzErro(resetErr.message));
      return;
    }

    setSuccess(true);
  }

  function traduzErro(msg: string) {
    const lower = msg.toLowerCase();
    if (lower.includes("not found") || lower.includes("user not found")) {
      return "Ocorreu um erro ao enviar o e-mail. Tente novamente mais tarde.";
    }
    if (lower.includes("rate limit")) {
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    }
    return msg;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-900/40 p-4 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-md scale-100 overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl transition-all duration-300 md:p-10">
        
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full bg-brand-50 p-2 text-brand-600 transition-colors hover:bg-brand-100 hover:text-brand-800"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="mt-2 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
              <Mail className="h-8 w-8" />
            </div>
            <h3 className="mb-3 font-display text-2xl font-bold text-ink">Verifique seu e-mail</h3>
            <p className="mb-6 text-sm leading-relaxed text-ink-muted">
              Enviamos um link de recuperação para <strong className="font-semibold text-ink">{email}</strong>. 
              Por favor, clique nele para cadastrar a nova senha.
            </p>
            <button
              onClick={onClose}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-100 px-6 font-bold text-brand-700 transition-colors hover:bg-brand-200"
            >
              Entendi
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <h3 className="mb-3 font-display text-2xl font-bold text-ink">Esqueceu a senha?</h3>
            <p className="mb-8 text-sm text-ink-muted">
              Não se preocupe! Digite seu e-mail cadastrado e enviaremos um link mágico para você cadastrar uma nova senha agora mesmo.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">E-mail da sua conta</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="voce@exemplo.com"
                  className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink placeholder-ink-subtle outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>

              <button
                type="submit"
                disabled={loading || !email}
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-500 font-bold text-white shadow-cta transition-colors hover:bg-accent-600 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Buscando conta...
                  </>
                ) : (
                  "Receber link de recuperação"
                )}
              </button>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                  {error}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
