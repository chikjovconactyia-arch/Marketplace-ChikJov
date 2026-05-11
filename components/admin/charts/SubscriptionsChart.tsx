"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface Props {
  data: { month: string; assinantes: number; empresas: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#E8E4F3] bg-white p-3 shadow-card text-xs">
      <p className="mb-2 font-semibold text-ink">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-ink-muted capitalize">{p.name}:</span>
          <span className="font-semibold text-ink">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function SubscriptionsChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradAssinantes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradEmpresas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F26B0A" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#F26B0A" stopOpacity={0} />
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
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(v) => <span style={{ color: "#5A5670" }}>{v}</span>}
        />
        <Area
          type="monotone"
          dataKey="assinantes"
          name="Assinantes"
          stroke="#7C3AED"
          strokeWidth={2.5}
          fill="url(#gradAssinantes)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="empresas"
          name="Empresas"
          stroke="#F26B0A"
          strokeWidth={2.5}
          fill="url(#gradEmpresas)"
          dot={false}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
