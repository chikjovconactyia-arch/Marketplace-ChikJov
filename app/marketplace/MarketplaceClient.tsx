"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, MapPin, Tag, Building2, Filter, X, Ticket,
  ArrowRight, Sparkles, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmpresaCard {
  id: string;
  slug: string | null;
  name: string;
  category: string;
  city: string | null;
  logo_url: string | null;
  description: string | null;
  is_featured: boolean;
  total_ofertas: number;
  oferta_titulo: string | null;
  oferta_descricao: string | null;
  desconto_pct: number | null;
}

interface Props {
  empresas: EmpresaCard[];
  cidades: string[];
  categorias: string[];
  initialCity: string;
}

// Trunca string em N chars
function trim(s: string | null, n = 80): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

export function MarketplaceClient({ empresas, cidades, categorias, initialCity }: Props) {
  const [search, setSearch] = useState("");
  const [cidade, setCidade] = useState(initialCity);
  const [categoria, setCategoria] = useState("");
  const [showFeatured, setShowFeatured] = useState(false);

  const filtered = useMemo(() => {
    return empresas.filter((e) => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.city ?? "").toLowerCase().includes(q) ||
        (e.oferta_titulo ?? "").toLowerCase().includes(q) ||
        (e.oferta_descricao ?? "").toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q);
      const matchCidade = !cidade || e.city === cidade;
      const matchCategoria = !categoria || e.category === categoria;
      const matchFeatured = !showFeatured || e.is_featured;
      return matchSearch && matchCidade && matchCategoria && matchFeatured;
    });
  }, [empresas, search, cidade, categoria, showFeatured]);

  const clearFilters = () => {
    setSearch(""); setCidade(""); setCategoria(""); setShowFeatured(false);
  };

  const hasFilters = !!(search || cidade || categoria || showFeatured);

  return (
    <section id="marketplace" className="relative bg-surface-soft py-16 md:py-20 lg:py-24">
      {/* Background subtle pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #7C3AED 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container-tight relative">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="pill">
            <Sparkles className="h-3.5 w-3.5" />
            Marketplace
          </span>
          <h1 className="heading-display mt-4 text-3xl text-balance md:text-5xl lg:text-6xl">
            Descubra as melhores ofertas e{" "}
            <span className="bg-accent-gradient bg-clip-text text-transparent">
              descontos da sua cidade.
            </span>
          </h1>
          <p className="mt-4 text-lg text-ink-muted text-balance">
            Mais vantagens para você economizar no dia a dia.
          </p>
        </div>

        {/* Filtros */}
        <div className="mt-10 rounded-3xl border border-brand-100 bg-white p-4 shadow-card md:p-5">
          {/* Mobile: só Cidade + Categoria lado a lado */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="h-11 w-full rounded-2xl border border-brand-100 bg-surface-soft pl-9 pr-3 text-sm text-ink outline-none focus:border-brand-300 focus:bg-white"
              >
                <option value="">Cidade</option>
                {cidades.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="h-11 w-full rounded-2xl border border-brand-100 bg-surface-soft pl-9 pr-3 text-sm text-ink outline-none focus:border-brand-300 focus:bg-white"
              >
                <option value="">Categoria</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop: todos os filtros */}
          <div className="hidden gap-3 md:grid md:grid-cols-[1fr_auto_auto_auto]">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <input
                type="text"
                placeholder="Buscar empresa, oferta, categoria..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-2xl border border-brand-100 bg-surface-soft pl-11 pr-4 text-sm text-ink placeholder-ink-subtle outline-none transition-colors focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* Cidade */}
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="h-12 min-w-[160px] rounded-2xl border border-brand-100 bg-surface-soft pl-10 pr-8 text-sm text-ink outline-none transition-colors focus:border-brand-300 focus:bg-white"
              >
                <option value="">Todas as cidades</option>
                {cidades.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Categoria */}
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="h-12 min-w-[180px] rounded-2xl border border-brand-100 bg-surface-soft pl-10 pr-8 text-sm text-ink outline-none transition-colors focus:border-brand-300 focus:bg-white"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Featured toggle */}
            <button
              onClick={() => setShowFeatured(!showFeatured)}
              className={cn(
                "inline-flex h-12 items-center gap-2 rounded-2xl px-5 text-sm font-bold transition-all",
                showFeatured
                  ? "bg-accent-500 text-white shadow-cta"
                  : "border border-brand-100 bg-surface-soft text-ink-muted hover:border-brand-300"
              )}
            >
              <Star className={cn("h-4 w-4", showFeatured && "fill-white")} />
              Destaques
            </button>
          </div>

          {/* Status row */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-subtle">
            <span className="font-semibold text-ink">
              {filtered.length} {filtered.length === 1 ? "empresa" : "empresas"}
            </span>
            {hasFilters && (
              <>
                <span>·</span>
                <button onClick={clearFilters} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 font-semibold text-brand-700 hover:bg-brand-100">
                  <X className="h-3 w-3" />
                  Limpar filtros
                </button>
              </>
            )}
            {cidade && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700 font-semibold inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {cidade}
              </span>
            )}
            {categoria && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-brand-700 font-semibold">
                {categoria}
              </span>
            )}
          </div>
        </div>

        {/* Grid de empresas */}
        {filtered.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-brand-100 bg-white py-20 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
              <Building2 className="h-8 w-8 text-brand-300" />
            </div>
            <p className="font-display text-lg font-bold text-ink">Nenhuma empresa encontrada</p>
            <p className="mt-1 text-sm text-ink-muted">Tente ajustar os filtros ou usar outras palavras-chave.</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-5 rounded-full border border-brand-200 px-5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((emp) => (
              <EmpresaCardItem key={emp.id} empresa={emp} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Card no estilo da referência ─────────────────────────────────────────────
function EmpresaCardItem({ empresa: e }: { empresa: EmpresaCard }) {
  // Texto de oferta resumido (usa título da oferta + descrição)
  const ofertaText = e.oferta_descricao || e.oferta_titulo || e.description || "Confira as ofertas exclusivas para assinantes ChikJov.";

  return (
    <article className="group relative h-full">
      {/* Card principal — gradiente roxo premium, inspirado na imagem */}
      <Link
        href={`/empresa/${e.slug || e.id}?from=marketplace`}
        className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(109,40,217,0.6)]"
      >
        {/* Categoria badge — topo */}
        <div className="mb-6 flex items-start justify-between gap-2">
          <div className="min-w-0">
            {e.is_featured ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F97316] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                <Star className="h-3 w-3 fill-white" />
                Destaque
              </span>
            ) : (
              <span className="invisible inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                <Star className="h-3 w-3" />
                Placeholder
              </span>
            )}
          </div>
          <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm shrink-0 truncate">
            {e.category}
          </span>
        </div>

        {/* Conteúdo: logo + info */}
        <div className="flex flex-1 items-center gap-4">
          {/* Logo circular */}
          <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-xl ring-[3px] ring-white/10">
            {e.logo_url ? (
              <img
                src={e.logo_url}
                alt={e.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-10 w-10 text-brand-400" />
            )}
          </div>

          {/* Nome + Oferta */}
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[1.15rem] font-bold leading-tight text-white drop-shadow-sm line-clamp-2">
              {e.name}
            </h3>
            {e.city && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-white/75">
                <MapPin className="h-3 w-3" />
                {e.city}
              </p>
            )}
            <p className="mt-2 text-[11px] leading-relaxed text-white/80 line-clamp-2">
              {trim(ofertaText, 80)}
            </p>
          </div>
        </div>

        {/* CTA + desconto */}
        <div className="mt-6 flex items-center justify-between gap-2">
          {e.desconto_pct ? (
            <div className="flex flex-col justify-center">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-white/60 mb-0.5">
                Desconto até
              </span>
              <span className="font-display text-3xl font-bold leading-none text-[#FBBF24]">
                {Math.round(e.desconto_pct)}%
                <span className="text-xl ml-1">OFF</span>
              </span>
            </div>
          ) : (
            <div className="flex flex-col justify-center">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-white/60 mb-0.5">
                Vantagens
              </span>
              <span className="font-display text-2xl font-bold leading-none text-[#FBBF24]">
                {e.total_ofertas} {e.total_ofertas === 1 ? "oferta" : "ofertas"}
              </span>
            </div>
          )}

          {/* Botão laranja - idêntico à imagem (Gere o seu Voucher em 2 linhas) */}
          <div className="inline-flex h-12 min-w-[140px] items-center justify-between gap-2 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C] px-4 shadow-cta transition-all group-hover:scale-[1.03] group-hover:from-[#FB923C] group-hover:to-[#F97316]">
            <Ticket className="h-4 w-4 text-white opacity-90 shrink-0" />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[10px] font-medium text-white/90">Gere o seu</span>
              <span className="text-sm font-bold text-white">Voucher</span>
            </div>
            <ArrowRight className="h-4 w-4 text-white opacity-90 shrink-0" />
          </div>
        </div>
      </Link>
    </article>
  );
}
