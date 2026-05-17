"use client";

import { useState } from "react";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao iniciar o checkout.");
      }

      if (data.url) {
        // Redireciona o usuário de forma segura para a Checkout Session dinâmica
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout inválida retornada pelo servidor.");
      }
    } catch (err: any) {
      console.error("[CheckoutButton] erro:", err);
      setError(err?.message ?? "Não foi possível iniciar o checkout. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 font-bold text-white shadow-cta transition-all hover:bg-accent-600 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparando seu checkout seguro...
          </>
        ) : (
          <>
            Iniciar 30 dias grátis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-xs text-red-800 border border-red-100 animate-fadeIn">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
