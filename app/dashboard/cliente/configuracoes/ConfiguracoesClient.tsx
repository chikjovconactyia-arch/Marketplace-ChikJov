"use client";

import { useState } from "react";
import {
  Bell, Mail, Shield, Palette, Globe, ChevronRight,
  CheckCircle2, X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Toggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-ink px-5 py-3 text-sm font-medium text-white shadow-2xl animate-fade-up">
      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-3 w-3" /></button>
    </div>
  );
}

function SectionCard({ title, description, icon: Icon, children }: {
  title: string; description: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
      <div className="border-b border-[#E8E4F3] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100">
            <Icon className="h-4 w-4 text-brand-700" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-ink">{title}</h2>
            <p className="text-xs text-ink-muted">{description}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function ToggleRow({ toggle, onToggle }: { toggle: Toggle; onToggle: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{toggle.label}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{toggle.description}</p>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          toggle.enabled ? "bg-brand-500" : "bg-surface-muted"
        )}
        aria-pressed={toggle.enabled}
      >
        <span className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
          toggle.enabled ? "translate-x-5" : "translate-x-0.5"
        )} />
      </button>
    </div>
  );
}

export function ConfiguracoesClient() {
  const [toast, setToast] = useState<string | null>(null);

  const [notificacoes, setNotificacoes] = useState<Toggle[]>([
    { id: "voucher_gerado", label: "Voucher gerado", description: "Receba notificação quando um voucher for gerado.", enabled: true },
    { id: "voucher_validado", label: "Voucher validado", description: "Avise quando uma empresa validar seu voucher.", enabled: true },
    { id: "voucher_expirando", label: "Voucher expirando", description: "Lembrete 3 dias antes do vencimento.", enabled: true },
    { id: "indicacao_aprovada", label: "Indicação aprovada", description: "Quando alguém que você indicou paga.", enabled: true },
    { id: "novo_parceiro", label: "Nova empresa parceira", description: "Receba quando uma nova empresa entrar no clube.", enabled: false },
  ]);

  const [marketing, setMarketing] = useState<Toggle[]>([
    { id: "newsletter", label: "Newsletter mensal", description: "Resumo das melhores ofertas e dicas.", enabled: true },
    { id: "promocoes", label: "Promoções especiais", description: "Ofertas relâmpago e cupons exclusivos.", enabled: false },
  ]);

  const [privacidade, setPrivacidade] = useState<Toggle[]>([
    { id: "perfil_publico", label: "Perfil público no ranking de indicações", description: "Apareça no ranking público dos top indicadores.", enabled: false },
    { id: "share_data", label: "Compartilhar dados com parceiros", description: "Permite que empresas vejam estatísticas anonimizadas.", enabled: true },
  ]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleItem = (
    list: Toggle[],
    setter: (l: Toggle[]) => void,
    id: string
  ) => {
    const updated = list.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t));
    setter(updated);
    showToast("Preferência salva!");
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notificações */}
        <SectionCard title="Notificações" description="Gerencie quais alertas você recebe" icon={Bell}>
          <div className="divide-y divide-[#F1ECF8]">
            {notificacoes.map((t) => (
              <ToggleRow key={t.id} toggle={t} onToggle={() => toggleItem(notificacoes, setNotificacoes, t.id)} />
            ))}
          </div>
        </SectionCard>

        {/* Marketing */}
        <SectionCard title="Email Marketing" description="Comunicações promocionais" icon={Mail}>
          <div className="divide-y divide-[#F1ECF8]">
            {marketing.map((t) => (
              <ToggleRow key={t.id} toggle={t} onToggle={() => toggleItem(marketing, setMarketing, t.id)} />
            ))}
          </div>
        </SectionCard>

        {/* Privacidade */}
        <SectionCard title="Privacidade" description="Como seus dados são compartilhados" icon={Shield}>
          <div className="divide-y divide-[#F1ECF8]">
            {privacidade.map((t) => (
              <ToggleRow key={t.id} toggle={t} onToggle={() => toggleItem(privacidade, setPrivacidade, t.id)} />
            ))}
          </div>
        </SectionCard>

        {/* Aparência */}
        <SectionCard title="Aparência" description="Tema e idioma" icon={Palette}>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-ink">Tema</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "light", label: "Claro" },
                  { id: "dark", label: "Escuro", soon: true },
                  { id: "system", label: "Sistema", soon: true },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    disabled={opt.soon}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                      opt.id === "light"
                        ? "border-brand-300 bg-brand-50 text-brand-700"
                        : "border-[#E8E4F3] text-ink-muted",
                      opt.soon && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {opt.label}
                    {opt.soon && <span className="ml-1 text-[9px] uppercase">soon</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-ink">Idioma</p>
              <select className="w-full rounded-xl border border-[#E8E4F3] bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-brand-300">
                <option>Português (Brasil)</option>
                <option disabled>English (em breve)</option>
                <option disabled>Español (em breve)</option>
              </select>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Conta — links rápidos */}
      <div className="mt-6 rounded-2xl bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
        <div className="border-b border-[#E8E4F3] px-6 py-4">
          <h2 className="font-display text-base font-bold text-ink">Outras ações</h2>
        </div>
        <div className="divide-y divide-[#F1ECF8]">
          {[
            { label: "Termos de uso", href: "#" },
            { label: "Política de privacidade", href: "#" },
            { label: "Central de ajuda", href: "#" },
            { label: "Contato com suporte", href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-surface-soft"
            >
              <span className="text-sm font-medium text-ink">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-ink-subtle" />
            </a>
          ))}
        </div>
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </>
  );
}
