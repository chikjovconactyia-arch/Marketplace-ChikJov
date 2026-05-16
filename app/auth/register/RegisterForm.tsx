"use client";

import { useState, useTransition } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { registerAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

type Role = "cliente" | "empresa";

const CIDADES_RMBH = [
  "Belo Horizonte", "Betim", "Contagem", "Ribeirão das Neves", "Santa Luzia", 
  "Ibirité", "Sabará", "Vespasiano", "Nova Lima", "Caeté", "Igarapé", 
  "São José da Lapa", "Mário Campos", "Confins", "Esmeraldas", "Florestal", 
  "Itaguara", "Itatiaiuçu", "Jaboticatubas", "Nova União", "Pedro Leopoldo", 
  "Raposos", "Rio Acima", "Taquaraçu de Minas", "Sarzedo", "São Joaquim de Bicas", 
  "Mateus Leme", "Juatuba", "Baldim", "Capim Branco", "Matozinhos", "Rio Manso", 
  "Brumadinho", "Barão de Cocais", "Bom Jesus do Amparo", "Itabirito", "Sete Lagoas", "São Gonçalo do Rio Abaixo"
];

export function RegisterForm({
  initialRole,
  referralSlug,
}: {
  initialRole: Role;
  referralSlug: string;
}) {
  const [role, setRole] = useState<Role>(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      {/* Tabs cliente / empresa */}
      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-surface-muted p-1">
        {(["cliente", "empresa"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-all",
              role === r
                ? "bg-white text-brand-700 shadow-soft"
                : "text-ink-muted hover:text-ink"
            )}
          >
            Sou {r}
          </button>
        ))}
      </div>

      <form
        action={(formData) => {
          setError(null);
          setSuccess(null);
          startTransition(async () => {
            const res = await registerAction(formData);
            if (res?.ok === false) setError(res.message ?? "Erro no cadastro.");
            else if (res?.ok === true)
              setSuccess(res.message ?? "Conta criada!");
          });
        }}
        className="mt-6 space-y-4"
      >
        <input type="hidden" name="role" value={role} />
        {referralSlug && (
          <input type="hidden" name="ref" value={referralSlug} />
        )}

        <Field
          label="Nome completo"
          name="fullName"
          required
          placeholder="João Silva"
        />

        {role === "empresa" && (
          <Field
            label="Nome da empresa"
            name="empresaName"
            required
            placeholder="Studio Bella Hair"
          />
        )}

        <Field
          label="WhatsApp"
          name="phone"
          type="tel"
          placeholder="(11) 99999-9999"
        />

        <Field
          label="Email"
          name="email"
          type="email"
          required
          placeholder="voce@exemplo.com"
        />

        <Field
          label="Senha"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Mínimo 8 caracteres"
        />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Cidade</span>
          <select
            name="city"
            className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink placeholder-ink-subtle outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value="" disabled selected>Selecione uma cidade</option>
            <option value="Todas as cidades">Todas as cidades</option>
            {CIDADES_RMBH.sort().map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 font-semibold text-white shadow-cta transition-colors hover:bg-accent-600 disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            "Criar conta"
          )}
        </button>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            {success}
          </div>
        )}

        <p className="text-xs text-ink-subtle">
          Ao criar conta você concorda com os{" "}
          <a href="#" className="underline">
            Termos
          </a>{" "}
          e{" "}
          <a href="#" className="underline">
            Política de Privacidade
          </a>
          .
        </p>
      </form>
    </>
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
