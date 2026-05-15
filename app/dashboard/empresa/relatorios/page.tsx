import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/empresa/Topbar";
import { BarChart3 } from "lucide-react";

export const metadata = { title: "Relatórios — ChikJov" };
export const revalidate = 0;

export default async function RelatoriosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/dashboard/empresa/relatorios");

  const admin = createAdminClient();

  // Encontra empresa do usuário
  const { data: empresario } = await admin
    .from("empresarios")
    .select("id")
    .eq("email", user.email ?? "")
    .maybeSingle();

  const { data: empresa } = empresario
    ? await admin.from("empresas").select("id, name").eq("empresario_id", empresario.id).maybeSingle()
    : { data: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  // Busca dados para o relatório
  let reportData: { title: string; ativos: number; validados: number; vendas: number }[] = [];
  let totais = { ativos: 0, validados: 0, vendas: 0 };

  if (empresa) {
    // 1. Pega todas as ofertas da empresa
    const { data: ofertas } = await admin
      .from("ofertas")
      .select("id, title, price, discount_percent")
      .eq("empresa_id", empresa.id)
      .order("created_at", { ascending: false });

    // 2. Pega todos os vouchers da empresa para essas ofertas
    const { data: vouchers } = await admin
      .from("vouchers")
      .select("offer_id, status")
      .eq("company_id", empresa.id);

    if (ofertas && vouchers) {
      reportData = ofertas.map((oferta) => {
        const ofertaVouchers = vouchers.filter(v => v.offer_id === oferta.id);
        
        const gerados = ofertaVouchers.length;
        const usados = ofertaVouchers.filter(v => v.status === "used");
        const validados = usados.length;
        
        // Cálculo do valor real da venda (Preço - Desconto)
        const price = Number(oferta.price) || 0;
        const discount_percent = Number(oferta.discount_percent) || 0;
        const finalPrice = price - (price * (discount_percent / 100));
        
        const vendas = validados * finalPrice;

        totais.ativos += gerados; // Reutilizando a variável 'ativos' para armazenar 'gerados' no total
        totais.validados += validados;
        totais.vendas += vendas;

        return {
          title: oferta.title,
          ativos: gerados, // Mantendo a chave 'ativos' no objeto para não precisar mudar todo o JSX
          validados,
          vendas
        };
      });
    }
  }

  return (
    <>
      <Topbar
        title="Relatórios"
        breadcrumbs={[{ label: "Relatórios" }]}
        empresaName={profile?.full_name ?? user.email}
      />
      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-card">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">Relatórios</h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              Acompanhe o desempenho de suas ofertas
            </p>
          </div>
        </div>

        {/* Tabela de Relatório */}
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink-muted">
              <thead className="bg-[#F4F2FA]/50 text-xs uppercase text-ink-subtle">
                <tr>
                  <th className="px-6 py-4 font-bold">Oferta</th>
                  <th className="px-6 py-4 font-bold text-center">Vouchers Gerados</th>
                  <th className="px-6 py-4 font-bold text-center">Já Validados</th>
                  <th className="px-6 py-4 font-bold text-right">Total de Vendas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4F3]">
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-ink-muted">
                      Nenhuma oferta encontrada ou sem dados no momento.
                    </td>
                  </tr>
                ) : (
                  reportData.map((row, index) => (
                    <tr key={index} className="hover:bg-[#F4F2FA]/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-ink">{row.title}</td>
                      <td className="px-6 py-4 text-center font-mono">{row.ativos}</td>
                      <td className="px-6 py-4 text-center font-mono text-emerald-600">{row.validados}</td>
                      <td className="px-6 py-4 text-right font-mono font-medium text-brand-700">
                        R$ {row.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {reportData.length > 0 && (
                <tfoot className="bg-brand-50 font-bold text-brand-900 border-t-2 border-brand-200">
                  <tr>
                    <td className="px-6 py-4 text-right">Subtotal</td>
                    <td className="px-6 py-4 text-center font-mono">{totais.ativos}</td>
                    <td className="px-6 py-4 text-center font-mono text-emerald-700">{totais.validados}</td>
                    <td className="px-6 py-4 text-right font-mono text-brand-800 text-base">
                      R$ {totais.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
