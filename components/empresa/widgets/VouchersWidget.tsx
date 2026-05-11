import { Ticket, CheckCircle2, Zap } from "lucide-react";

interface Props {
  geradosHoje: number;
  usadosHoje: number;
  totalGerados: number;
  economiaTotal: number;
}

export function VouchersWidget({ geradosHoje, usadosHoje, totalGerados, economiaTotal }: Props) {
  const taxaUso =
    geradosHoje > 0 ? Math.round((usadosHoje / geradosHoje) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Taxa de uso hoje */}
      <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-4 text-white">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-medium opacity-80">Taxa de uso hoje</p>
          <Zap className="h-4 w-4 opacity-60" />
        </div>
        <p className="font-display text-3xl font-bold">{taxaUso}%</p>
        <p className="mt-1 text-xs opacity-70">
          {usadosHoje} usados de {geradosHoje} gerados
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: `${taxaUso}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Gerados hoje", value: geradosHoje, icon: Ticket, bg: "bg-brand-100", color: "text-brand-700" },
          { label: "Usados hoje", value: usadosHoje, icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-700" },
          { label: "Total geral", value: totalGerados.toLocaleString("pt-BR"), icon: Ticket, bg: "bg-surface-muted", color: "text-ink-muted" },
          {
            label: "Economia gerada",
            value: `R$ ${economiaTotal.toFixed(0)}`,
            icon: Zap,
            bg: "bg-accent-100",
            color: "text-accent-700",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-surface-soft p-3">
            <div className={`mb-1.5 grid h-7 w-7 place-items-center rounded-lg ${s.bg}`}>
              <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
            </div>
            <p className="text-[11px] leading-tight text-ink-muted">{s.label}</p>
            <p className="mt-0.5 text-base font-bold text-ink">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
