import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar — ChikJov" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white p-8 shadow-card md:p-10">
        <h1 className="heading-display text-3xl">Bem-vindo de volta</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Entre na sua conta para acessar o clube.
        </p>

        <LoginForm redirectTo={sp.redirect ?? ""} />

        <p className="mt-6 text-center text-sm text-ink-muted">
          Ainda não tem conta?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-brand-700 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
