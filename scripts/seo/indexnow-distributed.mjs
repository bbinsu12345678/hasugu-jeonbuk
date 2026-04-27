#!/usr/bin/env node
// IndexNow 분산 핑 — 19,420 URL 을 7-14일에 걸쳐 1,500/day 로 분산.
//
// advisor 권고: 19k 일괄 핑은 spammy 시그널 → 서비스별 우선순위 + 일별 배치.
//
// Usage:
//   node scripts/seo/indexnow-distributed.mjs --batch=1     # day-1 첫 배치 (1,500 URL)
//   node scripts/seo/indexnow-distributed.mjs --batch=2     # day-2 두 번째 배치
//   node scripts/seo/indexnow-distributed.mjs --dry-run     # 실제 핑 안 하고 URL 만 출력
//
// IndexNow 스펙:
//   - 단일 요청 최대 10,000 URL (https://www.indexnow.org/documentation)
//   - 동일 호스트만 (cross-domain 금지)
//   - keyLocation 의 .txt 파일 일치해야 함
//
// 진행 상황은 ~/.gstack/projects/하수구막힘/indexnow-progress.json 에 기록.

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { argv } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');

const HOST = 'hasugu-jeonbuk.com';
const KEY = '3578809e434106335a30185a7e5c5284';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const BATCH_SIZE = 1500;
const PER_REQUEST = 1000; // 안전 여유 (10k 한도 내)

const STATE_DIR = resolve(homedir(), '.gstack', 'projects', '하수구막힘');
const STATE_FILE = resolve(STATE_DIR, 'indexnow-progress.json');

const args = Object.fromEntries(
  argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);

const dryRun = !!args['dry-run'];
const fromLive = !!args['from-live'];
const batchNum = parseInt(args.batch ?? '1', 10);

if (!Number.isFinite(batchNum) || batchNum < 1) {
  console.error('ERROR: --batch=N (N>=1) required');
  process.exit(1);
}

// sitemap-1.xml + sitemap-2.xml 에서 URL 전수 추출.
// 기본: 로컬 out/ (build 결과). --from-live: 라이브 도메인 fetch (CI/CD 친화).
async function extractUrls() {
  const urls = [];
  const sitemaps = ['sitemap-1.xml', 'sitemap-2.xml'];
  for (const f of sitemaps) {
    let xml;
    if (fromLive) {
      const r = await fetch(`https://${HOST}/${f}`);
      if (!r.ok) {
        console.error(`ERROR: live ${f} fetch ${r.status}`);
        process.exit(1);
      }
      xml = await r.text();
    } else {
      const p = resolve(REPO_ROOT, 'out', f);
      if (!existsSync(p)) {
        console.error(`ERROR: ${p} 없음. --from-live 옵션 또는 npm run build 필요.`);
        process.exit(1);
      }
      xml = readFileSync(p, 'utf8');
    }
    const m = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
    for (const tag of m) {
      const u = tag.replace(/<\/?loc>/g, '').trim();
      if (u.startsWith(`https://${HOST}`)) urls.push(u);
    }
  }
  return urls;
}

// 결정론적 우선순위 정렬:
//   1. 허브 (홈, /jeonbuk, /[city]) 먼저
//   2. 블로그는 hash(slug) 로 셔플 (서비스 간 균등 분산)
function prioritize(urls) {
  const hubs = urls.filter((u) => {
    const path = u.replace(`https://${HOST}`, '');
    if (path === '/' || path === '/jeonbuk') return true;
    // /[city] only (no slug → no '/' inside)
    const seg = path.split('/').filter(Boolean);
    return seg.length === 1;
  });
  const blogs = urls.filter((u) => !hubs.includes(u));

  // hash-based stable shuffle (FNV-1a)
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  blogs.sort((a, b) => hash(a) - hash(b));

  return [...hubs, ...blogs];
}

function loadProgress() {
  if (!existsSync(STATE_FILE)) return { batchesDone: [], totalPinged: 0 };
  return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
}

function saveProgress(state) {
  if (!existsSync(STATE_DIR)) mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

async function pingBatch(urlList) {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };
  if (dryRun) {
    console.log(`[dry-run] would ping ${urlList.length} URLs`);
    return { ok: true, status: 0, dryRun: true };
  }
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status };
}

async function main() {
  const all = prioritize(await extractUrls());
  console.log(`Total URLs in sitemap: ${all.length}`);

  const start = (batchNum - 1) * BATCH_SIZE;
  const end = Math.min(start + BATCH_SIZE, all.length);

  if (start >= all.length) {
    console.log(`✅ Batch ${batchNum} 가 sitemap 전체보다 큼. 모든 배치 완료.`);
    return;
  }

  const slice = all.slice(start, end);
  console.log(`Batch ${batchNum}: URL ${start + 1}~${end} (${slice.length} URLs)`);

  const state = loadProgress();
  if (state.batchesDone.includes(batchNum) && !dryRun) {
    console.log(`⚠️  Batch ${batchNum} 이미 핑됨. 강제 재실행 시 progress.json 수동 편집.`);
    return;
  }

  // 1000 URL/req 청크
  const chunks = [];
  for (let i = 0; i < slice.length; i += PER_REQUEST) {
    chunks.push(slice.slice(i, i + PER_REQUEST));
  }
  console.log(`Splitting into ${chunks.length} requests of <=${PER_REQUEST} URLs.`);

  let okCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    const r = await pingBatch(chunks[i]);
    console.log(`  req ${i + 1}/${chunks.length}: ${chunks[i].length} URLs → status ${r.status}${r.ok ? ' ✓' : ' ✗'}`);
    if (r.ok) okCount += chunks[i].length;
    // 요청 사이 1초 간격 (예의 + rate limit 회피)
    if (i < chunks.length - 1 && !dryRun) await new Promise((r) => setTimeout(r, 1000));
  }

  if (!dryRun) {
    state.batchesDone.push(batchNum);
    state.totalPinged = (state.totalPinged ?? 0) + okCount;
    state.lastBatchAt = new Date().toISOString();
    saveProgress(state);
  }

  console.log(`\n✅ Batch ${batchNum} 완료: ${okCount}/${slice.length} URLs 핑 성공`);
  console.log(`   누적: ${state.totalPinged}/${all.length}`);
  console.log(`   다음: node scripts/seo/indexnow-distributed.mjs --batch=${batchNum + 1}`);
}

main().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
