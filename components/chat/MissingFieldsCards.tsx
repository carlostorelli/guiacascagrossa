'use client';

import React from 'react';
import { UserProfile } from '@/types';
import { Check, Dumbbell, Sparkles } from 'lucide-react';

interface MissingFieldsCardsProps {
  profile: UserProfile;
  onChange: (updated: UserProfile) => void;
  onComplete: () => void;
}

export function MissingFieldsCards({
  profile,
  onChange,
  onComplete,
}: MissingFieldsCardsProps) {
  // Update helpers
  const setGoal = (val: string) => {
    const goals = profile.goal.includes(val)
      ? profile.goal.filter((g) => g !== val)
      : [...profile.goal, val];
    onChange({ ...profile, goal: goals });
  };

  const setScore = (key: keyof UserProfile['scores'], val: number) => {
    onChange({
      ...profile,
      scores: { ...profile.scores, [key]: val },
    });
  };

  const setTrainingFreq = (freq: number) => {
    onChange({
      ...profile,
      training: { ...profile.training, frequency: freq },
    });
  };

  const setTrainingType = (type: string) => {
    onChange({
      ...profile,
      training: { ...profile.training, type },
    });
  };

  const setDiet = (diet: UserProfile['diet']) => {
    onChange({ ...profile, diet });
  };

  const setLactose = (lactose_intolerance: UserProfile['lactose_intolerance']) => {
    onChange({ ...profile, lactose_intolerance });
  };

  const setDietaryPattern = (pattern: UserProfile['dietary_pattern']) => {
    onChange({ ...profile, dietary_pattern: pattern });
  };

  // Determine what is still missing
  const needsGoal = profile.goal.length === 0;
  const needsFreq = profile.training.frequency === null;
  const needsType = profile.training.type === null;
  const needsSleep = profile.scores.sleep === null;
  const needsEnergy = profile.scores.energy === null;
  const needsStress = profile.scores.stress === null;
  const needsFocus = profile.scores.focus === null;
  const needsLibido = profile.scores.libido === null;
  const needsDigestion = profile.scores.digestion === null;
  const needsDiet = profile.diet === null;
  const needsLactose = profile.lactose_intolerance === null;
  const needsPattern = profile.dietary_pattern === null;

  return (
    <div className="space-y-6 pt-2">
      {/* Intro prompt */}
      <div className="p-4 rounded-xl bg-[#111416] border border-[#292F33] text-sm text-[#F5F7F8] space-y-1">
        <div className="font-extrabold text-[#B6FF3B] flex items-center gap-1.5 text-xs uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Informações Complementares</span>
        </div>
        <p className="text-xs text-[#929A9F]">
          Já registramos o que você nos contou. Responda apenas os pontos abaixo para calibrar seu guia com precisão.
        </p>
      </div>

      {/* 1. Goals (if missing) */}
      {needsGoal && (
        <div className="p-4 rounded-xl bg-[#111416] border border-[#292F33] space-y-3">
          <label className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wide block">
            Qual seu principal objetivo? (Selecione um ou mais)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'hipertrofia', label: 'Ganho de massa' },
              { id: 'emagrecimento', label: 'Emagrecimento' },
              { id: 'performance', label: 'Performance' },
              { id: 'saude_geral', label: 'Saúde geral' },
              { id: 'sono', label: 'Melhorar sono' },
              { id: 'energia', label: 'Melhorar disposição' },
            ].map((g) => {
              const active = profile.goal.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all text-left flex items-center justify-between ${
                    active
                      ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                      : 'bg-[#181C1F] border-[#292F33] text-[#929A9F] hover:text-[#F5F7F8] hover:border-[#384147]'
                  }`}
                >
                  <span>{g.label}</span>
                  {active && <Check className="w-3.5 h-3.5 text-[#B6FF3B]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Escalas 0 a 10 */}
      <div className="p-4 rounded-xl bg-[#111416] border border-[#292F33] space-y-5">
        <div className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wide">
          Avaliação de Bem-Estar e Rotina (0 a 10)
        </div>

        {/* Sono */}
        {needsSleep && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#F5F7F8] font-medium">Como está seu sono?</span>
              <span className="font-mono text-[#B6FF3B] font-bold">
                {profile.scores.sleep !== null ? `${profile.scores.sleep}/10` : 'Selecione'}
              </span>
            </div>
            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setScore('sleep', num)}
                  className={`py-1.5 text-xs font-bold rounded border transition-all ${
                    profile.scores.sleep === num
                      ? 'bg-[#B6FF3B] text-[#080A0B] border-[#B6FF3B]'
                      : 'bg-[#181C1F] border-[#292F33] text-[#929A9F] hover:border-[#B6FF3B]/50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Energia */}
        {needsEnergy && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#F5F7F8] font-medium">Como está sua disposição durante o dia?</span>
              <span className="font-mono text-[#B6FF3B] font-bold">
                {profile.scores.energy !== null ? `${profile.scores.energy}/10` : 'Selecione'}
              </span>
            </div>
            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setScore('energy', num)}
                  className={`py-1.5 text-xs font-bold rounded border transition-all ${
                    profile.scores.energy === num
                      ? 'bg-[#B6FF3B] text-[#080A0B] border-[#B6FF3B]'
                      : 'bg-[#181C1F] border-[#292F33] text-[#929A9F] hover:border-[#B6FF3B]/50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Estresse */}
        {needsStress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#F5F7F8] font-medium">Como está seu nível de estresse / ansiedade?</span>
              <span className="font-mono text-[#B6FF3B] font-bold">
                {profile.scores.stress !== null ? `${profile.scores.stress}/10` : 'Selecione'}
              </span>
            </div>
            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setScore('stress', num)}
                  className={`py-1.5 text-xs font-bold rounded border transition-all ${
                    profile.scores.stress === num
                      ? 'bg-[#B6FF3B] text-[#080A0B] border-[#B6FF3B]'
                      : 'bg-[#181C1F] border-[#292F33] text-[#929A9F] hover:border-[#B6FF3B]/50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Foco */}
        {needsFocus && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#F5F7F8] font-medium">Como está seu foco e clareza mental?</span>
              <span className="font-mono text-[#B6FF3B] font-bold">
                {profile.scores.focus !== null ? `${profile.scores.focus}/10` : 'Selecione'}
              </span>
            </div>
            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setScore('focus', num)}
                  className={`py-1.5 text-xs font-bold rounded border transition-all ${
                    profile.scores.focus === num
                      ? 'bg-[#B6FF3B] text-[#080A0B] border-[#B6FF3B]'
                      : 'bg-[#181C1F] border-[#292F33] text-[#929A9F] hover:border-[#B6FF3B]/50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Libido */}
        {needsLibido && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#F5F7F8] font-medium">Como está sua libido e vitalidade?</span>
              <span className="font-mono text-[#B6FF3B] font-bold">
                {profile.scores.libido !== null ? `${profile.scores.libido}/10` : 'Selecione'}
              </span>
            </div>
            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setScore('libido', num)}
                  className={`py-1.5 text-xs font-bold rounded border transition-all ${
                    profile.scores.libido === num
                      ? 'bg-[#B6FF3B] text-[#080A0B] border-[#B6FF3B]'
                      : 'bg-[#181C1F] border-[#292F33] text-[#929A9F] hover:border-[#B6FF3B]/50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Digestão */}
        {needsDigestion && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#F5F7F8] font-medium">Como está sua digestão e funcionamento intestinal?</span>
              <span className="font-mono text-[#B6FF3B] font-bold">
                {profile.scores.digestion !== null ? `${profile.scores.digestion}/10` : 'Selecione'}
              </span>
            </div>
            <div className="grid grid-cols-11 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setScore('digestion', num)}
                  className={`py-1.5 text-xs font-bold rounded border transition-all ${
                    profile.scores.digestion === num
                      ? 'bg-[#B6FF3B] text-[#080A0B] border-[#B6FF3B]'
                      : 'bg-[#181C1F] border-[#292F33] text-[#929A9F] hover:border-[#B6FF3B]/50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Treino */}
      {(needsFreq || needsType) && (
        <div className="p-4 rounded-xl bg-[#111416] border border-[#292F33] space-y-4">
          <div className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wide">
            Rotina de Treinamento
          </div>

          {needsFreq && (
            <div className="space-y-2">
              <span className="text-xs text-[#929A9F]">Quantas vezes você treina por semana?</span>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTrainingFreq(num)}
                    className={`flex-1 py-2 text-xs font-bold rounded border transition-all ${
                      profile.training.frequency === num
                        ? 'bg-[#B6FF3B] text-[#080A0B] border-[#B6FF3B]'
                        : 'bg-[#181C1F] border-[#292F33] text-[#929A9F] hover:border-[#B6FF3B]/50'
                    }`}
                  >
                    {num === 0 ? '0' : `${num}x`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {needsType && (
            <div className="space-y-2">
              <span className="text-xs text-[#929A9F]">Qual é o seu tipo principal de treino?</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'musculacao', label: 'Musculação' },
                  { id: 'crossfit', label: 'CrossFit' },
                  { id: 'corrida', label: 'Corrida' },
                  { id: 'esportes', label: 'Esportes' },
                  { id: 'treino_em_casa', label: 'Treino em casa' },
                  { id: 'outro', label: 'Outro' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrainingType(t.id)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all text-left ${
                      profile.training.type === t.id
                        ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                        : 'bg-[#181C1F] border-[#292F33] text-[#929A9F] hover:text-[#F5F7F8]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Alimentação e Intolerâncias */}
      {(needsDiet || needsLactose || needsPattern) && (
        <div className="p-4 rounded-xl bg-[#111416] border border-[#292F33] space-y-4">
          <div className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wide">
            Alimentação & Restrições
          </div>

          {needsDiet && (
            <div className="space-y-2">
              <span className="text-xs text-[#929A9F]">Como você considera sua alimentação habitual?</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'ruim', label: 'Ruim' },
                  { id: 'razoavel', label: 'Razoável' },
                  { id: 'boa', label: 'Boa' },
                  { id: 'muito_boa', label: 'Muito boa' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDiet(d.id as UserProfile['diet'])}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      profile.diet === d.id
                        ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                        : 'bg-[#181C1F] border-[#292F33] text-[#929A9F]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {needsLactose && (
            <div className="space-y-2">
              <span className="text-xs text-[#929A9F]">Possui intolerância à lactose?</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: true, label: 'Sim' },
                  { val: false, label: 'Não' },
                  { val: 'nao_sei', label: 'Não sei' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLactose(item.val as UserProfile['lactose_intolerance'])}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      profile.lactose_intolerance === item.val
                        ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                        : 'bg-[#181C1F] border-[#292F33] text-[#929A9F]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {needsPattern && (
            <div className="space-y-2">
              <span className="text-xs text-[#929A9F]">É vegetariano ou vegano?</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'onivoro', label: 'Não (Onívoro)' },
                  { id: 'vegetariano', label: 'Vegetariano' },
                  { id: 'vegano', label: 'Vegano' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setDietaryPattern(p.id as UserProfile['dietary_pattern'])}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      profile.dietary_pattern === p.id
                        ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                        : 'bg-[#181C1F] border-[#292F33] text-[#929A9F]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Button to proceed to safety */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onComplete}
          className="w-full py-3.5 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-sm font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 neon-glow cursor-pointer"
        >
          Avançar para Triagem de Segurança →
        </button>
      </div>
    </div>
  );
}
