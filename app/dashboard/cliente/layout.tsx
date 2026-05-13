import { SidebarProvider } from "@/components/cliente/SidebarContext";
import { Sidebar } from "@/components/cliente/Sidebar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const avatarUrl: string | null = (user?.user_metadata?.avatar_url as string) ?? null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#F4F2FA]">
        <Sidebar avatarUrl={avatarUrl} userName={user?.user_metadata?.full_name ?? user?.email ?? null} />
        <div className="flex min-h-screen flex-1 flex-col transition-all duration-300 lg:pl-64">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
