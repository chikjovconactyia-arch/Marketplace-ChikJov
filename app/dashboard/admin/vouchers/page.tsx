import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/admin/Topbar";
import { Ticket, Banknote, Sparkles, Building2 } from "lucide-react";

export const metadata = { title: "Vouchers — Admin ChikJov" };
export const revalidate = 0;

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default async function AdminVouchersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const admin = createAdminClient();

  const [{ data: empresas }, { data: vouchersRaw }] = await Promise.all([
    admin.from("empresas").select("id, name").order("name"),
    admin
      .from("vouchers")
      .select("id, company_id, offer_id, status, economy_value, ofertas(price)"),
  ]);

  const empresas_ = empresas ?? [];
  const vouchers_ = vouchersRaw ?? [];

  // Agrupa por empresa
  const rows = empresas_
    .map((emp) => {
      const cvs = vouchers_.filter((v) => v.company_id === emp.id);
      const usedCvs = cvs.filter((v) => v.status === "used");

      const valorVendido = usedCvs.reduce((sum, v) => {
        const price = (v.ofertas as { price?: number | null } | null)?.price ?? 0;
        const economy = v.economy_value ?? 0;
        return sum + Math.max(0, price - economy);
      }, 0);

      const economiaGerada = cvs.reduce(
        (sum, v) => sum + (v.economy_value ?? 0),
        0
      );

      return {
        id: emp.id,
        name: emp.name,
        voucher_count: cvs.length,
        valor_vendido: valorVendido,
        economia_gerada: economiaGerada,
      };
    })
    .filter((r) => r.voucher_count > 0)
    .sort((a, b) => b.voucher_count - a.voucher_count);

  const totalEmpresas = rows.length;
  const totalVouchers = rows.reduce((s, r) => s + r.voucher_count, 0);
  const totalValorVendido = rows.reduce((s, r) => s + r.valor_vendido, 0);
  const totalEconomia = rows.reduce((s, r) => s + r.economia_gerada, 0);

  return (
    <>
      <Topbar
        title="Vouchers"
        breadcrumbs={[{ label: "Vouchers" }]}
        adminName={profile?.full_name}
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
            Vouchers
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Visão consolidada de vouchers por empresa parceira
          </p>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "Empresas c/ vouchers",
              value: totalEmpresas,
              display: String(totalEmpresas),
              icon: Building2,
              bg: "bg-brand-100",
              color: "text-brand-700",
            },
            {
              label: "Total de vouchers",
              value: totalVouchers,
              display: String(totalVouchers),
              icon: Ticket,
              bg: "bg-blue-100",
              color: "text-blue-700",
            },
            {
              label: "Valor vendido",
              value: totalValorVendido,
              display: fmt(totalValorVendido),
              icon: Banknote,
              bg: "bg-emerald-100",
              color: "text-emerald-700",
            },
            {
              label: "Economia gerada",
              value: totalEconomia,
              display: fmt(totalEconomia),
              icon: Sparkles,
              bg: "bg-accent-100",
              color: "text-accent-700",
            },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]"
            >
              <div
                className={`mb-3 grid h-10 w-10 place-items-center rounded-xl ${c.bg}`}
              >
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <p className="font-display text-2xl font-bold text-ink">
                {c.display}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Nº de Vouchers
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Valor Vendido
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Economia Gerada
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-50">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-sm text-ink-muted"
                    >
                      Nenhum voucher gerado ainda.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-brand-50/40"
                    >
                      <td className="px-6 py-4 font-medium text-ink">
                        {row.name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">
                          {row.voucher_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-ink">
                        {fmt(row.valor_vendido)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                        {fmt(row.economia_gerada)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {rows.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-brand-100 bg-brand-50/70">
                    <td className="px-6 py-4 font-bold text-ink">
                      Total Geral
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-brand-200 px-3 py-1 text-sm font-bold text-brand-800">
                        {totalVouchers}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-ink">
                      {fmt(totalValorVendido)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">
                      {fmt(totalEconomia)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
