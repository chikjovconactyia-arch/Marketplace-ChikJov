import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/empresa/Topbar";
import { OfertasClient } from "./OfertasClient";

export const metadata = { title: "Minhas Ofertas — ChikJov" };
export const revalidate = 0;

export default async function OfertasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createAdminClient();

  // Encontra empresa do usuário
  const { data: empresario } = await admin
    .from("empresarios")
    .select("id")
    .eq("email", user.email ?? "")
    .maybeSingle();

  const { data: empresa } = empresario
    ? await admin
        .from("empresas")
        .select("id, name, category, logo_url")
        .eq("empresario_id", empresario.id)
        .maybeSingle()
    : { data: null };

  // Busca ofertas + contagem de vouchers em paralelo
  const [{ data: ofertas }, { data: vouchers }] = await Promise.all([
    empresa
      ? admin.from("ofertas").select("*").eq("empresa_id", empresa.id).order("created_at", { ascending: false })
      : { data: [] },
    empresa
      ? admin.from("vouchers").select("offer_id, status").eq("company_id", empresa.id)
      : { data: [] },
  ]);

  const ofertas_ = ofertas ?? [];
  const vouchers_ = vouchers ?? [];

  // KPIs
  const totalOfertas = ofertas_.length;
  const ativas = ofertas_.filter((o) => o.active).length;
  const pausadas = ofertas_.filter((o) => !o.active).length;
  const vouchersUsados = vouchers_.filter((v) => v.status === "used").length;
  const economiaTotalCalc = vouchers_
    .filter((v) => v.status === "used")
    .reduce((_acc, _v) => _acc, 0);

  // Enriquece ofertas com contagem de vouchers
  const ofertasEnriquecidas = ofertas_.map((o) => ({
    ...o,
    vouchers_gerados: vouchers_.filter((v) => v.offer_id === o.id).length,
    vouchers_usados: vouchers_.filter((v) => v.offer_id === o.id && v.status === "used").length,
  }));

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <Topbar
        title="Minhas Ofertas"
        breadcrumbs={[{ label: "Minhas Ofertas" }]}
        empresaName={profile?.full_name ?? user.email}
      />
      <div className="flex-1 overflow-auto px-4 py-6 md:px-6 lg:px-8">
        <OfertasClient
          ofertas={ofertasEnriquecidas}
          kpis={{ totalOfertas, ativas, pausadas, vouchersUsados, economiaTotal: economiaTotalCalc }}
          empresaId={empresa?.id ?? null}
          empresaNome={empresa?.name ?? ""}
        />
      </div>
    </>
  );
}
