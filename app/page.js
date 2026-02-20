'use client';

import { useState, useEffect, useCallback } from 'react';
import StockCard from '@/components/StockCard';
import PortfolioManager from '@/components/PortfolioManager';

// ─── Skeleton loaders ─────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <div className="skeleton h-6 w-20" />
          <div className="skeleton h-4 w-40" />
        </div>
        <div className="skeleton h-8 w-20" />
      </div>
      <div className="skeleton h-14 w-full rounded-xl" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
    </div>
  );
}

// ─── Status banner ─────────────────────────────────────────────────────────────
function StatusBanner({ status }) {
  if (!status) return null;
  const isError = status.type === 'error';
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 ${
        isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
      }`}
    >
      {status.message}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [recommendations, setRecommendations] = useState([]);
  const [portfolioTickers, setPortfolioTickers] = useState([]);
  const [portfolioPerf, setPortfolioPerf] = useState([]);

  const [loadingRec, setLoadingRec] = useState(true);
  const [loadingPortfolioTickers, setLoadingPortfolioTickers] = useState(true);
  const [loadingPortfolioPerf, setLoadingPortfolioPerf] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(null);
  const [status, setStatus] = useState(null);
  const [recError, setRecError] = useState(null);

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function showStatus(message, type = 'success') {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 4000);
  }

  // ─── Fetch recommendations ────────────────────────────────────────────────
  const fetchRecommendations = useCallback(async () => {
    setLoadingRec(true);
    setRecError(null);
    try {
      const res = await fetch('/api/analyze?min=125');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load recommendations');
      setRecommendations(json.data);
      setLastUpdated(new Date());
    } catch (err) {
      setRecError(err.message);
    } finally {
      setLoadingRec(false);
    }
  }, []);

  // ─── Fetch portfolio tickers ──────────────────────────────────────────────
  const fetchPortfolioTickers = useCallback(async () => {
    setLoadingPortfolioTickers(true);
    try {
      const res = await fetch('/api/portfolio');
      const json = await res.json();
      if (json.success) setPortfolioTickers(json.tickers);
    } catch {
      // silent
    } finally {
      setLoadingPortfolioTickers(false);
    }
  }, []);

  // ─── Fetch portfolio performance ──────────────────────────────────────────
  const fetchPortfolioPerf = useCallback(async () => {
    setLoadingPortfolioPerf(true);
    try {
      const res = await fetch('/api/performance');
      const json = await res.json();
      if (json.success) setPortfolioPerf(json.data);
    } catch {
      // silent
    } finally {
      setLoadingPortfolioPerf(false);
    }
  }, []);

  // ─── Add ticker ───────────────────────────────────────────────────────────
  async function handleAddTicker(ticker) {
    const res = await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    setPortfolioTickers(json.tickers);
    showStatus(`${ticker} added to portfolio`);
    fetchPortfolioPerf();
  }

  // ─── Remove ticker ────────────────────────────────────────────────────────
  async function handleRemoveTicker(ticker) {
    const res = await fetch('/api/portfolio', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker }),
    });
    const json = await res.json();
    if (json.success) {
      setPortfolioTickers(json.tickers);
      setPortfolioPerf((prev) => prev.filter((s) => s.ticker !== ticker));
      showStatus(`${ticker} removed`);
    }
  }

  // ─── Send email ───────────────────────────────────────────────────────────
  async function handleSendEmail() {
    setSendingEmail(true);
    try {
      const res = await fetch('/api/email', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showStatus('Email sent successfully!');
      } else {
        showStatus(json.error || 'Failed to send email', 'error');
      }
    } catch {
      showStatus('Network error — could not send email', 'error');
    } finally {
      setSendingEmail(false);
    }
  }

  // ─── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchRecommendations();
    fetchPortfolioTickers();
  }, [fetchRecommendations, fetchPortfolioTickers]);

  useEffect(() => {
    if (portfolioTickers.length > 0) {
      fetchPortfolioPerf();
    }
  }, [portfolioTickers.length, fetchPortfolioPerf]);

  // ─── Computed ─────────────────────────────────────────────────────────────
  const totalCount = recommendations.length;
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <>
      <StatusBanner status={status} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">📈</span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Investment Tracker</h1>
              </div>
              <p className="text-slate-400 text-sm mt-1">{formattedDate}</p>
              {lastUpdated && (
                <p className="text-slate-500 text-xs mt-0.5">
                  Data refreshed at {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Stats pill */}
              {!loadingRec && (
                <div className="bg-white/10 rounded-xl px-4 py-2 text-sm">
                  <span className="text-green-400 font-bold">{totalCount}</span>
                  <span className="text-slate-300"> picks found (125%+ 5yr)</span>
                </div>
              )}

              {/* Refresh */}
              <button
                onClick={() => { fetchRecommendations(); fetchPortfolioPerf(); }}
                disabled={loadingRec}
                className="bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {loadingRec ? 'Loading…' : '⟳ Refresh'}
              </button>

              {/* Send email */}
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="bg-green-500 hover:bg-green-400 transition-colors px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                {sendingEmail ? 'Sending…' : '✉ Send Email Now'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">

        {/* ── My Portfolio ───────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">💼 My Portfolio</h2>
              <p className="text-sm text-slate-500 mt-0.5">Track your current investments</p>
            </div>
          </div>

          <div className="card mb-5">
            <PortfolioManager
              tickers={portfolioTickers}
              onAdd={handleAddTicker}
              onRemove={handleRemoveTicker}
              loading={loadingPortfolioTickers}
            />
          </div>

          {loadingPortfolioPerf ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioTickers.slice(0, 3).map((t) => <CardSkeleton key={t} />)}
            </div>
          ) : portfolioPerf.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioPerf.map((stock) => (
                <StockCard
                  key={stock.ticker}
                  stock={stock}
                  showRemove
                  onRemove={handleRemoveTicker}
                />
              ))}
            </div>
          ) : portfolioTickers.length > 0 ? (
            <p className="text-slate-400 text-sm italic">Loading portfolio data…</p>
          ) : null}
        </section>

        {/* ── Recommendations ─────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">🚀 Investment Picks</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                🇺🇸 US (S&amp;P 500) &amp; 🇬🇧 UK (FTSE 100/250) — 125%+ 5-year growth, sorted by performance
              </p>
            </div>
          </div>

          {recError ? (
            <div className="card text-center py-10">
              <p className="text-red-500 font-medium mb-2">Failed to load recommendations</p>
              <p className="text-slate-400 text-sm mb-4">{recError}</p>
              <button onClick={fetchRecommendations} className="btn-primary">Try Again</button>
            </div>
          ) : loadingRec ? (
            <>
              <div className="card mb-4 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Scanning {'{'}100+{'}'} stocks for 5-year performance… this takes ~30 seconds
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            </>
          ) : recommendations.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-slate-500">No stocks found meeting the 125% threshold today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((stock) => (
                <StockCard key={stock.ticker} stock={stock} />
              ))}
            </div>
          )}
        </section>

        {/* ── Disclaimer ──────────────────────────────────────────────────────── */}
        <footer className="text-center text-xs text-slate-400 pb-6 border-t border-slate-100 pt-6">
          <p>
            ⚠️ <strong>Not financial advice.</strong> Past performance does not guarantee future results.
            Always conduct your own research before investing.
          </p>
          <p className="mt-1">Data sourced from Yahoo Finance • Covers S&amp;P 500 (US) + FTSE 100/250 (UK) • Emails sent daily at 9 AM ET</p>
        </footer>
      </main>
    </>
  );
}
