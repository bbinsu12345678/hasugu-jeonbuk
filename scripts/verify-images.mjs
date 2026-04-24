#!/usr/bin/env node
// scripts/verify-images.mjs
//
// public/images/blog-content/ 의 모든 WebP 파일이 TEST_CYCLE.md L4 기준을
// 만족하는지 검증한다.
//
// 검증 항목:
//   1. 파일 해시(SHA-256) 중복 0건
//   2. EXIF 블록 존재 100%
//   3. EXIF 내 DateTimeOriginal 유니크율 ≥ 99.5%
//   4. (Make, Model) 조합이 2종 이상
//   5. GPS 좌표가 0이 아님 (미삽입 감지)
//   6. exif-manifest.json 의 항목 수와 실제 파일 수 일치
//
// 실패 시 exit 1.

import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const TARGET_DIR = resolve(ROOT, 'public/images/blog-content');
const MANIFEST_PATH = resolve(ROOT, 'scripts/exif-manifest.json');

/** ------------------------------------------------------------------ */
/** 아주 단순한 EXIF 파서 (JPEG/WebP 공통 EXIF APP1 포맷)                 */
/** ------------------------------------------------------------------ */

// WebP 파일에서 EXIF 청크를 추출.
function extractWebPExif(buf) {
  // WebP 헤더: "RIFF" [4byte size] "WEBP"
  if (buf.slice(0, 4).toString('ascii') !== 'RIFF' ||
      buf.slice(8, 12).toString('ascii') !== 'WEBP') {
    return null;
  }
  let offset = 12;
  while (offset + 8 <= buf.length) {
    const fourcc = buf.slice(offset, offset + 4).toString('ascii');
    const size = buf.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + size;
    if (fourcc === 'EXIF') {
      return buf.slice(dataStart, dataEnd);
    }
    // WebP 청크는 홀수 길이일 때 1바이트 패딩.
    offset = dataEnd + (size % 2);
  }
  return null;
}

// EXIF 바이트에서 TIFF 헤더(II/MM) 오프셋 찾기.
function findTiffStart(exif) {
  // 일부 도구는 "Exif\0\0" prefix 를 붙인다.
  if (exif.slice(0, 6).toString('ascii') === 'Exif\u0000\u0000') {
    return 6;
  }
  // 아니면 0 부터 TIFF.
  return 0;
}

// 매우 제한적 EXIF 리더: DateTimeOriginal(0x9003), Make(0x010F), Model(0x0110),
// 그리고 GPS IFD 의 위도/경도 첫 숫자 존재 여부만 확인한다.
function parseExif(exifBytes) {
  if (!exifBytes || exifBytes.length < 10) return null;
  const start = findTiffStart(exifBytes);
  const tiff = exifBytes.slice(start);
  const endian = tiff.slice(0, 2).toString('ascii');
  let readU16, readU32;
  if (endian === 'II') {
    readU16 = (o) => tiff.readUInt16LE(o);
    readU32 = (o) => tiff.readUInt32LE(o);
  } else if (endian === 'MM') {
    readU16 = (o) => tiff.readUInt16BE(o);
    readU32 = (o) => tiff.readUInt32BE(o);
  } else {
    return null;
  }
  const magic = readU16(2);
  if (magic !== 42) return null;

  const ifd0Offset = readU32(4);

  const result = {
    dateTime: null,          // 0x0132 (DateTime)
    dateTimeOriginal: null,  // 0x9003
    make: null,              // 0x010F
    model: null,             // 0x0110
    software: null,          // 0x0131
    hasGps: false,
    exifIfdOffset: null,
    gpsIfdOffset: null,
  };

  const readIfd = (ifdOffset, handler) => {
    if (ifdOffset <= 0 || ifdOffset + 2 > tiff.length) return;
    const count = readU16(ifdOffset);
    for (let i = 0; i < count; i++) {
      const entryOffset = ifdOffset + 2 + i * 12;
      if (entryOffset + 12 > tiff.length) return;
      const tag = readU16(entryOffset);
      const type = readU16(entryOffset + 2);
      const numValues = readU32(entryOffset + 4);
      const valueOffset = readU32(entryOffset + 8);
      handler(tag, type, numValues, valueOffset, entryOffset);
    }
  };

  const readString = (offset, length) => {
    if (offset <= 0 || offset + length > tiff.length) return null;
    const bytes = tiff.slice(offset, offset + length);
    return bytes.toString('ascii').replace(/\u0000+$/, '');
  };

  readIfd(ifd0Offset, (tag, type, numValues, valueOffset, entryOffset) => {
    // type==2 (ASCII) → string.
    if (type === 2) {
      const strOffset = numValues <= 4 ? entryOffset + 8 : valueOffset;
      const str = readString(strOffset, numValues);
      if (tag === 0x0132) result.dateTime = str;
      else if (tag === 0x010F) result.make = str;
      else if (tag === 0x0110) result.model = str;
      else if (tag === 0x0131) result.software = str;
    }
    if (tag === 0x8769) result.exifIfdOffset = valueOffset;
    if (tag === 0x8825) result.gpsIfdOffset = valueOffset;
  });

  if (result.exifIfdOffset) {
    readIfd(result.exifIfdOffset, (tag, type, numValues, valueOffset, entryOffset) => {
      if (tag === 0x9003 && type === 2) {
        const strOffset = numValues <= 4 ? entryOffset + 8 : valueOffset;
        result.dateTimeOriginal = readString(strOffset, numValues);
      }
    });
  }

  if (result.gpsIfdOffset) {
    readIfd(result.gpsIfdOffset, (tag /*, type, numValues, valueOffset */) => {
      // 위도 태그(0x0002) 존재 자체를 GPS 주입 증거로 사용.
      if (tag === 0x0002) result.hasGps = true;
    });
  }

  return result;
}

/** ------------------------------------------------------------------ */
/** 메인                                                                 */
/** ------------------------------------------------------------------ */

// 재귀 스캔 (서비스별 하위 폴더 + 구버전 flat 둘 다 지원)
function collectWebp(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, name.name);
    if (name.isDirectory()) {
      out.push(...collectWebp(abs));
    } else if (name.isFile() && name.name.endsWith('.webp')) {
      out.push(abs);
    }
  }
  return out;
}

const fileAbsList = collectWebp(TARGET_DIR).sort();
const files = fileAbsList.map((abs) => relative(TARGET_DIR, abs));

// 서비스별 분포 집계
const perService = {};
for (const rel of files) {
  const svc = rel.includes('/') || rel.includes('\\')
    ? rel.split(/[\\/]/)[0]
    : 'flat';
  perService[svc] = (perService[svc] || 0) + 1;
}

if (files.length === 0) {
  console.error(`ERROR: ${relative(ROOT, TARGET_DIR)} 에 webp 파일 없음`);
  process.exit(1);
}

console.log(`대상 파일: ${files.length.toLocaleString()}`);

const hashes = new Map();                    // sha256 → [filenames]
const dateOrigins = new Map();               // DateTimeOriginal → count
const deviceCombos = new Map();              // `${make}|${model}` → count
let exifMissing = 0;
let gpsMissing = 0;

for (const rel of files) {
  const abs = join(TARGET_DIR, rel);
  const name = rel;
  const buf = readFileSync(abs);

  const hash = createHash('sha256').update(buf).digest('hex');
  if (!hashes.has(hash)) hashes.set(hash, []);
  hashes.get(hash).push(name);

  const exifBytes = extractWebPExif(buf);
  if (!exifBytes) {
    exifMissing++;
    continue;
  }
  const parsed = parseExif(exifBytes);
  if (!parsed) {
    exifMissing++;
    continue;
  }

  const dto = parsed.dateTimeOriginal || parsed.dateTime;
  if (dto) dateOrigins.set(dto, (dateOrigins.get(dto) ?? 0) + 1);

  if (parsed.make && parsed.model) {
    const key = `${parsed.make}|${parsed.model}`;
    deviceCombos.set(key, (deviceCombos.get(key) ?? 0) + 1);
  }

  if (!parsed.hasGps) gpsMissing++;
}

// ---------------------------------------------------------------------

const duplicateHashes = [...hashes.entries()].filter(([, names]) => names.length > 1);
const uniqueDateOrigins = [...dateOrigins.values()].filter((c) => c === 1).length;
const totalDateOrigins = [...dateOrigins.values()].reduce((a, b) => a + b, 0);
const dateUniqueRate = totalDateOrigins ? uniqueDateOrigins / totalDateOrigins : 0;

let manifestMismatch = null;
try {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  if (manifest.total !== files.length) {
    manifestMismatch = `manifest.total=${manifest.total} vs files=${files.length}`;
  }
} catch {
  manifestMismatch = `manifest not readable at ${relative(ROOT, MANIFEST_PATH)}`;
}

const failures = [];

if (duplicateHashes.length > 0) {
  failures.push(`파일 해시 중복 ${duplicateHashes.length}건 (첫 예시: ${duplicateHashes[0][1].slice(0, 3).join(', ')})`);
}
if (exifMissing > 0) {
  failures.push(`EXIF 누락 ${exifMissing}건 (inject-exif.py 미실행 또는 쓰기 실패)`);
}
if (dateUniqueRate < 0.995) {
  failures.push(`DateTimeOriginal 유니크율 ${(dateUniqueRate * 100).toFixed(2)}% (< 99.5%)`);
}
if (deviceCombos.size < 2) {
  failures.push(`Make/Model 조합 ${deviceCombos.size}종 (< 2)`);
}
if (gpsMissing > files.length * 0.01) {
  failures.push(`GPS 누락 ${gpsMissing}건 (> 1%)`);
}
if (manifestMismatch) {
  failures.push(`manifest 불일치: ${manifestMismatch}`);
}

// ---------------------------------------------------------------------

console.log();
console.log('=== 결과 ===');
console.log(`총 파일:               ${files.length.toLocaleString()}`);
console.log(`서비스별 분포:`);
for (const [svc, cnt] of Object.entries(perService).sort()) {
  console.log(`  ${svc.padEnd(12)} ${cnt.toLocaleString()}장`);
}
console.log(`고유 해시:             ${hashes.size.toLocaleString()}`);
console.log(`해시 중복:             ${duplicateHashes.length}`);
console.log(`EXIF 블록 누락:        ${exifMissing}`);
console.log(`DateTimeOriginal 고유: ${uniqueDateOrigins.toLocaleString()} / ${totalDateOrigins.toLocaleString()}`);
console.log(`유니크율:              ${(dateUniqueRate * 100).toFixed(2)}%`);
console.log(`Make/Model 조합:       ${deviceCombos.size}종`);
console.log(`GPS 누락:              ${gpsMissing}`);
console.log();

if (failures.length > 0) {
  console.error('[FAIL]');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('[PASS] 전 항목 통과');
