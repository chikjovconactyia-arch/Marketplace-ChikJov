import { redirect } from "next/navigation";
import {
  Ticket, CheckCircle2, Clock, XCircle, TrendingDown,
  Building2, Tag, Calendar
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/cliente/Topbar";
import { MyVouchersClient } from "./MyVouchersClient";

export const metadata = { title: "Meus Vouchers — ChikJov" };
export const revalidate = 0;

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default async function MeusVouchersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();

  // Busca vouchers do usuário
  const { data: vouchersRaw } = await admin
    .from("vouchers")
    .select("id, code, qr_code_url, status, economy_value, generated_at, validated_at, expires_at, company_id, offer_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const vouchers = vouchersRaw ?? [];

  // Marca como expirado os que estão ativos mas passaram da validade
  const now = new Date();
  const vouchersWithStatus = vouchers.map((v) => {
    if (v.status === "active" && v.expires_at && new Date(v.expires_at) < now) {
      return { ...v, status: "expired" };
    }
    return v;
  });

  // Busca dados das empresas e ofertas em paralelo
  const empresaIds = [...new Set(vouchers.map((v) => v.company_id).filter(Boolean) as string[])];
  const ofertaIds = [...new Set(vouchers.map((v) => v.offer_id).filter(Boolean) as string[])];

  const [{ data: empresas }, { data: ofertas }] = await Promise.all([
    empresaIds.length
      ? admin.from("empresas").select("id, name, logo_url, category, city").in("id", empresaIds)
      : { data: [] },
    ofertaIds.length
      ? admin.from("ofertas").select("id, title, image_url, discount_percent, price").in("id", ofertaIds)
      : { data: [] },
  ]);

  // Enriquece vouchers
  const vouchersEnriquecidos = vouchersWithStatus.map((v) => {
    const emp = empresas?.find((e) => e.id === v.company_id);
    const off = ofertas?.find((o) => o.id === v.offer_id);
    return {
      id: v.id,
      code: v.code,
      qr_code_url: v.qr_code_url,
      status: v.status,
      economy_value: v.economy_value,
      generated_at: v.generated_at ?? v.created_at,
      validated_at: v.validated_at,
      expires_at: v.expires_at,
      empresa: emp ? {
        id: emp.id,
        name: emp.name,
        logo_url: emp.logo_url,
        category: emp.category,
        city: emp.city,
      } : null,
      oferta: off ? {
        title: off.title,
        image_url: off.image_url,
        discount_percent: off.discount_percent,
        price: off.price,
      } : null,
    };
  });

  // KPIs
  const totalGerados = vouchersWithStatus.length;
  const ativos = vouchersWithStatus.filter((v) => v.status === "active").length;
  const usados = vouchersWithStatus.filter((v) => v.status === "used").length;
  const expirados = vouchersWithStatus.filter((v) => v.status === "expired").length;

  // Economia total (só dos usados)
  const economiaTotal = vouchersWithStatus
    .filter((v) => v.status === "used")
    .reduce((acc, v) => acc + (v.economy_value ?? 0), 0);

  // Economia do mês
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const economiaMes = vouchersWithStatus
    .filter((v) => v.status === "used" && v.validated_at && new Date(v.validated_at) >= monthStart)
    .reduce((acc, v) => acc + (v.economy_value ?? 0), 0);

  const kpis = [
    { label: "Total gerados", value: totalGerados, icon: Ticket, bg: "bg-brand-100", color: "text-brand-700" },
    { label: "Ativos", value: ativos, icon: Clock, bg: "bg-amber-100", color: "text-amber-700" },
    { label: "Usados", value: usados, icon: CheckCircle2, bg: "bg-emerald-100", color: "text-emerald-700" },
    { label: "Economia este mês", value: formatBRL(economiaMes), icon: TrendingDown, bg: "bg-accent-100", color: "text-accent-700", isMoney: true },
  ];

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <Topbar
        title="Meus Vouchers"
        breadcrumbs={[{ label: "Meus Vouchers" }]}
        userName={profile?.full_name ?? user.email}
      />
      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
          <Ticket className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Meus Vouchers</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            {totalGerados > 0
              ? `Você já economizou ${formatBRL(economiaTotal)} usando o ChikJov`
              : "Comece a economizar — gere seu primeiro voucher!"
            }
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${k.bg}`}>
              <k.icon className={`h-5 w-5 ${k.color}`} />
            </div>
            <p className={`font-display ${k.isMoney ? "text-xl" : "text-3xl"} font-bold text-ink`}>
              {k.value}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">{k.label}</p>
          </div>
        ))}
      </div>

      {vouchersEnriquecidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-100 bg-white py-16 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
            <Ticket className="h-8 w-8 text-brand-300" />
          </div>
          <p className="font-display text-lg font-bold text-ink">Você ainda não tem vouchers</p>
          <p className="mt-1 text-sm text-ink-muted">Explore o marketplace e gere seu primeiro!</p>
          <Link
            href="/#marketplace"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-2.5 text-sm font-bold text-white shadow-cta hover:bg-accent-600"
          >
            Explorar empresas
          </Link>
        </div>
      ) : (
        <MyVouchersClient vouchers={vouchersEnriquecidos} />
      )}
      </div>
    </>
  );
}
