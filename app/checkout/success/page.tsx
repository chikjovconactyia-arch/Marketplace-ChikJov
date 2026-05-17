import Link from "next/link";
import { CheckCircle2, ArrowRight, Calendar, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";

export const metadata = { title: "Assinatura confirmada — ChikJov" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;

  let trialEnd: Date | null = null;
  let amountLabel: string | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["subscription"],
      });
      const sub = session.subscription;
      if (sub && typeof sub !== "string") {
        if (sub.trial_end) trialEnd = new Date(sub.trial_end * 1000);
        const price = sub.items.data[0]?.price;
        if (price?.unit_amount) {
          amountLabel = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: (price.currency ?? "brl").toUpperCase(),
          }).format(price.unit_amount / 100);
        }
      }
    } catch (err) {
      console.error("[checkout/success] erro ao buscar session:", err);
    }
  }

  // Checa se o usuário está logado para mostrar a mensagem certa
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50/40 py-20">
      <div className="container-tight max-w-xl">
        <div className="rounded-3xl bg-white p-8 text-center shadow-card md:p-12">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>

          <h1 className="heading-display mt-6 text-3xl">Tudo certo! 🎉</h1>
          <p className="mt-3 text-ink-muted">
            Sua assinatura do plano cliente está ativa. Aproveite os
            <strong className="text-ink"> 30 dias grátis</strong> para gerar
            vouchers e economizar com nossos parceiros.
          </p>

          {trialEnd && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
              <Calendar className="h-4 w-4" />
              Primeira cobrança em{" "}
              {trialEnd.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
              {amountLabel ? ` (${amountLabel})` : ""}
            </div>
          )}

          {!isLoggedIn && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100">
                  <Mail className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Verifique seu email para acessar a conta
                  </p>
                  <p className="mt-1 text-xs text-amber-800">
                    Enviamos um link para o email cadastrado no pagamento. Use-o
                    para definir sua senha e acessar o painel do cliente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLoggedIn ? (
            <Link
              href="/dashboard/cliente"
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-500 font-bold text-white shadow-cta transition-colors hover:bg-accent-600"
            >
              Ir para meu dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="mt-8 grid gap-3">
              <Link
                href="/auth/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent-500 font-bold text-white shadow-cta hover:bg-accent-600"
              >
                Já defini minha senha — Fazer login
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/" className="text-sm text-ink-muted hover:text-brand-700">
                Voltar ao site
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
