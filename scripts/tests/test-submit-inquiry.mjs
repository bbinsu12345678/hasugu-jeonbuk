#!/usr/bin/env node
/**
 * TDD: submitInquiry() / submitSymptomLead() RPC 계약 테스트.
 *
 * 2026-04-22 pivot: RLS `FOR INSERT` 정책이 anon JWT 에 매칭 안 되는 Supabase 인스턴스
 * 이슈 발견 → SECURITY DEFINER RPC 패턴으로 전환. 아래 계약은 클라이언트가 반드시
 * `.rpc('submit_*_hasugu', { p_* })` 형태로 호출함을 강제.
 *
 * 실행: node scripts/tests/test-submit-inquiry.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

let pass = 0, fail = 0;
const assert = (c, l) => { if (c) { pass++; console.log(`✅ ${l}`); } else { fail++; console.log(`❌ ${l}`); } };

const src = fs.readFileSync(path.resolve('src/lib/supabase.ts'), 'utf-8');

// Contract 1 — submitInquiry 는 RPC 'submit_inquiry_hasugu' 를 호출
assert(/\.rpc\(['"]submit_inquiry_hasugu['"]/.test(src),
  "계약: rpc('submit_inquiry_hasugu') 호출");

// Contract 2 — submitSymptomLead 는 RPC 'submit_symptom_lead_hasugu' 를 호출
assert(/\.rpc\(['"]submit_symptom_lead_hasugu['"]/.test(src),
  "계약: rpc('submit_symptom_lead_hasugu') 호출");

// Contract 3 — RPC 파라미터 네이밍은 p_ 프리픽스 (PostgreSQL 함수 시그니처 고정)
const inquiryParams = ['p_name', 'p_phone', 'p_address', 'p_message', 'p_source_url'];
for (const p of inquiryParams) {
  assert(new RegExp(`${p}:`).test(src), `inquiry 파라미터: ${p}`);
}
const symptomParams = ['p_phone', 'p_symptoms', 'p_city', 'p_source_url'];
for (const p of symptomParams) {
  assert(new RegExp(`${p}:`).test(src), `symptom 파라미터: ${p}`);
}

// Contract 4 — 직접 .from().insert() 호출 절대 금지 (RLS deny 로 실패함)
assert(!/\.from\(['"]inquiries_hasugu['"]\)\.insert/.test(src),
  '.from().insert() 직접 호출 없음 (RLS deny)');
assert(!/\.from\(['"]symptom_leads_hasugu['"]\)\.insert/.test(src),
  '.from().insert() symptom 직접 호출 없음');

// Contract 5 — 에러 시 throw
assert(/throw new Error/.test(src), '에러 시 throw');

// Contract 6 — optional 필드 undefined → null 정규화
assert(/\?\?\s*null/.test(src), 'optional 필드 ?? null 정규화');

// Contract 7 — anon key 누락 시 예외
assert(/NEXT_PUBLIC_SUPABASE_URL/.test(src), 'env URL 참조');
assert(/NEXT_PUBLIC_SUPABASE_ANON_KEY/.test(src), 'env anon key 참조');

// Contract 8 — RPC 반환값 (uuid) 은 string 으로 리턴
assert(/Promise<string>/.test(src), 'Promise<string> 반환 시그니처');

console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
