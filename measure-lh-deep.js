const { default: lighthouse } = require('lighthouse');
const { launch } = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function measure(url, label, formFactor, outDir) {
  let chrome;
  try {
    console.error(`[${label}] Starting...`);
    chrome = await launch({ chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'] });

    const options = {
      logLevel: 'error',
      output: 'json',
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    };

    if (formFactor === 'desktop') {
      options.formFactor = 'desktop';
      options.screenEmulation = { disabled: true };
    } else {
      options.formFactor = 'mobile';
    }

    const runnerResult = await lighthouse(url, options);
    const json = JSON.parse(runnerResult.report);
    const c = json.categories;
    const a = json.audits;

    const fail = [];
    for (const [id, audit] of Object.entries(a)) {
      if (audit.score === null) continue;
      if (audit.score >= 0.9) continue;
      fail.push({
        id,
        score: audit.score,
        title: audit.title,
        displayValue: audit.displayValue,
        numericValue: audit.numericValue,
        savingsMs: audit.details && audit.details.overallSavingsMs,
      });
    }
    fail.sort((x, y) => (y.savingsMs || 0) - (x.savingsMs || 0));

    const summary = {
      label,
      perf: Math.round(c.performance.score * 100),
      a11y: Math.round(c.accessibility.score * 100),
      bp: Math.round(c['best-practices'].score * 100),
      seo: Math.round(c.seo.score * 100),
      lcp: Math.round(a['largest-contentful-paint'].numericValue),
      fcp: Math.round(a['first-contentful-paint'].numericValue),
      tbt: Math.round(a['total-blocking-time'].numericValue),
      cls: parseFloat(a['cumulative-layout-shift'].numericValue.toFixed(3)),
      failCount: fail.length,
    };
    console.log(JSON.stringify(summary));
    fs.writeFileSync(path.join(outDir, `${label}.json`), JSON.stringify({ summary, fail }, null, 2));
  } finally {
    if (chrome) await chrome.kill();
  }
}

async function main() {
  const BASE = process.env.LH_BASE || 'http://localhost:4000';
  const outDir = path.resolve(__dirname, 'tmp', 'lh-deep');
  fs.mkdirSync(outDir, { recursive: true });
  const targets = [
    [`${BASE}/`, 'Home-Desktop', 'desktop'],
    [`${BASE}/`, 'Home-Mobile', 'mobile'],
    [`${BASE}/jeonbuk`, 'Jeonbuk-Desktop', 'desktop'],
    [`${BASE}/jeonbuk`, 'Jeonbuk-Mobile', 'mobile'],
  ];
  for (const [u, l, f] of targets) {
    try { await measure(u, l, f, outDir); } catch (e) { console.error('ERROR', l, e.message); }
  }
  console.log('OUT:', outDir);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
