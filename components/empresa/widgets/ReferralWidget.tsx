import { Share2, Clock, CheckCircle2, DollarSign } from "lucide-react";

interface Props {
  totalIndicacoes: number;
  pendentes: number;
  aprovadas: number;
  comissoesPendentes: number;
}

export function ReferralWidget({ totalIndicacoes, pendentes, aprovadas, comissoesPendentes }: Props) {
  const conversionRate =
    totalIndicacoes > 0 ? ((aprovadas / totalIndicacoes) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-4">
      {/* Conversion bar */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-ink">Taxa de conversão</span>
          <span className="font-bold text-brand-700">{conversionRate}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-700"
            style={{ width: `${conversionRate}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Total indicações", value: totalIndicacoes, icon: Share2, bg: "bg-brand-100", color: "text-brand-700" },
          { label: "Pendentes", value: pendentes, icon: Clock, bg: "bg-amber-100", color: "text-amber-700" },
          { label: "Aprovadas", value: aprovadas, icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-700" },
          {
            label: "Comissões pendentes",
            value: `R$ ${comissoesPendentes.toFixed(0)}`,
            icon: DollarSign,
            bg: "bg-accent-100",
            color: "text-accent-700",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-surface-soft p-3">
            <div className={`mb-1.5 grid h-7 w-7 place-items-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
            </div>
            <p className="text-[11px] leading-tight text-ink-muted">{s.label}</p>
            <p className="mt-0.5 text-base font-bold text-ink">{typeof s.value === "number" ? s.value.toLocaleString("pt-BR") : s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
