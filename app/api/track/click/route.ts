import { NextRequest, NextResponse } from 'next/server';
import { recordProductClick } from '@/lib/db/products';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_id, brand_id, assessment_id, destination_url, user_id } = body;

    if (!product_id || !brand_id || !destination_url) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const event = recordProductClick({
      product_id,
      brand_id,
      assessment_id,
      destination_url,
      user_id,
    });

    return NextResponse.json({ success: true, event });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao rastrear clique';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
