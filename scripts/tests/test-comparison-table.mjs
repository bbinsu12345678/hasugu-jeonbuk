#!/usr/bin/env node
/**
 * TDD RED: 비교 테이블 (일반 vs 전북하수구) 섹션 존재.
 *   - 데이터 파일 src/data/comparison.ts 존재, 배열 길이 >= 5
 *   - 페이지(page.tsx/jeonbuk/[city])에서 comparison import + 렌더
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
let pass = 0, fail = 0;
const check = (cond, label) => {
  if (cond) { pass++; console.log(`✅ ${label}`); }
  else { fail++; console.log(`❌ ${label}`); }
};

// Contract 1: data/comparison.ts 존재
const dataPath = path.join(ROOT, 'src/data/comparison.ts');
check(fs.existsSync(dataPath), 'src/data/comparison.ts 존재');

if (fs.existsSync(dataPath)) {
  const src = fs.readFileSync(dataPath, 'utf-8');
  // Contract 2: COMPARISON 배열 export (타입 annotation 허용)
  check(/export const COMPARISON[^=]*=/.test(src), 'COMPARISON 배열 export');

  // Contract 3: 항목 >= 5 — label 필드 개수 기준
  const labelCount = (src.match(/\blabel:\s*'/g) ?? []).length;
  check(labelCount >= 5, `비교 항목 >= 5 (실제 ${labelCount})`);

  // Contract 4: others/ours 필드 개수가 label 수와 일치
  const othersCount = (src.match(/\bothers:\s*'/g) ?? []).length;
  const oursCount = (src.match(/\bours:\s*'/g) ?? []).length;
  check(othersCount === labelCount && oursCount === labelCount,
        `others(${othersCount})/ours(${oursCount}) 수 = label(${labelCount})`);
}

// Contract 5: 3개 페이지 중 최소 1곳에서 import + 렌더
const pages = ['src/app/page.tsx', 'src/app/jeonbuk/page.tsx', 'src/app/[city]/page.tsx'];
let importsCount = 0;
for (const p of pages) {
  const src = fs.readFileSync(path.join(ROOT, p), 'utf-8');
  if (/from\s+['"]@\/data\/comparison['"]/.test(src) && /COMPARISON\.map|comparison\.map/.test(src)) {
    importsCount++;
  }
}
check(importsCount >= 1, `최소 1개 페이지에서 comparison import + 렌더 (${importsCount})`);

console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
