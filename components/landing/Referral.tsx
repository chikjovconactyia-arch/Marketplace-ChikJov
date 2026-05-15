import { Button } from "@/components/ui/Button";
import { CheckCircle2, Smartphone } from "lucide-react";

const perks = [
  "R$ 20 por cada amigo que assinar",
  "R$ 5 por indicação de 2º nível",
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

        {/* Imagem do Programa */}
        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-brand-gradient opacity-20 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl shadow-card transition-transform duration-500 hover:scale-105">
            <img
              src="/indique e ganhe.png"
              alt="Programa de Indicação ChikJov"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
