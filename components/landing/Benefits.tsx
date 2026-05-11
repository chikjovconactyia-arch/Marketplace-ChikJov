import { Stethoscope, Gift, Headphones, Tags } from "lucide-react";
import { Section } from "@/components/ui/Section";

const benefits = [
  {
    icon: Tags,
    title: "Clube de descontos",
    desc: "Acesso vitalício a ofertas exclusivas em centenas de empresas parceiras.",
    color: "from-brand-100 to-brand-50 text-brand-700",
  },
  {
    icon: Stethoscope,
    title: "Telemedicina 24/7",
    desc: "Consulta médica online ilimitada incluída no seu plano. Para você e família.",
    color: "from-accent-100 to-accent-50 text-accent-700",
  },
  {
    icon: Gift,
    title: "Benefícios extras",
    desc: "Mês a mês recebemos novidades: cashback, sorteios e experiências.",
    color: "from-brand-100 to-brand-50 text-brand-700",
  },
  {
    icon: Headphones,
    title: "Suporte humano",
    desc: "Equipe pronta pra te ajudar de verdade — sem robôs e sem espera.",
    color: "from-accent-100 to-accent-50 text-accent-700",
  },
];

export function Benefits() {
  return (
    <Section
      id="beneficios"
      eyebrow="Vantagens"
      title="Mais que descontos. É um clube completo."
      description="ChikJov vai além. Você ganha acesso a um pacote pensado pra fazer seu dinheiro render."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="group rounded-2xl bg-white p-7 text-left shadow-card transition-transform hover:-translate-y-1"
          >
            <div
              className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${b.color}`}
            >
              <b.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">
              {b.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {b.desc}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
