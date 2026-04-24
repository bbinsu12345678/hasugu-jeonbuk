#!/usr/bin/env node
/**
 * Rebirth diff — 도어웨이 위험도 측정
 *
 * 목적: 같은 서비스 타입 블로그 페이지들 사이의 본문 n-gram 중복률을 계산.
 * 경쟁사 지안홈케어는 72k URL 이 본문 동일 (extreme doorway). 우리는 20k 변형 목표.
 *
 * 측정법:
 *  1. 서비스별 out/{city}/{slug}.html 에서 본문 텍스트 추출 (JSON-LD, script, style 제거)
 *  2. 공백 정규화 → 4-gram 어절 슬라이딩
 *  3. 페어와이즈 자카드 유사도 평균 (같은 서비스 내)
 *  4. 전체 평균 유사도 < 0.35 목표 (플랜 기준)
 *
 * 실행: node scripts/rebirth-diff.mjs [--sample=100] [--service=변기막힘]
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const SAMPLE = Number(args.sample ?? 80);
const THRESHOLD = Number(args.threshold ?? 0.35);
const SERVICE_FILTER = args.service ?? null;

// regions.ts 에서 14 시 로드
const regionsSrc = fs.readFileSync(path.join(ROOT, 'src/data/regions.ts'), 'utf-8');
const cities = [...regionsSrc.matchAll(/city:\s*'([^']+)'/g)].map((m) => m[1]);

// 서비스별 블로그 샘플링 (라운드 로빈)
function sampleBlogFiles(limit) {
  const samples = [];
  for (const city of cities) {
    const dir = path.join(OUT, city);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));
    // 각 시에서 균등 샘플
    const step = Math.max(1, Math.floor(files.length / Math.ceil(limit / cities.length)));
    for (let i = 0; i < files.length && samples.length < limit; i += step) {
      samples.push({ city, file: files[i], abs: path.join(dir, files[i]) });
    }
    if (samples.length >= limit) break;
  }
  return samples;
}

function extractBody(html) {
  // 스크립트·스타일·head·JSON-LD 제거
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
  return s;
}

function ngrams(text, n = 4) {
  const words = text.split(/\s+/).filter((w) => w.length > 1);
  const set = new Set();
  for (let i = 0; i <= words.length - n; i++) {
    set.add(words.slice(i, i + n).join(' '));
  }
  return set;
}

function jaccard(a, b) {
  let intersect = 0;
  for (const x of a) if (b.has(x)) intersect++;
  const union = a.size + b.size - intersect;
  return union === 0 ? 0 : intersect / union;
}

// URL suffix 에서 서비스 타입 역추출 (파일명에 포함된 키워드로)
const SERVICE_MARKERS = {
  변기막힘: ['변기'],
  싱크대막힘: ['싱크대'],
  하수구막힘: ['하수구'],
  누수탐지: ['누수'],
  에어컨배관청소: ['에어컨'],
  오수관막힘: ['오수관'],
  우수관막힘: ['우수관'],
  맨홀청소: ['맨홀'],
};

function detectService(filename) {
  for (const [svc, markers] of Object.entries(SERVICE_MARKERS)) {
    if (markers.some((m) => filename.includes(m))) return svc;
  }
  return 'unknown';
}

// ────────── 실행 ──────────
if (!fs.existsSync(OUT)) {
  console.error('❌ out/ 디렉토리 없음. 먼저 `npx next build` 실행 필요.');
  process.exit(2);
}

console.log(`[sampling] SAMPLE=${SAMPLE} threshold=${THRESHOLD}${SERVICE_FILTER ? ` service=${SERVICE_FILTER}` : ''}`);
const raw = sampleBlogFiles(SAMPLE * 2); // 여유 버퍼
console.log(`[sampling] collected ${raw.length} blog files across ${cities.length} cities`);

// 서비스별 버킷
const bySvc = new Map();
for (const s of raw) {
  const svc = detectService(s.file);
  if (SERVICE_FILTER && svc !== SERVICE_FILTER) continue;
  if (!bySvc.has(svc)) bySvc.set(svc, []);
  if (bySvc.get(svc).length < Math.ceil(SAMPLE / Object.keys(SERVICE_MARKERS).length)) {
    bySvc.get(svc).push(s);
  }
}

let globalSum = 0, globalPairs = 0, maxSim = 0, maxPair = null;
const svcStats = [];

for (const [svc, files] of bySvc) {
  if (files.length < 2) continue;
  const grams = files.map((f) => ({ meta: f, g: ngrams(extractBody(fs.readFileSync(f.abs, 'utf-8'))) }));
  // 페어와이즈
  let sum = 0, pairs = 0, sMax = 0, sMaxPair = null;
  for (let i = 0; i < grams.length; i++) {
    for (let j = i + 1; j < grams.length; j++) {
      const sim = jaccard(grams[i].g, grams[j].g);
      sum += sim; pairs++;
      if (sim > sMax) { sMax = sim; sMaxPair = [grams[i].meta, grams[j].meta]; }
    }
  }
  const avg = sum / pairs;
  svcStats.push({ svc, n: files.length, avg, max: sMax });
  globalSum += sum; globalPairs += pairs;
  if (sMax > maxSim) { maxSim = sMax; maxPair = sMaxPair; }
  const status = avg < THRESHOLD ? '✅' : '❌';
  console.log(`${status} ${svc.padEnd(8)}  n=${String(files.length).padStart(3)}  avgJaccard=${avg.toFixed(3)}  maxJaccard=${sMax.toFixed(3)}`);
}

const globalAvg = globalPairs ? globalSum / globalPairs : 0;
console.log(`\n[global] avg Jaccard = ${globalAvg.toFixed(3)} (threshold ${THRESHOLD}, ${globalAvg < THRESHOLD ? 'PASS ✅' : 'FAIL ❌'})`);
if (maxPair) {
  console.log(`[outlier] max=${maxSim.toFixed(3)}  ${maxPair[0].city}/${maxPair[0].file.slice(0, 40)}  ↔  ${maxPair[1].city}/${maxPair[1].file.slice(0, 40)}`);
}

process.exit(globalAvg < THRESHOLD ? 0 : 1);
