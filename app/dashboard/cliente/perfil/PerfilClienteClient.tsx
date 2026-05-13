"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import {
  User, Mail, Phone, MapPin, Save, Loader2, CheckCircle2,
  AlertCircle, CreditCard, Calendar, Lock, X,
  UploadCloud, Trash2, Camera
} from "lucide-react";
import { updateClientePerfilAction, saveAvatarAction } from "@/app/actions/cliente-perfil";
import { cn } from "@/lib/utils";

const CIDADES_RMBH = [
  "Belo Horizonte", "Betim", "Brumadinho", "Caeté", "Capim Branco",
  "Confins", "Contagem", "Esmeraldas", "Florestal", "Ibirité", "Igarapé",
  "Itaguara", "Itatiaiuçu", "Jaboticatubas", "Juatuba", "Lagoa Santa",
  "Mário Campos", "Mateus Leme", "Matozinhos", "Nova Lima", "Nova União",
  "Pedro Leopoldo", "Raposos", "Ribeirão das Neves", "Rio Acima", "Sabará",
  "Santa Luzia", "São Joaquim de Bicas", "São José da Lapa", "Sarzedo",
  "Taquaraçu de Minas", "Vespasiano",
];

interface Profile {
  full_name: string | null;
  phone: string | null;
  city: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
}

interface Assinatura {
  plano: string;
  status: string;
  data_inicio: string | null;
  data_fim: string | null;
  stripe_subscription_id: string | null;
}

interface Props {
  profile: Profile;
  assinatura: Assinatura | null;
  userEmail: string;
  avatarUrl?: string | null;
}

// ─── Avatar Upload ────────────────────────────────────────────────────────────
function AvatarUpload({ value, onSaved }: {
  value: string;
  onSaved: (url: string, msg: string, type: "ok" | "error") => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro no upload");
      const url: string = json.url;
      setPreview(url);
      const saved = await saveAvatarAction(url);
      onSaved(url, saved.message, saved.ok ? "ok" : "error");
    } catch (e: any) {
      setError(e.message ?? "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  }, [onSaved]);

  const remove = async () => {
    setPreview("");
    const saved = await saveAvatarAction("");
    onSaved("", saved.message, saved.ok ? "ok" : "error");
  };

  return (
    <div className="flex items-center gap-5">
      {/* Avatar preview */}
      <div className="relative shrink-0">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Foto de perfil"
              className="h-20 w-20 rounded-2xl border border-[#E8E4F3] object-cover shadow-soft"
            />
            <button
              type="button"
              onClick={remove}
              title="Remover foto"
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="relative grid h-20 w-20 cursor-pointer place-items-center rounded-2xl bg-brand-50 border-2 border-dashed border-brand-200 hover:bg-brand-100 transition-colors"
          >
            <User className="h-8 w-8 text-brand-300" />
            <div className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-white">
              <Camera className="h-3 w-3" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div>
        <p className="text-sm font-medium text-ink">Foto de perfil</p>
        <p className="mt-0.5 text-xs text-ink-muted">JPG, PNG ou WebP · máx. 5MB</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-2.5 inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
        >
          {uploading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
            : <><UploadCloud className="h-4 w-4" /> {preview ? "Trocar foto" : "Enviar foto"}</>
          }
        </button>
        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />{error}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
        />
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-sm text-ink placeholder-ink-subtle outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "error"; onClose: () => void }) {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-2xl animate-fade-up",
      type === "ok" ? "bg-ink" : "bg-red-600"
    )}>
      {type === "ok" ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4" />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-3 w-3" /></button>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
      <div className="flex items-center gap-3 border-b border-[#E8E4F3] px-6 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100">
          <Icon className="h-4 w-4 text-brand-700" />
        </div>
        <h2 className="font-display text-base font-bold text-ink">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
        {Icon && <Icon className="h-3.5 w-3.5 text-ink-subtle" />}
        {label}
      </span>
      {children}
    </label>
  );
}

const SUBSCRIPTION_LABELS: Record<string, { label: string; cls: string }> = {
  active: { label: "Ativo", cls: "bg-emerald-100 text-emerald-700" },
  trial: { label: "Período grátis", cls: "bg-amber-100 text-amber-700" },
  past_due: { label: "Pagamento pendente", cls: "bg-red-100 text-red-700" },
  canceled: { label: "Cancelado", cls: "bg-red-100 text-red-700" },
  inactive: { label: "Inativo", cls: "bg-surface-muted text-ink-subtle" },
};

export function PerfilClienteClient({ profile, assinatura, userEmail, avatarUrl }: Props) {
  const [form, setForm] = useState({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    city: profile.city ?? "",
  });
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" } | null>(null);

  const showToast = (msg: string, type: "ok" | "error" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const save = () => {
    startTransition(async () => {
      const res = await updateClientePerfilAction(form);
      showToast(res.message, res.ok ? "ok" : "error");
    });
  };

  // Trial countdown
  let trialDays: number | null = null;
  if (profile.trial_ends_at) {
    const ms = new Date(profile.trial_ends_at).getTime() - Date.now();
    trialDays = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  const subStatus = profile.subscription_status ?? "inactive";
  const subBadge = SUBSCRIPTION_LABELS[subStatus] ?? SUBSCRIPTION_LABELS.inactive;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna esquerda — Dados pessoais */}
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Dados Pessoais" icon={User}>
            {/* Foto de perfil — auto-salva ao fazer upload */}
            <div className="mb-6 pb-6 border-b border-[#E8E4F3]">
              <AvatarUpload
                value={avatarUrl ?? ""}
                onSaved={(_, msg, type) => showToast(msg, type)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo *" icon={User}>
                <input
                  className={inputCls}
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Seu nome completo"
                />
              </Field>

              <Field label="WhatsApp" icon={Phone}>
                <input
                  className={inputCls}
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="(31) 99999-9999"
                />
              </Field>

              <Field label="Email" icon={Mail}>
                <input
                  className={cn(inputCls, "cursor-not-allowed bg-surface-soft text-ink-muted")}
                  value={userEmail}
                  readOnly
                  disabled
                />
              </Field>

              <Field label="Cidade" icon={MapPin}>
                <select
                  className={inputCls}
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  {CIDADES_RMBH.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={save}
                disabled={pending}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-500 px-6 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-600 disabled:opacity-60"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {pending ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </SectionCard>

          {/* Senha */}
          <SectionCard title="Segurança" icon={Lock}>
            <p className="text-sm text-ink-muted">
              Para alterar sua senha, faça logout e use a opção <strong>"Esqueci minha senha"</strong> na tela de login.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-surface-soft px-4 py-2 text-xs text-ink-muted">
              <Lock className="h-3.5 w-3.5" />
              Recurso direto de troca de senha em desenvolvimento.
            </div>
          </SectionCard>
        </div>

        {/* Coluna direita — Assinatura + Stripe */}
        <div className="space-y-6">
          {/* Assinatura */}
          <SectionCard title="Assinatura" icon={CreditCard}>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-subtle">Plano atual</p>
                <p className="mt-1 font-display text-lg font-bold text-ink">
                  {profile.subscription_plan ?? assinatura?.plano ?? "Sem plano ativo"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-subtle">Status</p>
                <span className={cn("mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", subBadge.cls)}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {subBadge.label}
                </span>
              </div>
              {trialDays !== null && trialDays > 0 && (
                <div className="rounded-xl bg-amber-50 p-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700">
                    <Calendar className="h-3.5 w-3.5" />
                    {trialDays} {trialDays === 1 ? "dia restante" : "dias restantes"} de trial
                  </div>
                </div>
              )}
              {assinatura?.data_fim && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-ink-subtle">Próxima renovação</p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {new Date(assinatura.data_fim).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              )}
              <a
                href="/checkout"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-4 text-sm font-bold text-white shadow-cta hover:bg-accent-600"
              >
                {subStatus === "active" ? "Gerenciar assinatura" : "Ativar plano"}
              </a>
            </div>
          </SectionCard>

          {/* Stripe Connect */}
          <SectionCard title="Stripe Connect" icon={CreditCard}>
            <div className="space-y-3">
              <p className="text-sm text-ink-muted">
                Conta Stripe necessária para receber bônus do programa Indique & Ganhe.
              </p>
              <div className="rounded-xl bg-surface-soft p-3 text-xs text-ink-muted">
                <span className="font-bold text-ink">Status:</span> Não conectado
              </div>
              <button
                disabled
                className="inline-flex h-10 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-surface-muted px-4 text-sm font-medium text-ink-subtle"
              >
                <Lock className="h-4 w-4" />
                Em breve
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
