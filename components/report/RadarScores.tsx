import React from 'react';
import { UserProfile } from '@/types';
import { Moon, Zap, Flame, Brain, Heart, Activity } from 'lucide-react';

interface RadarScoresProps {
  scores: UserProfile['scores'];
}

export function RadarScores({ scores }: RadarScoresProps) {
  const metrics = [
    { label: 'Sono', val: scores.sleep ?? 7, icon: Moon, color: '#B6FF3B' },
    { label: 'Energia', val: scores.energy ?? 7, icon: Zap, color: '#B6FF3B' },
    { label: 'Estresse', val: scores.stress ?? 5, icon: Flame, color: '#FF7B54' },
    { label: 'Foco', val: scores.focus ?? 7, icon: Brain, color: '#68B984' },
    { label: 'Libido', val: scores.libido ?? 7, icon: Heart, color: '#E14D2A' },
    { label: 'Digestão', val: scores.digestion ?? 8, icon: Activity, color: '#3E8E7E' },
  ];

  return (
    <div className="bg-[#111416] border border-[#292F33] rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase text-[#B6FF3B] tracking-wider">
            Diagnóstico de Rotina
          </div>
          <h3 className="text-lg font-black uppercase text-[#F5F7F8]">
            Seu Perfil Atual (Escala 0 a 10)
          </h3>
        </div>
        <div className="text-xs text-[#929A9F]">Métricas Subjetivas</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          const percentage = (m.val / 10) * 100;

          return (
            <div
              key={idx}
              className="bg-[#181C1F] border border-[#292F33] rounded-xl p-4 space-y-2.5 hover:border-[#B6FF3B]/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#111416] border border-[#292F33] flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-[#B6FF3B]" />
                  </div>
                  <span className="text-xs font-bold text-[#F5F7F8]">{m.label}</span>
                </div>
                <span className="font-mono text-sm font-black text-[#B6FF3B]">
                  {m.val}
                  <span className="text-xs text-[#929A9F] font-normal">/10</span>
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-[#111416] h-2 rounded-full overflow-hidden border border-[#292F33]">
                <div
                  className="bg-gradient-to-r from-[#B6FF3B] to-[#7be600] h-full rounded-full transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
