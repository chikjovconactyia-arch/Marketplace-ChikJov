import { Eye, Calendar, Heart, RefreshCw, BarChart3, Target } from "lucide-react";
import { Section } from "@/components/ui/Section";

const features = [
  {
    icon: Eye,
    title: "Mais visibilidade",
    desc: "Sua marca vista por milhares de assinantes ativamente buscando descontos.",
  },
  {
    icon: Calendar,
    title: "Agenda cheia",
    desc: "Receba leads qualificados com intenção real de compra todo dia.",
  },
  {
    icon: Heart,
    title: "Fidelização",
    desc: "Transforme clientes ocasionais em recorrentes com benefícios exclusivos.",
  },
  {
    icon: RefreshCw,
    title: "Receita recorrente",
    desc: "Movimento constante o ano inteiro — não só em datas comemorativas.",
  },
  {
    icon: BarChart3,
    title: "Painel completo",
    desc: "Acompanhe vouchers gerados, resgatados e ROI em tempo real.",
  },
  {
    icon: Target,
    title: "Público segmentado",
    desc: "Filtros por categoria e localização entregam o cliente certo pra você.",
  },
];

export function Features() {
  return (
    <Section
      eyebrow="Para empresas"
      title="O que sua empresa ganha no ChikJov"
      description="Não é só anúncio — é uma máquina de aquisição com clientes que já chegam dispostos a comprar."
      background="soft"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-2xl bg-white p-7 text-left shadow-card transition-all hover:shadow-cta"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-50 transition-transform group-hover:scale-150" />
            <div className="relative">
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient text-white shadow-card">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
