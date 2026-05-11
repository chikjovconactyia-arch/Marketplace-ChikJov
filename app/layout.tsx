import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChikJov — Clube de Vantagens",
  description:
    "O clube de vantagens que conecta empresas locais a clientes apaixonados por economia. Descontos, benefícios e experiências exclusivas.",
  metadataBase: new URL("https://chikjov.com.br"),
  openGraph: {
    title: "ChikJov — Clube de Vantagens",
    description:
      "Descontos exclusivos em centenas de empresas locais. Por apenas R$ 39,90/mês.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
