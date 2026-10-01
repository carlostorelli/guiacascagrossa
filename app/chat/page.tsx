'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { MissingFieldsCards } from '@/components/chat/MissingFieldsCards';
import { SafetyScreening } from '@/components/chat/SafetyScreening';
import { LoadingProgress } from '@/components/chat/LoadingProgress';
import { CouponBadge } from '@/components/ui/CouponBadge';
import { UserProfile, Assessment } from '@/types';
import { Send, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

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

type Stage = 'chat' | 'missing' | 'safety' | 'loading';

export default function ChatPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('chat');
  const [inputText, setInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [rawTextHistory, setRawTextHistory] = useState<string>('');
  const [createdAssessmentId, setCreatedAssessmentId] = useState<string | null>(null);

  const [messages, setMessages] = useState<
    { sender: 'ai' | 'user'; text: string; time: string }[]
  >([
    {
      sender: 'ai',
      text: 'Olá! Sou o assistente do Guia Casca Grossa de Marcelo Brigadeiro. Vamos montar seu plano personalizado de suplementação a partir do catálogo oficial. Qual é o principal resultado que você está buscando?',
      time: 'Agora',
    },
  ]);

  const quickPrompts = [
    'Quero ganhar massa muscular, treino 5x por semana mas durmo mal',
    'Foco em emagrecimento, retenção de líquidos e disposição durante o dia',
    'Tenho baixa energia, estresse alto e digestão pesada',
    'Sou vegetariano, treino crossfit e quero melhorar rendimento',
  ];

  const handleSendInitialText = async (textToSend: string) => {
    if (!textToSend.trim() || isExtracting) return;

    const userMessage = textToSend.trim();
    setInputText('');
    setRawTextHistory(userMessage);

    // Append user message
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userMessage, time: 'Agora' },
    ]);

    setIsExtracting(true);

    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage }),
      });

      const data = await res.json();
      const extracted = data.profile || {};

      // Merge extracted fields into profile
      const updatedProfile: UserProfile = {
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

      setProfile(updatedProfile);

      // Check if missing critical fields
      const hasGoal = updatedProfile.goal.length > 0;
      const hasFreq = updatedProfile.training.frequency !== null;
      const hasSleep = updatedProfile.scores.sleep !== null;
      const hasEnergy = updatedProfile.scores.energy !== null;

      if (!hasGoal || !hasFreq || !hasSleep || !hasEnergy) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'Perfeito! Já entendi o contexto principal. Para calibrar a indicação e dosagem de forma exata, responda os pontos rápidos abaixo.',
            time: 'Agora',
          },
        ]);
        setStage('missing');
      } else {
        // Direct to safety
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'Excelente! Perfil registrado com sucesso. Agora vamos à nossa triagem obrigatória de segurança.',
            time: 'Agora',
          },
        ]);
        setStage('safety');
      }
    } catch {
      // On error, proceed to complementary cards
      setStage('missing');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFinishMissing = () => {
    setMessages((prev) => [
      ...prev,
      {
        sender: 'ai',
        text: 'Ótimo, perfil completo! Agora realize a checagem obrigatória de segurança antes de consultarmos o catálogo.',
        time: 'Agora',
      },
    ]);
    setStage('safety');
  };

  const handleGenerateGuide = async () => {
    setStage('loading');

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          raw_text: rawTextHistory,
          user_name: profile.name || 'Atleta',
        }),
      });

      const data = await res.json();
      if (data.assessment && data.assessment.id) {
        setCreatedAssessmentId(data.assessment.id);
        // Save into local history as well
        if (typeof window !== 'undefined') {
          const currentHistory = JSON.parse(localStorage.getItem('brigadeiro_history') || '[]');
          currentHistory.unshift(data.assessment);
          localStorage.setItem('brigadeiro_history', JSON.stringify(currentHistory));
        }
      }
    } catch {
      // handled
    }
  };

  const handleLoadingFinished = () => {
    if (createdAssessmentId) {
      router.push(`/guia/${createdAssessmentId}`);
    } else {
      router.push('/guia/latest');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080A0B] text-[#F5F7F8]">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
        {/* Chat Title & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292F33] pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#B6FF3B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assistente Interativo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#F5F7F8] tracking-tight">
              Vamos montar seu guia.
            </h1>
          </div>

          <CouponBadge sourcePage="chat-header" />
        </div>

        {/* Progress Bar of Stages */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase tracking-wider">
          <div
            className={`py-2 px-3 rounded-lg border transition-all ${
              stage === 'chat' || stage === 'missing'
                ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                : 'bg-[#111416] border-[#292F33] text-[#929A9F]'
            }`}
          >
            1. Perfil & Rotina
          </div>
          <div
            className={`py-2 px-3 rounded-lg border transition-all ${
              stage === 'safety'
                ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                : 'bg-[#111416] border-[#292F33] text-[#929A9F]'
            }`}
          >
            2. Segurança & Triagem
          </div>
          <div
            className={`py-2 px-3 rounded-lg border transition-all ${
              stage === 'loading'
                ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                : 'bg-[#111416] border-[#292F33] text-[#929A9F]'
            }`}
          >
            3. Guia Personalizado
          </div>
        </div>

        {/* Messages Stream */}
        <div className="space-y-4 pt-2">
          {messages.map((m, idx) => (
            <ChatMessage key={idx} sender={m.sender} text={m.text} time={m.time} />
          ))}
        </div>

        {/* STAGE 1: CHAT INPUT */}
        {stage === 'chat' && (
          <div className="space-y-4 pt-4">
            {/* Quick Prompt Suggestions */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#929A9F] uppercase tracking-wider">
                Exemplos de respostas rápidas:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(qp);
                      handleSendInitialText(qp);
                    }}
                    className="text-xs bg-[#111416] hover:bg-[#181C1F] border border-[#292F33] hover:border-[#B6FF3B]/40 text-[#929A9F] hover:text-[#F5F7F8] px-3 py-1.5 rounded-lg transition-all text-left cursor-pointer"
                  >
                    &ldquo;{qp}&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendInitialText(inputText);
              }}
              className="relative"
            >
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ex: Tenho 32 anos, treino 5x por semana musculação, quero ganhar massa, mas estou acordando cansado e meu sono não é reparador..."
                className="w-full bg-[#111416] border border-[#292F33] focus:border-[#B6FF3B] rounded-2xl p-4 text-sm text-[#F5F7F8] placeholder-[#929A9F]/50 outline-none resize-none transition-all pr-14"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isExtracting}
                className="absolute bottom-4 right-3 p-2.5 rounded-xl bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
                title="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STAGE 2: MISSING FIELDS */}
        {stage === 'missing' && (
          <MissingFieldsCards
            profile={profile}
            onChange={setProfile}
            onComplete={handleFinishMissing}
          />
        )}

        {/* STAGE 3: SAFETY SCREENING */}
        {stage === 'safety' && (
          <SafetyScreening
            profile={profile}
            onChange={setProfile}
            onSubmit={handleGenerateGuide}
            isLoading={false}
          />
        )}

        {/* STAGE 4: LOADING SEQUENCE */}
        {stage === 'loading' && (
          <LoadingProgress onFinished={handleLoadingFinished} />
        )}
      </main>

      <Footer />
    </div>
  );
}
