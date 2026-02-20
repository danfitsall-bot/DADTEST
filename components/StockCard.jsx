'use client';

function fmt(price) {
  if (price == null) return 'N/A';
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(pct) {
  if (pct == null) return 'N/A';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

function fmtMarketCap(cap) {
  if (!cap) return null;
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  return `$${(cap / 1e6).toFixed(0)}M`;
}

export default function StockCard({ stock, onRemove, showRemove = false }) {
  const isUp5yr = stock.fiveYearChange >= 0;
  const isDayUp = stock.dayChange == null ? null : stock.dayChange >= 0;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 flex flex-col gap-3">
      {/* Top row: ticker + price */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#1e3a5f]">{stock.ticker}</span>
            {stock.sector && stock.sector !== 'N/A' && (
              <span className="badge-neutral">{stock.sector}</span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5 leading-tight line-clamp-1">{stock.name}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-slate-800">{fmt(stock.currentPrice)}</div>
          {stock.dayChange != null && (
            <span className={isDayUp ? 'badge-up' : 'badge-down'}>
              {isDayUp ? '▲' : '▼'} {fmtPct(stock.dayChange)} today
            </span>
          )}
        </div>
      </div>

      {/* 5-year bar */}
      <div className={`rounded-xl px-4 py-3 ${isUp5yr ? 'bg-green-50' : 'bg-red-50'}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">5-Year Return</span>
          <span className={`text-xl font-black ${isUp5yr ? 'text-green-600' : 'text-red-600'}`}>
            {fmtPct(stock.fiveYearChange)}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${isUp5yr ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(100, Math.abs(stock.fiveYearChange) / 10)}%` }}
          />
        </div>
      </div>

      {/* Reason / rationale */}
      {stock.reason && (
        <p className="text-sm text-slate-600 leading-relaxed">{stock.reason}</p>
      )}

      {/* Footer: market cap + PE + remove btn */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {fmtMarketCap(stock.marketCap) && (
            <span>Market cap {fmtMarketCap(stock.marketCap)}</span>
          )}
          {stock.pe && stock.pe > 0 && (
            <span>P/E {stock.pe.toFixed(1)}x</span>
          )}
        </div>
        {showRemove && (
          <button onClick={() => onRemove(stock.ticker)} className="btn-danger">
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
