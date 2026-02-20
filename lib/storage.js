/**
 * Portfolio storage abstraction.
 * - Production (Vercel): uses @vercel/blob
 * - Development (local): falls back to a local JSON file
 */

import path from 'path';
import fs from 'fs';

const LOCAL_FILE = path.join(process.cwd(), 'data', 'portfolio.json');
const BLOB_PATHNAME = 'investment-portfolio.json';

function isVercel() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

// ─── Local helpers ────────────────────────────────────────────────────────────
function readLocal() {
  try {
    if (!fs.existsSync(LOCAL_FILE)) return [];
    return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeLocal(tickers) {
  const dir = path.dirname(LOCAL_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(tickers, null, 2));
}

// ─── Vercel Blob helpers ──────────────────────────────────────────────────────
async function readBlob() {
  const { list } = await import('@vercel/blob');
  const { blobs } = await list({ prefix: BLOB_PATHNAME });
  if (blobs.length === 0) return [];
  const res = await fetch(blobs[0].url);
  if (!res.ok) return [];
  return await res.json();
}

async function writeBlob(tickers) {
  const { put } = await import('@vercel/blob');
  await put(BLOB_PATHNAME, JSON.stringify(tickers), {
    access: 'public',
    addRandomSuffix: false,
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function getPortfolio() {
  if (isVercel()) {
    return readBlob();
  }
  return readLocal();
}

export async function savePortfolio(tickers) {
  if (isVercel()) {
    return writeBlob(tickers);
  }
  return writeLocal(tickers);
}
