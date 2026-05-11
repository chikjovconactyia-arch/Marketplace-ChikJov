import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Props {
  receitaMensal: number;
  receitaAnual: number;
  assinaturasAtivas: number;
  assinaturasCanceladas: number;
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

export function FinancialWidget({
  receitaMensal,
  receitaAnual,
  assinaturasAtivas,
  assinaturasCanceladas,
}: Props) {
  const churn =
    assinaturasAtivas + assinaturasCanceladas > 0
      ? ((assinaturasCanceladas / (assinaturasAtivas + assinaturasCanceladas)) * 100).toFixed(1)
      : "0";

  const rows = [
    {
      label: "Receita este mês",
      value: formatBRL(receitaMensal),
      icon: DollarSign,
      positive: true,
      bg: "bg-emerald-100",
      color: "text-emerald-700",
    },
    {
      label: "Receita este ano",
      value: formatBRL(receitaAnual),
      icon: TrendingUp,
      positive: true,
      bg: "bg-brand-100",
      color: "text-brand-700",
    },
    {
      label: "Assinaturas ativas",
      value: assinaturasAtivas.toLocaleString("pt-BR"),
      icon: TrendingUp,
      positive: true,
      bg: "bg-blue-100",
      color: "text-blue-700",
    },
    {
      label: "Taxa de cancelamento",
      value: `${churn}%`,
      icon: TrendingDown,
      positive: false,
      bg: "bg-red-100",
      color: "text-red-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {rows.map((r) => (
        <div key={r.label} className="rounded-xl bg-surface-soft p-3.5">
          <div className={`mb-2 grid h-8 w-8 place-items-center rounded-lg ${r.bg}`}>
            <r.icon className={`h-4 w-4 ${r.color}`} />
          </div>
          <p className="text-xs text-ink-muted">{r.label}</p>
          <p className="mt-0.5 font-display text-lg font-bold leading-tight text-ink">{r.value}</p>
        </div>
      ))}
    </div>
  );
}
