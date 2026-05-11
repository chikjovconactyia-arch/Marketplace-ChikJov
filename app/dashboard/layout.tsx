// Layout pai do /dashboard — passthrough puro.
// Admin e Empresa têm seus próprios layouts com sidebar + topbar.
// Este arquivo existe apenas para satisfazer a estrutura de pastas do Next.js.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
