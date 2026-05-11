import { Button } from "@/components/ui/Button";
import { Check, Sparkles } from "lucide-react";

const features = [
  "Acesso ilimitado a todas as empresas parceiras",
  "Telemedicina 24/7 inclusa",
  "Vouchers ilimitados por mês",
  "Programa de indicação ativo",
  "Suporte humano via WhatsApp",
  "Cancele quando quiser",
];

export function Pricing() {
  return (
    <section
      id="preco"
      className="relative overflow-hidden bg-brand-gradient py-20 text-white md:py-28"
    >
      <div className="pointer-events-none absolute -left-20 top-10 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-brand-300/30 blur-3xl" />

      <div className="container-tight relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pill border-white/20 bg-white/10 text-white">
            <Sparkles className="h-3.5 w-3.5" />
            Plano único, valor que cabe no bolso
          </span>
          <h2 className="heading-display mt-5 text-3xl text-balance text-white md:text-5xl">
            Tudo isso por menos que um delivery
          </h2>
          <p className="mt-4 text-lg text-white/80 text-balance">
            Sem fidelidade, sem taxa escondida. É só assinar e começar.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-md">
          <div className="rounded-3xl bg-white p-8 text-ink shadow-card md:p-10">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
                Plano Cliente
              </p>
              <div className="mt-4 flex items-end justify-center gap-1">
                <span className="text-2xl font-bold text-ink-muted">R$</span>
                <span className="font-display text-6xl font-bold text-ink">
                  39,90
                </span>
                <span className="mb-2 text-sm text-ink-muted">/mês</span>
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                ou R$ 399/ano (economize 17%)
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                  <span className="text-ink">{f}</span>
                </li>
              ))}
            </ul>

            <Button href="/auth/register" size="lg" className="mt-8 w-full">
              Assinar agora
            </Button>
            <p className="mt-4 text-center text-xs text-ink-subtle">
              7 dias de garantia · Cancele a qualquer momento
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
