import { SidebarProvider } from "@/components/cliente/SidebarContext";
import { Sidebar } from "@/components/cliente/Sidebar";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#F4F2FA]">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col transition-all duration-300 lg:pl-64">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
