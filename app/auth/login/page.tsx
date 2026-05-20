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
    <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl grid grid-cols-1 md:grid-cols-2">
      {/* Coluna Esquerda: Branding & Copy (Oculta no mobile) */}
      <div className="relative hidden flex-col justify-center bg-gradient-to-br from-purple-700 via-[#7029A3] to-indigo-900 p-12 text-white md:flex overflow-hidden">
        {/* Efeitos decorativos sutis */}
        <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl mix-blend-overlay" />
        <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl mix-blend-overlay" />
        
        <div className="relative z-10">
          <h1 className="mb-4 font-display text-4xl font-bold leading-tight text-white drop-shadow-sm">
            Seja bem-vindo<br />ao ChikJov
          </h1>
          <p className="text-lg leading-relaxed text-purple-100/90 drop-shadow-sm">
            Faça o seu login e aproveite as melhores ofertas, descontos e vantagens exclusivas para você.
          </p>
        </div>
      </div>

      {/* Coluna Direita: Formulário */}
      <div className="flex flex-col justify-center p-8 md:p-12 lg:px-14">
        {/* Fallback mobile */}
        <div className="md:hidden">
          <h2 className="mb-2 font-display text-2xl font-bold text-ink">Bem-vindo</h2>
          <p className="mb-6 text-sm text-ink-muted">Faça o seu login e aproveite ofertas exclusivas.</p>
        </div>
        
        <LoginForm redirectTo={sp.redirect ?? ""} />

        <p className="mt-8 text-center text-sm font-medium text-ink-muted">
          Ainda não tem uma conta?{" "}
          <a
            href="https://buy.stripe.com/test_7sYeVcfPR0kz9OL0dD14400"
            className="font-bold text-accent-500 hover:text-accent-600 hover:underline transition-colors"
          >
            Criar Conta
          </a>
        </p>
      </div>
    </div>
  );
}
