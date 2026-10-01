'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types';
import { ShieldAlert, AlertTriangle, Check, ShieldCheck, Heart } from 'lucide-react';

interface SafetyScreeningProps {
  profile: UserProfile;
  onChange: (updated: UserProfile) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function SafetyScreening({
  profile,
  onChange,
  onSubmit,
  isLoading,
}: SafetyScreeningProps) {
  const [hasMeds, setHasMeds] = useState(profile.medications.length > 0);
  const [medsText, setMedsText] = useState(profile.medications.join(', '));

  const [hasConditions, setHasConditions] = useState(profile.health_conditions.length > 0);
  const [conditionsText, setConditionsText] = useState(profile.health_conditions.join(', '));

  const [hasAllergies, setHasAllergies] = useState(profile.allergies.length > 0);
  const [allergiesText, setAllergiesText] = useState(profile.allergies.join(', '));

  const handleUpdate = () => {
    const meds = hasMeds && medsText ? medsText.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const conds = hasConditions && conditionsText ? conditionsText.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const allgs = hasAllergies && allergiesText ? allergiesText.split(',').map((s) => s.trim()).filter(Boolean) : [];

    onChange({
      ...profile,
      medications: meds,
      health_conditions: conds,
      allergies: allgs,
    });
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Safety Header Badge */}
      <div className="p-4 rounded-xl bg-[#111416] border border-[#B6FF3B]/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-black text-[#B6FF3B] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#B6FF3B]" />
          <span>Etapa Obrigatória de Segurança & Triagem</span>
        </div>
        <p className="text-xs text-[#929A9F] leading-relaxed">
          Suplementação responsável exige checagem prévia. O sistema cruza essas respostas com contraindicações clínicas do catálogo.
        </p>
      </div>

      {/* 1. Medicamentos contínuos */}
      <div className="p-4 rounded-xl bg-[#111416] border border-[#292F33] space-y-3">
        <div className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wide">
          1. Você usa algum medicamento continuamente?
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setHasMeds(true);
              handleUpdate();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
              hasMeds
                ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                : 'bg-[#181C1F] border-[#292F33] text-[#929A9F]'
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => {
              setHasMeds(false);
              setMedsText('');
              onChange({ ...profile, medications: [] });
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
              !hasMeds
                ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                : 'bg-[#181C1F] border-[#292F33] text-[#929A9F]'
            }`}
          >
            Não
          </button>
        </div>

        {hasMeds && (
          <div className="pt-2">
            <input
              type="text"
              placeholder="Ex: Anticoagulante, pressão, ansiolítico, estatina..."
              value={medsText}
              onChange={(e) => {
                setMedsText(e.target.value);
                const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                onChange({ ...profile, medications: list });
              }}
              className="w-full bg-[#080A0B] border border-[#292F33] focus:border-[#B6FF3B] text-xs text-[#F5F7F8] px-3 py-2 rounded-lg outline-none"
            />
          </div>
        )}
      </div>

      {/* 2. Condições diagnosticadas */}
      <div className="p-4 rounded-xl bg-[#111416] border border-[#292F33] space-y-3">
        <div className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wide">
          2. Possui alguma condição de saúde diagnosticada?
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setHasConditions(true);
              handleUpdate();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
              hasConditions
                ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                : 'bg-[#181C1F] border-[#292F33] text-[#929A9F]'
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => {
              setHasConditions(false);
              setConditionsText('');
              onChange({ ...profile, health_conditions: [] });
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
              !hasConditions
                ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                : 'bg-[#181C1F] border-[#292F33] text-[#929A9F]'
            }`}
          >
            Não
          </button>
        </div>

        {hasConditions && (
          <div className="pt-2">
            <input
              type="text"
              placeholder="Ex: Hipertensão, problema renal, diabetes, gastrite..."
              value={conditionsText}
              onChange={(e) => {
                setConditionsText(e.target.value);
                const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                onChange({ ...profile, health_conditions: list });
              }}
              className="w-full bg-[#080A0B] border border-[#292F33] focus:border-[#B6FF3B] text-xs text-[#F5F7F8] px-3 py-2 rounded-lg outline-none"
            />
          </div>
        )}
      </div>

      {/* 3. Gravidez ou Amamentação */}
      <div className="p-4 rounded-xl bg-[#111416] border border-[#292F33] space-y-3">
        <div className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wide">
          3. Está grávida ou amamentando?
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...profile, pregnant_or_breastfeeding: true })}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
              profile.pregnant_or_breastfeeding
                ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                : 'bg-[#181C1F] border-[#292F33] text-[#929A9F]'
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...profile, pregnant_or_breastfeeding: false })}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
              !profile.pregnant_or_breastfeeding
                ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                : 'bg-[#181C1F] border-[#292F33] text-[#929A9F]'
            }`}
          >
            Não
          </button>
        </div>
      </div>

      {/* 4. Alergias conhecidas */}
      <div className="p-4 rounded-xl bg-[#111416] border border-[#292F33] space-y-3">
        <div className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wide">
          4. Possui alguma alergia alimentar conhecida?
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setHasAllergies(true);
              handleUpdate();
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
              hasAllergies
                ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                : 'bg-[#181C1F] border-[#292F33] text-[#929A9F]'
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => {
              setHasAllergies(false);
              setAllergiesText('');
              onChange({ ...profile, allergies: [] });
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
              !hasAllergies
                ? 'bg-[#B6FF3B]/10 border-[#B6FF3B] text-[#B6FF3B]'
                : 'bg-[#181C1F] border-[#292F33] text-[#929A9F]'
            }`}
          >
            Não
          </button>
        </div>

        {hasAllergies && (
          <div className="pt-2">
            <input
              type="text"
              placeholder="Ex: Leite / Soro, Peixes e frutos do mar, Soja, Glúten..."
              value={allergiesText}
              onChange={(e) => {
                setAllergiesText(e.target.value);
                const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                onChange({ ...profile, allergies: list });
              }}
              className="w-full bg-[#080A0B] border border-[#292F33] focus:border-[#B6FF3B] text-xs text-[#F5F7F8] px-3 py-2 rounded-lg outline-none"
            />
          </div>
        )}
      </div>

      {/* 5. Campo aberto */}
      <div className="p-4 rounded-xl bg-[#111416] border border-[#292F33] space-y-2">
        <label className="text-xs font-bold text-[#F5F7F8] uppercase tracking-wide block">
          Existe alguma informação de saúde adicional que você considera importante?
        </label>
        <textarea
          rows={2}
          placeholder="Ex: Sinto azia com facilidade, sinto dores no joelho após correr..."
          value={profile.additional_health_info || ''}
          onChange={(e) => onChange({ ...profile, additional_health_info: e.target.value })}
          className="w-full bg-[#080A0B] border border-[#292F33] focus:border-[#B6FF3B] text-xs text-[#F5F7F8] p-3 rounded-lg outline-none resize-none"
        />
      </div>

      {/* Legal & Medical Notice */}
      <div className="p-3.5 rounded-xl bg-[#181C1F] border border-[#292F33] flex items-start gap-3 text-xs text-[#929A9F]">
        <ShieldAlert className="w-5 h-5 text-[#B6FF3B] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          O assistente não diagnostica doenças nem substitui consultas com médicos ou nutricionistas. O objetivo é fornecer uma curadoria educativa sobre os produtos do catálogo.
        </p>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={onSubmit}
          className="w-full py-4 bg-[#B6FF3B] hover:bg-[#a6ec31] text-[#080A0B] text-sm font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 neon-glow cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Analisando Catálogo...' : 'GERAR MEU GUIA PERSONALIZADO →'}
        </button>
      </div>
    </div>
  );
}
