import { UserProfile, RecommendedProduct } from '@/types';

// Deterministic natural language fallback parser for profile extraction
export function fallbackExtractProfile(text: string): Partial<UserProfile> {
  const lower = text.toLowerCase();
  const profile: Partial<UserProfile> = {
    goal: [],
    training: { type: null, frequency: null },
    scores: { sleep: null, energy: null, stress: null, focus: null, libido: null, digestion: null },
    medications: [],
    health_conditions: [],
    allergies: [],
    pregnant_or_breastfeeding: false,
  };

  // Extract Age
  const ageMatch = lower.match(/(?:tenho|idade|minha idade|sou de)\s*(\d{1,2})\s*anos?/i) || lower.match(/(\d{1,2})\s*anos/i);
  if (ageMatch) {
    profile.age = parseInt(ageMatch[1], 10);
  }

  // Extract Training Frequency
  const freqMatch = lower.match(/(\d{1})\s*(?:x|vezes|dias)\s*(?:por|\/|na)\s*semana/i) || lower.match(/treino\s*(\d{1})\s*(?:x|vezes|dias)/i);
  if (freqMatch) {
    profile.training!.frequency = parseInt(freqMatch[1], 10);
  }

  // Extract Training Type
  if (lower.includes('muscula') || lower.includes('academia') || lower.includes('pesos') || lower.includes('hipertrofia')) {
    profile.training!.type = 'musculacao';
  } else if (lower.includes('crossfit')) {
    profile.training!.type = 'crossfit';
  } else if (lower.includes('corrida') || lower.includes('corro') || lower.includes('maratona')) {
    profile.training!.type = 'corrida';
  } else if (lower.includes('casa') || lower.includes('calistenia')) {
    profile.training!.type = 'treino_em_casa';
  }

  // Goals
  if (lower.includes('massa') || lower.includes('hipertrofia') || lower.includes('crescer') || lower.includes('musculo')) {
    profile.goal!.push('hipertrofia');
  }
  if (lower.includes('emagrecer') || lower.includes('secar') || lower.includes('perder peso') || lower.includes('gordura')) {
    profile.goal!.push('emagrecimento');
  }
  if (lower.includes('performance') || lower.includes('desempenho') || lower.includes('forca')) {
    profile.goal!.push('performance');
  }
  if (lower.includes('saude') || lower.includes('longevidade') || lower.includes('imunidade')) {
    profile.goal!.push('saude_geral');
  }

  // Sleep issues
  if (lower.includes('dormindo mal') || lower.includes('sono ruim') || lower.includes('insonia') || lower.includes('acordo cansado') || lower.includes('sono fraco')) {
    profile.scores!.sleep = 3;
    profile.goal!.push('sono');
  } else if (lower.includes('durmo bem') || lower.includes('sono otimo')) {
    profile.scores!.sleep = 9;
  }

  // Energy
  if (lower.includes('cansado') || lower.includes('sem energia') || lower.includes('desanimado') || lower.includes('baixa disposicao') || lower.includes('fadiga')) {
    profile.scores!.energy = 3;
    profile.goal!.push('energia');
  } else if (lower.includes('muita energia') || lower.includes('disposto')) {
    profile.scores!.energy = 9;
  }

  // Stress
  if (lower.includes('estressado') || lower.includes('estresse alto') || lower.includes('ansioso') || lower.includes('ansiedade')) {
    profile.scores!.stress = 8;
  }

  // Digestion
  if (lower.includes('estomago') || lower.includes('azia') || lower.includes('refluxo') || lower.includes('estufamento') || lower.includes('intestino preso')) {
    profile.scores!.digestion = 4;
  }

  // Lactose
  if (lower.includes('intoleran') && lower.includes('lactose')) {
    profile.lactose_intolerance = true;
  }

  // Diet
  if (lower.includes('vegano')) {
    profile.dietary_pattern = 'vegano';
  } else if (lower.includes('vegetariano')) {
    profile.dietary_pattern = 'vegetariano';
  }

  // Pregnancy
  if (lower.includes('gravida') || lower.includes('gestante') || lower.includes('amamentando') || lower.includes('lactante')) {
    profile.pregnant_or_breastfeeding = true;
  }

  return profile;
}

// AI Extraction Call (Gemini or OpenAI or Fallback)
export async function extractProfileWithAI(userText: string): Promise<Partial<UserProfile>> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Você é um extrator de perfis esportivos e nutricionais. Extraia as informações do texto do usuário em formato JSON estrito sem markdown.
Campos possíveis:
- age (número ou null)
- sex ("masculino", "feminino", "outro" ou null)
- goal (array de strings: "hipertrofia", "emagrecimento", "performance", "saude_geral", "sono", "energia", "libido", "digestao")
- training: { type: string ou null, frequency: number ou null }
- scores: { sleep: number(0-10) ou null, energy: number(0-10) ou null, stress: number(0-10) ou null, focus: number(0-10) ou null, libido: number(0-10) ou null, digestion: number(0-10) ou null }
- diet: "ruim", "razoavel", "boa", "muito_boa" ou null
- lactose_intolerance: boolean ou null
- dietary_pattern: "onivoro", "vegetariano", "vegano" ou null
- medications: array de strings
- health_conditions: array de strings
- allergies: array de strings
- pregnant_or_breastfeeding: boolean

Texto do usuário: "${userText}"`,
                  },
                ],
              },
            ],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonStr) {
          return JSON.parse(jsonStr);
        }
      }
    } catch {
      // fallback
    }
  }

  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Extraia as informações do usuário para um perfil em JSON estrito. Campos: age, sex, goal (array), training ({type, frequency}), scores ({sleep, energy, stress, focus, libido, digestion}), diet, lactose_intolerance, dietary_pattern, medications, health_conditions, allergies, pregnant_or_breastfeeding.',
            },
            { role: 'user', content: userText },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const jsonStr = data.choices?.[0]?.message?.content;
        if (jsonStr) {
          return JSON.parse(jsonStr);
        }
      }
    } catch {
      // fallback
    }
  }

  // Fallback to deterministic regex parser
  return fallbackExtractProfile(userText);
}

// AI Personalized Product Explanation
export async function personalizeProductReasons(
  recommendations: RecommendedProduct[],
  profile: UserProfile
): Promise<RecommendedProduct[]> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    // If no keys, customize with profile metrics deterministically
    return recommendations.map((rec) => {
      let personalized = rec.reason;
      if (rec.matchedGoalOrNeed === 'sono' && profile.scores.sleep !== null) {
        personalized = `Com sua pontuação de sono em ${profile.scores.sleep}/10, este suplemento foi priorizado para normalizar seu ciclo circadiano e potencializar a recuperação muscular noturna.`;
      } else if (rec.matchedGoalOrNeed === 'energia' && profile.scores.energy !== null) {
        personalized = `Você indicou nível de disposição em ${profile.scores.energy}/10. Esta formulação atua nos carreadores mitocondriais para fornecer suporte contínuo sem efeito rebote.`;
      } else if (rec.matchedGoalOrNeed === 'hipertrofia') {
        personalized = `Para sua rotina de treinos de ${profile.training.frequency || 5}x na semana com foco em hipertrofia, este item é o padrão-ouro do catálogo para estímulo de síntese de proteínas e ressíntese de energia rápida.`;
      } else if (rec.matchedGoalOrNeed === 'emagrecimento') {
        personalized = `Alinhado ao seu objetivo de emagrecimento, atua na saciedade e no suporte metabólico seguro a partir dos ativos cadastrados.`;
      }
      return {
        ...rec,
        reason: personalized,
      };
    });
  }

  // AI prompt for personalized explanations
  try {
    const prompt = `Você é o assistente do Guia Casca Grossa de Marcelo Brigadeiro. Personalize as justificativas para cada um dos produtos abaixo com base no perfil do usuário.
IMPORTANTE:
- Não altere os produtos selecionados.
- Não altere as instruções de uso.
- Seja direto, técnico e encorajador (Gym Dark / Performance).
- Retorne apenas um array JSON de strings com as justificativas na mesma ordem dos produtos.

Perfil: ${JSON.stringify(profile)}
Produtos: ${JSON.stringify(
      recommendations.map((r) => ({ name: r.product.name, brand: r.product.brand, need: r.matchedGoalOrNeed }))
    )}`;

    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const reasons = JSON.parse(jsonStr);
        if (Array.isArray(reasons)) {
          return recommendations.map((rec, i) => ({
            ...rec,
            reason: reasons[i] || rec.reason,
          }));
        }
      }
    }
  } catch {
    // ignore and return default
  }

  return recommendations;
}
