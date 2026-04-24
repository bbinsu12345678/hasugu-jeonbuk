#!/usr/bin/env node
/**
 * SEO 심층 감사 (빌드 산출물 기준):
 *  - sitemap URL 수 >= 19,400
 *  - image:image 네임스페이스 전수
 *  - feed media:content 전수
 *  - robots.txt AI 봇 차단
 *  - canonical count=1 (샘플)
 *  - og:image 페이지별 다변화
 *  - JSON-LD 6+ 종
 *  - H1 =1, H2 >=3
 *  - 경쟁사/금지어 0건
 */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; console.log(`✅ ${l}`); } else { fail++; console.log(`❌ ${l}`); } };

// 1. sitemap
const sm1 = fs.readFileSync(path.join(OUT, 'sitemap-1.xml'), 'utf-8');
const sm2 = fs.readFileSync(path.join(OUT, 'sitemap-2.xml'), 'utf-8');
const urlCount = (sm1.match(/<loc>/g)?.length ?? 0) + (sm2.match(/<loc>/g)?.length ?? 0);
assert(urlCount >= 19400, `sitemap URL >= 19,400 (실제 ${urlCount})`);

// 2. image:image 전수
const imgCount = (sm1.match(/<image:image>/g)?.length ?? 0) + (sm2.match(/<image:image>/g)?.length ?? 0);
assert(imgCount === urlCount, `image:image 수 = URL 수 (${imgCount}/${urlCount})`);

// 3. feed media:content
const feedFiles = fs.readdirSync(OUT).filter(f => /^feed.*\.xml$/.test(f));
let feedItems = 0, feedMedia = 0;
for (const f of feedFiles) {
  const src = fs.readFileSync(path.join(OUT, f), 'utf-8');
  feedItems += (src.match(/<item>/g)?.length ?? 0);
  feedMedia += (src.match(/<media:content/g)?.length ?? 0);
}
assert(feedItems >= 19000, `feed items >= 19,000 (실제 ${feedItems})`);
assert(feedMedia >= feedItems * 0.95, `media:content 수 >= 95% items (${feedMedia}/${feedItems})`);

// 4. robots.txt
const robots = fs.readFileSync(path.join(OUT, 'robots.txt'), 'utf-8');
const aiBots = ['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended', 'Bytespider', 'Amazonbot', 'Applebot-Extended', 'meta-externalagent'];
for (const bot of aiBots) {
  assert(new RegExp(`User-Agent:\\s*${bot}[\\s\\S]*?Disallow:\\s*/`).test(robots), `robots.txt ${bot} 차단`);
}

// 5. canonical count=1 + 자기참조 (샘플 4개)
const samples = ['index.html', 'jeonbuk.html', '전주시.html', '군산시.html'];
for (const s of samples) {
  const html = fs.readFileSync(path.join(OUT, s), 'utf-8');
  const canonicals = html.match(/<link[^>]*rel="canonical"[^>]*>/g) ?? [];
  assert(canonicals.length === 1, `${s}: canonical count=1 (${canonicals.length})`);
}

// 6. og:image 페이지별 다변화
const og1raw = fs.readFileSync(path.join(OUT, '전주시.html'), 'utf-8').match(/og:image"\s+content="([^"]+)/)?.[1] ?? '';
const og2raw = fs.readFileSync(path.join(OUT, '군산시.html'), 'utf-8').match(/og:image"\s+content="([^"]+)/)?.[1] ?? '';
const og1 = decodeURIComponent(og1raw);
const og2 = decodeURIComponent(og2raw);
assert(og1 !== og2 && og1.includes('전주시') && og2.includes('군산시'),
       `og:image 도시별 다변화 (전주 ${og1.slice(-30)} vs 군산 ${og2.slice(-30)})`);

// 7. JSON-LD 종류 (홈)
const homeLd = fs.readFileSync(path.join(OUT, 'index.html'), 'utf-8');
const ldTypes = new Set([...homeLd.matchAll(/"@type":"([^"]+)"/g)].map(m => m[1]));
assert(ldTypes.size >= 6, `JSON-LD @type 종류 >= 6 (실제 ${ldTypes.size}: ${[...ldTypes].slice(0, 8).join(',')})`);

// 8. H1=1, H2>=3 (샘플)
for (const s of samples) {
  const html = fs.readFileSync(path.join(OUT, s), 'utf-8');
  const h1 = (html.match(/<h1[^>]*>/g) ?? []).length;
  const h2 = (html.match(/<h2[^>]*>/g) ?? []).length;
  assert(h1 === 1, `${s}: H1 = 1 (실제 ${h1})`);
  assert(h2 >= 3, `${s}: H2 >= 3 (실제 ${h2})`);
}

// 9. 경쟁사 흔적 + 금지어 0건 (전 페이지)
const deepScan = (pattern) => {
  let hits = 0;
  for (const f of fs.readdirSync(OUT)) {
    if (!f.endsWith('.html')) continue;
    const src = fs.readFileSync(path.join(OUT, f), 'utf-8');
    if (pattern.test(src)) hits++;
  }
  return hits;
};
assert(deepScan(/jianhomecare|지안홈케어|010-3463-4474/) === 0, '경쟁사 흔적 0건');
assert(deepScan(/100% 해결|안 뚫리면 0원|무조건 뚫어|최저가|즉시 출동|1등/) === 0, '금지어 0건');

console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
