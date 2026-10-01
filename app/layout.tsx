import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Guia Casca Grossa | Marcelo Brigadeiro',
  description:
    'Descubra quais suplementos fazem sentido para sua rotina. Assistente inteligente de suplementação baseado no catálogo oficial verificado da Growth Supplements e Oficial Farma. Cupom oficial: BRIGADEIRO.',
  keywords: [
    'guia casca grossa',
    'marcelo brigadeiro',
    'suplementos',
    'growth supplements',
    'oficial farma',
    'creatina',
    'whey protein',
    'cupom brigadeiro',
    'hipertrofia',
    'saúde',
  ],
  authors: [{ name: 'Marcelo Brigadeiro' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark scroll-smooth">
      <body className="bg-[#080A0B] text-[#F5F7F8] antialiased selection:bg-[#B6FF3B] selection:text-[#080A0B]">
        {children}
      </body>
    </html>
  );
}
