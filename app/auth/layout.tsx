import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50/40">
      <header className="border-b border-brand-100/60 bg-white/60 backdrop-blur">
        <div className="container-tight flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-card">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold text-brand-700">
              ChikJov
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-ink-muted transition-colors hover:text-brand-700"
          >
            ← Voltar ao site
          </Link>
        </div>
      </header>
      <main className="container-tight flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
        {children}
      </main>
    </div>
  );
}
