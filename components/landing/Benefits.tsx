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
    isComingSoon: true,
  },
  {
    icon: Gift,
    title: "Benefícios extras",
    desc: "Mês a mês recebemos novidades: sorteios e experiências.",
    color: "from-brand-100 to-brand-50 text-brand-700",
  },
  {
    icon: Headphones,
    title: "Suporte",
    desc: "Suporte 24 / 7 com nossa agente de IA 'Any' e para o suporte humano em até 24 horas um de nossos consultores entrará em contato com você.",
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
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink">
                {b.title}
              </h3>
              {b.isComingSoon && (
                <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                  Em Breve
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {b.desc}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
