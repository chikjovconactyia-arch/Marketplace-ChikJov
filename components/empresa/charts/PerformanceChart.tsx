"use client";

import { VoucherPerformance } from "@/lib/empresa-data";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

interface Props {
  data: VoucherPerformance[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#E8E4F3] bg-white p-3 shadow-card text-xs">
      <p className="mb-2 font-semibold text-ink">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke }} />
          <span className="text-ink-muted">{p.name}:</span>
          <span className="font-semibold text-ink">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function PerformanceChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGerados" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C4B5FD" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorValidados" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#F1ECF8" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
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
        <Area
          type="monotone"
          dataKey="gerados"
          name="Gerados"
          stroke="#C4B5FD"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorGerados)"
        />
        <Area
          type="monotone"
          dataKey="validados"
          name="Validados"
          stroke="#7C3AED"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorValidados)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
