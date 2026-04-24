const { default: lighthouse } = require('lighthouse');
const { launch } = require('chrome-launcher');

async function measure(url, label, formFactor) {
  let chrome;
  try {
    console.error(`[${label}] Starting...`);
    chrome = await launch({ chromeFlags: ['--headless', '--no-sandbox'] });

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

    const result = {
      label,
      perf: Math.round(c.performance.score * 100),
      a11y: Math.round(c.accessibility.score * 100),
      bp: Math.round(c['best-practices'].score * 100),
      seo: Math.round(c.seo.score * 100),
      lcp: Math.round(a['largest-contentful-paint'].numericValue),
      fcp: Math.round(a['first-contentful-paint'].numericValue),
      si: Math.round(a['speed-index'].numericValue),
      tbt: Math.round(a['total-blocking-time'].numericValue),
      cls: parseFloat(a['cumulative-layout-shift'].numericValue.toFixed(3))
    };
    
    console.log(JSON.stringify(result));

  } finally {
    if (chrome) await chrome.kill();
  }
}

async function main() {
  await measure('http://localhost:4000', 'Home-Desktop', 'desktop');
  await measure('http://localhost:4000', 'Home-Mobile', 'mobile');
  await measure('http://localhost:4000/%EC%A0%84%EC%A3%BC%EC%8B%9C', 'Jeonju-Desktop', 'desktop');
  await measure('http://localhost:4000/%EC%A0%84%EC%A3%BC%EC%8B%9C', 'Jeonju-Mobile', 'mobile');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
