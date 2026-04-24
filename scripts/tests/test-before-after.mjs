#!/usr/bin/env node
/** TDD RED: Before/After 섹션 데이터 + 컴포넌트 + 홈 렌더. */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
let pass = 0, fail = 0;
const check = (c, l) => { if (c) { pass++; console.log(`✅ ${l}`); } else { fail++; console.log(`❌ ${l}`); } };

const dp = path.join(ROOT, 'src/data/before-after.ts');
check(fs.existsSync(dp), 'src/data/before-after.ts 존재');
if (fs.existsSync(dp)) {
  const src = fs.readFileSync(dp, 'utf-8');
  check(/export const BEFORE_AFTER[^=]*=/.test(src), 'BEFORE_AFTER export');
  const pairs = (src.match(/\bbefore:\s*'/g) ?? []).length;
  const afters = (src.match(/\bafter:\s*'/g) ?? []).length;
  check(pairs >= 3, `before 사진 >= 3 (실제 ${pairs})`);
  check(afters === pairs, `after 수 = before (${afters}/${pairs})`);
}

const cp = path.join(ROOT, 'src/components/sections/BeforeAfterSlider.tsx');
check(fs.existsSync(cp), 'src/components/sections/BeforeAfterSlider.tsx 존재');
if (fs.existsSync(cp)) {
  const src = fs.readFileSync(cp, 'utf-8');
  check(/'use client'/.test(src), "'use client' 지시어 (드래그 상호작용)");
  check(/useState/.test(src), 'useState hook 사용');
  check(/onPointer|onMouse|onTouch/.test(src), '포인터 이벤트 처리');
}

const home = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf-8');
check(/BeforeAfterSlider/.test(home), '홈에서 BeforeAfterSlider 사용');
check(/from\s+['"]@\/data\/before-after['"]/.test(home), '홈 import @/data/before-after');
console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
