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
      className="relative overflow-hidden py-20 text-white md:py-32 min-h-[600px] flex items-center"
      style={{
        backgroundImage: "url('/pricing-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay para mobile para garantir legibilidade se a imagem for cortada */}
      <div className="absolute inset-0 bg-brand-900/40 md:hidden" />

      <div className="container-tight relative z-10">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="max-w-xl">
            <span className="pill border-white/20 bg-white/10 text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Plano único, valor que cabe no bolso
            </span>
            <h2 className="heading-display mt-5 text-4xl text-balance text-white md:text-6xl">
              Tudo isso por menos que um delivery
            </h2>
            <p className="mt-6 text-xl text-white/90 text-balance leading-relaxed">
              Sem fidelidade, sem taxa escondida. É só assinar e começar a economizar agora mesmo em centenas de estabelecimentos.
            </p>
            
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button
                href="https://buy.stripe.com/test_7sYeVcfPR0kz9OL0dD14400"
                size="lg"
                className="px-12 py-7 text-lg shadow-cta"
              >
                Iniciar 30 dias grátis
              </Button>
            </div>
            <p className="mt-3 text-sm text-white/70">
              Sem cobrança nos primeiros 30 dias · cancele quando quiser.
            </p>
          </div>

          {/* No desktop o card já está na imagem de fundo. 
              No mobile, mostramos um card simplificado ou apenas o CTA acima.
              Como a imagem já contém o card no desktop, vamos deixar o espaço vazio à direita.
          */}
          <div className="hidden md:block" />

          {/* Card Mobile: Mostrado apenas em telas pequenas onde o background pode não ser legível */}
          <div className="md:hidden">
            <div className="rounded-3xl bg-white p-8 text-ink shadow-card">
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
              </div>

              <ul className="mt-8 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                    <span className="text-ink">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
