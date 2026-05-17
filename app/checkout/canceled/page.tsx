import Link from "next/link";
import { XCircle, ArrowRight } from "lucide-react";

export const metadata = { title: "Checkout cancelado — ChikJov" };

export default function CheckoutCanceledPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50/40 py-20">
      <div className="container-tight max-w-xl">
        <div className="rounded-3xl bg-white p-8 text-center shadow-card md:p-12">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-100">
            <XCircle className="h-8 w-8 text-amber-600" />
          </div>

          <h1 className="heading-display mt-6 text-3xl">Checkout cancelado</h1>
          <p className="mt-3 text-ink-muted">
            Sem problemas! Você pode voltar quando quiser para iniciar seus 30
            dias grátis e começar a economizar.
          </p>

          <div className="mt-8 grid gap-3">
            <Link
              href="/checkout"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent-500 font-bold text-white shadow-cta transition-colors hover:bg-accent-600"
            >
              Tentar novamente
              <ArrowRight className="h-4 w-4" />
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
