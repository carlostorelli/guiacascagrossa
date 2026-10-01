import { NextResponse } from 'next/server';
import { getAllAssessments } from '@/lib/db/products';

export async function GET() {
  const assessments = getAllAssessments();
  return NextResponse.json({ assessments });
}
