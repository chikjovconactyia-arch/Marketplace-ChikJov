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
    <footer className="border-t border-brand-100 bg-surface-soft">
      <div className="container-tight py-16">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="font-display text-xl font-bold text-brand-700">
                ChikJov
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-ink-muted">
              O clube de vantagens que conecta empresas locais a clientes que
              amam economizar. Descontos reais, benefícios exclusivos.
            </p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-700 shadow-soft transition-colors hover:bg-brand-50"
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
                <h4 className="font-display text-[13px] font-bold uppercase tracking-wider text-ink">
                  {group.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[13px] text-ink-muted transition-colors hover:text-brand-700"
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

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-brand-100 pt-6 text-xs text-ink-subtle md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Agência WebSic | ConectyIA | Todos os direitos reservados ChikJov.</p>
          <p>CNPJ 00.000.000/0001-00 • Feito com 💜 para empresas locais</p>
        </div>
      </div>
    </footer>
  );
}
