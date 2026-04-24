#!/usr/bin/env node
/** TDD RED: 기사 프로필 3명 카드. */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
let pass = 0, fail = 0;
const check = (c, l) => { if (c) { pass++; console.log(`✅ ${l}`); } else { fail++; console.log(`❌ ${l}`); } };

const dp = path.join(ROOT, 'src/data/team.ts');
check(fs.existsSync(dp), 'src/data/team.ts 존재');
if (fs.existsSync(dp)) {
  const src = fs.readFileSync(dp, 'utf-8');
  check(/export const TEAM[^=]*=/.test(src), 'TEAM export');
  const names = (src.match(/\bname:\s*'/g) ?? []).length;
  check(names >= 3, `기사 >= 3 (실제 ${names})`);
  const roles = (src.match(/\brole:\s*'/g) ?? []).length;
  check(roles === names, `role 수 = name (${roles}/${names})`);
  const years = (src.match(/\bexperience:\s*'/g) ?? []).length;
  check(years === names, `experience 수 = name (${years}/${names})`);
  const quotes = (src.match(/\bquote:\s*'/g) ?? []).length;
  check(quotes === names, `quote 수 = name (${quotes}/${names})`);
}
const home = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf-8');
check(/from\s+['"]@\/data\/team['"]/.test(home), '홈 import @/data/team');
check(/TEAM\.map/.test(home), '홈 TEAM.map 렌더');
console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
