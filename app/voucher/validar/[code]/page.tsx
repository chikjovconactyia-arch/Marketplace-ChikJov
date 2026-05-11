import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, ScanLine, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { VoucherValidator } from "@/components/voucher/VoucherValidator";

export const metadata = { title: "Validar Voucher — ChikJov" };

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function PublicValidarPage({ params }: PageProps) {
  const { code: rawCode } = await params;
  const code = rawCode.toUpperCase();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Se não estiver logado, mostra tela pedindo login da empresa
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50/40">
        <header className="border-b border-brand-100/60 bg-white/60 backdrop-blur">
          <div className="container-tight flex h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-card">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-bold text-brand-700">ChikJov</span>
            </Link>
          </div>
        </header>

        <main className="container-tight flex min-h-[calc(100vh-5rem)] items-center justify-center py-12">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card md:p-10">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
              <ScanLine className="h-7 w-7" />
            </div>
            <h1 className="text-center font-display text-2xl font-bold text-ink">Validar Voucher</h1>
            <p className="mt-2 text-center text-sm text-ink-muted">
              Para validar este voucher, faça login com a conta da sua empresa.
            </p>
            <div className="mt-4 rounded-xl bg-surface-soft p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-ink-subtle">Código detectado</p>
              <p className="mt-1 font-mono text-lg font-bold tracking-wider text-brand-700">{code}</p>
            </div>
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(`/dashboard/empresa/validar-voucher?code=${code}`)}`}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 text-sm font-bold text-white shadow-cta hover:bg-accent-600"
            >
              Entrar como empresa
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-center text-xs text-ink-subtle">
              Não tem cadastro? <Link href="/#empresas" className="font-semibold text-brand-700 hover:underline">Cadastre sua empresa</Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Se for admin/empresa, redireciona para o dashboard de validação com o código pré-preenchido
  // (a página completa tem o histórico e KPIs)
  redirect(`/dashboard/empresa/validar-voucher?code=${code}`);
}
