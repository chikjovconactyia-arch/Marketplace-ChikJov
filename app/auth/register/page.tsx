import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Criar conta — ChikJov" };

type Role = "cliente" | "empresa";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; ref?: string }>;
}) {
  const sp = await searchParams;
  const initialRole: Role = sp.role === "empresa" ? "empresa" : "cliente";

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white p-8 shadow-card md:p-10">
        <h1 className="heading-display text-3xl">Criar conta</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Comece em menos de 1 minuto.
        </p>

        <RegisterForm initialRole={initialRole} referralSlug={sp.ref ?? ""} />

        <p className="mt-6 text-center text-sm text-ink-muted">
          Já tem uma conta?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-brand-700 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
