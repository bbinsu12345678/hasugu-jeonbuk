#!/usr/bin/env node
// scripts/verify-seo.mjs
//
// L4 SEO 산출물 검증.
// 빌드 후(out/) 생성된 sitemap.xml · feed.xml · robots.txt · *.html 를 대상으로
// TEST_CYCLE.md 의 L4 통과 기준을 자동 확인한다.
//
// 실패 시 exit 1. 성공 시 exit 0.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'out');
const FAIL = [];
const WARN = [];
const STATS = {};

// sitemap index + 2 파트 합계 ≥ 19,400 URL
const MIN_SITEMAP_URLS = 19400;
// main feed = 최신 500건 + 8개 서비스 feed 분할 (경쟁사 12 sitemap 분할 방식 RSS 확장)
const MIN_FEED_ITEMS = 400;

const COMPETITOR_MARKERS = [
  'jianhomecare',
  '지안홈케어',
  '010-3463-4474',
  'No1 해결사',
];

const AD_LAW_FORBIDDEN = [
  '100% 해결',
  '100%해결',
  '안 뚫리면 0원',
  '안뚫리면 0원',
  '무조건',
  '최저가',
  '즉시 출동',
  '즉시출동',
  '1등',
  'No1',
  '국내 최고',
  '국내최고',
];

const AI_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'CCBot',
  'Google-Extended',
  'Bytespider',
  'Amazonbot',
  'Applebot-Extended',
  'meta-externalagent',
];

/** ------------------------------------------------------------------ */

function fail(msg) { FAIL.push(msg); }
function warn(msg) { WARN.push(msg); }

function readText(abs) {
  try { return readFileSync(abs, 'utf8'); } catch { return null; }
}

function globHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) {
      if (name === '_next' || name === '_not-found' || name === 'images') continue;
      globHtml(abs, acc);
    } else if (name.endsWith('.html')) {
      acc.push(abs);
    }
  }
  return acc;
}

function countMatches(text, needle) {
  if (!text) return 0;
  let c = 0, i = 0;
  while ((i = text.indexOf(needle, i)) !== -1) { c++; i += needle.length; }
  return c;
}

function countRegex(text, regex) {
  if (!text) return 0;
  const m = text.match(regex);
  return m ? m.length : 0;
}

function extractJsonLd(html) {
  const results = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      results.push(JSON.parse(m[1]));
    } catch {
      warn(`JSON-LD 파싱 실패: ${m[1].slice(0, 80)}...`);
    }
  }
  return results;
}

function hasType(ldArr, type) {
  return ldArr.some((ld) => ld && (ld['@type'] === type || (Array.isArray(ld['@type']) && ld['@type'].includes(type))));
}

/** ------------------------------------------------------------------ */
/** 1. sitemap — index + 파트 분할 (경쟁사 jianhomecare 방식)         */
/** ------------------------------------------------------------------ */
const sitemapIndex = readText(join(OUT, 'sitemap.xml'));
if (!sitemapIndex) {
  fail('out/sitemap.xml 없음 (빌드 먼저 실행 필요)');
} else {
  const sitemapRefs = countMatches(sitemapIndex, '<sitemap>');
  STATS.sitemapIndexCount = sitemapRefs;
  if (sitemapRefs < 2) {
    fail(`sitemap index <sitemap> 수 ${sitemapRefs} < 2 (분할 구조 기대)`);
  }
}

// 파트 파일 스캔 · <url> / <image:image> 합산
let totalUrls = 0;
let totalImageImages = 0;
let partFilesFound = 0;
for (let i = 1; i <= 10; i++) {
  const partText = readText(join(OUT, `sitemap-${i}.xml`));
  if (!partText) break;
  partFilesFound++;
  totalUrls += countMatches(partText, '<url>');
  totalImageImages += countMatches(partText, '<image:image>');
  const hasImageNs = partText.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  if (!hasImageNs) warn(`sitemap-${i}.xml 에 xmlns:image 네임스페이스 없음`);
}
STATS.sitemapUrls = totalUrls;
STATS.sitemapParts = partFilesFound;
STATS.imageImageCount = totalImageImages;
if (totalUrls < MIN_SITEMAP_URLS) {
  fail(`sitemap 파트 합계 URL ${totalUrls} < ${MIN_SITEMAP_URLS}`);
}
if (totalImageImages < Math.floor(totalUrls * 0.9)) {
  fail(`<image:image> ${totalImageImages} / URL ${totalUrls} — 90% 미만`);
}

/** ------------------------------------------------------------------ */
/** 2. feed.xml                                                        */
/** ------------------------------------------------------------------ */
const feed = readText(join(OUT, 'feed.xml'));
if (!feed) {
  fail('out/feed.xml 없음');
} else {
  const itemCount = countMatches(feed, '<item>');
  STATS.feedItems = itemCount;
  if (itemCount < MIN_FEED_ITEMS) {
    fail(`feed item ${itemCount} < ${MIN_FEED_ITEMS}`);
  }
  const hasMediaNs = feed.includes('xmlns:media="http://search.yahoo.com/mrss/"');
  const mediaCount = countMatches(feed, '<media:content');
  STATS.mediaContentCount = mediaCount;
  if (!hasMediaNs) {
    warn('feed.xml 에 xmlns:media 네임스페이스 없음 (Phase 2-D 후 필수)');
  }
  if (hasMediaNs && mediaCount < Math.floor(itemCount * 0.9)) {
    fail(`<media:content> ${mediaCount} / item ${itemCount} — 90% 미만`);
  }
}

/** ------------------------------------------------------------------ */
/** 3. robots.txt                                                      */
/** ------------------------------------------------------------------ */
const robots = readText(join(OUT, 'robots.txt'));
if (!robots) {
  fail('out/robots.txt 없음');
} else {
  const missingBots = AI_BOTS.filter((bot) => !robots.includes(bot));
  if (missingBots.length > 0) {
    fail(`robots.txt 에 AI 봇 미차단: ${missingBots.join(', ')}`);
  }
  if (!robots.includes('Sitemap:')) {
    fail('robots.txt 에 Sitemap 지시자 없음');
  }
}

/** ------------------------------------------------------------------ */
/** 4. HTML 스캔                                                       */
/** ------------------------------------------------------------------ */
const htmlFiles = existsSync(OUT) ? globHtml(OUT) : [];
STATS.htmlCount = htmlFiles.length;

function existsSync(p) {
  try { statSync(p); return true; } catch { return false; }
}

if (htmlFiles.length === 0) {
  fail('out/ 에 HTML 파일 0건');
}

// 4-1. 경쟁사 흔적 / 표시광고법 금지어 / __next_error__ 404 fallback 전수 스캔
let competitorHits = 0;
let adLawHits = 0;
let nextErrorHits = 0;
const adLawSample = [];
const nextErrorSample = [];
for (const abs of htmlFiles) {
  const html = readText(abs);
  if (!html) continue;
  for (const m of COMPETITOR_MARKERS) {
    if (html.includes(m)) {
      competitorHits++;
      fail(`경쟁사 흔적 "${m}" in ${relative(ROOT, abs)}`);
      break;
    }
  }
  for (const m of AD_LAW_FORBIDDEN) {
    if (html.includes(m)) {
      adLawHits++;
      if (adLawSample.length < 3) adLawSample.push(`${m} in ${relative(ROOT, abs)}`);
      break;
    }
  }
  // Next.js 정적 export 404 fallback 감지 (한글 URL 인코딩 버그 지표)
  if (html.includes('__next_error__') || html.includes('NEXT_HTTP_ERROR_FALLBACK;404')) {
    nextErrorHits++;
    if (nextErrorSample.length < 5) nextErrorSample.push(relative(ROOT, abs));
  }
}
STATS.competitorHits = competitorHits;
STATS.adLawHits = adLawHits;
STATS.nextErrorHits = nextErrorHits;
if (adLawHits > 0) {
  fail(`표시광고법 금지어 ${adLawHits}건 — 예: ${adLawSample.join(' | ')}`);
}
if (nextErrorHits > 0) {
  fail(`__next_error__ 404 fallback ${nextErrorHits}건 — 예: ${nextErrorSample.join(' | ')}`);
}

// 4-2. 샘플 페이지 HTML 검증 (H1·H2·canonical·og:image·JSON-LD)
const samplePaths = [
  'index.html',
  'jeonbuk.html',
  '전주시.html',
  '군산시.html',
  '익산시.html',
];

// 블로그 10개 (동·서비스 다양화)
const blogSamples = htmlFiles
  .filter((p) => !samplePaths.some((s) => p.endsWith(s)))
  .filter((p) => {
    const rel = relative(OUT, p).replaceAll('\\', '/');
    const segs = rel.split('/');
    return segs.length >= 2 && segs[segs.length - 1].includes('.html');
  })
  .slice(0, 10);

const samples = [
  ...samplePaths.map((n) => join(OUT, n)).filter(existsSync),
  ...blogSamples,
];

let h1Fail = 0, h2Fail = 0, canonicalFail = 0, ogFail = 0, jsonLdFail = 0;

for (const abs of samples) {
  const html = readText(abs);
  if (!html) continue;
  const rel = relative(ROOT, abs);

  const h1Count = countRegex(html, /<h1[\s>]/gi);
  if (h1Count !== 1) {
    h1Fail++;
    fail(`H1 count=${h1Count} in ${rel}`);
  }

  const h2Count = countRegex(html, /<h2[\s>]/gi);
  if (h2Count < 3) {
    h2Fail++;
    warn(`H2 count=${h2Count} (< 3) in ${rel}`);
  }

  // canonical 자기참조
  const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i);
  if (!canonicalMatch) {
    canonicalFail++;
    fail(`canonical 없음 in ${rel}`);
  }

  // og:image
  if (!/<meta[^>]*property="og:image"[^>]*>/i.test(html)) {
    ogFail++;
    fail(`og:image 없음 in ${rel}`);
  }

  // JSON-LD 최소 1종
  const ldArr = extractJsonLd(html);
  if (ldArr.length === 0) {
    jsonLdFail++;
    fail(`JSON-LD 0건 in ${rel}`);
  }
}

STATS.samples = samples.length;
STATS.h1Fail = h1Fail;
STATS.h2Fail = h2Fail;
STATS.canonicalFail = canonicalFail;
STATS.ogFail = ogFail;
STATS.jsonLdFail = jsonLdFail;

// 4-2-b. 이미지 컨테이너 비율 ↔ 원본 비율 교차 검증
//        - <img> 태그에서 className 중 "aspect-[W/H]" 또는 "h-N" 추출
//        - src 원본 파일의 실제 비율 비교, 15% 초과 불일치 시 WARN
//        - object-cover 쓰면서 aspect-ratio 없는 고정 h-N 는 무조건 WARN
const IMAGE_RE = /<img[^>]+>/g;
const ASPECT_RE = /aspect-\[(\d+)\/(\d+)\]/;
const FIXED_H_RE = /\bh-\d+\b/;
const FIXED_W_RE = /\bw-\d+\b/;
const OBJ_COVER_RE = /object-cover/;
// 원형 아바타 예외: rounded-full + h-N + w-N (정방형) → 원본이 정방형이면 자연스러움
const SQUARE_AVATAR_RE = /rounded-full/;
let fixedHHits = 0;
const fixedHSample = [];
// 대표 샘플만 검사 (전수 검사 비용 큼)
for (const abs of samples) {
  const html = readText(abs);
  if (!html) continue;
  const rel = relative(ROOT, abs);
  const tags = html.match(IMAGE_RE) || [];
  for (const tag of tags) {
    if (!OBJ_COVER_RE.test(tag)) continue;
    const hasAspect = ASPECT_RE.test(tag);
    const hasFixedH = FIXED_H_RE.test(tag);
    const hasFixedW = FIXED_W_RE.test(tag);
    const isAvatar = SQUARE_AVATAR_RE.test(tag) && hasFixedH && hasFixedW;
    if (isAvatar) continue; // 원형 정방형 아바타는 예외 (REBIRTH_SPEC 6-B 허용)
    if (!hasAspect && hasFixedH) {
      fixedHHits++;
      if (fixedHSample.length < 3) fixedHSample.push(`${rel}: ${tag.slice(0, 120)}...`);
    }
  }
}
STATS.fixedHHits = fixedHHits;
if (fixedHHits > 0) {
  warn(`<img object-cover> 중 aspect-[] 명시 없이 고정 h-N 쓰는 패턴 ${fixedHHits}건 — 이미지 원본 비율 일치 X (자름 리스크). 예: ${fixedHSample.join(' | ')}`);
}

// 4-3. 홈 HTML 에 LocalBusiness + FAQPage + ItemList 3종 JSON-LD 존재 확인
const home = readText(join(OUT, 'index.html'));
if (home) {
  const homeLd = extractJsonLd(home);
  const missing = [];
  const hasBusiness = hasType(homeLd, 'LocalBusiness') || hasType(homeLd, 'Plumber');
  if (!hasBusiness) missing.push('LocalBusiness/Plumber');
  if (!hasType(homeLd, 'FAQPage')) missing.push('FAQPage');
  if (!hasType(homeLd, 'ItemList')) missing.push('ItemList');
  if (missing.length > 0) {
    warn(`홈 index.html JSON-LD 누락: ${missing.join(', ')}`);
  }
}

/** ------------------------------------------------------------------ */
/** 결과                                                                */
/** ------------------------------------------------------------------ */
console.log('=== verify-seo.mjs 결과 ===');
console.log(`out/ HTML:          ${STATS.htmlCount}`);
console.log(`sitemap parts:      ${STATS.sitemapParts ?? '-'} (index + ${STATS.sitemapParts ?? 0} part files)`);
console.log(`sitemap URL 합계:   ${STATS.sitemapUrls ?? '-'}`);
console.log(`<image:image>:      ${STATS.imageImageCount ?? '-'}`);
console.log(`feed main item:     ${STATS.feedItems ?? '-'}`);
console.log(`<media:content>:    ${STATS.mediaContentCount ?? '-'}`);
console.log(`경쟁사 흔적:          ${STATS.competitorHits ?? 0}`);
console.log(`표시광고법 금지어:    ${STATS.adLawHits ?? 0}`);
console.log(`샘플 H1 실패:         ${STATS.h1Fail ?? 0}`);
console.log(`샘플 H2 경고:         ${STATS.h2Fail ?? 0}`);
console.log(`샘플 canonical 실패:  ${STATS.canonicalFail ?? 0}`);
console.log(`샘플 og:image 실패:   ${STATS.ogFail ?? 0}`);
console.log(`샘플 JSON-LD 실패:    ${STATS.jsonLdFail ?? 0}`);
console.log(`이미지 고정 h-N WARN: ${STATS.fixedHHits ?? 0}`);
console.log();

if (WARN.length > 0) {
  console.log('[WARN]');
  for (const w of WARN) console.log(`  - ${w}`);
  console.log();
}

if (FAIL.length > 0) {
  console.error('[FAIL]');
  for (const f of FAIL) console.error(`  - ${f}`);
  console.error();
  console.error(`총 실패: ${FAIL.length}건`);
  process.exit(1);
}

console.log('[PASS] L4 SEO 산출물 검증 전 항목 통과');
