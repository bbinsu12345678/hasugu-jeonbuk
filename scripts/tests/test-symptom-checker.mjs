#!/usr/bin/env node
/** TDD RED: 증상 체크리스트 컴포넌트 + Supabase 리드 저장. */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
let pass = 0, fail = 0;
const check = (c, l) => { if (c) { pass++; console.log(`✅ ${l}`); } else { fail++; console.log(`❌ ${l}`); } };

const comp = path.join(ROOT, 'src/components/sections/SymptomChecker.tsx');
check(fs.existsSync(comp), 'SymptomChecker.tsx 존재');
if (fs.existsSync(comp)) {
  const src = fs.readFileSync(comp, 'utf-8');
  check(/'use client'/.test(src), "'use client' 지시어");
  check(/useState/.test(src), 'useState hook');
  check(/type=['"]checkbox['"]/.test(src), 'checkbox input 렌더');
  check(/type=['"]tel['"]/.test(src), 'tel input 렌더 (연락처)');
  check(/submitSymptomLead/.test(src), 'submitSymptomLead 호출');
}

const lib = fs.readFileSync(path.join(ROOT, 'src/lib/supabase.ts'), 'utf-8');
check(/submitSymptomLead/.test(lib), 'supabase.ts submitSymptomLead 함수');
check(/submit_symptom_lead_hasugu/.test(lib), 'RPC submit_symptom_lead_hasugu 호출 (SECURITY DEFINER)');

const home = fs.readFileSync(path.join(ROOT, 'src/app/page.tsx'), 'utf-8');
check(/SymptomChecker/.test(home), '홈에서 SymptomChecker 사용');

console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
