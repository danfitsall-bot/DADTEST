import nodemailer from 'nodemailer';

function fmt(price) {
  if (price == null) return 'N/A';
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(pct) {
  if (pct == null) return 'N/A';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

function pctColor(pct) {
  if (pct == null) return '#64748b';
  return pct >= 0 ? '#16a34a' : '#dc2626';
}

function marketCapLabel(cap) {
  if (!cap) return '';
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T market cap`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B market cap`;
  return `$${(cap / 1e6).toFixed(0)}M market cap`;
}

function buildStockRows(stocks, emptyMsg) {
  if (!stocks || stocks.length === 0) {
    return `<tr><td colspan="6" style="padding:20px;text-align:center;color:#94a3b8;font-style:italic;">${emptyMsg}</td></tr>`;
  }
  return stocks
    .map(
      (s) => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:12px 16px;font-weight:700;color:#1e3a5f;">${s.ticker}</td>
      <td style="padding:12px 16px;color:#374151;max-width:200px;">${s.name}</td>
      <td style="padding:12px 16px;font-weight:600;">${fmt(s.currentPrice)}</td>
      <td style="padding:12px 16px;font-weight:600;color:${pctColor(s.dayChange)};">${fmtPct(s.dayChange)}</td>
      <td style="padding:12px 16px;font-weight:700;color:${pctColor(s.fiveYearChange)};">${fmtPct(s.fiveYearChange)}</td>
      <td style="padding:12px 16px;color:#64748b;font-size:13px;">${s.sector || ''}</td>
    </tr>`
    )
    .join('');
}

function buildReasonCards(stocks) {
  return stocks
    .slice(0, 5)
    .map(
      (s) => `
    <div style="background:#f8fafc;border-left:4px solid #16a34a;border-radius:8px;padding:16px;margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-weight:700;font-size:16px;color:#1e3a5f;">${s.ticker}</span>
        <span style="font-weight:700;color:#16a34a;font-size:15px;">${fmtPct(s.fiveYearChange)} 5yr</span>
      </div>
      <div style="color:#374151;font-size:14px;margin-bottom:4px;">${s.name}</div>
      <div style="color:#64748b;font-size:13px;">${s.reason || ''}</div>
      ${s.marketCap ? `<div style="color:#94a3b8;font-size:12px;margin-top:4px;">${marketCapLabel(s.marketCap)}</div>` : ''}
    </div>`
    )
    .join('');
}

export function buildEmailHTML({ portfolio, recommendations, date }) {
  const portfolioRows = buildStockRows(portfolio, 'No portfolio stocks added yet — visit the dashboard to add some!');
  const recRows = buildStockRows(recommendations, 'No stocks found meeting the 125%+ threshold today.');
  const reasonCards = buildReasonCards(recommendations);
  const topCount = recommendations.length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Investment Update</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:760px;margin:0 auto;padding:24px 16px;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%);border-radius:16px;padding:36px;margin-bottom:24px;text-align:center;">
    <div style="font-size:36px;margin-bottom:8px;">📈</div>
    <h1 style="color:#ffffff;margin:0 0 8px;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Daily Investment Update</h1>
    <p style="color:#94a3b8;margin:0;font-size:15px;">${date}</p>
    <div style="margin-top:16px;display:inline-block;background:rgba(255,255,255,0.1);border-radius:8px;padding:8px 20px;">
      <span style="color:#22c55e;font-weight:700;font-size:14px;">${topCount} stocks</span>
      <span style="color:#94a3b8;font-size:14px;"> found with 125%+ 5-year growth</span>
    </div>
  </div>

  <!-- My Portfolio -->
  <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <h2 style="margin:0 0 4px;color:#1e3a5f;font-size:20px;font-weight:700;">💼 My Portfolio</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px;">Current performance of your holdings</p>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;min-width:500px;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">
            <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Ticker</th>
            <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Name</th>
            <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
            <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Today</th>
            <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">5-Year</th>
            <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Sector</th>
          </tr>
        </thead>
        <tbody>${portfolioRows}</tbody>
      </table>
    </div>
  </div>

  <!-- Top 5 Picks Spotlight -->
  ${recommendations.length > 0 ? `
  <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <h2 style="margin:0 0 4px;color:#1e3a5f;font-size:20px;font-weight:700;">🌟 Top 5 Picks — Why Invest</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px;">Our highest-performing recommendations with investment rationale</p>
    ${reasonCards}
  </div>
  ` : ''}

  <!-- Full Recommendations Table -->
  <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <h2 style="margin:0 0 4px;color:#1e3a5f;font-size:20px;font-weight:700;">🚀 All Recommendations (125%+ 5yr)</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:14px;">Sorted by 5-year performance — highest first</p>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;min-width:500px;">
        <thead>
          <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;">
            <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Ticker</th>
            <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Name</th>
            <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Price</th>
            <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Today</th>
            <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">5-Year Return</th>
            <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Sector</th>
          </tr>
        </thead>
        <tbody>${recRows}</tbody>
      </table>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:20px;color:#94a3b8;font-size:12px;">
    <p style="margin:0 0 8px;">Generated automatically by <strong>Investment Tracker</strong> • ${date}</p>
    <p style="margin:0;color:#cbd5e1;">⚠️ Past performance does not guarantee future results. This is not financial advice. Always conduct your own research before investing.</p>
  </div>

</div>
</body>
</html>`;
}

export async function sendDailyEmail({ portfolio, recommendations }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD must be set');
  }
  if (!process.env.RECIPIENT_EMAIL) {
    throw new Error('RECIPIENT_EMAIL must be set');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = buildEmailHTML({ portfolio, recommendations, date });

  const topTicker =
    recommendations.length > 0 ? `Top Pick: ${recommendations[0].ticker} (+${recommendations[0].fiveYearChange.toFixed(0)}% 5yr)` : 'Market Update';

  await transporter.sendMail({
    from: `"Investment Tracker" <${process.env.GMAIL_USER}>`,
    to: process.env.RECIPIENT_EMAIL,
    subject: `📈 Investment Update — ${date} | ${topTicker}`,
    html,
  });
}
