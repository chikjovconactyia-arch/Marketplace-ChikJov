import { UserCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/empresa/Topbar";
import { PerfilForm } from "./PerfilForm";

export const metadata = { title: "Perfil — ChikJov Empresa" };
export const revalidate = 0;

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();

  // Busca profile e empresa em paralelo
  const [{ data: profile }, { data: empresario }] = await Promise.all([
    admin.from("profiles").select("full_name, phone, city, subscription_status").eq("id", user.id).maybeSingle(),
    admin.from("empresarios").select("id, full_name, phone").eq("email", user.email ?? "").maybeSingle(),
  ]);

  // Busca empresa vinculada ao empresário
  const { data: empresa } = empresario
    ? await admin
        .from("empresas")
        .select("id, name, category, city, phone, email, website, instagram, address, description, cnpj, active")
        .eq("empresario_id", empresario.id)
        .maybeSingle()
    : { data: null };

  return (
    <>
      <Topbar title="Perfil" breadcrumbs={[{ label: "Perfil" }]} empresaName={profile?.full_name ?? user.email} />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
            <UserCircle className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
              {profile?.full_name ?? "Meu Perfil"}
            </h1>
            <p className="mt-0.5 text-sm text-ink-muted">{user.email}</p>
          </div>
        </div>

        <PerfilForm
          profile={{
            full_name: profile?.full_name ?? null,
            phone: profile?.phone ?? null,
            city: profile?.city ?? null,
          }}
          empresa={empresa ?? null}
          userEmail={user.email ?? ""}
        />
      </div>
    </>
  );
}
