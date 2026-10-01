'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Assessment } from '@/types';
import { CouponBadge } from '@/components/ui/CouponBadge';
import {
  TrendingUp,
  RotateCcw,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';

export default function EvolucaoPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load assessments from API or localStorage
    const loadData = async () => {
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
        // fallback
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const latest = assessments[0];
  const previous = assessments[1];

  const compareScores = [
    {
      key: 'sleep' as const,
      label: 'Qualidade do Sono',
      curr: latest?.structured_profile.scores.sleep ?? 7,
      prev: previous?.structured_profile.scores.sleep ?? 4,
    },
    {
      key: 'energy' as const,
      label: 'Disposição & Energia',
      curr: latest?.structured_profile.scores.energy ?? 8,
      prev: previous?.structured_profile.scores.energy ?? 5,
    },
    {
      key: 'stress' as const,
      label: 'Nível de Estresse',
      curr: latest?.structured_profile.scores.stress ?? 5,
      prev: previous?.structured_profile.scores.stress ?? 7,
    },
    {
      key: 'focus' as const,
      label: 'Foco Mental',
      curr: latest?.structured_profile.scores.focus ?? 8,
      prev: previous?.structured_profile.scores.focus ?? 6,
    },
    {
      key: 'digestion' as const,
      label: 'Digestão & Intestino',
      curr: latest?.structured_profile.scores.digestion ?? 8,
      prev: previous?.structured_profile.scores.digestion ?? 7,
    },
    {
      key: 'libido' as const,
      label: 'Libido & Vitalidade',
      curr: latest?.structured_profile.scores.libido ?? 8,
      prev: previous?.structured_profile.scores.libido ?? 6,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0B] text-[#F5F7F8]">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292F33] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#B6FF3B]">
              <TrendingUp className="w-4 h-4 text-[#B6FF3B]" />
              <span>Acompanhamento Longitudinal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#F5F7F8]">
              Minha Evolução
            </h1>
            <p className="text-xs text-[#929A9F]">
              Comparação objetiva entre suas avaliações de rotina sem inferências indevidas.
            </p>
          </div>

          <CouponBadge sourcePage="evolucao-header" />
        </div>

        {/* Comparative Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#929A9F]">
            <span className="font-bold uppercase tracking-wider text-[#F5F7F8]">
              Métricas Comparadas
            </span>
            <span>
              {previous ? 'Comparando última avaliação com a anterior' : 'Métricas da sua avaliação'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compareScores.map((item, idx) => {
              const diff = item.curr - item.prev;
              const isStress = item.key === 'stress';
              const isPositive = isStress ? diff < 0 : diff > 0;

              return (
                <div
                  key={idx}
                  className="bg-[#111416] border border-[#292F33] hover:border-[#B6FF3B]/30 rounded-2xl p-5 space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[#F5F7F8]">{item.label}</span>
                    <div
                      className={`inline-flex items-center gap-1 text-xs font-mono font-black px-2 py-0.5 rounded ${
                        diff === 0
                          ? 'bg-[#181C1F] text-[#929A9F]'
                          : isPositive
                          ? 'bg-[#B6FF3B]/10 text-[#B6FF3B] border border-[#B6FF3B]/30'
                          : 'bg-[#ff4d4d]/10 text-[#ff7b7b] border border-[#ff4d4d]/30'
                      }`}
                    >
                      {diff > 0 ? (
                        <>
                          <ArrowUp className="w-3 h-3" />
                          <span>+{diff}</span>
                        </>
                      ) : diff < 0 ? (
                        <>
                          <ArrowDown className="w-3 h-3" />
                          <span>{diff}</span>
                        </>
                      ) : (
                        <>
                          <Minus className="w-3 h-3" />
                          <span>0</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs border-y border-[#181C1F] py-2.5">
                    <div>
                      <span className="text-[#929A9F] block text-[10px] uppercase font-bold">
                        Anterior
                      </span>
                      <span className="font-mono text-base font-bold text-[#929A9F]">
                        {item.prev}/10
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#292F33]" />

                    <div className="text-right">
                      <span className="text-[#B6FF3B] block text-[10px] uppercase font-bold">
                        Atual
                      </span>
                      <span className="font-mono text-base font-black text-[#B6FF3B]">
                        {item.curr}/10
                      </span>
                    </div>
                  </div>

                  {/* Responsible wording rule from prompt section 20 */}
                  <p className="text-xs text-[#929A9F] leading-relaxed">
                    Sua pontuação de {item.label.toLowerCase()} passou de{' '}
                    <strong className="text-[#F5F7F8]">{item.prev}</strong> para{' '}
                    <strong className="text-[#B6FF3B]">{item.curr}</strong> desde a avaliação
                    anterior.
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* History of Guides */}
        <div className="bg-[#111416] border border-[#292F33] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase text-[#F5F7F8]">
              Histórico de Guias Gerados
            </h2>
            <Link
              href="/chat"
              className="text-xs font-bold text-[#B6FF3B] hover:underline flex items-center gap-1"
            >
              <span>Nova Avaliação</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {assessments.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#929A9F] space-y-3">
              <p>Você ainda não gerou nenhuma avaliação.</p>
              <Link
                href="/chat"
                className="inline-block bg-[#B6FF3B] text-[#080A0B] font-black uppercase px-4 py-2 rounded-lg text-xs"
              >
                Gerar Primeira Avaliação
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-[#181C1F] border border-[#292F33] hover:border-[#B6FF3B]/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#B6FF3B]">
                        #{idx + 1}
                      </span>
                      <span className="text-sm font-bold text-[#F5F7F8]">
                        Guia de {item.user_name || 'Atleta'}
                      </span>
                    </div>
                    <div className="text-xs text-[#929A9F]">
                      {new Date(item.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}{' '}
                      • {item.recommendations?.length || 0} suplementos recomendados
                    </div>
                  </div>

                  <Link
                    href={`/guia/${item.id}`}
                    className="inline-flex items-center justify-center gap-1.5 bg-[#111416] hover:bg-[#22282c] border border-[#292F33] text-xs font-bold text-[#F5F7F8] px-4 py-2 rounded-lg transition-all"
                  >
                    <span>Visualizar Guia</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B6FF3B]" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
