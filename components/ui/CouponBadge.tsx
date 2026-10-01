'use client';

import React, { useState } from 'react';
import { Flame, Copy, Check } from 'lucide-react';
import { trackCouponCopy } from '@/lib/tracking/analytics';

interface CouponBadgeProps {
  variant?: 'compact' | 'floating' | 'banner' | 'card';
  sourcePage?: string;
  className?: string;
}

export function CouponBadge({
  variant = 'compact',
  sourcePage = 'global',
  className = '',
}: CouponBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('BRIGADEIRO');
    setCopied(true);
    trackCouponCopy(sourcePage);
    setTimeout(() => setCopied(false), 2500);
  };

  if (variant === 'floating') {
    return (
      <aside aria-label="Cupom de desconto" className={`fixed bottom-4 right-4 z-50 animate-bounce-subtle ${className}`}>
        <div className="flex items-center gap-3 bg-[#111416]/95 border border-[#B6FF3B]/50 px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-xs font-black tracking-wider text-[#B6FF3B]">
            <Flame className="w-4 h-4 fill-[#B6FF3B] text-[#B6FF3B] animate-pulse" />
            <span>CUPOM:</span>
            <span className="bg-[#181C1F] text-[#F5F7F8] px-2 py-0.5 rounded border border-[#292F33] font-mono">
              BRIGADEIRO
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`bg-gradient-to-r from-[#111416] via-[#181C1F] to-[#111416] border border-[#292F33] rounded-xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#B6FF3B]/10 border border-[#B6FF3B]/30 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-[#B6FF3B] fill-[#B6FF3B]" />
          </div>
          <div>
            <div className="text-xs uppercase font-extrabold tracking-wider text-[#B6FF3B]">
              Economize na sua compra
            </div>
            <div className="text-sm font-medium text-[#F5F7F8]">
              Use nas lojas oficiais <span className="font-bold">Growth Supplements</span> e <span className="font-bold">Oficial Farma</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="bg-[#080A0B] border border-[#B6FF3B]/40 px-3.5 py-1.5 rounded-lg font-mono font-extrabold text-[#B6FF3B] tracking-wider text-sm select-all">
            BRIGADEIRO
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-xs font-black uppercase px-4 py-2 rounded-lg transition-all active:scale-95 cursor-pointer neon-glow"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Cupom copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar cupom</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Default compact badge (used in Header and Navigation)
  return (
    <div
      onClick={handleCopy}
      title="Clique para copiar o cupom BRIGADEIRO"
      className={`inline-flex items-center gap-2 bg-[#181C1F] hover:bg-[#22282c] border border-[#B6FF3B]/40 hover:border-[#B6FF3B] px-3 py-1.5 rounded-full transition-all cursor-pointer group active:scale-95 ${className}`}
    >
      <div className="flex items-center gap-1 text-xs font-black tracking-wide text-[#F5F7F8]">
        <Flame className="w-3.5 h-3.5 fill-[#B6FF3B] text-[#B6FF3B]" />
        <span>CUPOM:</span>
        <span className="text-[#B6FF3B] font-mono font-black ml-0.5">BRIGADEIRO</span>
      </div>
      <span className="text-[10px] font-bold text-[#080A0B] bg-[#B6FF3B] px-1.5 py-0.5 rounded transition-all">
        {copied ? 'COPIADO!' : 'COPIAR'}
      </span>
    </div>
  );
}
