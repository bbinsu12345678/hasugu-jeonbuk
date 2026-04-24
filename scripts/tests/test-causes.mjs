#!/usr/bin/env node
/** TDD RED: 원인 설명 교육 블록 데이터 + 홈 렌더. */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
let pass = 0, fail = 0;
const check = (c, l) => { if (c) { pass++; console.log(`✅ ${l}`); } else { fail++; console.log(`❌ ${l}`); } };

const dataPath = path.join(ROOT, 'src/data/causes.ts');
check(fs.existsSync(dataPath), 'src/data/causes.ts 존재');
if (fs.existsSync(dataPath)) {
  const src = fs.readFileSync(dataPath, 'utf-8');
  check(/export const CAUSES[^=]*=/.test(src), 'CAUSES 배열 export');
  const n = (src.match(/\bname:\s*'/g) ?? []).length;
  check(n >= 4, `원인 항목 >= 4 (실제 ${n})`);
  const e = (src.match(/\bexplanation:\s*'/g) ?? []).length;
  check(e === n, `explanation 수 = name (${e}/${n})`);
  const t = (src.match(/\btip:\s*'/g) ?? []).length;
  check(t === n, `tip 수 = name (${t}/${n})`);
}
const home = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf-8');
check(/from\s+['"]@\/data\/causes['"]/.test(home), '홈 페이지 import @/data/causes');
check(/CAUSES\.map/.test(home), '홈 페이지 CAUSES.map 렌더');
console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
