"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Filter, MapPin, Tag, Star, Building2, Package,
  ArrowRight, X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Empresa {
  id: string;
  name: string;
  category: string | null;
  city: string | null;
  description: string | null;
  logo_url: string | null;
  is_featured: boolean;
  total_ofertas: number;
  melhor_desconto: number | null;
  melhor_imagem: string | null;
}

interface Props {
  empresas: Empresa[];
  cidades: string[];
  categorias: string[];
}

export function ExplorarClient({ empresas, cidades, categorias }: Props) {
  const [search, setSearch] = useState("");
  const [cidade, setCidade] = useState("");
  const [categoria, setCategoria] = useState("");
  const [showFeatured, setShowFeatured] = useState(false);

  const filtered = useMemo(() => {
    return empresas.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        e.name.toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q) ||
        (e.category ?? "").toLowerCase().includes(q);
      const matchCidade = !cidade || e.city === cidade;
      const matchCategoria = !categoria || e.category === categoria;
      const matchFeatured = !showFeatured || e.is_featured;
      return matchSearch && matchCidade && matchCategoria && matchFeatured;
    });
  }, [empresas, search, cidade, categoria, showFeatured]);

  const clearFilters = () => {
    setSearch("");
    setCidade("");
    setCategoria("");
    setShowFeatured(false);
  };

  const hasFilters = search || cidade || categoria || showFeatured;

  return (
    <>
      {/* Filtros */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(124,58,237,0.07),0_4px_16px_rgba(124,58,237,0.04)]">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              type="text"
              placeholder="Buscar empresa, descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#E8E4F3] bg-white pl-10 pr-4 text-sm text-ink placeholder-ink-subtle outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="h-10 rounded-xl border border-[#E8E4F3] bg-white px-3 text-sm text-ink outline-none focus:border-brand-300"
          >
            <option value="">Todas cidades</option>
            {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="h-10 rounded-xl border border-[#E8E4F3] bg-white px-3 text-sm text-ink outline-none focus:border-brand-300"
          >
            <option value="">Todas categorias</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <button
            onClick={() => setShowFeatured(!showFeatured)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-4 text-sm font-semibold transition-colors",
              showFeatured
                ? "bg-accent-500 text-white shadow-cta"
                : "border border-[#E8E4F3] bg-white text-ink-muted hover:border-brand-200"
            )}
          >
            <Star className={cn("h-3.5 w-3.5", showFeatured && "fill-white")} />
            Destaques
          </button>
        </div>

        {hasFilters && (
          <div className="mt-3 flex items-center gap-2 text-xs text-ink-subtle">
            <span>{filtered.length} resultados</span>
            <button onClick={clearFilters} className="inline-flex items-center gap-1 rounded-full bg-surface-soft px-2.5 py-1 font-semibold text-brand-700 hover:bg-brand-50">
              <X className="h-3 w-3" />
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Grid de empresas */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-card">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-50">
            <Building2 className="h-8 w-8 text-brand-300" />
          </div>
          <p className="font-display text-lg font-bold text-ink">Nenhuma empresa encontrada</p>
          <p className="mt-1 text-sm text-ink-muted">Tente ajustar os filtros ou buscar por outra palavra.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((emp) => {
            const pct = emp.melhor_desconto ? Math.round(emp.melhor_desconto) : null;
            return (
              <Link
                key={emp.id}
                href={`/empresa/${emp.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(124,58,237,0.15)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                  {emp.melhor_imagem ? (
                    <img src={emp.melhor_imagem} alt={emp.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : emp.logo_url ? (
                    <div className="flex h-full items-center justify-center p-6">
                      <img src={emp.logo_url} alt={emp.name} className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-brand-50">
                      <Package className="h-12 w-12 text-brand-200" />
                    </div>
                  )}
                  {pct && (
                    <span className="absolute left-3 top-3 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white shadow-cta">
                      {pct}% OFF
                    </span>
                  )}
                  {emp.is_featured && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-amber-700 backdrop-blur">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      Destaque
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  {emp.category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                      {emp.category}
                    </span>
                  )}
                  <h3 className="mt-0.5 font-display text-base font-bold text-ink line-clamp-1">
                    {emp.name}
                  </h3>
                  {emp.city && (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-subtle">
                      <MapPin className="h-3 w-3" />
                      {emp.city}
                    </p>
                  )}
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="text-xs text-ink-muted">
                      {emp.total_ofertas} {emp.total_ofertas === 1 ? "oferta" : "ofertas"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-brand-500 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
