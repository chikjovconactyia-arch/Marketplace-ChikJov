import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import { LeadsClientesClient, type LeadClienteRow, type LeadStatus } from "./LeadsClientesClient";

export const metadata = { title: "Leads — Admin ChikJov" };
export const revalidate = 0;

const PAID_STATUSES = new Set(["ativo", "active"]);

function daysAgo(d: string | null): string {
  if (!d) return "";
  const diff = Math.floor(
    (Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "hoje";
  if (diff === 1) return "ontem";
  return `há ${diff} dias`;
}

function classifyLead(
  subStatus: string | null,
  trialEndsAt: string | null
): LeadStatus {
  const s = (subStatus ?? "").toLowerCase();
  if (s === "trial" || s === "trialing") {
    if (trialEndsAt && new Date(trialEndsAt) < new Date()) {
      return "trial_expirado";
    }
    return "em_trial";
  }
  if (s === "pendente" || s === "past_due" || s === "incomplete") return "pendente";
  if (s === "cancelado" || s === "canceled" || s === "cancelled") return "cancelado";
  return "nunca_pagou";
}

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: adminProfile } = user
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const admin = createAdminClient();

  // Busca todos clientes + assinaturas + auth users (para emails)
  const [
    { data: clientesRaw },
    { data: assinaturasRaw },
    { data: authData },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, full_name, phone, city, subscription_status, subscription_plan, trial_ends_at, created_at"
      )
      .eq("role", "cliente")
      .order("created_at", { ascending: false }),
    admin
      .from("assinaturas")
      .select("cliente_id, status, data_inicio"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const clientes_ = clientesRaw ?? [];
  const assinaturas_ = assinaturasRaw ?? [];
  const authUsers = authData?.users ?? [];

  const emailById = new Map(authUsers.map((u) => [u.id, u.email ?? null]));

  // Conjunto de cliente_id que TEM pagamento confirmado (assinaturas ativa com data_inicio)
  const paidClientIds = new Set<string>();
  for (const a of assinaturas_) {
    if (PAID_STATUSES.has(a.status) && a.data_inicio) {
      paidClientIds.add(a.cliente_id);
    }
  }

  // Filtra os leads: clientes que NÃO pagaram ainda
  const leadsRows: LeadClienteRow[] = clientes_
    .filter((c) => {
      // Se profile já está com status 'ativo'/'active' OU tem assinatura paga → não é lead
      const s = (c.subscription_status ?? "").toLowerCase();
      if (PAID_STATUSES.has(s)) return false;
      if (paidClientIds.has(c.id)) return false;
      return true;
    })
    .map((c) => ({
      id: c.id,
      nome: c.full_name,
      email: emailById.get(c.id) ?? null,
      phone: c.phone,
      city: c.city,
      subscription_status: c.subscription_status,
      subscription_plan: c.subscription_plan,
      trial_ends_at: c.trial_ends_at,
      created_at: c.created_at,
      status: classifyLead(c.subscription_status, c.trial_ends_at),
      created_ago: daysAgo(c.created_at),
    }));

  // KPIs — apenas números (sem ícones, que não podem passar server→client)
  const kpis = {
    total: leadsRows.length,
    emTrial: leadsRows.filter((l) => l.status === "em_trial").length,
    trialExpirado: leadsRows.filter((l) => l.status === "trial_expirado").length,
    pendente: leadsRows.filter((l) => l.status === "pendente").length,
    cancelado: leadsRows.filter((l) => l.status === "cancelado").length,
  };

  return (
    <>
      <Topbar
        title="Leads"
        breadcrumbs={[{ label: "Leads" }]}
        adminName={adminProfile?.full_name}
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
            Leads
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Usuários cadastrados que ainda não efetuaram o primeiro pagamento da assinatura
          </p>
        </div>

        <LeadsClientesClient rows={leadsRows} kpis={kpis} />
      </div>
    </>
  );
}
