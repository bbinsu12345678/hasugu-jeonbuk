#!/usr/bin/env node
/** TDD RED: 장비 스펙 쇼케이스 (고압세척기 · CCTV · 해빙기). */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
let pass = 0, fail = 0;
const check = (c, l) => { if (c) { pass++; console.log(`✅ ${l}`); } else { fail++; console.log(`❌ ${l}`); } };

const dp = path.join(ROOT, 'src/data/equipment.ts');
check(fs.existsSync(dp), 'src/data/equipment.ts 존재');
if (fs.existsSync(dp)) {
  const src = fs.readFileSync(dp, 'utf-8');
  check(/export const EQUIPMENT[^=]*=/.test(src), 'EQUIPMENT export');
  const names = (src.match(/\bname:\s*'/g) ?? []).length;
  check(names >= 3, `장비 >= 3 (실제 ${names})`);
  const specs = (src.match(/\bspecs:\s*\[/g) ?? []).length;
  check(specs === names, `specs 배열 수 = name (${specs}/${names})`);
}
const home = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf-8');
check(/from\s+['"]@\/data\/equipment['"]/.test(home), '홈 import @/data/equipment');
check(/EQUIPMENT\.map/.test(home), '홈 EQUIPMENT.map 렌더');
console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
