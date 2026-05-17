"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, AlertTriangle, CreditCard, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  status: string | null;
  trialDays: number | null;
}

export function SubscriptionBanner({ status, trialDays }: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function openPortal() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const j = await res.json();
      if (!res.ok || !j.url) throw new Error(j.error ?? "Erro ao abrir portal.");
      window.location.href = j.url;
    } catch (e: any) {
      setErr(e.message);
      setLoading(false);
    }
  }

  // Trial em andamento
  if (
    (status === "ativo" || status === "active") &&
    trialDays !== null &&
    trialDays > 0
  ) {
    return (
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100">
          <Sparkles className="h-5 w-5 text-amber-700" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-sm font-semibold text-amber-900">
            Você está no período grátis · {trialDays}{" "}
            {trialDays === 1 ? "dia restante" : "dias restantes"}
          </p>
          <p className="text-xs text-amber-800">
            Após o trial, R$ 39,90/mês serão cobrados automaticamente. Cancele
            a qualquer momento.
          </p>
          {err && <p className="mt-1 text-xs text-red-700">{err}</p>}
        </div>
        <button
          onClick={openPortal}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
          Gerenciar assinatura
        </button>
      </div>
    );
  }

  // Assinatura ativa (sem trial)
  if (status === "ativo" || status === "active") {
    return (
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100">
          <CheckCircle2 className="h-5 w-5 text-emerald-700" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-sm font-semibold text-emerald-900">
            Assinatura ativa · Plano Cliente
          </p>
          <p className="text-xs text-emerald-800">
            Você tem acesso completo ao clube. Cobrança recorrente de R$ 39,90/mês.
          </p>
          {err && <p className="mt-1 text-xs text-red-700">{err}</p>}
        </div>
        <button
          onClick={openPortal}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
          Gerenciar
        </button>
      </div>
    );
  }

  // Pagamento pendente
  if (status === "pendente") {
    return (
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-700" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="text-sm font-semibold text-red-900">
            Pagamento pendente
          </p>
          <p className="text-xs text-red-800">
            Houve um problema com sua última cobrança. Atualize seu método de pagamento.
          </p>
          {err && <p className="mt-1 text-xs text-red-700">{err}</p>}
        </div>
        <button
          onClick={openPortal}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
          Atualizar pagamento
        </button>
      </div>
    );
  }

  // Sem assinatura (inativo / cancelado / null)
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100">
        <Sparkles className="h-5 w-5 text-brand-700" />
      </div>
      <div className="flex-1 min-w-[200px]">
        <p className="text-sm font-semibold text-brand-900">
          Assine o plano cliente e libere todos os benefícios
        </p>
        <p className="text-xs text-brand-800">
          30 dias grátis · R$ 39,90/mês depois · cancele quando quiser.
        </p>
      </div>
      <Link
        href="/checkout"
        className="inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2 text-xs font-bold text-white shadow-cta hover:bg-accent-600"
      >
        <CreditCard className="h-3.5 w-3.5" />
        Iniciar 30 dias grátis
      </Link>
    </div>
  );
}
