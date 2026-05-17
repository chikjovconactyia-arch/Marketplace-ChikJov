import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata = { title: "Definir senha — ChikJov" };

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50/40 py-12">
      <div className="container-tight max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-card md:p-10">
          <h1 className="font-display text-2xl font-bold text-ink">
            Defina sua senha
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            Sua assinatura está ativa! Crie uma senha para acessar seu painel.
          </p>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
