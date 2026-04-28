const { default: lighthouse } = require('lighthouse');
const { launch } = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function run(url, label, formFactor) {
  let chrome;
  try {
    console.error(`[${label}] starting`);
    chrome = await launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });
    const opts = {
      logLevel: 'error', output: 'json', port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    };
    if (formFactor === 'desktop') { opts.formFactor='desktop'; opts.screenEmulation={disabled:true}; }
    const r = await lighthouse(url, opts);
    const j = JSON.parse(r.report);
    const want = [
      'errors-in-console','color-contrast','heading-order','label-content-name-mismatch',
      'unsized-images','largest-contentful-paint-element','render-blocking-resources',
      'unused-javascript','legacy-javascript','uses-long-cache-ttl',
      'mainthread-work-breakdown','third-party-summary'
    ];
    const out = { label, summary: {} };
    for (const id of want) {
      const a = j.audits[id];
      if (!a) continue;
      out.summary[id] = {
        score: a.score, displayValue: a.displayValue,
        items: a.details && a.details.items ? a.details.items.slice(0, 8) : null,
      };
    }
    const dir = path.resolve(__dirname, 'tmp', 'lh-detail');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${label}.json`), JSON.stringify(out, null, 2));
    console.error(`[${label}] done`);
  } finally { if (chrome) await chrome.kill(); }
}

(async () => {
  const BASE = process.env.LH_BASE || 'http://localhost:4000';
  await run(`${BASE}/`, 'Home-Desktop', 'desktop');
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
