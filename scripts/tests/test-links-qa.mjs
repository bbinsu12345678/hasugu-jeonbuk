#!/usr/bin/env node
/**
 * TDD: 주요 페이지의 모든 내부 링크 + 핵심 버튼 타겟 존재 확인.
 *  - 빌드 산출물 out/ 에서 a[href] 수집
 *  - 내부 경로 (/) 만 대상, 외부 (http, tel:, mailto:, #) 제외
 *  - 각 링크의 타겟 HTML 파일 존재 여부 확인
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; console.log(`✅ ${l}`); } else { fail++; console.log(`❌ ${l}`); } };

assert(fs.existsSync(OUT), 'out/ 빌드 산출물 존재');

const samples = [
  'index.html',
  'jeonbuk.html',
  '전주시.html',
  '군산시.html',
];

// 파일 내 <a href="..."> 수집
function extractLinks(html) {
  return [...html.matchAll(/<a[^>]*href="([^"]+)"/g)].map(m => m[1]);
}

// 내부 경로 → 파일 경로 매핑
function resolveLink(href) {
  if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('#') || href.startsWith('javascript:')) return null;
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return path.join(OUT, 'index.html');
  const trimmed = clean.replace(/^\//, '').replace(/\/$/, '');
  // 파일이 바로 있는지 확인 (decoded 상태로 비교)
  const decoded = decodeURIComponent(trimmed);
  const candidates = [
    path.join(OUT, `${decoded}.html`),
    path.join(OUT, decoded, 'index.html'),
  ];
  return candidates.find(c => fs.existsSync(c)) ?? candidates[0];
}

let allLinks = new Set();
let deadLinks = [];
for (const s of samples) {
  const p = path.join(OUT, s);
  if (!fs.existsSync(p)) { assert(false, `샘플 파일 ${s} 존재`); continue; }
  const html = fs.readFileSync(p, 'utf-8');
  const links = extractLinks(html);
  let internalCount = 0;
  for (const href of links) {
    const resolved = resolveLink(href);
    if (!resolved) continue;
    internalCount++;
    allLinks.add(href);
    if (!fs.existsSync(resolved)) {
      deadLinks.push({ page: s, href, target: path.relative(OUT, resolved) });
    }
  }
  assert(internalCount >= 3, `${s}: 내부 링크 >= 3 (실제 ${internalCount})`);
}

assert(deadLinks.length === 0, `전체 내부 링크 dead = 0 (실제 ${deadLinks.length})`);
if (deadLinks.length) {
  console.log('\n❌ Dead links:');
  for (const d of deadLinks.slice(0, 10)) console.log(`  ${d.page} → ${d.href} (target: ${d.target})`);
  if (deadLinks.length > 10) console.log(`  ...및 ${deadLinks.length - 10}개 추가`);
}

// 전화/카카오 링크 존재 확인
for (const s of samples) {
  const p = path.join(OUT, s);
  if (!fs.existsSync(p)) continue;
  const html = fs.readFileSync(p, 'utf-8');
  assert(/tel:\d/.test(html), `${s}: tel: 링크 존재`);
  assert(/open\.kakao\.com|kakaoUrl/.test(html), `${s}: 카카오 링크 존재`);
}

console.log(`\nResult: ${pass} pass, ${fail} fail · 전체 링크 ${allLinks.size}개 검사`);
process.exit(fail === 0 ? 0 : 1);
