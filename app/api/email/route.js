import { NextResponse } from 'next/server';
import { getPortfolio } from '@/lib/storage';
import { getPortfolioPerformance, getRecommendations } from '@/lib/stockData';
import { sendDailyEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST — manually trigger an email send
export async function POST() {
  try {
    const [tickers, recommendations] = await Promise.all([
      getPortfolio(),
      getRecommendations(125),
    ]);

    const portfolio = await getPortfolioPerformance(tickers);
    await sendDailyEmail({ portfolio, recommendations });

    return NextResponse.json({
      success: true,
      message: `Email sent to ${process.env.RECIPIENT_EMAIL}`,
      portfolioCount: portfolio.length,
      recommendationCount: recommendations.length,
    });
  } catch (err) {
    console.error('[/api/email] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
