"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  leadsContent: React.ReactNode;
  empresasContent: React.ReactNode;
  leadsCount: number;
  empresasCount: number;
}

export function TabsClient({ leadsContent, empresasContent, leadsCount, empresasCount }: Props) {
  const [tab, setTab] = useState<"leads" | "empresas">("empresas");

  return (
    <>
      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-surface-muted p-1 w-fit">
        <TabBtn active={tab === "empresas"} onClick={() => setTab("empresas")} count={empresasCount}>
          Empresas cadastradas
        </TabBtn>
        <TabBtn active={tab === "leads"} onClick={() => setTab("leads")} count={leadsCount}>
          Leads da landing
        </TabBtn>
      </div>

      {tab === "empresas" ? empresasContent : leadsContent}
    </>
  );
}

function TabBtn({ active, onClick, count, children }: {
  active: boolean; onClick: () => void; count: number; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
        active ? "bg-white text-brand-700 shadow-soft" : "text-ink-muted hover:text-ink"
      )}
    >
      {children}
      <span className={cn(
        "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
        active ? "bg-brand-100 text-brand-700" : "bg-white/60 text-ink-subtle"
      )}>
        {count}
      </span>
    </button>
  );
}
