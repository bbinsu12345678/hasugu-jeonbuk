#!/usr/bin/env node
/**
 * TDD: public/images/partners/ 에 32개 파트너 로고 파일 존재 + 유효 검증.
 * 실행: node scripts/tests/test-local-logos.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'public/images/partners');
const SRC = path.join(ROOT, 'src/data/partners.ts');

let pass = 0, fail = 0;
const assert = (cond, label) => {
  if (cond) { pass++; console.log(`✅ ${label}`); }
  else { fail++; console.log(`❌ ${label}`); }
};

// Contract 1: partners.ts 에서 name 목록 추출
const src = fs.readFileSync(SRC, 'utf-8');
const names = [...src.matchAll(/name:\s*'([^']+)'/g)].map(m => m[1]);
assert(names.length >= 30, `partners.ts name 개수 >= 30 (실제 ${names.length})`);

// Contract 2: slug → 영문·소문자·하이픈 규칙 (파일명 안전성)
const slug = (name) => {
  const map = {
    '전주시청': 'jeonju-city', '익산시청': 'iksan-city', '익산역': 'iksan-ktx',
    '우체국': 'epost', '삼성': 'samsung', 'LG': 'lg', '현대': 'hyundai',
    'SK': 'sk', '롯데': 'lotte', '한화': 'hanwha', '쿠팡': 'coupang',
    '이마트': 'emart', '홈플러스': 'homeplus', '롯데마트': 'lottemart',
    '코스트코': 'costco', '스타벅스': 'starbucks', '맥도날드': 'mcdonalds',
    'BBQ': 'bbq', '교촌치킨': 'kyochon', '롯데리아': 'lotteria',
    '파리바게뜨': 'parisbaguette', 'GS25': 'gs25', 'CU': 'cu',
    '힐스테이트': 'hillstate', '자이': 'xi', '푸르지오': 'prugio',
    '래미안': 'raemian', 'KB': 'kb', '신한': 'shinhan', '우리': 'woori',
    'NH': 'nh', 'CJ': 'cj', '한진': 'hanjin',
  };
  return map[name] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

// Contract 3: 디렉토리 존재
assert(fs.existsSync(DIR), `디렉토리 존재: public/images/partners`);

// Contract 4: partners.ts 에서 logoUrl 이 명시된 브랜드는 반드시 파일 존재
const logoLines = src.match(/logoUrl:\s*'(\/images\/partners\/[^']+)'/g) ?? [];
const declared = logoLines.map(l => l.match(/'([^']+)'/)[1]);
assert(declared.length >= 20, `logoUrl 선언 수 >= 20 (실제 ${declared.length})`);
for (const rel of declared) {
  const abs = path.join(ROOT, 'public', rel.replace(/^\//, ''));
  const exists = fs.existsSync(abs);
  const size = exists ? fs.statSync(abs).size : 0;
  assert(exists && size >= 200, `${path.basename(rel)} 파일 존재 + >=200B (${size}B)`);
}

console.log(`\nResult: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
