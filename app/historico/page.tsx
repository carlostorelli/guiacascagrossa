'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Assessment } from '@/types';
import { CouponBadge } from '@/components/ui/CouponBadge';
import { FileText, Calendar, ArrowRight, RotateCcw, Dumbbell } from 'lucide-react';

export default function HistoricoPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await fetch('/api/assessment');
        if (res.ok) {
          const data = await res.json();
          if (data.assessments && data.assessments.length > 0) {
            setAssessments(data.assessments);
            setLoading(false);
            return;
          }
        }

        if (typeof window !== 'undefined') {
          const local = JSON.parse(localStorage.getItem('brigadeiro_history') || '[]');
          setAssessments(local);
        }
      } catch {
        // quiet fail
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0B] text-[#F5F7F8]">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292F33] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#B6FF3B]">
              <FileText className="w-4 h-4 text-[#B6FF3B]" />
              <span>Seus Registros</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#F5F7F8]">
              Meus Guias de Suplementação
            </h1>
          </div>

          <Link
            href="/chat"
            className="inline-flex items-center justify-center gap-2 bg-[#B6FF3B] text-[#080A0B] text-xs font-black uppercase px-5 py-3 rounded-xl neon-glow"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nova Avaliação</span>
          </Link>
        </div>

        {assessments.length === 0 ? (
          <div className="bg-[#111416] border border-[#292F33] rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#181C1F] border border-[#292F33] flex items-center justify-center mx-auto text-[#B6FF3B]">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold uppercase text-[#F5F7F8]">
              Nenhum guia salvo ainda
            </h2>
            <p className="text-xs text-[#929A9F] max-w-sm mx-auto">
              Converse com o assistente agora para gerar seu primeiro plano personalizado com base no catálogo oficial.
            </p>
            <div className="pt-2">
              <Link
                href="/chat"
                className="bg-[#B6FF3B] text-[#080A0B] text-xs font-black uppercase px-6 py-3 rounded-xl neon-glow inline-block"
              >
                Montar Meu Guia
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map((a, idx) => (
              <div
                key={a.id || idx}
                className="bg-[#111416] border border-[#292F33] hover:border-[#B6FF3B]/40 rounded-2xl p-6 space-y-4 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-xs font-mono font-bold text-[#B6FF3B]">
                      GUIA #{idx + 1}
                    </span>
                    <span className="text-[#929A9F] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(a.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h3 className="text-lg font-black uppercase text-[#F5F7F8]">
                    {a.user_name || 'Atleta'}
                  </h3>

                  <div className="text-xs text-[#929A9F]">
                    <span className="text-[#F5F7F8] font-bold">Objetivo: </span>
                    {a.structured_profile?.goal?.join(', ') || 'Geral'}
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-bold text-[#929A9F] uppercase">
                      Recomendações:
                    </div>
                    <ul className="text-xs text-[#F5F7F8] space-y-1">
                      {a.recommendations?.slice(0, 3).map((r, rIdx) => (
                        <li key={rIdx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B6FF3B]" />
                          <span className="font-medium">{r.product.name}</span>
                          <span className="text-[10px] text-[#929A9F]">({r.product.brand})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#181C1F] flex items-center justify-between">
                  <CouponBadge sourcePage="historico-card" />
                  <Link
                    href={`/guia/${a.id}`}
                    className="flex items-center gap-1.5 bg-[#181C1F] hover:bg-[#22282c] border border-[#292F33] text-xs font-bold text-[#F5F7F8] px-3.5 py-2 rounded-xl transition-all"
                  >
                    <span>Ver Detalhes</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B6FF3B]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
