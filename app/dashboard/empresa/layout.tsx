import { SidebarProvider } from "@/components/empresa/SidebarContext";
import { Sidebar } from "@/components/empresa/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  // Busca logo da empresa para exibir na sidebar
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let logoUrl: string | null = null;
  let empresaNome: string | null = null;

  if (user?.email) {
    const admin = createAdminClient();
    const { data: empresario } = await admin
      .from("empresarios")
      .select("id")
      .eq("email", user.email)
      .maybeSingle();

    if (empresario) {
      const { data: empresa } = await admin
        .from("empresas")
        .select("name, logo_url")
        .eq("empresario_id", empresario.id)
        .maybeSingle();
      logoUrl = empresa?.logo_url ?? null;
      empresaNome = empresa?.name ?? null;
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#F4F2FA]">
        <Sidebar logoUrl={logoUrl} empresaNome={empresaNome} />
        <div className="flex min-h-screen flex-1 flex-col transition-all duration-300 lg:pl-64">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
