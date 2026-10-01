'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Dumbbell,
  Send,
  Sparkles,
  RotateCcw,
  Download,
  ShieldAlert,
  Loader2,
  Calendar,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { CouponBadge } from '@/components/ui/CouponBadge';
import { MissingFieldsCards } from '@/components/chat/MissingFieldsCards';
import { SafetyScreening } from '@/components/chat/SafetyScreening';
import { LoadingProgress } from '@/components/chat/LoadingProgress';
import { RadarScores } from '@/components/report/RadarScores';
import { ProductCard } from '@/components/products/ProductCard';
import { UserProfile, Assessment } from '@/types';
import { generateGuidePdf } from '@/lib/pdf/generateGuidePdf';

const INITIAL_PROFILE: UserProfile = {
  name: '',
  age: null,
  sex: null,
  goal: [],
  training: {
    type: null,
    frequency: null,
  },
  scores: {
    sleep: null,
    energy: null,
    stress: null,
    focus: null,
    libido: null,
    digestion: null,
  },
  diet: null,
  lactose_intolerance: null,
  dietary_pattern: null,
  medications: [],
  health_conditions: [],
  allergies: [],
  pregnant_or_breastfeeding: false,
};

type Step = 'input' | 'missing' | 'safety' | 'loading' | 'guide';

export default function SinglePageApp() {
  const [step, setStep] = useState<Step>('input');
  const [inputText, setInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const quickExamples = [
    'Tenho 32 anos, treino musculação 5x na semana, quero hipertrofia mas durmo mal e acordo cansado',
    'Foco em emagrecimento, retenção de líquido e preciso de mais disposição no dia a dia',
    'Tenho 28 anos, estresse alto, durmo pouco e sinto desconforto digestivo',
    'Sou vegetariano, treino corrida 4x por semana e busco recuperação e saúde geral',
  ];

  // Step 1: Submit free text input
  const handleExtractProfile = async (text: string) => {
    if (!text.trim() || isExtracting) return;
    setIsExtracting(true);

    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      const extracted = data.profile || {};

      const updated: UserProfile = {
        ...profile,
        ...extracted,
        training: {
          ...profile.training,
          ...(extracted.training || {}),
        },
        scores: {
          ...profile.scores,
          ...(extracted.scores || {}),
        },
        goal: extracted.goal && extracted.goal.length > 0 ? extracted.goal : profile.goal,
      };

      setProfile(updated);

      const hasGoal = updated.goal.length > 0;
      const hasFreq = updated.training.frequency !== null;
      const hasSleep = updated.scores.sleep !== null;
      const hasEnergy = updated.scores.energy !== null;

      if (!hasGoal || !hasFreq || !hasSleep || !hasEnergy) {
        setStep('missing');
      } else {
        setStep('safety');
      }
    } catch {
      setStep('missing');
    } finally {
      setIsExtracting(false);
    }
  };

  // Step 2: Missing fields completed
  const handleFinishMissing = () => {
    setStep('safety');
  };

  // Step 3: Safety screening completed -> trigger recommendation
  const handleGenerateGuide = async () => {
    setStep('loading');

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          raw_text: inputText,
          user_name: profile.name || 'Atleta',
        }),
      });

      const data = await res.json();
      if (data.assessment) {
        setAssessment(data.assessment);
      }
    } catch {
      // handled
    }
  };

  // Step 4: Loading sequence finishes
  const handleLoadingFinished = () => {
    setStep('guide');
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
  };

  // Download PDF
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
      alert('Não foi possível gerar o PDF no momento.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleReset = () => {
    setProfile(INITIAL_PROFILE);
    setInputText('');
    setAssessment(null);
    setStep('input');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0B] text-[#F5F7F8]">
      {/* Top Header */}
      <header className="border-b border-[#292F33] bg-[#080A0B]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#181C1F] border border-[#292F33] flex items-center justify-center text-[#B6FF3B]">
              <Dumbbell className="w-4 h-4" />
            </div>
            <span className="font-black text-base tracking-tight text-[#F5F7F8]">
              BRIGADEIRO<span className="text-[#B6FF3B]">.FIT</span>
            </span>
          </div>

          <CouponBadge sourcePage="single-header" />
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        {/* Title area (visible while answering) */}
        {step !== 'guide' && (
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181C1F] border border-[#292F33] text-[11px] font-black uppercase text-[#B6FF3B] tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assistente Inteligente de Suplementação</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-[#F5F7F8] tracking-tight">
              Descubra quais suplementos <br className="hidden sm:block" />
              fazem sentido para sua rotina.
            </h1>
            <p className="text-sm sm:text-base text-[#929A9F] max-w-xl mx-auto leading-relaxed">
              Conte seus objetivos e como você está se sentindo. Nosso assistente organiza suas informações e cria um guia personalizado usando os produtos cadastrados da Growth e Oficial Farma.
            </p>
          </div>
        )}

        {/* STEP 1: FREE TEXT INPUT */}
        {step === 'input' && (
          <div className="bg-[#111416] border border-[#292F33] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-[#B6FF3B] block">
                Conte sobre você e seus objetivos:
              </label>
              <p className="text-xs text-[#929A9F]">
                Escreva livremente sua rotina, idade, treinos e queixas (sono, energia, digestão).
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExtractProfile(inputText);
              }}
              className="space-y-4"
            >
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ex: Tenho 32 anos, treino musculação 5 vezes por semana, quero ganhar massa muscular, mas estou dormindo mal e acordo cansado..."
                className="w-full bg-[#080A0B] border border-[#292F33] focus:border-[#B6FF3B] rounded-2xl p-4 text-sm text-[#F5F7F8] placeholder-[#929A9F]/50 outline-none resize-none transition-all"
              />

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#929A9F] uppercase tracking-wider">
                  Ou selecione um exemplo rápido:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {quickExamples.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInputText(ex);
                        handleExtractProfile(ex);
                      }}
                      className="text-xs bg-[#181C1F] hover:bg-[#22282c] border border-[#292F33] hover:border-[#B6FF3B]/40 text-[#929A9F] hover:text-[#F5F7F8] p-3 rounded-xl transition-all text-left cursor-pointer"
                    >
                      &ldquo;{ex}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!inputText.trim() || isExtracting}
                  className="w-full py-4 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-sm font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 neon-glow cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processando informações...</span>
                    </>
                  ) : (
                    <>
                      <span>MONTAR MEU GUIA</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: MISSING FIELDS QUESTIONNAIRE */}
        {step === 'missing' && (
          <div className="bg-[#111416] border border-[#292F33] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#292F33] pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#B6FF3B] uppercase">Etapa 2 de 3</span>
                <h2 className="text-lg font-black uppercase text-[#F5F7F8]">Apenas os dados que faltam</h2>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-[#929A9F] hover:text-[#F5F7F8] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reiniciar</span>
              </button>
            </div>

            <MissingFieldsCards
              profile={profile}
              onChange={setProfile}
              onComplete={handleFinishMissing}
            />
          </div>
        )}

        {/* STEP 3: MANDATORY SAFETY SCREENING */}
        {step === 'safety' && (
          <div className="bg-[#111416] border border-[#292F33] rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#292F33] pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#B6FF3B] uppercase">Etapa 3 de 3</span>
                <h2 className="text-lg font-black uppercase text-[#F5F7F8]">Triagem de Segurança</h2>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-[#929A9F] hover:text-[#F5F7F8] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reiniciar</span>
              </button>
            </div>

            <SafetyScreening
              profile={profile}
              onChange={setProfile}
              onSubmit={handleGenerateGuide}
              isLoading={false}
            />
          </div>
        )}

        {/* STEP 4: LOADING SCREEN */}
        {step === 'loading' && (
          <div className="bg-[#111416] border border-[#292F33] rounded-3xl p-8">
            <LoadingProgress onFinished={handleLoadingFinished} />
          </div>
        )}

        {/* STEP 5: COMPLETED GUIDE RESULT */}
        {step === 'guide' && assessment && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Result Card */}
            <div className="bg-gradient-to-r from-[#111416] via-[#181C1F] to-[#111416] border border-[#292F33] rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-mono font-black text-[#B6FF3B] uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guia Personalizado Gerado</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black uppercase text-[#F5F7F8] tracking-tight">
                    Seu Guia de Suplementação
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#929A9F]">
                    <span className="text-[#F5F7F8] font-bold">
                      {assessment.user_name || 'Atleta'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span>•</span>
                    <span className="text-[#B6FF3B] font-bold uppercase">
                      {assessment.structured_profile.goal.join(', ') || 'Performance'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={pdfGenerating}
                    onClick={handleDownloadPdf}
                    className="flex items-center justify-center gap-2 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all active:scale-95 neon-glow cursor-pointer disabled:opacity-50"
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

                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 bg-[#181C1F] hover:bg-[#22282c] border border-[#292F33] text-xs font-bold text-[#F5F7F8] px-4 py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Novo Guia</span>
                  </button>
                </div>
              </div>

              {/* Coupon Highlight Banner */}
              <div className="pt-2 border-t border-[#292F33]/70">
                <CouponBadge variant="banner" sourcePage="single-page-result" />
              </div>
            </div>

            {/* Safety Alerts if applicable */}
            {assessment.safety_evaluation.warnings.length > 0 && (
              <div className="p-5 rounded-2xl bg-[#1f1313] border border-[#ff4d4d]/40 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#ff6b6b] font-black uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Avisos de Segurança da Triagem</span>
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

            {/* Profile Scores Radar */}
            <RadarScores scores={assessment.structured_profile.scores} />

            {/* Selected Products (3 to 5 items strictly from database) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase text-[#B6FF3B] tracking-wider">
                    Catálogo Oficial Verificado
                  </div>
                  <h2 className="text-2xl font-black uppercase text-[#F5F7F8]">
                    Suplementos Selecionados ({assessment.recommendations.length})
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

            {/* Legal Disclaimer */}
            <div className="p-5 rounded-2xl bg-[#111416] border border-[#292F33] text-xs text-[#929A9F] space-y-2 leading-relaxed">
              <div className="flex items-center gap-2 text-[#F5F7F8] font-bold">
                <ShieldAlert className="w-4 h-4 text-[#B6FF3B]" />
                <span>Aviso Legal & Diretrizes de Uso</span>
              </div>
              <p>
                Este guia possui caráter informativo e educacional e foi elaborado a partir das informações fornecidas pelo usuário e do catálogo cadastrado na plataforma. Ele não substitui avaliação, diagnóstico, prescrição ou acompanhamento de médico, nutricionista ou outro profissional habilitado.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-[#292F33] py-6 text-center text-xs text-[#929A9F]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>BRIGADEIRO FIT AI • Growth Supplements + Oficial Farma</span>
          <span>Cupom de desconto: <strong className="text-[#B6FF3B] font-mono">BRIGADEIRO</strong></span>
        </div>
      </footer>
    </div>
  );
}
