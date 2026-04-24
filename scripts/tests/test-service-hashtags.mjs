#!/usr/bin/env node
/**
 * TDD RED: 서비스 카드 해시태그
 *   - SERVICES 배열 각 항목에 tags: string[] 필드 존재
 *   - 각 서비스 최소 2개 해시태그
 *   - 렌더 JSX 에 #{tag} 표기 렌더링 코드 존재
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const files = [
  'src/app/page.tsx',
  'src/app/jeonbuk/page.tsx',
  'src/app/[city]/page.tsx',
];

let pass = 0, fail = 0;
const check = (cond, label) => {
  if (cond) { pass++; console.log(`✅ ${label}`); }
  else { fail++; console.log(`❌ ${label}`); }
};

for (const f of files) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf-8');

  // Contract 1: SERVICES 배열 각 항목에 tags 필드
  const servicesMatch = src.match(/const SERVICES = \[([\s\S]*?)\];/);
  check(servicesMatch, `${f}: SERVICES 배열 존재`);
  if (!servicesMatch) continue;
  const servicesBlock = servicesMatch[1];

  // 각 객체에 tags: [...] 포함
  const objs = servicesBlock.match(/\{[^}]*\}/g) ?? [];
  check(objs.length >= 4, `${f}: SERVICES 항목 >= 4`);

  const withTags = objs.filter((o) => /tags:\s*\[/.test(o));
  check(withTags.length === objs.length, `${f}: 모든 SERVICES 항목에 tags 필드 (${withTags.length}/${objs.length})`);

  // 각 tags 최소 2개 (문자열 기준)
  for (const obj of objs) {
    const tagsMatch = obj.match(/tags:\s*\[([^\]]*)\]/);
    if (!tagsMatch) continue;
    const tagCount = (tagsMatch[1].match(/'[^']+'/g) ?? []).length;
    const nameMatch = obj.match(/name:\s*'([^']+)'/);
    const name = nameMatch?.[1] ?? '?';
    check(tagCount >= 2, `${f}: ${name} tags >= 2 (실제 ${tagCount})`);
  }

  // Contract 2: 렌더 코드에 # 프리픽스 + tags.map 호출
  check(/s\.tags\.map|service\.tags\.map|\.tags\.map/.test(src), `${f}: tags.map 렌더 코드 존재`);
  check(/#\$\{|#\{.*?tag.*?\}|#\{?t\}?/.test(src), `${f}: # 프리픽스 렌더`);
}

console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
