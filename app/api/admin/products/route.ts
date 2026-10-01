import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '@/lib/db/products';

export async function GET() {
  const products = getAllProducts(true);
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Nome do produto é obrigatório' }, { status: 400 });
    }

    const created = addProduct(data);
    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar produto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...updates } = data;
    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    const updated = updateProduct(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar produto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const deleted = deleteProduct(id);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao excluir produto';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
