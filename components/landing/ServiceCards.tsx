"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

export interface HomeCardData {
  id: string;
  title: string;
  description: string;
  tag_value: string;
  cta_link: string | null;
  icon_left_name: string;
  icon_left_bg: string;
  icon_right_name: string;
  icon_right_color: string;
}

interface Props {
  cards: HomeCardData[];
}

const FALLBACK_CARDS: HomeCardData[] = [
  {
    id: "fallback-1",
    title: "Management",
    description: "Gerencie seus cupons de desconto, controle o uso dos seus benefícios e organize sua conta de forma centralizada e sem complicações.",
    tag_value: "9.0",
    cta_link: "/dashboard/cliente",
    icon_left_name: "FolderGit2",
    icon_left_bg: "bg-[#EEF2F6] text-[#6B21D9]",
    icon_right_name: "BarChart3",
    icon_right_color: "text-[#8B5CF6]"
  },
  {
    id: "fallback-2",
    title: "Data Analytics",
    description: "Monitore sua economia mensal em tempo real, veja quais categorias você mais consome e tome decisões inteligentes para o seu bolso.",
    tag_value: "5.0",
    cta_link: "/dashboard/cliente",
    icon_left_name: "Target",
    icon_left_bg: "bg-[#E6F0FA] text-[#2563EB]",
    icon_right_name: "GitBranch",
    icon_right_color: "text-[#F26B0A]"
  },
  {
    id: "fallback-3",
    title: "Project",
    description: "Explore novas parcerias, acompanhe as empresas que estão chegando e participe de campanhas especiais de descontos de grandes marcas.",
    tag_value: "2.0",
    cta_link: "/servicos",
    icon_left_name: "Briefcase",
    icon_left_bg: "bg-[#F1F5F9] text-[#475569]",
    icon_right_name: "Compass",
    icon_right_color: "text-[#64748B]"
  },
  {
    id: "fallback-4",
    title: "Marketing",
    description: "Receba recomendações altamente personalizadas com base nos seus gostos, garantindo ofertas exclusivas que combinam perfeitamente com você.",
    tag_value: "2.0",
    cta_link: "/marketplace",
    icon_left_name: "LayoutGrid",
    icon_left_bg: "bg-[#E6F4EA] text-[#16A34A]",
    icon_right_name: "Gem",
    icon_right_color: "text-[#475569]"
  }
];

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <LucideIcons.HelpCircle className={className} />;
  return <IconComponent className={className} />;
}

export function ServiceCards({ cards }: Props) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const activeCards = cards && cards.length > 0 ? cards : FALLBACK_CARDS;

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const cardClasses = cn(
    "group relative flex flex-col justify-between p-5 md:p-6 rounded-[28px] h-full",
    "bg-brand-500/8 backdrop-blur-xl border border-brand-500/15",
    "shadow-[0_12px_30px_-10px_rgba(31,41,55,0.08)]",
    "transition-all duration-500 ease-out",
    "hover:-translate-y-1.5 hover:bg-brand-500/12",
    "hover:shadow-[0_20px_40px_-12px_rgba(124,58,237,0.15)]",
    "hover:border-brand-500/25 cursor-pointer"
  );

  return (
    <section className="relative pt-6 pb-20 md:py-20 px-4 md:px-8 overflow-hidden bg-white">
      {/* Luzes difusas de fundo para reforçar o glassmorphism */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 rounded-full bg-[#B888FF]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 rounded-full bg-[#22D3EE]/10 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Título da seção */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight mb-3">
            Serviços ChikJov
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            Descubra as ferramentas criadas para transformar e simplificar sua experiência no maior clube de vantagens local.
          </p>
        </div>

        {/* Grid responsiva: 2 colunas no mobile, 4 colunas no desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {activeCards.map((card) => {
            const isFavorited = !!favorites[card.id];

            const cardContent = (
              <>
                {/* Botão de favoritos (coração) */}
                <button
                  onClick={(e) => toggleFavorite(e, card.id)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/40 active:scale-90 transition-all duration-300 z-20"
                  aria-label="Adicionar aos favoritos"
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isFavorited 
                        ? "text-red-500 fill-red-500 scale-110" 
                        : "text-slate-400/80 group-hover:text-slate-600"
                    )}
                  />
                </button>

                {/* Bloco de conteúdo superior */}
                <div>
                  {/* Ícones duplos com estilo sobreposto e sombras */}
                  <div className="flex items-center gap-2 mb-6">
                    {/* Ícone 1 (Fundo colorido suave) */}
                    <div className={cn(
                      "flex items-center justify-center h-10 w-10 rounded-[14px]",
                      card.icon_left_bg,
                      "shadow-soft transition-transform duration-500 group-hover:scale-105"
                    )}>
                      <DynamicIcon name={card.icon_left_name} className="h-5 w-5" />
                    </div>

                    {/* Ícone 2 (Fundo branco jateado / sombra leve) */}
                    <div className={cn(
                      "flex items-center justify-center h-10 w-10 rounded-[14px] bg-white",
                      "shadow-[0_3px_8px_-2px_rgba(15,10,31,0.08)]",
                      "transition-transform duration-500 group-hover:scale-105 delay-75"
                    )}>
                      <DynamicIcon name={card.icon_right_name} className={cn("h-5 w-5", card.icon_right_color)} />
                    </div>
                  </div>

                  {/* Título do Card */}
                  <h3 className="font-display text-lg md:text-xl font-bold text-[#0F0A1F] tracking-tight mb-2 group-hover:text-brand-600 transition-colors duration-300">
                    {card.title}
                  </h3>

                  {/* Descrição do Card */}
                  <div className="text-xs md:text-sm text-slate-600/90 leading-relaxed font-sans group-hover:text-slate-700 transition-colors duration-300">
                    {/* Mobile: Abre/Fecha interativo */}
                    <div className="md:hidden">
                      {expandedCards[card.id] 
                        ? card.description 
                        : (card.description.length > 30 
                            ? `${card.description.slice(0, 30)}` 
                            : card.description
                          )
                      }
                      {card.description.length > 30 && (
                        <button
                          onClick={(e) => toggleExpand(e, card.id)}
                          className="inline-block ml-1 font-bold text-brand-600 hover:text-brand-850 focus:outline-none transition-colors duration-300 bg-brand-50 px-1 py-0.5 rounded text-[10px]"
                        >
                          {expandedCards[card.id] ? " (ver menos)" : "..."}
                        </button>
                      )}
                    </div>

                    {/* Desktop: Padrão com line-clamp */}
                    <p className="hidden md:block line-clamp-4">
                      {card.description}
                    </p>
                  </div>
                </div>


              </>
            );

            if (card.cta_link) {
              return (
                <Link
                  key={card.id}
                  href={card.cta_link}
                  className={cardClasses}
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div
                key={card.id}
                className={cardClasses}
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
