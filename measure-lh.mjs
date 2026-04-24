import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

async function measure(url, label, isDesktop = true) {
  let chrome;
  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox']
    });

    const runnerResult = await lighthouse(url, {
      logLevel: 'error',
      output: 'json',
      port: chrome.port,
      emulatedFormFactor: isDesktop ? 'desktop' : 'mobile',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    });

    const json = JSON.parse(runnerResult.report);
    const c = json.categories;
    const a = json.audits;

    console.log(JSON.stringify({
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
    }));

  } finally {
    if (chrome) await chrome.kill();
  }
}

async function main() {
  console.log('Starting 4 Lighthouse audits...');
  await measure('http://localhost:4000', 'Home-Desktop', true);
  await measure('http://localhost:4000', 'Home-Mobile', false);
  await measure('http://localhost:4000/%EC%A0%84%EC%A3%BC%EC%8B%9C', 'Jeonju-Desktop', true);
  await measure('http://localhost:4000/%EC%A0%84%EC%A3%BC%EC%8B%9C', 'Jeonju-Mobile', false);
}

main().catch(console.error);
