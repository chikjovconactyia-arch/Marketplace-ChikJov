import { Building2, Ticket, UserPlus, Share2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const activityConfig = {
  empresa: { icon: Building2, bg: "bg-brand-100", color: "text-brand-700", label: "Empresa" },
  voucher: { icon: Ticket, bg: "bg-accent-100", color: "text-accent-700", label: "Voucher" },
  assinatura: { icon: CreditCard, bg: "bg-emerald-100", color: "text-emerald-700", label: "Assinatura" },
  indicacao: { icon: Share2, bg: "bg-purple-100", color: "text-purple-700", label: "Indicação" },
  pagamento: { icon: CreditCard, bg: "bg-blue-100", color: "text-blue-700", label: "Pagamento" },
};

interface Activity {
  id: string;
  type: keyof typeof activityConfig;
  title: string;
  subtitle: string;
  time: string;
}

// Dados de exemplo — substituir por dados reais quando histórico de eventos existir
const mockActivities: Activity[] = [
  { id: "1", type: "empresa", title: "Studio Bella Hair", subtitle: "Nova empresa cadastrada", time: "2 min" },
  { id: "2", type: "assinatura", title: "João Silva", subtitle: "Assinou o plano cliente", time: "15 min" },
  { id: "3", type: "voucher", title: "Voucher #VCH-8821", subtitle: "Gerado por Maria Souza", time: "32 min" },
  { id: "4", type: "indicacao", title: "Pedro Lima → Ana Costa", subtitle: "Indicação registrada R$ 20", time: "1h" },
  { id: "5", type: "empresa", title: "Pet Mania", subtitle: "Plano empresa ativado", time: "2h" },
  { id: "6", type: "pagamento", title: "R$ 39,90 recebido", subtitle: "Assinatura #ASS-2210", time: "3h" },
];

export function ActivityFeed({ activities = mockActivities }: { activities?: Activity[] }) {
  return (
    <div className="space-y-3">
      {activities.map((a) => {
        const cfg = activityConfig[a.type];
        return (
          <div key={a.id} className="flex items-start gap-3">
            <div className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl", cfg.bg)}>
              <cfg.icon className={cn("h-4 w-4", cfg.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{a.title}</p>
              <p className="truncate text-xs text-ink-muted">{a.subtitle}</p>
            </div>
            <span className="shrink-0 text-xs text-ink-subtle">{a.time}</span>
          </div>
        );
      })}
    </div>
  );
}
