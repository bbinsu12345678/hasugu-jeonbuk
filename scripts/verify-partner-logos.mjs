#!/usr/bin/env node
/**
 * partners.ts 의 모든 logoUrl 을 HTTP HEAD 요청하여
 *  - 200 OK 여부
 *  - Content-Type image/* 여부
 *  - 바이트 크기
 *  를 확인. 실패 로고만 특정해 수정 대상 리스트 출력.
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// partners.ts 는 TS — tsx 로 dynamic import 대신 간단히 node --import 로 처리하기 어려워
// 정규식으로 logoUrl 추출.
const fs = await import('node:fs');
const src = fs.readFileSync(path.join(ROOT, 'src/data/partners.ts'), 'utf-8');

// name: '...' ... logoUrl: si(...)|gfav(...)|string
const partners = [];
const re = /name:\s*'([^']+)'[\s\S]*?logoUrl:\s*([^,\n]+)/g;
let m;
while ((m = re.exec(src)) !== null) {
  const name = m[1];
  let urlExpr = m[2].trim();
  let url = null;
  if (urlExpr.startsWith('si(')) {
    const mm = /si\('([^']+)',\s*'([^']+)'\)/.exec(urlExpr);
    if (mm) url = `https://cdn.simpleicons.org/${mm[1]}/${mm[2].replace('#', '')}`;
  } else if (urlExpr.startsWith('gfav(')) {
    const mm = /gfav\('([^']+)'\)/.exec(urlExpr);
    if (mm) url = `https://www.google.com/s2/favicons?domain=${mm[1]}&sz=128`;
  }
  if (url) partners.push({ name, url });
}

console.log(`\nScanning ${partners.length} partner logo URLs...\n`);

const failed = [];
const ok = [];

for (const p of partners) {
  try {
    // curl -sL (follow redirect) -o /dev/null -w "%{http_code}|%{content_type}|%{size_download}"
    const out = execSync(
      `curl -sL -o /dev/null --max-time 10 -w "%{http_code}|%{content_type}|%{size_download}" "${p.url}"`,
      { encoding: 'utf-8' },
    ).trim();
    const [code, ct, size] = out.split('|');
    const codeNum = parseInt(code, 10);
    const sizeNum = parseInt(size, 10);
    const isImage = ct?.startsWith('image/');
    const pass = codeNum === 200 && isImage && sizeNum > 200;
    const line = `${pass ? '✅' : '❌'} ${p.name.padEnd(10)} ${code} ${ct?.padEnd(20) ?? ''} ${size}B`;
    console.log(line);
    (pass ? ok : failed).push({ ...p, code, ct, size: sizeNum });
  } catch (e) {
    console.log(`❌ ${p.name} FETCH_ERROR ${e.message}`);
    failed.push({ ...p, code: 'ERR', ct: '', size: 0 });
  }
}

console.log(`\nResult: ${ok.length}/${partners.length} OK, ${failed.length} failed\n`);
if (failed.length) {
  console.log('Failed:');
  for (const f of failed) console.log(`  ${f.name}: ${f.url}`);
  process.exit(1);
}
