import React from 'react';
import Link from 'next/link';
import { Dumbbell, ShieldAlert, HeartHandshake } from 'lucide-react';
import { CouponBadge } from '@/components/ui/CouponBadge';

export function Footer() {
  return (
    <footer className="w-full bg-[#080A0B] border-t border-[#292F33] pt-12 pb-16 text-[#929A9F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#181C1F] border border-[#292F33] flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-[#B6FF3B]" />
              </div>
              <span className="font-black text-lg tracking-tight text-[#F5F7F8]">
                GUIA <span className="text-[#B6FF3B]">CASCA GROSSA</span>
              </span>
            </div>
            <p className="text-sm text-[#929A9F] max-w-md leading-relaxed">
              O assistente inteligente de suplementação que cruza seus objetivos e rotina com o catálogo oficial verificado das principais marcas brasileiras.
            </p>
            <div className="pt-2">
              <CouponBadge sourcePage="footer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wider">
              Navegação
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#F5F7F8] transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-[#F5F7F8] transition-colors">
                  Montar Guia
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="hover:text-[#F5F7F8] transition-colors">
                  Catálogo Auditado
                </Link>
              </li>
              <li>
                <Link href="/evolucao" className="hover:text-[#F5F7F8] transition-colors">
                  Minha Evolução
                </Link>
              </li>
            </ul>
          </div>

          {/* Brands Col */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wider">
              Marcas Parceiras
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF3B]" />
                <span>Growth Supplements</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF3B]" />
                <span>Oficial Farma</span>
              </li>
            </ul>
            <div className="text-xs text-[#929A9F] pt-2">
              Utilize o cupom <span className="text-[#B6FF3B] font-mono font-bold">BRIGADEIRO</span> no checkout para economizar.
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-4 rounded-xl bg-[#111416] border border-[#292F33] text-xs text-[#929A9F] space-y-2 leading-relaxed">
          <div className="flex items-center gap-2 text-[#F5F7F8] font-bold">
            <ShieldAlert className="w-4 h-4 text-[#B6FF3B]" />
            <span>Aviso Legal & Responsabilidade</span>
          </div>
          <p>
            Este guia possui caráter exclusivamente informativo e educacional e foi elaborado a partir das informações fornecidas pelo usuário e do catálogo cadastrado na plataforma. Ele não substitui avaliação, diagnóstico, prescrição ou acompanhamento de médico, nutricionista ou outro profissional habilitado.
          </p>
        </div>

        {/* Bottom line */}
        <div className="pt-4 border-t border-[#181C1F] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#929A9F]">
          <div>© {new Date().getFullYear()} GUIA CASCA GROSSA • Marcelo Brigadeiro. Todos os direitos reservados.</div>
          <div className="flex items-center gap-1 text-[#929A9F]">
            <HeartHandshake className="w-3.5 h-3.5 text-[#B6FF3B]" />
            <span>Foco em Saúde, Performance e Transparência</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
