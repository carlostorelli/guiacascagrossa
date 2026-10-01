import { NextRequest, NextResponse } from 'next/server';
import { recordCouponEvent } from '@/lib/db/products';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, coupon, source_page } = body;

    const event = recordCouponEvent({
      type: type || 'copy',
      coupon: coupon || 'BRIGADEIRO',
      source_page: source_page || 'unknown',
    });

    return NextResponse.json({ success: true, event });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao rastrear cupom';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
