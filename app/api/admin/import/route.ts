import { NextRequest, NextResponse } from 'next/server';
import { importProducts } from '@/lib/db/products';
import { Product } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { products } = (await req.json()) as { products: Partial<Product>[] };
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Nenhum produto enviado para importação' }, { status: 400 });
    }

    const result = importProducts(products);
    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro na importação de produtos';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
