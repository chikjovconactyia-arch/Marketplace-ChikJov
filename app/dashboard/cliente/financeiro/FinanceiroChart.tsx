"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

interface Props {
  data: { month: string; economia: number; vouchers: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#E8E4F3] bg-white p-3 shadow-card text-xs">
      <p className="mb-2 font-semibold text-ink">{label}</p>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-ink-muted">Economia:</span>
        <span className="font-bold text-emerald-600">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(payload[0].value)}
        </span>
      </div>
      {payload[0].payload.vouchers > 0 && (
        <div className="mt-1 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-500" />
          <span className="text-ink-muted">Vouchers:</span>
          <span className="font-bold text-brand-600">{payload[0].payload.vouchers}</span>
        </div>
      )}
    </div>
  );
};

export function FinanceiroChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradEconomia" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#F1ECF8" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "#8A869A" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#8A869A" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$ ${v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="economia"
          name="Economia"
          stroke="#10B981"
          strokeWidth={2.5}
          fill="url(#gradEconomia)"
          dot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
