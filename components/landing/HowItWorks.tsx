import { MapPin, Ticket, Users } from "lucide-react";
import { Section } from "@/components/ui/Section";

const steps = [
  {
    icon: MapPin,
    title: "Encontre perto de você",
    desc: "Descubra empresas locais com ofertas exclusivas a poucos minutos de onde você está.",
  },
  {
    icon: Ticket,
    title: "Aproveite descontos",
    desc: "Gere seu voucher digital, vá até a empresa parceira e economize na hora.",
  },
  {
    icon: Users,
    title: "Ganhe indicando",
    desc: "Convide amigos e ganhe comissões a cada novo assinante via seu link exclusivo.",
  },
];

export function HowItWorks() {
  return (
    <Section
      id="como-funciona"
      eyebrow="Como funciona"
      title="Em 3 passos você começa a economizar"
      description="Simples, rápido e sem letras miúdas. É só assinar, escolher e usar."
      background="soft"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="relative rounded-2xl bg-white p-8 text-left shadow-card"
          >
            <div className="absolute -top-4 left-8 grid h-9 w-9 place-items-center rounded-full bg-accent-gradient text-sm font-bold text-white shadow-cta">
              {i + 1}
            </div>
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-brand-700">
              <s.icon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink">
              {s.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
