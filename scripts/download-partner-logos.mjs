#!/usr/bin/env node
/**
 * 32개 파트너 로고를 런타임 CDN 에서 1회 가져와 public/images/partners/ 에 저장.
 * 이후 partners.ts 는 로컬 경로 참조로 교체 → 네트워크 장애·레이트 리밋 면역.
 */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public/images/partners');
fs.mkdirSync(OUT, { recursive: true });

/** name → slug (파일명 안전 영문) */
const SLUG = {
  '전주시청': 'jeonju-city', '익산시청': 'iksan-city', '익산역': 'iksan-ktx',
  '우체국': 'epost', '삼성': 'samsung', 'LG': 'lg', '현대': 'hyundai',
  'SK': 'sk', '롯데': 'lotte', '한화': 'hanwha', '쿠팡': 'coupang',
  '이마트': 'emart', '홈플러스': 'homeplus', '롯데마트': 'lottemart',
  '코스트코': 'costco', '스타벅스': 'starbucks', '맥도날드': 'mcdonalds',
  'BBQ': 'bbq', '교촌치킨': 'kyochon', '롯데리아': 'lotteria',
  '파리바게뜨': 'parisbaguette', 'GS25': 'gs25', 'CU': 'cu',
  '힐스테이트': 'hillstate', '자이': 'xi', '푸르지오': 'prugio',
  '래미안': 'raemian', 'KB': 'kb', '신한': 'shinhan', '우리': 'woori',
  'NH': 'nh', 'CJ': 'cj', '한진': 'hanjin',
};

/** partners.ts 의 각 Partner 객체 블록을 개별 스캔 → { name, url, ext } */
function parsePartners() {
  const src = fs.readFileSync(path.join(ROOT, 'src/data/partners.ts'), 'utf-8');
  const items = [];
  // 객체 블록별로 name + logoUrl 추출 (multiline safe)
  const blockRe = /\{\s*name:\s*'([^']+)'[\s\S]*?(?:,\s*logoUrl:\s*([^,\n}]+))?\s*,?\s*(?:keepColor:[^,\n}]+)?\s*\}/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    const name = m[1];
    const expr = (m[2] ?? '').trim();
    if (!expr) continue; // logoUrl 없는 brand 는 로컬 다운로드 대상 아님
    let url = null, ext = '.png';
    const si = /si\('([^']+)',\s*'([^']+)'\)/.exec(expr);
    const gfav = /gfav\('([^']+)'\)/.exec(expr);
    if (si) { url = `https://cdn.simpleicons.org/${si[1]}/${si[2].replace('#', '')}`; ext = '.svg'; }
    else if (gfav) { url = `https://www.google.com/s2/favicons?domain=${gfav[1]}&sz=128`; ext = '.png'; }
    if (url) items.push({ name, url, ext });
  }
  return items;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      // 리다이렉트 따라가기
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => f.close(() => resolve()));
      f.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('TIMEOUT')); });
  });
}

// Simple Icons 로 가져오는 brand 목록 (파서가 놓치는 경우 보강)
const SIMPLE_ICONS = [
  { name: '삼성', slug: 'samsung', color: '1428A0' },
  { name: 'LG', slug: 'lg', color: 'A50034' },
  { name: '현대', slug: 'hyundai', color: '002C5F' },
  { name: '쿠팡', slug: 'coupang', color: 'F02020' },
  { name: '코스트코', slug: 'costco', color: '005DAA' },
  { name: '스타벅스', slug: 'starbucks', color: '00704A' },
  { name: '맥도날드', slug: 'mcdonalds', color: 'FFC72C' },
];
const parsed = parsePartners();
const parsedNames = new Set(parsed.map((p) => p.name));
for (const si of SIMPLE_ICONS) {
  if (!parsedNames.has(si.name)) {
    parsed.push({
      name: si.name,
      url: `https://cdn.simpleicons.org/${si.slug}/${si.color}`,
      ext: '.svg',
    });
  }
}
const items = parsed;
console.log(`총 ${items.length}개 로고 다운로드 시작...\n`);

let ok = 0, fail = 0;
for (const it of items) {
  const slug = SLUG[it.name] ?? it.name.toLowerCase();
  const fname = `${slug}${it.ext}`;
  const out = path.join(OUT, fname);
  try {
    await download(it.url, out);
    const size = fs.statSync(out).size;
    if (size >= 200) {
      console.log(`✅ ${it.name} → ${fname} (${size}B)`);
      ok++;
    } else {
      console.log(`⚠️ ${it.name} → ${fname} (${size}B - too small, removing)`);
      fs.unlinkSync(out);
      fail++;
    }
  } catch (e) {
    console.log(`❌ ${it.name} → ${e.message}`);
    fail++;
  }
}

console.log(`\n완료: ${ok} OK, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
