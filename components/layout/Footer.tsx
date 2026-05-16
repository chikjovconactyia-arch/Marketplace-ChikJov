import Link from "next/link";
import { Sparkles, Instagram, Facebook, Linkedin } from "lucide-react";

const linkGroups = [
  {
    title: "Plataforma",
    links: [
      { href: "#como-funciona", label: "Como funciona" },
      { href: "#beneficios", label: "Benefícios" },
      { href: "#preco", label: "Preço" },
    ],
  },
  {
    title: "Para empresas",
    links: [
      { href: "#empresas", label: "Anuncie sua marca" },
      { href: "/auth/register?role=empresa", label: "Cadastre sua empresa" },
      { href: "#empresas", label: "Indique e ganhe" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "#", label: "Sobre" },
      { href: "#", label: "Contato" },
      { href: "#", label: "Termos de uso" },
      { href: "#", label: "Privacidade" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#6528a7] text-white">
      <div className="container-tight py-16">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-2-chikjov.png" alt="ChikJov" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-white/80">
              O clube de vantagens que conecta empresas locais a clientes que
              amam economizar. Descontos reais, benefícios exclusivos.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white shadow-soft transition-colors hover:bg-white/20"
                  aria-label="Rede social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:col-span-3 lg:gap-12">
            {linkGroups.map((group) => (
              <div key={group.title}>
                <h4 className="font-display text-[13px] font-bold uppercase tracking-wider text-white">
                  {group.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[13px] text-white/80 transition-colors hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/20 pt-6 text-xs text-white/60 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Agência WebSic | ConectyIA | Todos os direitos reservados ChikJov.</p>
          <p>CNPJ 00.000.000/0001-00 • Feito com 💜 para empresas locais</p>
        </div>
      </div>
    </footer>
  );
}
