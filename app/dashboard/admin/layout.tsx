import { SidebarProvider } from "@/components/admin/SidebarContext";
import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#F4F2FA]">
        <Sidebar />
        {/* Main content — shifts right when sidebar is open on desktop */}
        <div className="flex min-h-screen flex-1 flex-col transition-all duration-300 lg:pl-64">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
