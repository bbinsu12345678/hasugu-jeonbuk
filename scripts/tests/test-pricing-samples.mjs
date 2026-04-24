#!/usr/bin/env node
/** TDD RED: 투명 견적 샘플 데이터 + 홈 렌더. */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
let pass = 0, fail = 0;
const check = (c, l) => { if (c) { pass++; console.log(`✅ ${l}`); } else { fail++; console.log(`❌ ${l}`); } };

const dataPath = path.join(ROOT, 'src/data/pricing-samples.ts');
check(fs.existsSync(dataPath), 'src/data/pricing-samples.ts 존재');
if (fs.existsSync(dataPath)) {
  const src = fs.readFileSync(dataPath, 'utf-8');
  check(/export const PRICING_SAMPLES[^=]*=/.test(src), 'PRICING_SAMPLES export');
  const titles = (src.match(/\btitle:\s*'/g) ?? []).length;
  check(titles >= 3, `샘플 >= 3 (실제 ${titles})`);
  const items = (src.match(/\bitems:\s*\[/g) ?? []).length;
  check(items === titles, `items 배열 수 = title 수 (${items}/${titles})`);
  // 문자열 값으로 쓰인 total: '...' 만 카운트 (타입 정의 total: string 제외)
  const totals = (src.match(/\btotal:\s*'/g) ?? []).length;
  check(totals === titles, `total 필드 = title (${totals}/${titles})`);
  // 주석 제외 후 금지어 검사
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  check(!/무조건|100%|최저가|안 뚫리면 0원/.test(stripped), '표시광고법 금지어 0건 (데이터부)');
}
const home = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf-8');
check(/from\s+['"]@\/data\/pricing-samples['"]/.test(home), '홈 import @/data/pricing-samples');
check(/PRICING_SAMPLES\.map/.test(home), '홈 PRICING_SAMPLES.map 렌더');
console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
