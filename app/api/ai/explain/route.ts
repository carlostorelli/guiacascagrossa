import { NextRequest, NextResponse } from 'next/server';
import { personalizeProductReasons } from '@/lib/ai/provider';
import { RecommendedProduct, UserProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { recommendations, profile } = (await req.json()) as {
      recommendations: RecommendedProduct[];
      profile: UserProfile;
    };

    if (!recommendations || !profile) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const personalized = await personalizeProductReasons(recommendations, profile);
    return NextResponse.json({ recommendations: personalized });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao personalizar explicações';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
