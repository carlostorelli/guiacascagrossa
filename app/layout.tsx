import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BRIGADEIRO FIT AI | Assistente Inteligente de Suplementação',
  description:
    'Descubra quais suplementos fazem sentido para sua rotina. Assistente inteligente que cruza seus objetivos e rotina com o catálogo oficial verificado da Growth Supplements e Oficial Farma. Cupom oficial: BRIGADEIRO.',
  keywords: [
    'suplementos',
    'growth supplements',
    'oficial farma',
    'creatina',
    'whey protein',
    'cupom brigadeiro',
    'assistente de suplementação',
    'hipertrofia',
    'emagrecimento',
    'saúde',
  ],
  authors: [{ name: 'Brigadeiro Fit AI' }],
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
