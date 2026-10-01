'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RadarScores } from '@/components/report/RadarScores';
import { ProductCard } from '@/components/products/ProductCard';
import { CouponBadge } from '@/components/ui/CouponBadge';
import { Assessment } from '@/types';
import { generateGuidePdf } from '@/lib/pdf/generateGuidePdf';
import {
  Download,
  Flame,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
} from 'lucide-react';

interface GuidePageProps {
  params: Promise<{ id: string }>;
}

export default function GuidePage({ params }: GuidePageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    // Fire celebration confetti on load
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B6FF3B', '#F5F7F8', '#181C1F'],
      });
    } catch {
      // ignore
    }

    const fetchAssessment = async () => {
      try {
        // Try fetching from API
        const res = await fetch(`/api/assessment/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.assessment) {
            setAssessment(data.assessment);
            setLoading(false);
            return;
          }
        }

        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          const history = JSON.parse(localStorage.getItem('brigadeiro_history') || '[]');
          if (id === 'latest' && history.length > 0) {
            setAssessment(history[0]);
          } else {
            const found = history.find((a: Assessment) => a.id === id);
            if (found) setAssessment(found);
            else if (history.length > 0) setAssessment(history[0]);
          }
        }
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!assessment) return;
    setPdfGenerating(true);
    try {
      const blob = await generateGuidePdf(assessment);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = (assessment.user_name || 'atleta').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const cleanDate = new Date(assessment.created_at).toISOString().split('T')[0];
      a.download = `guia-suplementacao-${cleanName}-${cleanDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível gerar o PDF neste momento.');
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#080A0B] text-[#F5F7F8]">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="w-8 h-8 text-[#B6FF3B] animate-spin" />
          <p className="text-xs uppercase font-bold text-[#929A9F] tracking-wider">
            Carregando seu guia personalizado...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex flex-col bg-[#080A0B] text-[#F5F7F8]">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <h2 className="text-2xl font-black uppercase text-[#F5F7F8]">
            Nenhum guia encontrado
          </h2>
          <p className="text-sm text-[#929A9F] max-w-md">
            Parece que você ainda não gerou sua avaliação ou o identificador expirou.
          </p>
          <Link
            href="/chat"
            className="bg-[#B6FF3B] text-[#080A0B] text-xs font-black uppercase px-6 py-3 rounded-xl neon-glow"
          >
            Montar Novo Guia
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const p = assessment.structured_profile;
  const dateFormatted = new Date(assessment.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0B] text-[#F5F7F8]">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-[#111416] via-[#181C1F] to-[#111416] border border-[#292F33] rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-black text-[#B6FF3B] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>Guia Gerado com Sucesso</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#F5F7F8] tracking-tight">
                Seu Guia Personalizado
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#929A9F] pt-1">
                <span className="text-[#F5F7F8] font-bold">
                  Atleta: {assessment.user_name || 'Atleta'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {dateFormatted}
                </span>
                <span>•</span>
                <span className="text-[#B6FF3B] font-bold uppercase">
                  {p.goal.join(', ') || 'Performance & Bem-Estar'}
                </span>
              </div>
            </div>

            {/* Download PDF Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                disabled={pdfGenerating}
                onClick={handleDownloadPdf}
                className="flex items-center justify-center gap-2.5 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all active:scale-95 neon-glow cursor-pointer disabled:opacity-50"
              >
                {pdfGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Baixar Guia em PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Prominent Coupon Callout */}
          <div className="pt-2 border-t border-[#292F33]/70">
            <CouponBadge variant="banner" sourcePage={`guide-${assessment.id}`} />
          </div>
        </div>

        {/* Safety Warning Banner if applicable */}
        {assessment.safety_evaluation.warnings.length > 0 && (
          <div className="p-5 rounded-2xl bg-[#1f1313] border border-[#ff4d4d]/40 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#ff6b6b] font-black uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Observações de Triagem Clínica</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#F5F7F8]">
              {assessment.safety_evaluation.warnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
            <p className="text-[11px] text-[#929A9F] pt-1">
              {assessment.safety_evaluation.disclaimer}
            </p>
          </div>
        )}

        {/* Current Wellbeing & Performance Profile */}
        <RadarScores scores={p.scores} />

        {/* Priority Hierarchy Summary */}
        <div className="bg-[#111416] border border-[#292F33] rounded-2xl p-6 space-y-4">
          <div className="text-xs font-black uppercase text-[#B6FF3B] tracking-wider">
            Hierarquia Estratégica
          </div>
          <h2 className="text-xl font-black uppercase text-[#F5F7F8]">
            Suas Prioridades de Suplementação
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {assessment.recommendations.slice(0, 3).map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#181C1F] border border-[#292F33] space-y-1"
              >
                <div className="text-xs font-mono font-black text-[#B6FF3B]">
                  #{idx + 1} PRIORIDADE
                </div>
                <div className="text-sm font-black text-[#F5F7F8] truncate">
                  {rec.product.name}
                </div>
                <div className="text-[11px] text-[#929A9F] uppercase font-bold">
                  {rec.product.brand}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Product Recommendations List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase text-[#B6FF3B] tracking-wider">
                Catálogo Auditado
              </div>
              <h2 className="text-2xl font-black uppercase text-[#F5F7F8]">
                Produtos Selecionados para Você ({assessment.recommendations.length})
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            {assessment.recommendations.map((item, idx) => (
              <ProductCard
                key={idx}
                item={item}
                assessmentId={assessment.id}
              />
            ))}
          </div>
        </div>

        {/* Actions Bottom Bar */}
        <div className="p-6 rounded-2xl bg-[#111416] border border-[#292F33] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-[#F5F7F8]">Deseja refazer ou atualizar sua rotina?</h3>
            <p className="text-xs text-[#929A9F]">
              Compare sua evolução física ou reavalie seus parâmetros com novas métricas.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/evolucao"
              className="flex-1 sm:flex-none text-center bg-[#181C1F] hover:bg-[#22282c] border border-[#292F33] text-xs font-bold px-4 py-3 rounded-xl transition-all"
            >
              Minha Evolução
            </Link>
            <Link
              href="/chat"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#B6FF3B] text-[#080A0B] text-xs font-black uppercase px-5 py-3 rounded-xl neon-glow transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nova Avaliação</span>
            </Link>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-5 rounded-2xl bg-[#111416] border border-[#292F33] text-xs text-[#929A9F] space-y-2 leading-relaxed">
          <div className="flex items-center gap-2 text-[#F5F7F8] font-bold">
            <ShieldAlert className="w-4 h-4 text-[#B6FF3B]" />
            <span>Aviso de Responsabilidade Médica e Nutricional</span>
          </div>
          <p>
            Este guia possui caráter informativo e educacional e foi elaborado a partir das informações fornecidas pelo usuário e do catálogo cadastrado na plataforma. Ele não substitui avaliação, diagnóstico, prescrição ou acompanhamento de médico, nutricionista ou outro profissional habilitado.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
