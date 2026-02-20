# Investment Tracker — Setup Guide

## What this does
- **Website**: Clean, mobile-friendly dashboard showing investment picks (125%+ 5yr growth) and your portfolio
- **Daily email**: Sent every day at 9 AM ET with your portfolio performance + top picks
- **Data**: Scans 100+ well-known stocks using Yahoo Finance historical data

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | What it is | How to get it |
|---|---|---|
| `GMAIL_USER` | Your Gmail address | e.g. `you@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password (NOT your real password) | [Create here](https://myaccount.google.com/apppasswords) |
| `RECIPIENT_EMAIL` | Email to receive daily updates | Usually same as `GMAIL_USER` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (portfolio storage) | Set up in Vercel (step 4) |
| `CRON_SECRET` | Any random string | e.g. `openssl rand -hex 32` |

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploying to Vercel

### Step 1 — Push to GitHub
Push this repo to GitHub if you haven't.

### Step 2 — Import to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy**

### Step 3 — Set up Vercel Blob (portfolio storage)
1. In your Vercel project → **Storage** tab → **Create Database** → **Blob**
2. Name it anything (e.g. `investment-portfolio`)
3. Click **Connect to Project** — this auto-adds `BLOB_READ_WRITE_TOKEN`

### Step 4 — Add environment variables
In Vercel → **Settings** → **Environment Variables**, add:
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `RECIPIENT_EMAIL`
- `CRON_SECRET` (any random string)

### Step 5 — Redeploy
After adding env vars, go to **Deployments** → **Redeploy** (latest deployment).

### Step 6 — Verify cron
Vercel automatically reads `vercel.json` and schedules the daily cron at **14:00 UTC (9 AM ET)**.
You can check cron runs in Vercel → **Logs**.

---

## Gmail App Password Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Select app: **Mail**, device: **Other** → name it "Investment Tracker"
4. Copy the 16-character password → paste as `GMAIL_APP_PASSWORD`

---

## Adding Your Investments

1. Open the website
2. In **My Portfolio**, type a ticker symbol (e.g. `AAPL`) and click **+ Add**
3. Your holdings are saved and will appear in daily emails

---

## How Recommendations Work

- Scans ~100 well-known stocks across Tech, Finance, Healthcare, Consumer, Energy, etc.
- Calculates 5-year price change using Yahoo Finance historical data
- Shows only stocks with **125%+ growth** over 5 years
- Sorted highest → lowest, with explanations for each pick
- Results are cached for 1 hour to prevent rate limiting
