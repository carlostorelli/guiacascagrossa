'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Dumbbell, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { CouponBadge } from '@/components/ui/CouponBadge';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080A0B]/90 backdrop-blur-md border-b border-[#292F33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-lg bg-[#181C1F] border border-[#292F33] group-hover:border-[#B6FF3B] flex items-center justify-center transition-all">
            <Dumbbell className="w-5 h-5 text-[#B6FF3B]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-[#F5F7F8]">
                GUIA <span className="text-[#B6FF3B]">CASCA GROSSA</span>
              </span>
            </div>
            <div className="text-[10px] font-semibold text-[#929A9F] tracking-wide uppercase">
              Marcelo Brigadeiro • Suplementação
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#929A9F]">
          <Link href="/#como-funciona" className="hover:text-[#F5F7F8] transition-colors">
            Como funciona
          </Link>
          <Link href="/chat" className="hover:text-[#F5F7F8] transition-colors">
            Meu Guia
          </Link>
          <Link href="/produtos" className="hover:text-[#F5F7F8] transition-colors">
            Produtos
          </Link>
          <Link href="/evolucao" className="hover:text-[#F5F7F8] transition-colors">
            Minha Evolução
          </Link>
          <Link href="/admin" className="text-xs bg-[#181C1F] hover:bg-[#22282c] border border-[#292F33] px-2.5 py-1 rounded text-[#929A9F] hover:text-[#F5F7F8] transition-all">
            Admin
          </Link>
        </nav>

        {/* Actions & Cupom */}
        <div className="hidden lg:flex items-center gap-3">
          <CouponBadge sourcePage="header" />

          <Link
            href="/chat"
            className="flex items-center gap-2 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all active:scale-95 neon-glow cursor-pointer"
          >
            <span>Montar meu guia</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <CouponBadge sourcePage="header-mobile" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#181C1F] text-[#F5F7F8] border border-[#292F33] hover:border-[#B6FF3B]"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#292F33] bg-[#080A0B] px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-[#F5F7F8]">
            <Link
              href="/#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#181C1F]"
            >
              Como funciona
            </Link>
            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#181C1F]"
            >
              Meu Guia
            </Link>
            <Link
              href="/produtos"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#181C1F]"
            >
              Catálogo de Produtos
            </Link>
            <Link
              href="/evolucao"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#181C1F]"
            >
              Minha Evolução
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#929A9F]"
            >
              Painel Administrativo
            </Link>
          </nav>

          <Link
            href="/chat"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 bg-[#B6FF3B] text-[#080A0B] font-black text-sm uppercase py-3 rounded-lg shadow neon-glow"
          >
            <span>Montar meu guia agora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </header>
  );
}
