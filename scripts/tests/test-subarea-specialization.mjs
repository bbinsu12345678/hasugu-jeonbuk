#!/usr/bin/env node
/**
 * 14 시/군 서브페이지 지역 특화 검증:
 *  - 각 시/군 HTML 파일 존재
 *  - H1/title/description 에 해당 도시명 포함
 *  - canonical = 자기 URL
 *  - og:image = 해당 도시 전용
 *  - FAQ 질문에 도시명 포함
 *  - 동 목록이 해당 도시 실제 동 수와 일치
 */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');
let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; console.log(`✅ ${l}`); } else { fail++; console.log(`❌ ${l}`); } };

// regions 데이터 직접 파싱 (동 수 확인용)
const regionsTs = fs.readFileSync(path.join(ROOT, 'src/data/regions.ts'), 'utf-8');
const cityRe = /city:\s*'([^']+)',[\s\S]*?districts:\s*\[([^\]]+)\]/g;
const cityInfo = [];
let m;
while ((m = cityRe.exec(regionsTs)) !== null) {
  const districtCount = (m[2].match(/'[^']+'/g) ?? []).length;
  cityInfo.push({ city: m[1], districts: districtCount });
}
assert(cityInfo.length === 14, `regions.ts 에 14 시/군 (실제 ${cityInfo.length})`);

let totalFail = 0;
for (const { city, districts } of cityInfo) {
  const html = path.join(OUT, `${city}.html`);
  if (!fs.existsSync(html)) {
    assert(false, `${city}.html 존재`);
    totalFail++;
    continue;
  }
  const src = fs.readFileSync(html, 'utf-8');

  // Title 에 도시명
  const title = src.match(/<title>([^<]+)<\/title>/)?.[1] ?? '';
  assert(title.includes(city), `${city}: title 에 도시명 포함`);

  // Description 에 도시명
  const desc = src.match(/name="description"\s+content="([^"]+)"/)?.[1] ?? '';
  assert(desc.includes(city), `${city}: meta description 에 도시명`);

  // H1 에 도시명
  const h1 = src.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '') ?? '';
  assert(h1.includes(city), `${city}: H1 에 도시명 (${h1.slice(0, 40)})`);

  // canonical = 자기 URL
  const canonical = src.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1] ?? '';
  assert(decodeURIComponent(canonical).endsWith(`/${city}`), `${city}: canonical 자기참조 (${decodeURIComponent(canonical)})`);

  // og:image = 도시 전용
  const og = src.match(/og:image"\s+content="([^"]+)"/)?.[1] ?? '';
  assert(decodeURIComponent(og).includes(`/og/${city}.png`), `${city}: og:image 도시 전용`);

  // 동 수 렌더 — "N개 동·읍·면" 또는 "(N개 동/읍/면)" 어느 포맷이든 인정
  const districtLabel = src.match(/(\d+)개\s*동[·/]읍[·/]면/);
  assert(districtLabel && parseInt(districtLabel[1]) === districts,
    `${city}: 동 수 일치 (${districtLabel?.[1] ?? '?'} = ${districts})`);

  // FAQ 중 최소 1개 질문에 도시명
  const faqQs = [...src.matchAll(/"Question"[^}]*"name":"([^"]+)"/g)].map(mm => mm[1]);
  const cityInFaq = faqQs.filter(q => q.includes(city)).length;
  assert(cityInFaq >= 1, `${city}: FAQ 질문에 도시명 포함 (${cityInFaq}/${faqQs.length})`);
}

console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
