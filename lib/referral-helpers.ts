// Calcula a data de liberação da comissão (dia 01 do mês subsequente)
export function getReleaseDate(paymentDate: Date | string): Date {
  const d = typeof paymentDate === "string" ? new Date(paymentDate) : paymentDate;
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0);
}

// Mapeia commission_status do banco -> status semântico do business
// O DB pode ter valores legados como "pago", "pendente", etc.
// Sinônimos aceitos:
//  pago | paid → "paid"
//  liberado | available → "available"
//  pendente | pending | approved_pending_release → conforme contexto
export type ReferralBizStatus =
  | "pending_signup"          // indicado ainda não terminou cadastro
  | "pending_payment"         // indicado cadastrou mas ainda no trial
  | "approved_pending_release" // pagamento confirmado, aguarda dia 01
  | "available"               // liberado para saque
  | "paid"                    // já pago
  | "cancelled";

export function deriveReferralStatus(referral: {
  commission_status: string | null;
  subscription_status: string | null;
  activated_at: string | null;
  paid_at: string | null;
}): ReferralBizStatus {
  const cs = (referral.commission_status ?? "").toLowerCase();
  const ss = (referral.subscription_status ?? "").toLowerCase();

  if (referral.paid_at || cs === "paid" || cs === "pago") return "paid";
  if (cs === "available" || cs === "liberado") return "available";
  if (cs === "cancelled" || cs === "cancelado") return "cancelled";

  // Se já tem activated_at, está aguardando liberação (release_date = mês seguinte ao activated_at)
  if (referral.activated_at && (cs === "approved_pending_release" || ss === "active")) {
    return "approved_pending_release";
  }

  if (ss === "trial" || cs === "pending_payment") return "pending_payment";
  return "pending_signup";
}

export const STATUS_CONFIG: Record<ReferralBizStatus, { label: string; cls: string }> = {
  pending_signup: { label: "Aguardando cadastro", cls: "bg-surface-muted text-ink-subtle" },
  pending_payment: { label: "Em período grátis", cls: "bg-amber-100 text-amber-700" },
  approved_pending_release: { label: "Liberação em breve", cls: "bg-blue-100 text-blue-700" },
  available: { label: "Disponível", cls: "bg-emerald-100 text-emerald-700" },
  paid: { label: "Pago", cls: "bg-brand-100 text-brand-700" },
  cancelled: { label: "Cancelado", cls: "bg-red-100 text-red-700" },
};

export function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
