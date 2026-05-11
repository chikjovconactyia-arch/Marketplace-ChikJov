import { redirect } from "next/navigation";
import { Settings, Bell, Mail, Shield, Palette, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/cliente/Topbar";
import { ConfiguracoesClient } from "./ConfiguracoesClient";

export const metadata = { title: "Configurações — ChikJov" };

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard/cliente/configuracoes");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <Topbar
        title="Configurações"
        breadcrumbs={[{ label: "Configurações" }]}
        userName={profile?.full_name ?? user.email}
      />
      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Configurações</h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              Personalize sua experiência no ChikJov
            </p>
          </div>
        </div>

        <ConfiguracoesClient />
      </div>
    </>
  );
}
