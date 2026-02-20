import { NextResponse } from 'next/server';
import { getPortfolio, savePortfolio } from '@/lib/storage';

export const runtime = 'nodejs';

// GET — return current portfolio tickers
export async function GET() {
  try {
    const tickers = await getPortfolio();
    return NextResponse.json({ success: true, tickers });
  } catch (err) {
    console.error('[/api/portfolio GET] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST — add a ticker { ticker: "AAPL" }
export async function POST(request) {
  try {
    const body = await request.json();
    const ticker = (body.ticker || '').trim().toUpperCase();

    if (!ticker || !/^[A-Z.\-]{1,10}$/.test(ticker)) {
      return NextResponse.json({ success: false, error: 'Invalid ticker symbol' }, { status: 400 });
    }

    const tickers = await getPortfolio();
    if (tickers.includes(ticker)) {
      return NextResponse.json({ success: false, error: `${ticker} is already in your portfolio` }, { status: 409 });
    }

    tickers.push(ticker);
    await savePortfolio(tickers);
    return NextResponse.json({ success: true, tickers });
  } catch (err) {
    console.error('[/api/portfolio POST] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE — remove a ticker { ticker: "AAPL" }
export async function DELETE(request) {
  try {
    const body = await request.json();
    const ticker = (body.ticker || '').trim().toUpperCase();

    const tickers = await getPortfolio();
    const updated = tickers.filter((t) => t !== ticker);

    if (updated.length === tickers.length) {
      return NextResponse.json({ success: false, error: `${ticker} not found in portfolio` }, { status: 404 });
    }

    await savePortfolio(updated);
    return NextResponse.json({ success: true, tickers: updated });
  } catch (err) {
    console.error('[/api/portfolio DELETE] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
