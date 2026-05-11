import Link from "next/link";
import { Building2, Clock, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecentCompany } from "@/lib/admin-data";

interface Props {
  companies: RecentCompany[];
  pending: number;
}

export function CompaniesWidget({ companies, pending }: Props) {
  return (
    <div className="space-y-3">
      {pending > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-amber-800">
              {pending} empresa{pending > 1 ? "s" : ""} aguardando aprovação
            </span>
          </div>
          <Link
            href="/dashboard/admin/empresas?status=pendente"
            className="text-xs font-semibold text-amber-700 hover:underline"
          >
            Revisar
          </Link>
        </div>
      )}

      {companies.slice(0, 5).map((c) => (
        <div key={c.id} className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-medium text-ink">{c.name}</p>
              {c.is_featured && (
                <Star className="h-3 w-3 shrink-0 fill-accent-500 text-accent-500" />
              )}
            </div>
            <p className="truncate text-xs text-ink-muted">
              {c.category ?? "Sem categoria"} {c.city ? `· ${c.city}` : ""}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
              c.active && c.subscription_active
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            )}
          >
            {c.active && c.subscription_active ? "Ativo" : "Pendente"}
          </span>
        </div>
      ))}

      <Link
        href="/dashboard/admin/empresas"
        className="flex items-center justify-center gap-1.5 rounded-xl border border-brand-100 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
      >
        Ver todas as empresas
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
