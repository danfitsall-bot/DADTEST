import yahooFinance from 'yahoo-finance2';

// ─── Stock Universe ──────────────────────────────────────────────────────────
// Curated list of well-known stocks across major sectors.
// We scan this list to find investments with 125%+ 5-year growth.
export const STOCK_UNIVERSE = [
  // Mega-cap Tech
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META', 'AMZN', 'TSLA', 'AMD',
  'AVGO', 'ORCL', 'CRM', 'ADBE', 'INTC', 'CSCO', 'QCOM', 'TXN',
  'AMAT', 'NOW', 'SNOW', 'PLTR', 'NFLX', 'UBER', 'SHOP',
  // Semiconductors
  'LRCX', 'KLAC', 'MU', 'MRVL', 'MPWR', 'ENTG',
  // Cloud / SaaS
  'DDOG', 'NET', 'CRWD', 'OKTA', 'TWLO', 'ZS', 'VEEV', 'WDAY',
  // Finance
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'AXP', 'SCHW', 'BLK',
  'COF', 'PYPL', 'SQ', 'NU',
  // Healthcare / Biotech
  'JNJ', 'UNH', 'PFE', 'MRK', 'ABT', 'LLY', 'TMO', 'DHR', 'ISRG',
  'REGN', 'AMGN', 'GILD', 'MRNA', 'ABBV', 'MDT',
  // Consumer
  'WMT', 'HD', 'MCD', 'SBUX', 'NKE', 'TGT', 'COST', 'LOW', 'AMZN',
  'ETSY', 'LULU', 'CMG',
  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'OXY',
  // Industrials
  'CAT', 'BA', 'HON', 'GE', 'MMM', 'LMT', 'RTX', 'UPS', 'FDX', 'DE',
  'ITW', 'EMR',
  // Communication / Media
  'CMCSA', 'DIS', 'CHTR', 'T', 'VZ',
  // Real Estate & Utilities
  'NEE', 'DUK', 'AMT', 'PLD', 'EQIX', 'SPG',
  // ETFs
  'SPY', 'QQQ', 'VTI', 'IVV', 'VOO', 'XLK', 'ARKK', 'SOXX',
  // International
  'TSM', 'ASML', 'BABA', 'NVO', 'LVMUY',
];

// ─── Cache ───────────────────────────────────────────────────────────────────
const analysisCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateInvestReason(stock) {
  const { fiveYearChange, sector, pe, dayChange } = stock;

  const lines = [];

  if (fiveYearChange >= 500) {
    lines.push(`Extraordinary performer — up ${fiveYearChange.toFixed(0)}% over 5 years.`);
  } else if (fiveYearChange >= 300) {
    lines.push(`Exceptional growth — up ${fiveYearChange.toFixed(0)}% over 5 years.`);
  } else if (fiveYearChange >= 200) {
    lines.push(`Strong multi-year compounder — up ${fiveYearChange.toFixed(0)}% over 5 years.`);
  } else {
    lines.push(`Solid 5-year track record — up ${fiveYearChange.toFixed(0)}%, above our 125% threshold.`);
  }

  if (sector && sector !== 'N/A') {
    lines.push(`Operates in the ${sector} sector.`);
  }

  if (pe && pe > 0 && pe < 100) {
    lines.push(`P/E ratio of ${pe.toFixed(1)}x.`);
  } else if (pe && pe >= 100) {
    lines.push(`High-growth valuation (P/E ${pe.toFixed(0)}x).`);
  }

  if (dayChange && Math.abs(dayChange) > 2) {
    const dir = dayChange > 0 ? 'up' : 'down';
    lines.push(`Moving ${dir} ${Math.abs(dayChange).toFixed(1)}% today.`);
  }

  return lines.join(' ');
}

// ─── Core Analysis ───────────────────────────────────────────────────────────
async function analyzeOneTicker(ticker, fiveYearsAgo) {
  try {
    const [historical, quote] = await Promise.all([
      yahooFinance.historical(ticker, {
        period1: fiveYearsAgo,
        period2: new Date(),
        interval: '1mo',
      }),
      yahooFinance.quote(ticker),
    ]);

    if (!historical || historical.length < 10 || !quote) return null;

    const oldPrice = historical[0].close;
    const currentPrice = quote.regularMarketPrice;
    if (!oldPrice || !currentPrice) return null;

    const fiveYearChange = ((currentPrice - oldPrice) / oldPrice) * 100;

    const stock = {
      ticker,
      name: quote.longName || quote.shortName || ticker,
      currentPrice,
      fiveYearChange: Math.round(fiveYearChange * 100) / 100,
      oldPrice: Math.round(oldPrice * 100) / 100,
      sector: quote.sector || quote.quoteType || 'N/A',
      marketCap: quote.marketCap || null,
      pe: quote.trailingPE || null,
      dayChange: quote.regularMarketChangePercent
        ? Math.round(quote.regularMarketChangePercent * 100) / 100
        : null,
      volume: quote.regularMarketVolume || null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || null,
    };

    stock.reason = generateInvestReason(stock);
    return stock;
  } catch {
    return null;
  }
}

/**
 * Scan STOCK_UNIVERSE and return all stocks with 5-year growth >= minGrowthPct.
 * Results are cached for 1 hour to avoid rate limiting.
 */
export async function getRecommendations(minGrowthPct = 125) {
  const cacheKey = `recommendations_${minGrowthPct}`;
  const cached = analysisCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  const results = [];
  const BATCH = 5;

  for (let i = 0; i < STOCK_UNIVERSE.length; i += BATCH) {
    const batch = STOCK_UNIVERSE.slice(i, i + BATCH);
    const settled = await Promise.allSettled(
      batch.map((t) => analyzeOneTicker(t, fiveYearsAgo))
    );
    for (const r of settled) {
      if (r.status === 'fulfilled' && r.value && r.value.fiveYearChange >= minGrowthPct) {
        results.push(r.value);
      }
    }
    if (i + BATCH < STOCK_UNIVERSE.length) {
      await new Promise((res) => setTimeout(res, 150));
    }
  }

  results.sort((a, b) => b.fiveYearChange - a.fiveYearChange);

  analysisCache.set(cacheKey, { timestamp: Date.now(), data: results });
  return results;
}

/**
 * Get current performance data for a list of portfolio tickers.
 */
export async function getPortfolioPerformance(tickers) {
  if (!tickers || tickers.length === 0) return [];

  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  const settled = await Promise.allSettled(
    tickers.map((t) => analyzeOneTicker(t, fiveYearsAgo))
  );

  return settled
    .filter((r) => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value);
}
