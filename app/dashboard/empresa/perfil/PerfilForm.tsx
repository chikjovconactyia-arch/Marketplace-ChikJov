"use client";

import { useState, useTransition } from "react";
import {
  User, Building2, Phone, Mail, MapPin, Globe, FileText,
  Loader2, CheckCircle2, AlertCircle, Save, Hash, Instagram
} from "lucide-react";
import { updatePerfilPessoalAction, updateEmpresaAction } from "@/app/actions/perfil";
import { cn } from "@/lib/utils";

const CATEGORIAS = [
  "Beleza & Estética", "Saúde & Bem-estar", "Gastronomia",
  "Academia & Esporte", "Automotivo", "Pet Shop & Veterinário",
  "Moda & Acessórios", "Educação & Cursos", "Serviços Domésticos",
  "Tecnologia", "Lazer & Entretenimento", "Outros",
];

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
}

interface Empresa {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  description: string | null;
  cnpj: string | null;
  instagram?: string | null;
  active?: boolean;
}

interface Props {
  profile: Profile;
  empresa: Empresa | null;
  userEmail: string;
}

function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "error"; onClose: () => void }) {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-2xl animate-fade-up",
      type === "ok" ? "bg-ink" : "bg-red-600"
    )}>
      {type === "ok"
        ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
        : <AlertCircle className="h-4 w-4 shrink-0" />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
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

function Field({
  label, icon: Icon, required, children
}: {
  label: string; icon?: React.ElementType; required?: boolean; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
        {Icon && <Icon className="h-3.5 w-3.5 text-ink-subtle" />}
        {label}
        {required && <span className="text-accent-500">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-xl border border-brand-100 bg-white px-4 py-2.5 text-sm text-ink placeholder-ink-subtle outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function PerfilForm({ profile, empresa, userEmail }: Props) {
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" } | null>(null);

  // ── Seção pessoal ───────────────────────────────────────────────────────────
  const [pessoal, setPessoal] = useState({
    full_name: profile.full_name ?? "",
    phone: profile.phone ?? "",
    city: profile.city ?? "",
  });
  const [pendingP, startP] = useTransition();

  const savePessoal = () => {
    startP(async () => {
      const res = await updatePerfilPessoalAction(pessoal);
      setToast({ msg: res.message, type: res.ok ? "ok" : "error" });
    });
  };

  // ── Seção empresa ───────────────────────────────────────────────────────────
  const [emp, setEmp] = useState({
    name: empresa?.name ?? "",
    category: empresa?.category ?? "",
    city: empresa?.city ?? "",
    phone: empresa?.phone ?? "",
    email: empresa?.email ?? userEmail,
    website: empresa?.website ?? "",
    address: empresa?.address ?? "",
    description: empresa?.description ?? "",
    cnpj: empresa?.cnpj ?? "",
    instagram: empresa?.instagram ?? "",
  });
  const [pendingE, startE] = useTransition();

  const saveEmpresa = () => {
    startE(async () => {
      // Limpa o instagram para salvar apenas o handle
      const sanitizedEmp = {
        ...emp,
        instagram: emp.instagram.replace(/https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "").replace(/^@/, "")
      };
      
      // Passa o ID como hint mas a action valida server-side pelo usuário logado
      const res = await updateEmpresaAction(empresa?.id ?? "", sanitizedEmp);
      setToast({ msg: res.message, type: res.ok ? "ok" : "error" });
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* ── Informações Pessoais ─────────────────────────────────────────── */}
        <SectionCard title="Informações Pessoais" icon={User}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" icon={User} required>
              <input
                className={inputCls}
                value={pessoal.full_name}
                onChange={(e) => setPessoal((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="João Silva"
              />
            </Field>

            <Field label="WhatsApp / Telefone" icon={Phone}>
              <input
                className={inputCls}
                value={pessoal.phone}
                onChange={(e) => setPessoal((p) => ({ ...p, phone: e.target.value }))}
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
                value={pessoal.city}
                onChange={(e) => setPessoal((p) => ({ ...p, city: e.target.value }))}
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
              onClick={savePessoal}
              disabled={pendingP}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-500 px-6 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-600 disabled:opacity-60"
            >
              {pendingP ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {pendingP ? "Salvando..." : "Salvar informações pessoais"}
            </button>
          </div>
        </SectionCard>

        {/* ── Informações da Empresa ───────────────────────────────────────── */}
        <SectionCard title="Informações da Empresa" icon={Building2}>
          {!empresa ? (
            <p className="text-sm text-ink-muted">
              Nenhuma empresa vinculada a este perfil ainda.
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome da empresa" icon={Building2} required>
                  <input
                    className={inputCls}
                    value={emp.name}
                    onChange={(e) => setEmp((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Studio Bella"
                  />
                </Field>

                <Field label="Categoria" icon={FileText}>
                  <select
                    className={inputCls}
                    value={emp.category}
                    onChange={(e) => setEmp((p) => ({ ...p, category: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                <Field label="CNPJ" icon={Hash}>
                  <input
                    className={inputCls}
                    value={emp.cnpj}
                    onChange={(e) => setEmp((p) => ({ ...p, cnpj: e.target.value }))}
                    placeholder="00.000.000/0001-00"
                  />
                </Field>

                <Field label="Telefone da empresa" icon={Phone}>
                  <input
                    className={inputCls}
                    value={emp.phone}
                    onChange={(e) => setEmp((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="(31) 3333-4444"
                  />
                </Field>

                <Field label="Email da empresa" icon={Mail}>
                  <input
                    type="email"
                    className={inputCls}
                    value={emp.email}
                    onChange={(e) => setEmp((p) => ({ ...p, email: e.target.value }))}
                    placeholder="contato@empresa.com.br"
                  />
                </Field>

                <Field label="Instagram" icon={Instagram}>
                  <input
                    className={inputCls}
                    value={emp.instagram}
                    onChange={(e) => setEmp((p) => ({ ...p, instagram: e.target.value }))}
                    placeholder="@suaempresa"
                  />
                </Field>

                <Field label="Cidade" icon={MapPin}>
                  <select
                    className={inputCls}
                    value={emp.city}
                    onChange={(e) => setEmp((p) => ({ ...p, city: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {CIDADES_RMBH.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Site / Website" icon={Globe}>
                  <input
                    className={inputCls}
                    value={emp.website}
                    onChange={(e) => setEmp((p) => ({ ...p, website: e.target.value }))}
                    placeholder="https://suaempresa.com.br"
                  />
                </Field>

                <Field label="Endereço" icon={MapPin} >
                  <input
                    className={cn(inputCls, "sm:col-span-2")}
                    value={emp.address}
                    onChange={(e) => setEmp((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Rua das Flores, 123 — Bairro"
                  />
                </Field>
              </div>

              {/* Descrição full-width */}
              <div className="mt-4">
                <Field label="Descrição da empresa" icon={FileText}>
                  <textarea
                    className={cn(inputCls, "min-h-[96px] resize-y")}
                    value={emp.description}
                    onChange={(e) => setEmp((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Descreva sua empresa, diferenciais, horários..."
                  />
                </Field>
              </div>

              {/* Status badge */}
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-soft px-4 py-3">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  empresa.active ? "bg-emerald-500" : "bg-amber-400"
                )} />
                <span className="text-sm text-ink-muted">
                  Status:{" "}
                  <strong className="text-ink">
                    {empresa.active ? "Empresa ativa" : "Aguardando aprovação do admin"}
                  </strong>
                </span>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={saveEmpresa}
                  disabled={pendingE}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-accent-500 px-6 text-sm font-semibold text-white shadow-cta transition-colors hover:bg-accent-600 disabled:opacity-60"
                >
                  {pendingE ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {pendingE ? "Salvando..." : "Salvar informações da empresa"}
                </button>
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
}
