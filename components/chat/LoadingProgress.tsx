'use client';

import React, { useEffect, useState } from 'react';
import { Dumbbell, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface LoadingProgressProps {
  onFinished?: () => void;
}

const STEPS = [
  'Entendendo seu perfil...',
  'Analisando seus objetivos...',
  'Verificando informações de segurança...',
  'Consultando nosso catálogo...',
  'Organizando suas prioridades...',
  'Criando seu guia...',
  'Seu guia está pronto.',
];

export function LoadingProgress({ onFinished }: LoadingProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          if (onFinished) {
            setTimeout(onFinished, 600);
          }
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(timer);
  }, [onFinished]);

  return (
    <div className="py-12 px-4 max-w-md mx-auto text-center space-y-8">
      {/* Animated Icon */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="absolute inset-0 rounded-full border-2 border-[#292F33] animate-ping opacity-25" />
        <div className="w-20 h-20 rounded-2xl bg-[#111416] border border-[#B6FF3B] flex items-center justify-center neon-glow-strong">
          <Dumbbell className="w-9 h-9 text-[#B6FF3B] animate-bounce-subtle" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black uppercase tracking-tight text-[#F5F7F8]">
          Processando Recomendações
        </h3>
        <p className="text-xs text-[#929A9F]">
          Cruzando evidências com os catálogos Growth e Oficial Farma
        </p>
      </div>

      {/* Progress Step List */}
      <div className="bg-[#111416] border border-[#292F33] rounded-2xl p-5 space-y-3.5 text-left">
        {STEPS.map((stepText, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs transition-all ${
                isDone
                  ? 'text-[#B6FF3B] font-bold'
                  : isCurrent
                  ? 'text-[#F5F7F8] font-extrabold scale-102'
                  : 'text-[#929A9F]/40'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-[#B6FF3B] shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-[#B6FF3B] animate-spin shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full border border-[#292F33] shrink-0" />
              )}
              <span>{stepText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
