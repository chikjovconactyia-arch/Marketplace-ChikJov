import Link from "next/link";
import { CreditCard, Construction } from "lucide-react";

export const metadata = { title: "Checkout — ChikJov" };

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50/40 py-20">
      <div className="container-tight max-w-xl">
        <div className="rounded-3xl bg-white p-8 text-center shadow-card md:p-12">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
            <CreditCard className="h-7 w-7" />
          </div>
          <h1 className="heading-display mt-6 text-3xl">Quase lá!</h1>
          <p className="mt-3 text-ink-muted">
            Finalize sua assinatura para liberar o acesso completo ao clube.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-2 text-sm font-medium text-accent-700">
            <Construction className="h-4 w-4" />
            Integração Stripe na Fase 3
          </div>

          <div className="mt-8 grid gap-3">
            <Link
              href="/dashboard/cliente"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand-500 font-semibold text-white shadow-card transition-colors hover:bg-brand-600"
            >
              Ir para meu dashboard (modo dev)
            </Link>
            <Link
              href="/"
              className="text-sm text-ink-muted hover:text-brand-700"
            >
              Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
