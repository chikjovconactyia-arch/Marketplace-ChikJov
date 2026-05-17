import { redirect } from "next/navigation";
import { CreditCard, Check, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CheckoutButton } from "./CheckoutButton";

export const metadata = { title: "Checkout — ChikJov" };
export const dynamic = "force-dynamic";

const features = [
  "Acesso ilimitado a todas as empresas parceiras",
  "Vouchers ilimitados conforme regras de cada empresa",
  "Programa Indique & Ganhe ativo",
  "Suporte humano via WhatsApp",
  "Cancele quando quiser, sem fidelidade",
];

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/register?redirect=/checkout");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("subscription_status, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.subscription_status === "ativo") {
    redirect("/dashboard/cliente");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50/40 py-12 md:py-20">
      <div className="container-tight max-w-3xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-card">
          {/* Header */}
          <div className="bg-brand-gradient px-8 py-10 text-white md:px-12">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                  Plano Cliente
                </p>
                <h1 className="font-display text-2xl font-bold md:text-3xl">
                  Assine e comece a economizar
                </h1>
              </div>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent-300" />
              30 dias grátis · primeira cobrança só após o período de teste
            </div>
          </div>

          {/* Body */}
          <div className="grid gap-8 px-8 py-10 md:grid-cols-2 md:px-12">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-700">
                Resumo
              </p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-lg font-bold text-ink-muted">R$</span>
                <span className="font-display text-5xl font-bold text-ink leading-none">
                  39,90
                </span>
                <span className="mb-1.5 text-sm text-ink-muted">/mês</span>
              </div>
              <p className="mt-3 text-sm text-ink-muted">
                Hoje você paga <strong className="text-ink">R$ 0,00</strong>.
                Após <strong className="text-ink">30 dias grátis</strong>, será
                cobrado R$ 39,90/mês automaticamente. Você pode cancelar
                quando quiser pelo portal do cliente.
              </p>

              <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                Pagamento seguro processado pela Stripe.
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-brand-700">
                O que está incluído
              </p>
              <ul className="mt-3 space-y-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#F1ECF8] bg-surface-soft px-8 py-6 md:px-12">
            <CheckoutButton />
            <p className="mt-3 text-center text-xs text-ink-subtle">
              Ao continuar você concorda com os{" "}
              <a href="#" className="underline">Termos</a> e{" "}
              <a href="#" className="underline">Política de Privacidade</a>.
            </p>
            <p className="mt-2 text-center text-xs text-ink-subtle">
              <Link href="/" className="hover:text-brand-700">← Voltar ao site</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
