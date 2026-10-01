import { NextRequest, NextResponse } from 'next/server';
import { UserProfile, Assessment } from '@/types';
import { evaluateSafety } from '@/lib/safety/screening';
import { generateRecommendations } from '@/lib/recommendation/engine';
import { personalizeProductReasons } from '@/lib/ai/provider';
import { saveAssessment } from '@/lib/db/products';

export async function POST(req: NextRequest) {
  try {
    const { profile, raw_text, user_name } = (await req.json()) as {
      profile: UserProfile;
      raw_text?: string;
      user_name?: string;
    };

    if (!profile) {
      return NextResponse.json({ error: 'Perfil do usuário é obrigatório' }, { status: 400 });
    }

    // 1. Safety Screening
    const safetyEvaluation = evaluateSafety(profile);

    // 2. Deterministic Recommendation Engine
    const initialRecommendations = generateRecommendations(profile, safetyEvaluation);

    // 3. AI Explanation & Context Personalization
    const personalizedRecommendations = await personalizeProductReasons(
      initialRecommendations,
      profile
    );

    // 4. Build Assessment Entity
    const assessmentId = `guide-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const assessment: Assessment = {
      id: assessmentId,
      user_name: user_name || profile.name || 'Atleta',
      raw_text: raw_text || '',
      structured_profile: profile,
      safety_evaluation: safetyEvaluation,
      recommendations: personalizedRecommendations,
      created_at: new Date().toISOString(),
    };

    saveAssessment(assessment);

    return NextResponse.json({ assessment });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao gerar recomendação';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
