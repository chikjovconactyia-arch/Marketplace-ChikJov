import { Button } from "@/components/ui/Button";
import { ArrowRight, Star, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-white">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-32 h-[380px] w-[380px] rounded-full bg-accent-200/40 blur-3xl" />

      <div className="container-tight relative grid gap-12 py-16 md:grid-cols-2 md:gap-8 md:py-24 lg:py-28">
        {/* Texto */}
        <div className="flex flex-col justify-center">
          <span className="pill w-fit">
            <Star className="h-3.5 w-3.5 fill-brand-500 text-brand-500" />
            Mais de 2.500 empresas parceiras
          </span>

          <h1 className="heading-display mt-5 text-4xl text-balance md:text-5xl lg:text-6xl">
            Economize de verdade nas{" "}
            <span className="bg-brand-gradient bg-clip-text text-transparent">
              empresas que você ama
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-ink-muted text-balance">
            Acesso ilimitado a descontos exclusivos em restaurantes,
            academias, clínicas e centenas de empresas locais. Por apenas{" "}
            <strong className="text-ink">R$ 39,90/mês</strong>.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#preco" size="lg">
              Assinar agora
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#empresas" variant="outline" size="lg">
              Sou empresa
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-6 text-sm text-ink-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-500" />
              Cancele quando quiser
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-accent-500 text-accent-500" />
              4.9 / 5 (3.4k avaliações)
            </div>
          </div>
        </div>

        {/* Imagem / mockup */}
        <div className="relative">
          <div className="relative grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div
                className="aspect-[3/4] rounded-3xl bg-cover bg-center shadow-card"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80)",
                }}
              />
              <div className="rounded-2xl bg-white p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-100 text-accent-600 font-bold">
                    %
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted">Você economizou</p>
                    <p className="font-display text-lg font-bold text-ink">
                      R$ 487 esse mês
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4 pt-10">
              <div className="rounded-2xl bg-brand-gradient p-5 text-white shadow-card">
                <p className="text-xs uppercase tracking-wider opacity-80">
                  Voucher disponível
                </p>
                <p className="mt-1 font-display text-xl font-bold">
                  30% OFF
                </p>
                <p className="mt-1 text-sm opacity-90">Studio Bella Hair</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                    Beleza
                  </span>
                  <span className="text-xs opacity-80">Válido até 15/06</span>
                </div>
              </div>
              <div
                className="aspect-square rounded-3xl bg-cover bg-center shadow-card"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
