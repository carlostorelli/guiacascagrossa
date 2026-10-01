import { NextRequest, NextResponse } from 'next/server';
import { getAssessment } from '@/lib/db/products';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const assessment = getAssessment(id);

  if (!assessment) {
    return NextResponse.json({ error: 'Guia não encontrado' }, { status: 404 });
  }

  return NextResponse.json({ assessment });
}
