#!/usr/bin/env node
/** TDD RED: 홈 FAQ 12개 이상 + 각 항목에 question/answer 쌍. */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
let pass = 0, fail = 0;
const check = (c, l) => { if (c) { pass++; console.log(`✅ ${l}`); } else { fail++; console.log(`❌ ${l}`); } };

const home = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf-8');
// 홈의 mainFaq 배열 추출 (const mainFaq = [ ... ];)
const match = home.match(/const mainFaq\s*=\s*\[([\s\S]*?)\];/);
check(!!match, 'mainFaq 배열 존재');
if (match) {
  const body = match[1];
  const qs = (body.match(/\bquestion:\s*'/g) ?? []).length;
  const as = (body.match(/\banswer:\s*'/g) ?? []).length;
  check(qs >= 12, `question >= 12 (실제 ${qs})`);
  check(as === qs, `answer 수 = question 수 (${as}/${qs})`);
}
console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
