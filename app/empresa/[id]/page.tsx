import { notFound } from "next/navigation";
import {
  MapPin, Phone, Globe, Instagram, Star, Award,
  Sparkles, Tag, Mail
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { EmpresaPublicClient } from "./EmpresaPublicClient";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: empresa } = await admin
    .from("empresas")
    .select("name, description, category")
    .eq("id", id)
    .maybeSingle();

  if (!empresa) return { title: "Empresa não encontrada — ChikJov" };

  return {
    title: `${empresa.name} — ChikJov`,
    description: empresa.description ?? `Aproveite descontos exclusivos em ${empresa.name} com o ChikJov.`,
  };
}

export default async function EmpresaPublicPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const from = resolvedSearchParams?.from;
  const backLink = from === "marketplace" ? "/marketplace" : "/#marketplace";

  const admin = createAdminClient();

  // Busca empresa
  const { data: empresa } = await admin
    .from("empresas")
    .select("id, name, category, logo_url, city, state, description, address, phone, email, website, instagram, is_featured")
    .eq("id", id)
    .maybeSingle();

  if (!empresa) notFound();

  // Busca ofertas ativas + total de vouchers gerados/usados
  const [{ data: ofertasRaw }, { data: vouchers }] = await Promise.all([
    admin
      .from("ofertas")
      .select("id, title, description, type, price, discount_percent, image_url, created_at")
      .eq("empresa_id", id)
      .eq("active", true)
      .order("discount_percent", { ascending: false }),
    admin
      .from("vouchers")
      .select("offer_id, status")
      .eq("company_id", id),
  ]);

  const ofertas = ofertasRaw ?? [];
  const vouchers_ = vouchers ?? [];

  // Métricas para a seção de benefícios
  const totalOfertas = ofertas.length;
  const maiorDesconto = ofertas.reduce(
    (max, o) => Math.max(max, o.discount_percent ?? 0),
    0
  );
  const economiaMedia = ofertas.length > 0
    ? Math.round(
        ofertas.reduce((acc, o) =>
          acc + ((o.price ?? 0) * (o.discount_percent ?? 0)) / 100, 0
        ) / ofertas.length
      )
    : 0;

  const totalVouchersGerados = vouchers_.length;
  const totalVouchersUsados = vouchers_.filter((v) => v.status === "used").length;

  // Enriquece ofertas com vouchers count
  const ofertasEnriquecidas = ofertas.map((o) => ({
    ...o,
    vouchers_count: vouchers_.filter((v) => v.offer_id === o.id).length,
  }));

  return (
    <>
      <Header />
      <main className="bg-surface-soft">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden bg-brand-gradient pb-16 pt-12 text-white md:pb-24 md:pt-16">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-accent-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-brand-300/40 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />

          <div className="container-tight relative">
            {/* Breadcrumb */}
            <Link
              href={backLink}
              className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
            >
              ← Voltar
            </Link>

            <div className="grid items-start gap-8 md:grid-cols-[auto_1fr_auto]">
              {/* Logo */}
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-white p-3 shadow-2xl shadow-brand-900/30 ring-4 ring-white/10">
                {empresa.logo_url ? (
                  <img src={empresa.logo_url} alt={empresa.name} className="h-full w-full rounded-2xl object-contain" />
                ) : (
                  <div className="grid h-full w-full place-items-center rounded-2xl bg-brand-100 text-brand-700">
                    <Sparkles className="h-10 w-10" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                {empresa.is_featured && (
                  <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white shadow-cta">
                    <Award className="h-3.5 w-3.5" />
                    Parceiro em destaque
                  </span>
                )}

                <h1 className="font-display text-3xl font-bold leading-tight text-balance md:text-4xl lg:text-5xl">
                  {empresa.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/85">
                  {empresa.category && (
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      {empresa.category}
                    </span>
                  )}
                  {empresa.city && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {empresa.city}{empresa.state ? `, ${empresa.state}` : ""}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-accent-500 text-accent-500" />
                    4.9 · No clube
                  </span>
                </div>

                {empresa.description && (
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 text-balance">
                    {empresa.description}
                  </p>
                )}
              </div>

              {/* Top CTA / Stats */}
              <div className="hidden md:block">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md ring-1 ring-white/20 min-w-[180px]">
                  <p className="text-xs uppercase tracking-widest text-white/60">Maior desconto</p>
                  <p className="mt-1 font-display text-3xl font-bold">
                    {maiorDesconto > 0 ? `${Math.round(maiorDesconto)}%` : "—"}
                  </p>
                  <p className="text-xs text-white/70">{totalOfertas} oferta{totalOfertas !== 1 ? "s" : ""} ativa{totalOfertas !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Benefícios ─── */}
        {totalOfertas > 0 && (
          <section className="relative z-10 -mt-16 px-4 md:px-0">
            <div className="container-tight">
              <div className="grid gap-6 rounded-[2rem] bg-white p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ring-1 ring-black/5 md:grid-cols-3 md:p-8">
                <BeneficioCard
                  icon={Tag}
                  label="Ofertas disponíveis"
                  value={totalOfertas.toString()}
                  bg="bg-brand-100"
                  color="text-brand-700"
                />
                <BeneficioCard
                  icon={Star}
                  label="Maior desconto"
                  value={maiorDesconto > 0 ? `${Math.round(maiorDesconto)}% OFF` : "—"}
                  bg="bg-accent-100"
                  color="text-accent-700"
                />
                <BeneficioCard
                  icon={Sparkles}
                  label="Economia média"
                  value={economiaMedia > 0 ? `R$ ${economiaMedia}` : "—"}
                  bg="bg-emerald-100"
                  color="text-emerald-700"
                />
              </div>
            </div>
          </section>
        )}

        {/* ─── Ofertas ─── */}
        <section className="px-4 py-16 md:px-0 md:py-20">
          <div className="container-tight">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <span className="pill">🎯 Ofertas exclusivas</span>
                <h2 className="heading-display mt-3 text-3xl text-balance md:text-4xl">
                  Descontos que valem a pena
                </h2>
                <p className="mt-2 text-ink-muted">
                  Disponíveis para assinantes ativos do clube ChikJov.
                </p>
              </div>
              <span className="hidden text-sm text-ink-subtle md:block">
                {totalOfertas} oferta{totalOfertas !== 1 ? "s" : ""}
              </span>
            </div>

            {ofertasEnriquecidas.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-brand-100 bg-white py-20 text-center">
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
                  <Tag className="h-8 w-8 text-brand-300" />
                </div>
                <p className="font-display text-lg font-bold text-ink">
                  Esta empresa ainda não tem ofertas ativas
                </p>
                <p className="mt-1 max-w-sm text-sm text-ink-muted">
                  Volte em breve — novas promoções estão a caminho!
                </p>
              </div>
            ) : (
              <EmpresaPublicClient
                ofertas={ofertasEnriquecidas}
                empresaId={empresa.id}
                empresaNome={empresa.name}
              />
            )}
          </div>
        </section>

        {/* ─── Contato ─── */}
        <section className="bg-white px-4 py-16 md:px-0 md:py-20">
          <div className="container-tight">
            <div className="mb-10">
              <span className="pill">📞 Fale com a empresa</span>
              <h2 className="heading-display mt-3 text-3xl text-balance md:text-4xl">
                Como chegar e contato
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {empresa.phone && (
                <ContactCard
                  icon={Phone}
                  label="WhatsApp / Telefone"
                  value={empresa.phone}
                  href={`https://wa.me/55${empresa.phone.replace(/\D/g, "")}`}
                />
              )}
              {empresa.instagram && (() => {
                const clean = empresa.instagram.replace(/https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "").replace(/^@/, "");
                return (
                  <ContactCard
                    icon={Instagram}
                    label="Instagram"
                    value={`@${clean}`}
                    href={`https://instagram.com/${clean}`}
                  />
                );
              })()}
              {empresa.email && (
                <ContactCard
                  icon={Mail}
                  label="Email"
                  value={empresa.email}
                  href={`mailto:${empresa.email}`}
                />
              )}
              {empresa.website && (
                <ContactCard
                  icon={Globe}
                  label="Site"
                  value={empresa.website.replace(/^https?:\/\//, "")}
                  href={empresa.website}
                />
              )}
              {empresa.address && (
                <ContactCard
                  icon={MapPin}
                  label="Endereço"
                  value={empresa.address}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(empresa.address)}`}
                />
              )}
            </div>

            {/* Stats finais */}
            {totalVouchersGerados > 0 && (
              <div className="mt-10 rounded-3xl bg-gradient-to-br from-brand-50 to-accent-50 p-8 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
                  Já são parceiros do clube
                </p>
                <div className="mt-3 flex justify-center gap-8 md:gap-16">
                  <div>
                    <p className="font-display text-3xl font-bold text-ink md:text-4xl">{totalVouchersGerados}</p>
                    <p className="text-xs text-ink-muted">Vouchers gerados</p>
                  </div>
                  <div>
                    <p className="font-display text-3xl font-bold text-ink md:text-4xl">{totalVouchersUsados}</p>
                    <p className="text-xs text-ink-muted">Vouchers usados</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────
function BeneficioCard({ icon: Icon, label, value, bg, color }: {
  icon: React.ElementType; label: string; value: string; bg: string; color: string;
}) {
  return (
    <div className="group relative flex items-center gap-5 rounded-2xl p-2 transition-all hover:bg-brand-50/50">
      <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-[1.25rem] ${bg} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div className="flex flex-col">
        <p className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">{label}</p>
        <p className="font-display text-2xl font-bold leading-none text-ink mt-1.5">{value}</p>
      </div>
    </div>
  );
}

function ContactCard({ icon: Icon, label, value, href }: {
  icon: React.ElementType; label: string; value: string; href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-2xl border border-[#E8E4F3] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700 transition-colors group-hover:bg-brand-200">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-ink-subtle">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-ink">{value}</p>
      </div>
    </a>
  );
}
