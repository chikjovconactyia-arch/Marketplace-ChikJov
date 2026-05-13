import { redirect } from "next/navigation";
import { UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/cliente/Topbar";
import { PerfilClienteClient } from "./PerfilClienteClient";

export const metadata = { title: "Meu Perfil — ChikJov" };
export const revalidate = 0;

export default async function PerfilClientePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard/cliente/perfil");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, phone, city, subscription_plan, subscription_status, trial_ends_at, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const { data: assinatura } = await admin
    .from("assinaturas")
    .select("plano, status, data_inicio, data_fim, stripe_subscription_id")
    .eq("cliente_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Avatar salvo no user_metadata do Supabase Auth
  const avatarUrl: string | null = (user.user_metadata?.avatar_url as string) ?? null;

  return (
    <>
      <Topbar
        title="Meu Perfil"
        breadcrumbs={[{ label: "Meu Perfil" }]}
        userName={profile?.full_name ?? user.email}
        avatarUrl={avatarUrl}
      />
      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        {/* Header com foto */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile?.full_name ?? "Foto"}
                className="h-16 w-16 rounded-2xl object-cover border border-[#E8E4F3] shadow-card"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
                <UserCircle className="h-8 w-8" />
              </div>
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
              {profile?.full_name ?? "Meu Perfil"}
            </h1>
            <p className="mt-0.5 text-sm text-ink-muted">{user.email}</p>
          </div>
        </div>

        <PerfilClienteClient
          profile={{
            full_name: profile?.full_name ?? null,
            phone: profile?.phone ?? null,
            city: profile?.city ?? null,
            subscription_plan: profile?.subscription_plan ?? null,
            subscription_status: profile?.subscription_status ?? null,
            trial_ends_at: profile?.trial_ends_at ?? null,
          }}
          assinatura={assinatura ?? null}
          userEmail={user.email ?? ""}
          avatarUrl={avatarUrl}
        />
      </div>
    </>
  );
}
