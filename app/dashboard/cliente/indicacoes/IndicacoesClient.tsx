"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Share2, Copy, CheckCircle2, AlertCircle, Wallet, Users,
  Clock, TrendingUp, Loader2, Send, Link as LinkIcon, X,
  Sparkles, Lock, ArrowRight, LayoutList, Network, QrCode
} from "lucide-react";
import {
  getOrGenerateSlugAction, requestPayoutAction, connectStripeAction
} from "@/app/actions/referrals";
import { STATUS_CONFIG, formatBRL, type ReferralBizStatus } from "@/lib/referral-helpers";
import { cn } from "@/lib/utils";

interface ReferralItem {
  id: string;
  level: number;
  commission_value: number | null;
  status: ReferralBizStatus;
  release_date: string | null;
  paid_at: string | null;
  created_at: string | null;
  indicado_nome: string | null;
}

interface Props {
  userName: string;
  slug: string | null;
  items: ReferralItem[];
  kpis: {
    saldoDisponivel: number;
    saldoPendente: number;
    totalPago: number;
    nivel1Count: number;
    nivel2Count: number;
    totalIndicados: number;
  };
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

// ─── Ícone bonequinho SVG ──────────────────────────────────────────────────────
function PersonIcon({ size = 32, color = "#7C3AED" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Cabeça */}
      <circle cx="16" cy="9" r="5" fill={color} />
      {/* Corpo */}
      <path
        d="M6 27c0-5.523 4.477-10 10-10s10 4.477 10 10"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// ─── Nó da árvore ─────────────────────────────────────────────────────────────
function TreeNode({
  label,
  sublabel,
  status,
  isYou = false,
  level = 0,
}: {
  label: string;
  sublabel?: string;
  status?: ReferralBizStatus;
  isYou?: boolean;
  level?: number;
}) {
  const cfg = status ? STATUS_CONFIG[status] : null;
  const color = isYou ? "#7C3AED" : level === 1 ? "#F26B0A" : "#5618B0";
  const bgColor = isYou ? "bg-brand-100" : level === 1 ? "bg-accent-100" : "bg-purple-100";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn("grid h-14 w-14 place-items-center rounded-2xl shadow-soft", bgColor)}>
        <PersonIcon size={36} color={color} />
      </div>
      <div className="text-center">
        <p className={cn(
          "max-w-[90px] truncate text-xs font-bold leading-tight",
          isYou ? "text-brand-700" : "text-ink"
        )}>
          {isYou ? "VOCÊ" : (label.split(" ")[0] || label)}
        </p>
        {sublabel && !isYou && (
          <p className="text-[10px] text-ink-subtle">{sublabel}</p>
        )}
        {cfg && (
          <span className={cn("mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold", cfg.cls)}>
            {cfg.label}
          </span>
        )}
        {isYou && (
          <p className="text-[10px] font-semibold text-brand-600">+R$20/indicação</p>
        )}
      </div>
    </div>
  );
}

// ─── Linha de conexão vertical/horizontal ─────────────────────────────────────
function Connector({ horizontal = false }: { horizontal?: boolean }) {
  if (horizontal) {
    return <div className="h-px w-8 flex-shrink-0 bg-brand-200" />;
  }
  return <div className="mx-auto h-6 w-px bg-brand-200" />;
}

// ─── Visualização em árvore ───────────────────────────────────────────────────
function TreeView({ items, userName }: { items: ReferralItem[]; userName: string }) {
  const nivel1 = items.filter((i) => i.level === 1);
  const nivel2 = items.filter((i) => i.level === 2);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <TreeNode label="VOCÊ" isYou level={0} />
          <Connector />
          <div className="rounded-2xl border-2 border-dashed border-brand-100 px-6 py-4 text-center">
            <PersonIcon size={28} color="#C4B5FD" />
            <p className="mt-1 text-xs text-brand-300">Aguardando indicações</p>
          </div>
        </div>
        <p className="mt-6 text-sm text-ink-muted">Compartilhe seu link para ver a árvore crescer!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto py-6">
      <div className="flex min-w-max flex-col items-center">
        {/* Nó raiz — você */}
        <TreeNode label={userName} isYou level={0} />

        {nivel1.length > 0 && (
          <>
            <Connector />
            {/* Linha horizontal que conecta os filhos nível 1 */}
            <div className="flex items-start gap-0">
              {nivel1.map((item, idx) => (
                <div key={item.id} className="flex flex-col items-center">
                  {/* Linha horizontal de conexão */}
                  <div className="flex items-center">
                    {idx === 0 && nivel1.length > 1 && (
                      <div className="h-px w-12 bg-brand-200" />
                    )}
                    {idx > 0 && idx < nivel1.length - 1 && (
                      <div className="h-px w-24 bg-brand-200" />
                    )}
                    {idx === nivel1.length - 1 && nivel1.length > 1 && (
                      <div className="h-px w-12 bg-brand-200" />
                    )}
                    <div className="h-4 w-px bg-brand-200" />
                    {idx < nivel1.length - 1 && <div className="h-px w-12 bg-brand-200" />}
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <TreeNode
                      label={item.indicado_nome ?? "?"}
                      sublabel={`R$ ${item.commission_value}`}
                      status={item.status}
                      level={1}
                    />

                    {/* Nível 2 abaixo deste nível 1 (proporcional se existirem) */}
                    {nivel2.length > 0 && idx === 0 && (
                      <div className="mt-1 flex flex-col items-center">
                        <Connector />
                        <div className="flex gap-3">
                          {nivel2.slice(0, 3).map((n2) => (
                            <div key={n2.id} className="flex flex-col items-center">
                              <TreeNode
                                label={n2.indicado_nome ?? "?"}
                                sublabel={`R$ ${n2.commission_value}`}
                                status={n2.status}
                                level={2}
                              />
                            </div>
                          ))}
                          {nivel2.length > 3 && (
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-purple-50 shadow-soft">
                                <span className="font-display text-lg font-bold text-purple-500">
                                  +{nivel2.length - 3}
                                </span>
                              </div>
                              <p className="text-[10px] text-ink-subtle">mais</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Legenda */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <PersonIcon size={18} color="#7C3AED" />
          <span className="font-semibold text-brand-700">Você</span>
          <span>(hub)</span>
        </div>
        <div className="flex items-center gap-2">
          <PersonIcon size={18} color="#F26B0A" />
          <span>Nível 1 · R$ 20</span>
        </div>
        <div className="flex items-center gap-2">
          <PersonIcon size={18} color="#5618B0" />
          <span>Nível 2 · R$ 5</span>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "error" | "warning"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "ok" ? "bg-ink" : type === "warning" ? "bg-amber-600" : "bg-red-600";
  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-2xl animate-fade-up", bg)}>
      {type === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
    </div>
  );
}

export function IndicacoesClient({ userName, slug: initialSlug, items, kpis }: Props) {
  const [slug, setSlug] = useState(initialSlug);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "error" | "warning" } | null>(null);
  const [stripeModal, setStripeModal] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [viewMode, setViewMode] = useState<"lista" | "arvore">("lista");
  const [pending, startTransition] = useTransition();

  const [refLink, setRefLink] = useState("");

  // Gera slug automaticamente se ainda não existe
  useEffect(() => {
    if (!slug) {
      startTransition(async () => {
        const res = await getOrGenerateSlugAction();
        if (res.ok && res.slug) setSlug(res.slug);
      });
    }
  }, [slug]);

  useEffect(() => {
    if (slug && typeof window !== "undefined") {
      setRefLink(`${window.location.origin}/ref/${slug}`);
    } else {
      setRefLink("");
    }
  }, [slug]);

  const copyLink = async () => {
    if (!refLink) return;
    await navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsapp = () => {
    if (!refLink) return;
    const text = encodeURIComponent(
      `🎯 Conheci o ChikJov, clube de vantagens com descontos em centenas de empresas! Use meu link e ganhe acesso: ${refLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handlePayout = () => {
    startTransition(async () => {
      const res = await requestPayoutAction();
      setToast({ msg: res.message, type: res.ok ? "ok" : "warning" });
    });
  };

  const handleConnectStripe = () => {
    startTransition(async () => {
      const res = await connectStripeAction();
      setToast({ msg: res.message, type: res.ok ? "ok" : "warning" });
      setStripeModal(false);
    });
  };

  const kpiCards = [
    { label: "Saldo disponível", value: formatBRL(kpis.saldoDisponivel), icon: Wallet, bg: "bg-emerald-100", color: "text-emerald-700", isMoney: true },
    { label: "Saldo pendente", value: formatBRL(kpis.saldoPendente), icon: Clock, bg: "bg-amber-100", color: "text-amber-700", isMoney: true },
    { label: "Total pago", value: formatBRL(kpis.totalPago), icon: TrendingUp, bg: "bg-brand-100", color: "text-brand-700", isMoney: true },
    { label: "Indicados Nível 1", value: kpis.nivel1Count.toString(), icon: Users, bg: "bg-blue-100", color: "text-blue-700" },
    { label: "Indicados Nível 2", value: kpis.nivel2Count.toString(), icon: Users, bg: "bg-purple-100", color: "text-purple-700" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
          <Share2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Indique & Ganhe</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Compartilhe e receba R$ 20 por cada amigo que assinar (e R$ 5 por indicações de 2º nível)
          </p>
        </div>
      </div>

      {/* Hero — link de indicação */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-brand-gradient p-1">
        <div className="rounded-[1.4rem] bg-brand-gradient p-6 md:p-8">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div className="text-white">
              <p className="text-xs uppercase tracking-widest opacity-80">Seu link exclusivo</p>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-md ring-1 ring-white/20">
                <LinkIcon className="h-4 w-4 shrink-0 opacity-70" />
                {!slug ? (
                  <span className="text-sm opacity-70">Gerando seu link...</span>
                ) : (
                  <span className="truncate font-mono text-sm font-semibold">{refLink}</span>
                )}
                <button
                  onClick={copyLink}
                  disabled={!slug}
                  className="ml-auto flex shrink-0 items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-white/30 disabled:opacity-50"
                >
                  {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:flex-nowrap">
              <button
                onClick={() => setQrModal(true)}
                disabled={!slug}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/20 px-4 text-sm font-bold text-white shadow-card transition-colors hover:bg-white/30 disabled:opacity-50"
              >
                <QrCode className="h-4 w-4" />
                QR Code
              </button>
              <button
                onClick={shareWhatsapp}
                disabled={!slug}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-brand-700 shadow-card transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Enviar no WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Connect Banner */}
      <div className="mb-6 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100">
          <Lock className="h-5 w-5 text-amber-700" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-amber-900">Conecte sua conta Stripe para receber</p>
          <p className="mt-0.5 text-sm text-amber-800">
            Você acumula bônus normalmente, mas para sacar é necessário conectar uma conta Stripe Connect.
            Em desenvolvimento — disponível em breve!
          </p>
        </div>
        <button
          onClick={() => setStripeModal(true)}
          className="shrink-0 rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
        >
          Conectar Stripe
        </button>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((k) => (
          <div key={k.label} className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
            <div className={cn("mb-3 grid h-10 w-10 place-items-center rounded-xl", k.bg)}>
              <k.icon className={cn("h-5 w-5", k.color)} />
            </div>
            <p className={cn("font-display font-bold text-ink", k.isMoney ? "text-xl" : "text-3xl")}>{k.value}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Saque box */}
      <div className="mb-6 grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100">
              <Wallet className="h-6 w-6 text-emerald-700" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Saldo disponível para saque</p>
              <p className="mt-0.5 font-display text-3xl font-bold text-ink md:text-4xl">
                {formatBRL(kpis.saldoDisponivel)}
              </p>
            </div>
          </div>
          <button
            onClick={handlePayout}
            disabled={pending || kpis.saldoDisponivel <= 0}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent-500 px-6 text-sm font-bold text-white shadow-cta transition-colors hover:bg-accent-600 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Solicitar saque via PIX
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <p className="mt-2 text-center text-xs text-emerald-700/80">
            Saque mínimo: R$ 50 · Liberação no dia 01 do mês subsequente
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-subtle">Como funciona</p>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            <li className="flex items-start gap-2"><span className="mt-1 grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">1</span> Compartilhe seu link</li>
            <li className="flex items-start gap-2"><span className="mt-1 grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">2</span> Amigo se cadastra (30 dias grátis)</li>
            <li className="flex items-start gap-2"><span className="mt-1 grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">3</span> Quando ele paga, R$20 entra no pendente</li>
            <li className="flex items-start gap-2"><span className="mt-1 grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">4</span> Dia 01 do mês seguinte → liberado</li>
          </ul>
        </div>
      </div>

      {/* Lista de indicados */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
        <div className="flex items-center justify-between border-b border-[#E8E4F3] px-5 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-ink">Suas indicações</h2>
            <p className="text-xs text-ink-muted">{items.length} {items.length === 1 ? "indicação" : "indicações"} no total</p>
          </div>

          {/* Toggle Lista / Árvore */}
          <div className="flex items-center gap-1 rounded-xl bg-surface-muted p-1">
            <button
              onClick={() => setViewMode("lista")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                viewMode === "lista"
                  ? "bg-white text-brand-700 shadow-soft"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              Lista
            </button>
            <button
              onClick={() => setViewMode("arvore")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                viewMode === "arvore"
                  ? "bg-white text-brand-700 shadow-soft"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <Network className="h-3.5 w-3.5" />
              Árvore
            </button>
          </div>
        </div>

        {/* Vista em Árvore */}
        {viewMode === "arvore" && (
          <div className="px-5">
            <TreeView items={items} userName={userName} />
          </div>
        )}

        {/* Vista em Lista */}
        {viewMode === "lista" && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
              <Users className="h-8 w-8 text-brand-300" />
            </div>
            <p className="font-display text-lg font-bold text-ink">Você ainda não tem indicações</p>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">
              Compartilhe seu link com amigos e familiares — quanto mais gente assinar, mais você ganha!
            </p>
          </div>
        ) : viewMode === "lista" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-[#E8E4F3] bg-surface-soft">
                  {["Indicado", "Nível", "Comissão", "Status", "Data cadastro", "Liberação"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1ECF8]">
                {items.map((item) => {
                  const cfg = STATUS_CONFIG[item.status];
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-brand-50/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                            {(item.indicado_nome ?? "?")[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-ink">{item.indicado_nome ?? "Aguardando cadastro"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-bold",
                          item.level === 1 ? "bg-brand-100 text-brand-700" : "bg-purple-100 text-purple-700"
                        )}>
                          Nível {item.level}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-ink">{formatBRL(item.commission_value ?? 0)}</td>
                      <td className="px-5 py-3">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", cfg.cls)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-muted">{formatDate(item.created_at)}</td>
                      <td className="px-5 py-3 text-ink-muted">
                        {item.paid_at ? `Pago ${formatDate(item.paid_at)}` : formatDate(item.release_date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal QR Code */}
      {qrModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setQrModal(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl text-center animate-fade-up">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink">Seu QR Code</h3>
            <p className="mt-2 mb-6 text-sm text-ink-muted">
              Mostre este QR Code para que seus amigos possam escanear e se cadastrar através da sua indicação.
            </p>
            {refLink && (
              <div className="mx-auto flex w-fit justify-center rounded-xl border border-gray-100 bg-white p-4 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(refLink)}`} 
                  alt="QR Code de Indicação" 
                  className="h-48 w-48"
                />
              </div>
            )}
            <button
              onClick={() => setQrModal(false)}
              className="mt-6 w-full rounded-full bg-brand-500 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600"
            >
              Fechar
            </button>
          </div>
        </>
      )}

      {/* Modal Stripe Connect */}

      {stripeModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setStripeModal(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink">Conectar Stripe Connect</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Para receber bônus do programa Indique & Ganhe, é necessário ter uma conta Stripe Connect.
              Estamos finalizando esta integração — você poderá conectar em breve.
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setStripeModal(false)} className="flex-1 rounded-full border border-[#E8E4F3] py-2.5 text-sm font-medium text-ink-muted hover:border-brand-200">
                Fechar
              </button>
              <button
                onClick={handleConnectStripe}
                disabled={pending}
                className="flex-1 rounded-full bg-brand-500 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {pending ? "..." : "Notificar quando disponível"}
              </button>
            </div>
          </div>
        </>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
