"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
import { registerEmpresaLandingAction } from "@/app/actions/auth";

const CIDADES_RMBH = [
  "Belo Horizonte",
  "Betim",
  "Brumadinho",
  "Caeté",
  "Capim Branco",
  "Confins",
  "Contagem",
  "Esmeraldas",
  "Florestal",
  "Ibirité",
  "Igarapé",
  "Itaguara",
  "Itatiaiuçu",
  "Jaboticatubas",
  "Juatuba",
  "Lagoa Santa",
  "Mário Campos",
  "Mateus Leme",
  "Matozinhos",
  "Nova Lima",
  "Nova União",
  "Pedro Leopoldo",
  "Raposos",
  "Ribeirão das Neves",
  "Rio Acima",
  "Sabará",
  "Santa Luzia",
  "São Joaquim de Bicas",
  "São José da Lapa",
  "Sarzedo",
  "Taquaraçu de Minas",
  "Vespasiano",
];

const CATEGORIAS = [
  "Beleza & Estética",
  "Saúde & Bem-estar",
  "Gastronomia",
  "Academia & Esporte",
  "Automotivo",
  "Pet Shop & Veterinário",
  "Moda & Acessórios",
  "Educação & Cursos",
  "Serviços Domésticos",
  "Tecnologia",
  "Lazer & Entretenimento",
  "Outros",
];

const initial = {
  nome: "",
  whatsapp: "",
  email: "",
  empresa: "",
  instagram: "",
  cidade: "",
  categoria: "",
  senha: "",
};

export function BusinessCTA() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    // Limpa o instagram para salvar apenas o handle se colarem a URL completa
    const sanitizedForm = {
      ...form,
      instagram: form.instagram.replace(/https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "").replace(/^@/, "")
    };

    const res = await registerEmpresaLandingAction(sanitizedForm);

    if (res.ok) {
      if (res.redirectTo) {
        // Conta criada e sessão ativa → ir para o dashboard
        router.push(res.redirectTo);
        return;
      }
      // Confirmação de email pendente
      setStatus("ok");
      setMessage(res.message);
      setForm(initial);
    } else {
      setStatus("error");
      setMessage(res.message);
    }
  };

  return (
    <section
      id="empresas"
      className="relative overflow-hidden bg-white py-16 md:py-24 lg:py-28"
    >
      <div className="container-tight grid items-center gap-12 lg:grid-cols-2">
        {/* Imagem esquerda */}
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-accent-gradient opacity-20 blur-3xl" />
          <div
            className="aspect-[4/5] overflow-hidden rounded-3xl bg-cover bg-center shadow-card"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=800&q=80)",
            }}
          />
          <div className="absolute -bottom-6 -right-4 rounded-2xl bg-white p-5 shadow-card md:-right-8">
            <p className="text-xs text-ink-muted">Leads esse mês</p>
            <p className="font-display text-3xl font-bold text-brand-700">+1.247</p>
            <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-accent-600">
              ↑ 38% vs mês anterior
            </div>
          </div>
        </div>

        {/* Formulário */}
        <div>
          <span className="pill">📈 Para empresas</span>
          <h2 className="heading-display mt-4 text-3xl text-balance md:text-4xl lg:text-5xl">
            Coloque sua marca entre as{" "}
            <span className="bg-accent-gradient bg-clip-text text-transparent">
              mais desejadas
            </span>
          </h2>
          <p className="mt-4 text-lg text-ink-muted text-balance">
            Cadastre sua empresa e receba leads qualificados todos os dias. Sem
            taxa de adesão. Sem fidelidade.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Nome + WhatsApp */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo *" name="nome" value={form.nome} onChange={handleChange} required placeholder="João Silva" />
              <Field label="WhatsApp *" name="whatsapp" value={form.whatsapp} onChange={handleChange} required placeholder="(11) 99999-9999" />
            </div>

            {/* Email */}
            <Field label="Email *" type="email" name="email" value={form.email} onChange={handleChange} required placeholder="voce@empresa.com.br" />

            {/* Nome da empresa + Instagram */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome da empresa *" name="empresa" value={form.empresa} onChange={handleChange} required placeholder="Studio Bella" />
              <Field label="Instagram" name="instagram" value={form.instagram} onChange={handleChange} placeholder="@suaempresa" />
            </div>

            {/* Cidade + Categoria */}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Cidade *
                </span>
                <select
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="" disabled>Selecione a cidade...</option>
                  {CIDADES_RMBH.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Categoria *
                </span>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="" disabled>
                    Selecione...
                  </option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Senha */}
            <div className="relative">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Senha * <span className="font-normal text-ink-subtle">(mínimo 8 caracteres)</span>
                </span>
                <input
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  value={form.senha}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 pr-11 text-sm text-ink placeholder-ink-subtle outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-10 text-ink-muted transition-colors hover:text-ink"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-8 text-base font-semibold text-white shadow-cta transition-all hover:bg-accent-600 active:scale-[0.99] disabled:opacity-60"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Criando sua conta...
                </>
              ) : (
                <>
                  Quero destacar minha marca
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {status === "ok" && (
              <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                {message}
              </div>
            )}
            {status === "error" && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                {message}
              </div>
            )}

            <p className="text-xs text-ink-subtle">
              Ao criar conta você concorda com os{" "}
              <a href="#" className="underline">Termos de uso</a>{" "}
              e{" "}
              <a href="#" className="underline">Política de Privacidade</a>.
            </p>
          </form>
        </div>
      </div>
    </section>
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
