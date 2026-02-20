import { NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/storage';
import { getPortfolioPerformance } from '@/lib/stockData';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  try {
    const tickers = await getPortfolio();
    const performance = await getPortfolioPerformance(tickers);
    return NextResponse.json({ success: true, data: performance });
  } catch (err) {
    console.error('[/api/performance] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
