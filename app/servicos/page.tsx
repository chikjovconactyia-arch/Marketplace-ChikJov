"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Bell, BriefcaseMedical, PawPrint, Tag, Users, Building, Ticket } from "lucide-react";

export default function ServicosPage() {
  const categories = [
    {
      id: "telemedicina",
      title: "Telemedicina",
      subtitle: "Consulta online agora",
      icon: BriefcaseMedical,
      iconColor: "text-brand-600",
      iconBg: "bg-brand-100",
      href: "/servicos/telemedicina",
    },
    {
      id: "telepet",
      title: "Telepet",
      subtitle: "Cuidado para seu pet",
      icon: PawPrint,
      iconColor: "text-brand-600",
      iconBg: "bg-brand-100",
      href: "/servicos/telepet",
    },
    {
      id: "ofertas",
      title: "Ofertas Destaques",
      subtitle: "Melhores descontos",
      icon: Tag,
      iconColor: "text-brand-600",
      iconBg: "bg-brand-100",
      href: "/marketplace",
    },
    {
      id: "indique",
      title: "Indique e Ganhe",
      subtitle: "Ganhe créditos extras",
      icon: Users,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-100",
      href: "/indique-e-ganhe",
    },
    {
      id: "empresas",
      title: "Empresas Prêmio",
      subtitle: "Parceiros exclusivos",
      icon: Building,
      iconColor: "text-brand-600",
      iconBg: "bg-brand-100",
      href: "/empresas",
    },
    {
      id: "sorteios",
      title: "Sorteios",
      subtitle: "Concorra a prêmios",
      icon: Ticket,
      iconColor: "text-brand-600",
      iconBg: "bg-brand-100",
      href: "/sorteios",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-white sticky top-0 z-10">
        <button className="p-2 text-brand-600 rounded-full hover:bg-gray-100 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-brand-700 tracking-tight">Serviços</h1>
        <button className="p-2 text-brand-600 rounded-full hover:bg-gray-100 transition-colors relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </header>

      <main className="px-4 pt-2">
        {/* Banner Telemedicina */}
        <div className="relative w-full rounded-2xl overflow-hidden mb-8 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-400 opacity-90 z-10"></div>
          {/* Placeholder for the doctor image - replace with actual image later */}
          <div className="absolute inset-0 z-0 bg-brand-800">
            {/* If you have the image: <Image src="/path-to-image.jpg" alt="Telemedicina" fill className="object-cover" /> */}
          </div>
          
          <div className="relative z-20 p-5 md:p-6 h-full flex flex-col justify-center min-h-[160px]">
            <span className="inline-block bg-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-2 w-fit">
              Novidade
            </span>
            <h2 className="text-white text-xl md:text-2xl font-bold leading-tight max-w-[200px] drop-shadow-md">
              Telemedicina 24h<br />Sem coparticipação
            </h2>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Explorar Categorias</h3>
          <Link href="/servicos/categorias" className="text-sm font-semibold text-brand-600 hover:text-brand-800">
            Ver tudo
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={category.href}
              className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow flex flex-col items-start border border-gray-50/50"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${category.iconBg}`}>
                <category.icon className={`w-6 h-6 ${category.iconColor}`} />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{category.title}</h4>
              <p className="text-xs text-gray-500 leading-snug">{category.subtitle}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
