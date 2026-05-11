"use client";

import { useState, useTransition } from "react";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/app/actions/auth";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const res = await loginAction(formData);
          if (res?.ok === false) setError(res.message ?? "Erro ao entrar.");
        });
      }}
      className="mt-8 space-y-4"
    >
      <input type="hidden" name="redirect" value={redirectTo} />

      <Field
        label="Email"
        name="email"
        type="email"
        required
        placeholder="voce@exemplo.com"
      />
      <div className="relative">
        <Field
          label="Senha"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-4 top-10 text-ink-muted hover:text-ink transition-colors"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-end">
        <a
          href="#"
          className="text-xs font-medium text-brand-700 hover:underline"
        >
          Esqueci minha senha
        </a>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 font-semibold text-white shadow-cta transition-colors hover:bg-accent-600 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </button>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          {error}
        </div>
      )}
    </form>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function Field({ label, ...props }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink placeholder-ink-subtle outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
