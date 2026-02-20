import YahooFinance from 'yahoo-finance2';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// ─── Singleton client (v3 requires instantiation) ─────────────────────────────
const yahooFinance = new YahooFinance();

// ─── Stock Universe ───────────────────────────────────────────────────────────
// Comprehensive coverage of the US (S&P 500 range) and UK (FTSE 100 + FTSE 250)
// UK stocks use the .L suffix for the London Stock Exchange on Yahoo Finance.

const US_STOCKS = [
  // ── Mega-cap Tech ──────────────────────────────────────────────────────────
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'GOOG', 'META', 'AMZN', 'TSLA', 'AMD',
  'AVGO', 'ORCL', 'CRM', 'ADBE', 'INTC', 'CSCO', 'QCOM', 'TXN', 'AMAT',
  'NOW', 'SNOW', 'PLTR', 'NFLX', 'UBER', 'SHOP', 'LRCX', 'KLAC', 'MU',
  'MRVL', 'MPWR', 'ENTG', 'ASML', 'ARM', 'SMCI',
  // ── Cloud / SaaS ───────────────────────────────────────────────────────────
  'DDOG', 'NET', 'CRWD', 'OKTA', 'ZS', 'VEEV', 'WDAY', 'HUBS', 'GTLB',
  'MDB', 'TEAM', 'ZM', 'DOCU', 'BILL', 'COUP', 'SMAR', 'APPN',
  // ── Finance ────────────────────────────────────────────────────────────────
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'USB', 'TFC', 'PNC',
  'V', 'MA', 'AXP', 'SCHW', 'BLK', 'COF', 'PYPL', 'SQ', 'NU', 'AFRM',
  'ICE', 'CME', 'NDAQ', 'SPGI', 'MCO', 'MSCI',
  // ── Healthcare / Biotech ───────────────────────────────────────────────────
  'JNJ', 'UNH', 'PFE', 'MRK', 'ABT', 'LLY', 'TMO', 'DHR', 'ISRG',
  'REGN', 'AMGN', 'GILD', 'MRNA', 'ABBV', 'MDT', 'SYK', 'BSX', 'EW',
  'DXCM', 'IDXX', 'VRTX', 'BIIB', 'ILMN', 'GEHC', 'CI', 'CVS', 'HUM',
  // ── Consumer ───────────────────────────────────────────────────────────────
  'WMT', 'HD', 'MCD', 'SBUX', 'NKE', 'TGT', 'COST', 'LOW', 'ETSY',
  'LULU', 'CMG', 'DPZ', 'YUM', 'QSR', 'RH', 'ROST', 'TJX', 'ULTA',
  'EL', 'KO', 'PEP', 'MNST', 'CELH', 'PM', 'MO', 'CL', 'PG',
  // ── Energy ─────────────────────────────────────────────────────────────────
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'OXY', 'PSX', 'VLO',
  'FANG', 'DVN', 'HES', 'BKR', 'HAL', 'CTRA',
  // ── Industrials ────────────────────────────────────────────────────────────
  'CAT', 'BA', 'HON', 'GE', 'MMM', 'LMT', 'RTX', 'UPS', 'FDX', 'DE',
  'ITW', 'EMR', 'ETN', 'PH', 'ROK', 'IR', 'CARR', 'OTIS', 'CPRT', 'CSX',
  'UNP', 'NSC', 'JBHT', 'XPO', 'SAIA', 'ODFL', 'GNRC', 'PWR', 'FAST',
  // ── Communication / Media ──────────────────────────────────────────────────
  'CMCSA', 'DIS', 'NFLX', 'CHTR', 'T', 'VZ', 'TMUS', 'SPOT', 'TTD', 'ROKU',
  // ── Real Estate & Utilities ────────────────────────────────────────────────
  'NEE', 'DUK', 'AMT', 'PLD', 'EQIX', 'SPG', 'O', 'VICI', 'PSA', 'EXR',
  'CCI', 'DLR', 'WPC', 'ARE', 'VTR',
  // ── Materials ─────────────────────────────────────────────────────────────
  'FCX', 'NEM', 'GOLD', 'ALB', 'SQM', 'MP', 'LAC', 'LIN', 'APD', 'ECL',
  'PPG', 'SHW', 'NUE', 'STLD', 'RS',
  // ── Other S&P 500 / Growth ────────────────────────────────────────────────
  'MELI', 'SE', 'GRAB', 'BABA', 'JD', 'PDD', 'BIDU', 'TSM', 'NVO', 'ASML',
  'LVMUY', 'RACE', 'TTE', 'SAP', 'SONY', 'SNY', 'AZN', 'GSK',
  // ── ETFs (for benchmarking) ────────────────────────────────────────────────
  'SPY', 'QQQ', 'VTI', 'IVV', 'VOO', 'XLK', 'ARKK', 'SOXX', 'SMH', 'CQQQ',
];

const UK_STOCKS = [
  // ── FTSE 100 ───────────────────────────────────────────────────────────────
  'AZN.L',    // AstraZeneca
  'SHEL.L',   // Shell
  'HSBA.L',   // HSBC
  'BP.L',     // BP
  'ULVR.L',   // Unilever
  'GSK.L',    // GSK
  'RIO.L',    // Rio Tinto
  'DGE.L',    // Diageo
  'REL.L',    // RELX
  'NG.L',     // National Grid
  'BA.L',     // BAE Systems
  'LSEG.L',   // London Stock Exchange Group
  'EXPN.L',   // Experian
  'HLMA.L',   // Halma
  'AHT.L',    // Ashtead Group
  'FLTR.L',   // Flutter Entertainment
  'CRH.L',    // CRH
  'SGRO.L',   // Segro
  'AAL.L',    // Anglo American
  'ANTO.L',   // Antofagasta
  'BARC.L',   // Barclays
  'LLOY.L',   // Lloyds Banking Group
  'NWG.L',    // NatWest Group
  'STAN.L',   // Standard Chartered
  'PRU.L',    // Prudential
  'AV.L',     // Aviva
  'LGEN.L',   // Legal & General
  'BATS.L',   // British American Tobacco
  'IMB.L',    // Imperial Brands
  'WPP.L',    // WPP
  'CPG.L',    // Compass Group
  'IHG.L',    // InterContinental Hotels Group
  'OCDO.L',   // Ocado Group
  'JD.L',     // JD Sports Fashion
  'AUTO.L',   // Auto Trader Group
  'DPLM.L',   // Diploma
  'MNDI.L',   // Mondi
  'MKS.L',    // Marks & Spencer
  'SBRY.L',   // Sainsbury's
  'TSCO.L',   // Tesco
  'RR.L',     // Rolls-Royce Holdings
  'IAG.L',    // International Airlines Group
  'EZJ.L',    // EasyJet
  'WTB.L',    // Whitbread
  'ABF.L',    // Associated British Foods
  'RKT.L',    // Reckitt Benckiser
  'PSON.L',   // Pearson
  'INF.L',    // Informa
  'SKG.L',    // Smurfit Westrock (formerly Smurfit Kappa)
  'SMDS.L',   // DS Smith
  'MNG.L',    // M&G
  'PHNX.L',   // Phoenix Group
  'SDR.L',    // Schroders
  'III.L',    // 3i Group
  'SMT.L',    // Scottish Mortgage Investment Trust
  'VOD.L',    // Vodafone
  'BT-A.L',   // BT Group
  'SSE.L',    // SSE
  'CNA.L',    // Centrica
  'SVT.L',    // Severn Trent
  'UU.L',     // United Utilities
  'LAND.L',   // Land Securities
  'BLND.L',   // British Land
  'BDEV.L',   // Barratt Developments
  'PSN.L',    // Persimmon
  'TW.L',     // Taylor Wimpey
  'IMI.L',    // IMI
  'WEIR.L',   // Weir Group
  'SN.L',     // Smith & Nephew
  'COB.L',    // Cobham (now private? use caution)
  'FRES.L',   // Fresnillo
  'KGF.L',    // Kingfisher
  'NXT.L',    // Next
  'M.L',      // Marks & Spencer (alt)
  'TUI.L',    // TUI Group
  'HWDN.L',   // Howden Joinery
  'IBST.L',   // Ibstock
  'CCC.L',    // Computacenter
  'IGG.L',    // IG Group
  'MONY.L',   // Moneysupermarket.com
  // ── FTSE 250 Highlights ───────────────────────────────────────────────────
  'DCC.L',    // DCC
  'EMG.L',    // Man Group
  'GENL.L',   // Genel Energy
  'SPDI.L',   // Secure Property Development
  'PETS.L',   // Pets at Home
  'GDWN.L',   // Goodwin
  'FUTR.L',   // Future plc
  'GAW.L',    // Games Workshop
  'SPX.L',    // Spirax-Sarco Engineering (now Spirax Group)
  'LTHM.L',   // Livent (now Arcadium Lithium)
  'VCT.L',    // Victrex
];

export const STOCK_UNIVERSE = [...new Set([...US_STOCKS, ...UK_STOCKS])];

// ─── File-based cache ─────────────────────────────────────────────────────────
const CACHE_DIR = '/tmp/investment-tracker';

function ensureCacheDir() {
  try { mkdirSync(CACHE_DIR, { recursive: true }); } catch { /* already exists */ }
}

function readCache(key) {
  try {
    ensureCacheDir();
    const path = join(CACHE_DIR, `${key}.json`);
    const raw = readFileSync(path, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(key, data, ttlMs) {
  try {
    ensureCacheDir();
    const path = join(CACHE_DIR, `${key}.json`);
    writeFileSync(path, JSON.stringify({ data, expiresAt: Date.now() + ttlMs }), 'utf8');
  } catch { /* silently ignore write errors */ }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// UK stocks listed in GBX (pence) — convert to GBP for display
function normalisePrice(price, currency) {
  if (currency === 'GBp' || currency === 'GBX') return price / 100;
  return price;
}

function formatCurrencySymbol(currency) {
  if (currency === 'GBP' || currency === 'GBp' || currency === 'GBX') return '£';
  if (currency === 'EUR') return '€';
  return '$';
}

function generateInvestReason(stock) {
  const { fiveYearChange, sector, pe, dayChange, market } = stock;
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

  if (market) lines.push(`Listed on the ${market}.`);
  else if (sector && sector !== 'N/A') lines.push(`Operates in the ${sector} sector.`);

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

// ─── Core: analyse one ticker ─────────────────────────────────────────────────
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

    const currency = quote.currency || 'USD';
    const oldRaw = historical[0].close;
    const currentRaw = quote.regularMarketPrice;
    if (!oldRaw || !currentRaw) return null;

    // For UK stocks quoted in GBX (pence), normalise to GBP for display
    const currentPrice = normalisePrice(currentRaw, currency);
    const oldPrice = normalisePrice(oldRaw, currency);

    const fiveYearChange = ((currentRaw - oldRaw) / oldRaw) * 100;

    const isUK = ticker.endsWith('.L');
    const market = isUK ? 'London Stock Exchange (FTSE)' : 'US Markets (NYSE/NASDAQ)';

    const stock = {
      ticker,
      name: quote.longName || quote.shortName || ticker,
      currentPrice: Math.round(currentPrice * 100) / 100,
      fiveYearChange: Math.round(fiveYearChange * 100) / 100,
      oldPrice: Math.round(oldPrice * 100) / 100,
      currency: isUK ? 'GBP' : (currency || 'USD'),
      currencySymbol: isUK ? '£' : formatCurrencySymbol(currency),
      market,
      sector: quote.sector || quote.quoteType || 'N/A',
      marketCap: quote.marketCap || null,
      pe: quote.trailingPE || null,
      dayChange: quote.regularMarketChangePercent
        ? Math.round(quote.regularMarketChangePercent * 100) / 100
        : null,
      volume: quote.regularMarketVolume || null,
      fiftyTwoWeekHigh: normalisePrice(quote.fiftyTwoWeekHigh || 0, currency) || null,
      fiftyTwoWeekLow: normalisePrice(quote.fiftyTwoWeekLow || 0, currency) || null,
    };

    stock.reason = generateInvestReason(stock);
    return stock;
  } catch {
    return null;
  }
}

// ─── Scan universe ────────────────────────────────────────────────────────────
/**
 * Scan STOCK_UNIVERSE and return all stocks with 5-year growth >= minGrowthPct.
 * Cached for 23 hours so the daily cron job refreshes it once per day.
 */
export async function getRecommendations(minGrowthPct = 125) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const cacheKey = `recommendations_${today}_${minGrowthPct}`;

  const cached = readCache(cacheKey);
  if (cached) return cached;

  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  const results = [];
  const BATCH = 10; // parallel requests per batch

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
    // Small delay to avoid rate limiting
    if (i + BATCH < STOCK_UNIVERSE.length) {
      await new Promise((res) => setTimeout(res, 100));
    }
  }

  results.sort((a, b) => b.fiveYearChange - a.fiveYearChange);

  // Cache for 23 hours
  writeCache(cacheKey, results, 23 * 60 * 60 * 1000);
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
