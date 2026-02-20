import { NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/storage';
import { getPortfolioPerformance, getRecommendations } from '@/lib/stockData';
import { sendDailyEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 60;

// GET — called by Vercel Cron at 14:00 UTC (9 AM ET) every day
export async function GET(request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [tickers, recommendations] = await Promise.all([
      getPortfolio(),
      getRecommendations(125),
    ]);

    const portfolio = await getPortfolioPerformance(tickers);
    await sendDailyEmail({ portfolio, recommendations });

    const timestamp = new Date().toISOString();
    console.log(`[cron] Daily email sent at ${timestamp}`);

    return NextResponse.json({
      success: true,
      timestamp,
      portfolioCount: portfolio.length,
      recommendationCount: recommendations.length,
    });
  } catch (err) {
    console.error('[/api/cron] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
