import { Users, ShieldBan, ShieldCheck, CheckCircle2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/admin/Topbar";
import { createClient } from "@/lib/supabase/server";
import { ClientesTable } from "./ClientesTable";

export const metadata = { title: "Clientes — Admin ChikJov" };
export const revalidate = 0;

export default async function AdminClientesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    : { data: null };

  const admin = createAdminClient();

  // Buscar usuários na tabela auth.users para pegar email e status de banimento
  const { data: { users: authUsers }, error: authError } = await admin.auth.admin.listUsers();
  const authUsersMap = new Map((authUsers || []).map((u) => [u.id, u]));

  // Buscar perfis com role 'cliente'
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("*")
    .eq("role", "cliente")
    .order("created_at", { ascending: false });

  const clientesRaw = profiles ?? [];

  // Enriquecer dados dos clientes
  const clientes = clientesRaw.map((cliente) => {
    const authUser = authUsersMap.get(cliente.id);
    const isBanned = !!(authUser?.banned_until && new Date(authUser.banned_until) > new Date());
    
    return {
      ...cliente,
      email: authUser?.email ?? "Sem email",
      is_banned: isBanned,
    };
  });

  // KPIs
  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter((c) => c.subscription_status === "active").length;
  const clientesPendentes = clientes.filter((c) => c.subscription_status === "inactive" || c.subscription_status === "pendente").length;
  const clientesBloqueados = clientes.filter((c) => c.is_banned).length;

  return (
    <>
      <Topbar
        title="Clientes"
        breadcrumbs={[{ label: "Clientes" }]}
        adminName={profile?.full_name}
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Clientes</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Gerencie os usuários finais e assinantes do ChikJov
          </p>
        </div>

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total de clientes", value: totalClientes, icon: Users, bg: "bg-brand-100", color: "text-brand-700" },
            { label: "Assinaturas ativas", value: clientesAtivos, icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-700" },
            { label: "Sem assinatura", value: clientesPendentes, icon: ShieldCheck, bg: "bg-blue-100", color: "text-blue-700" },
            { label: "Bloqueados", value: clientesBloqueados, icon: ShieldBan, bg: "bg-red-100", color: "text-red-700" },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
              <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${c.bg}`}>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <p className="font-display text-3xl font-bold text-ink">{c.value}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Tabela de clientes */}
        <ClientesTable clientes={clientes} />
      </div>
    </>
  );
}
