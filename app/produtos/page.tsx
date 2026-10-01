'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { INITIAL_PRODUCTS } from '@/lib/db/initialCatalog';
import { Product } from '@/types';
import { trackProductClick } from '@/lib/tracking/analytics';
import { CouponBadge } from '@/components/ui/CouponBadge';
import {
  Search,
  Filter,
  ExternalLink,
  Flame,
  Check,
  Dumbbell,
  ArrowRight,
} from 'lucide-react';

export default function ProdutosPage() {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<'all' | 'growth-supplements' | 'oficial-farma'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((prod) => {
      // Brand filter
      if (selectedBrand !== 'all' && prod.brand_id !== selectedBrand) return false;

      // Tag filter
      if (selectedTag !== 'all') {
        const hasTag = prod.tags && prod.tags.includes(selectedTag);
        const nameLower = prod.name.toLowerCase();
        const indLower = prod.indication.toLowerCase();
        const matchText = nameLower.includes(selectedTag) || indLower.includes(selectedTag);
        if (!hasTag && !matchText) return false;
      }

      // Search term
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(query);
        const matchInd = prod.indication.toLowerCase().includes(query);
        const matchCat = prod.category.toLowerCase().includes(query);
        if (!matchName && !matchInd && !matchCat) return false;
      }

      return true;
    });
  }, [search, selectedBrand, selectedTag]);

  const handleOpenProduct = (p: Product) => {
    if (!p.url) return;
    trackProductClick({
      product_id: p.id,
      brand_id: p.brand_id,
      destination_url: p.url,
    });
    window.open(p.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0B] text-[#F5F7F8]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#292F33] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#B6FF3B]">
              <Dumbbell className="w-4 h-4 text-[#B6FF3B]" />
              <span>Bases Oficiais Auditadas</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#F5F7F8]">
              Catálogo de Produtos ({INITIAL_PRODUCTS.length})
            </h1>
            <p className="text-xs text-[#929A9F]">
              Consulte os suplementos cadastrados da Growth Supplements e Oficial Farma com links oficiais e cupom ativo.
            </p>
          </div>

          <CouponBadge sourcePage="catalog-header" />
        </div>

        {/* Filters Bar */}
        <div className="bg-[#111416] border border-[#292F33] rounded-2xl p-4 md:p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#929A9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome (ex: Creatina, Whey, Omega, Melatonina...)"
                className="w-full bg-[#181C1F] border border-[#292F33] focus:border-[#B6FF3B] text-xs text-[#F5F7F8] placeholder-[#929A9F]/60 pl-10 pr-4 py-2.5 rounded-xl outline-none"
              />
            </div>

            {/* Brand Filter Buttons */}
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'Todas as Marcas' },
                { id: 'growth-supplements', label: 'Growth Supplements' },
                { id: 'oficial-farma', label: 'Oficial Farma' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBrand(b.id as typeof selectedBrand)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedBrand === b.id
                      ? 'bg-[#B6FF3B] text-[#080A0B] border-[#B6FF3B]'
                      : 'bg-[#181C1F] border-[#292F33] text-[#929A9F] hover:text-[#F5F7F8]'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal / Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-[#181C1F] text-xs">
            <span className="text-[#929A9F] font-bold text-[11px] self-center mr-1">Filtro rápido:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'hipertrofia', label: 'Hipertrofia' },
              { id: 'emagrecimento', label: 'Emagrecimento' },
              { id: 'sono', label: 'Sono' },
              { id: 'energia', label: 'Energia' },
              { id: 'digestao', label: 'Digestão' },
              { id: 'articulacoes', label: 'Articulações' },
              { id: 'vegano', label: 'Vegano' },
            ].map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  selectedTag === tag.id
                    ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                    : 'bg-[#181C1F] border-[#292F33] text-[#929A9F] hover:text-[#F5F7F8]'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => {
            const isGrowth = p.brand_id === 'growth-supplements';
            const hasUrl = Boolean(p.url && p.url.startsWith('http'));

            return (
              <div
                key={p.id}
                className="bg-[#111416] border border-[#292F33] hover:border-[#B6FF3B]/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        isGrowth
                          ? 'bg-[#181C1F] text-[#F5F7F8] border-[#292F33]'
                          : 'bg-[#181C1F] text-[#B6FF3B] border-[#B6FF3B]/30'
                      }`}
                    >
                      {p.brand}
                    </span>
                    <span className="text-[10px] font-mono text-[#929A9F]">
                      Cupom: <strong className="text-[#B6FF3B]">BRIGADEIRO</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-black text-[#F5F7F8] tracking-tight line-clamp-2">
                    {p.name}
                  </h3>

                  <div className="space-y-1.5 text-xs text-[#929A9F]">
                    <div>
                      <strong className="text-[#F5F7F8]">Indicação:</strong>{' '}
                      {p.indication || 'Informação não cadastrada'}
                    </div>
                    <div>
                      <strong className="text-[#F5F7F8]">Como tomar:</strong>{' '}
                      {p.usage_instruction || 'Informação não cadastrada'}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#181C1F] flex items-center justify-between gap-2">
                  <CouponBadge variant="compact" sourcePage={`catalog-${p.slug}`} />

                  {hasUrl ? (
                    <button
                      type="button"
                      onClick={() => handleOpenProduct(p)}
                      className="flex items-center gap-1.5 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-xs font-black uppercase px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Ver Produto</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#929A9F] italic">Sem link cadastrado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
