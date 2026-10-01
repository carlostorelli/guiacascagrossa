'use client';

import React from 'react';
import { RecommendedProduct } from '@/types';
import { trackProductClick } from '@/lib/tracking/analytics';
import { ExternalLink, Flame, Shield, Check, ArrowUpRight } from 'lucide-react';
import { CouponBadge } from '@/components/ui/CouponBadge';

interface ProductCardProps {
  item: RecommendedProduct;
  assessmentId?: string;
}

export function ProductCard({ item, assessmentId }: ProductCardProps) {
  const { product, priority, priorityTitle, reason, equivalentProduct } = item;

  const handleOpenLink = (url: string, brandId: string, prodId: string) => {
    trackProductClick({
      product_id: prodId,
      brand_id: brandId,
      assessment_id: assessmentId,
      destination_url: url,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isGrowth = product.brand_id === 'growth-supplements';
  const hasLink = Boolean(product.url && product.url.startsWith('http'));

  return (
    <div className="bg-[#111416] border border-[#292F33] hover:border-[#B6FF3B]/40 rounded-2xl p-6 md:p-7 space-y-6 transition-all relative overflow-hidden">
      {/* Top Banner: Priority & Brand */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#181C1F] pb-4">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-mono font-black text-[#080A0B] bg-[#B6FF3B] px-2.5 py-1 rounded-md uppercase">
            Prioridade #{priority}
          </span>
          <span className="text-xs font-bold text-[#929A9F] uppercase tracking-wider hidden sm:inline">
            {priorityTitle.replace(/^#\d+\s*/, '')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-black uppercase px-2.5 py-1 rounded border ${
              isGrowth
                ? 'bg-[#181C1F] text-[#F5F7F8] border-[#292F33]'
                : 'bg-[#181C1F] text-[#B6FF3B] border-[#B6FF3B]/30'
            }`}
          >
            {product.brand}
          </span>
        </div>
      </div>

      {/* Product Title */}
      <div className="space-y-1">
        <h3 className="text-xl sm:text-2xl font-black uppercase text-[#F5F7F8] tracking-tight">
          {product.name}
        </h3>
        <p className="text-xs text-[#929A9F]">
          Categoria: <span className="text-[#F5F7F8] font-medium">{product.category}</span>
        </p>
      </div>

      {/* Why it was selected */}
      <div className="bg-[#181C1F] border border-[#292F33] rounded-xl p-4 space-y-2">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#B6FF3B] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF3B]" />
          <span>Por que apareceu no seu guia</span>
        </div>
        <p className="text-xs sm:text-sm text-[#F5F7F8] leading-relaxed">
          {reason}
        </p>
      </div>

      {/* Catalog Usage Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-[#080A0B] border border-[#292F33] space-y-1">
          <span className="font-bold text-[#929A9F] uppercase text-[10px] tracking-wider block">
            Instrução de Uso no Catálogo:
          </span>
          <p className="text-[#F5F7F8] font-medium leading-relaxed">
            {product.usage_instruction || 'Informação não cadastrada'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#080A0B] border border-[#292F33] space-y-1">
          <span className="font-bold text-[#929A9F] uppercase text-[10px] tracking-wider block">
            Indicação Registrada:
          </span>
          <p className="text-[#F5F7F8] font-medium leading-relaxed">
            {product.indication || 'Informação não cadastrada'}
          </p>
        </div>
      </div>

      {/* Equivalent comparison if available */}
      {equivalentProduct && (
        <div className="p-4 rounded-xl bg-[#181C1F]/60 border border-[#292F33] space-y-3">
          <div className="text-[11px] font-bold text-[#B6FF3B] uppercase tracking-wider">
            Opção Equivalente na Outra Marca:
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-[#F5F7F8]">{equivalentProduct.name}</span>
              <span className="text-[#929A9F] ml-2">({equivalentProduct.brand})</span>
            </div>
            {equivalentProduct.url ? (
              <button
                type="button"
                onClick={() =>
                  handleOpenLink(
                    equivalentProduct.url,
                    equivalentProduct.brand_id,
                    equivalentProduct.id
                  )
                }
                className="inline-flex items-center gap-1.5 text-[#B6FF3B] hover:underline font-bold text-xs cursor-pointer"
              >
                <span>Ver na {equivalentProduct.brand}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-[#929A9F] italic text-[11px]">Link não cadastrado</span>
            )}
          </div>
        </div>
      )}

      {/* Actions & Cupom */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#181C1F]">
        <div className="w-full sm:w-auto">
          <CouponBadge sourcePage={`product-${product.slug}`} />
        </div>

        <div className="w-full sm:w-auto">
          {hasLink ? (
            <button
              type="button"
              onClick={() => handleOpenLink(product.url, product.brand_id, product.id)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-xs font-black uppercase tracking-wider px-6 py-3 rounded-xl transition-all active:scale-95 neon-glow cursor-pointer"
            >
              <span>{isGrowth ? 'VER NA GROWTH' : 'VER NA OFICIAL FARMA'}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-xs text-[#929A9F] italic bg-[#181C1F] px-4 py-2 rounded-lg border border-[#292F33] text-center">
              Informação de compra não cadastrada
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
