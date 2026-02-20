'use client';

import { useState } from 'react';

export default function PortfolioManager({ tickers, onAdd, onRemove, loading }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    const ticker = input.trim().toUpperCase();
    if (!ticker) return;
    setError('');
    setAdding(true);
    try {
      await onAdd(ticker);
      setInput('');
    } catch (err) {
      setError(err.message || 'Failed to add ticker');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="Ticker (e.g. AAPL)"
          maxLength={10}
          className="input-field"
          disabled={adding}
        />
        <button type="submit" className="btn-primary whitespace-nowrap" disabled={adding || !input.trim()}>
          {adding ? 'Adding…' : '+ Add'}
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {loading ? (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-8 w-20 rounded-full" />
          ))}
        </div>
      ) : tickers.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No tickers added yet. Enter a stock symbol above.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tickers.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 bg-[#1e3a5f] text-white text-sm font-semibold px-3 py-1.5 rounded-full"
            >
              {t}
              <button
                onClick={() => onRemove(t)}
                className="text-white/60 hover:text-white transition-colors text-xs leading-none"
                aria-label={`Remove ${t}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
