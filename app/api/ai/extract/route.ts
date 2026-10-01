import { NextRequest, NextResponse } from 'next/server';
import { extractProfileWithAI } from '@/lib/ai/provider';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 });
    }

    const profile = await extractProfileWithAI(text);
    return NextResponse.json({ profile });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao processar texto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
