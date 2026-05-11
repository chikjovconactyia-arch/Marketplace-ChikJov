import { Button } from "@/components/ui/Button";
import { CheckCircle2, Smartphone } from "lucide-react";

const perks = [
  "R$ 20 por cada amigo que assinar",
  "R$ 5 por indicação de 2º nível",
  "Saque via PIX a partir de R$ 50",
  "Painel exclusivo pra acompanhar seus ganhos",
];

export function Referral() {
  return (
    <section className="bg-white py-16 md:py-24 lg:py-28">
      <div className="container-tight grid items-center gap-16 md:grid-cols-2">
        <div>
          <span className="pill">💸 Programa de indicação</span>
          <h2 className="heading-display mt-4 text-3xl text-balance md:text-4xl lg:text-5xl">
            Indique amigos e ganhe{" "}
            <span className="bg-accent-gradient bg-clip-text text-transparent">
              dinheiro de verdade
            </span>
          </h2>
          <p className="mt-5 text-lg text-ink-muted text-balance">
            Compartilhe o ChikJov com quem você ama. A cada nova assinatura,
            você recebe comissão direto na conta.
          </p>

          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3 text-ink">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button href="/auth/register" size="lg">
              Começar a indicar
            </Button>
          </div>
        </div>

        {/* Mockup celular */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-brand-gradient opacity-20 blur-3xl" />
          <div className="relative mx-auto aspect-[9/19] w-full max-w-[280px] rounded-[2.5rem] border-[10px] border-ink bg-white p-3 shadow-card">
            <div className="flex h-full flex-col rounded-[1.75rem] bg-gradient-to-b from-brand-50 to-white p-4">
              <div className="mb-1 flex items-center justify-between text-[10px] text-ink-subtle">
                <span>09:41</span>
                <Smartphone className="h-3 w-3" />
              </div>
              <div className="mt-3 rounded-2xl bg-white p-4 shadow-soft">
                <p className="text-xs text-ink-muted">Saldo disponível</p>
                <p className="font-display text-2xl font-bold text-ink">
                  R$ 340,00
                </p>
                <button className="mt-3 w-full rounded-full bg-accent-500 py-2 text-xs font-bold text-white shadow-cta">
                  Sacar via PIX
                </button>
              </div>
              <div className="mt-3 rounded-2xl bg-brand-gradient p-4 text-white shadow-card">
                <p className="text-[10px] uppercase tracking-wider opacity-80">
                  Indicações ativas
                </p>
                <p className="mt-1 font-display text-3xl font-bold">17</p>
                <p className="mt-1 text-xs opacity-80">+3 este mês</p>
              </div>
              <div className="mt-3 space-y-2">
                {["Marina", "Pedro", "Ana"].map((name, i) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-xl bg-white p-2.5 shadow-soft"
                  >
                    <div className="flex items-center gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                        {name[0]}
                      </div>
                      <span className="text-xs font-medium text-ink">
                        {name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-brand-600">
                      +R$ {i === 0 ? "20" : i === 1 ? "5" : "20"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
