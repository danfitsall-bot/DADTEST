import { NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/stockData';

export const runtime = 'nodejs';
export const maxDuration = 60; // seconds — scanning takes time

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const minGrowth = parseFloat(searchParams.get('min') || '125');

  try {
    const recommendations = await getRecommendations(minGrowth);
    return NextResponse.json({ success: true, data: recommendations, count: recommendations.length });
  } catch (err) {
    console.error('[/api/analyze] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
