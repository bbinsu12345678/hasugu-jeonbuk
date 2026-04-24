import fs from 'node:fs';
import path from 'node:path';
import { once } from 'node:events';

const REGION_SOURCE_PATH = path.join(process.cwd(), 'src', 'data', 'regions.ts');
const OUTPUT_DIR = path.join(process.cwd(), 'generated', 'naver-blog-titles');

const PLACE_KEYWORDS = [
  '화장실',
  '욕실',
  '주방',
  '베란다',
  '세탁실',
  '옥상',
  '아파트',
  '빌라',
  '원룸',
  '주택',
  '상가',
  '식당',
  '카페',
  '사무실',
  '공장',
];

const MODIFIERS = [
  '비용',
  '가격',
  '해결',
  '빠른해결',
  '업체추천',
  '믿을만한업체추천',
  '전문업체',
  '당일출동',
  '24시출동',
  '후기',
  '원인점검',
  '재발방지',
  '깔끔한처리',
];

const SERVICES = [
  { keyword1: '변기', keyword2: ['막힘', '뚫음', '역류', '수리', '교체'] },
  { keyword1: '하수구', keyword2: ['막힘', '뚫음', '역류', '악취', '청소'] },
  { keyword1: '싱크대', keyword2: ['막힘', '뚫음', '역류', '배수불량', '악취'] },
  { keyword1: '맨홀', keyword2: ['막힘', '청소', '준설', '역류', '악취'] },
  { keyword1: '오수관', keyword2: ['막힘', '뚫음', '역류', '고압세척', '내시경'] },
  { keyword1: '우수관', keyword2: ['막힘', '청소', '역류', '배수불량', '넘침'] },
  { keyword1: '누수', keyword2: ['탐지', '수리', '공사', '원인점검', '해결'] },
];

function parseRegions(source) {
  const regionPattern = /\{\s*city: '([^']+)',\s*districts: \[((?:.|\n)*?)\],\s*\}/g;
  const districtPattern = /'([^']+)'/g;
  const regions = [];
  const duplicateDistricts = [];

  for (const match of source.matchAll(regionPattern)) {
    const cityFull = match[1];
    const districtBlock = match[2];
    const cityShort = cityFull.replace(/[시군]$/, '');
    const districts = [];
    const seen = new Set();

    for (const districtMatch of districtBlock.matchAll(districtPattern)) {
      const district = districtMatch[1];

      if (seen.has(district)) {
        duplicateDistricts.push(`${cityShort} ${district}`);
        continue;
      }

      seen.add(district);
      districts.push(district);
    }

    regions.push({ cityFull, cityShort, districts });
  }

  return { regions, duplicateDistricts };
}

function csvEscape(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

async function writeLine(stream, line) {
  if (!stream.write(line)) {
    await once(stream, 'drain');
  }
}

async function closeStream(stream) {
  stream.end();
  await once(stream, 'finish');
}

async function main() {
  const regionSource = fs.readFileSync(REGION_SOURCE_PATH, 'utf8');
  const { regions, duplicateDistricts } = parseRegions(regionSource);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const txtPath = path.join(OUTPUT_DIR, 'naver-blog-titles-all.txt');
  const csvPath = path.join(OUTPUT_DIR, 'naver-blog-titles-all.csv');
  const jsonPath = path.join(OUTPUT_DIR, 'naver-blog-titles-manifest.json');

  const txtStream = fs.createWriteStream(txtPath, { encoding: 'utf8' });
  const csvStream = fs.createWriteStream(csvPath, { encoding: 'utf8' });

  txtStream.write('\uFEFF');
  csvStream.write('\uFEFF');
  csvStream.write('city_full,city_short,district,place,keyword1,keyword2,modifier,title\n');

  let totalTitles = 0;
  let totalDistricts = 0;

  for (const region of regions) {
    totalDistricts += region.districts.length;

    for (const district of region.districts) {
      for (const place of PLACE_KEYWORDS) {
        for (const service of SERVICES) {
          for (const keyword2 of service.keyword2) {
            for (const modifier of MODIFIERS) {
              const title = `${region.cityShort} ${district} ${place} ${service.keyword1} ${keyword2} ${modifier}`;
              const row = [
                region.cityFull,
                region.cityShort,
                district,
                place,
                service.keyword1,
                keyword2,
                modifier,
                title,
              ];

              await writeLine(txtStream, `${title}\n`);
              await writeLine(csvStream, `${row.map(csvEscape).join(',')}\n`);
              totalTitles += 1;
            }
          }
        }
      }
    }
  }

  await Promise.all([closeStream(txtStream), closeStream(csvStream)]);

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: 'src/data/regions.ts',
    outputFiles: {
      txt: txtPath,
      csv: csvPath,
    },
    counts: {
      cities: regions.length,
      districts: totalDistricts,
      placeKeywords: PLACE_KEYWORDS.length,
      serviceKeywords: SERVICES.length,
      keyword2Values: SERVICES.reduce((sum, service) => sum + service.keyword2.length, 0),
      modifiers: MODIFIERS.length,
      totalTitles,
    },
    duplicateDistrictsRemoved: duplicateDistricts,
    placeKeywords: PLACE_KEYWORDS,
    modifiers: MODIFIERS,
    services: SERVICES,
    pattern: '{cityShort} {district} {place} {keyword1} {keyword2} {modifier}',
  };

  fs.writeFileSync(jsonPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`Generated ${totalTitles.toLocaleString('en-US')} titles.`);
  console.log(`TXT: ${txtPath}`);
  console.log(`CSV: ${csvPath}`);
  console.log(`Manifest: ${jsonPath}`);

  if (duplicateDistricts.length > 0) {
    console.log(`Removed duplicates: ${duplicateDistricts.join(', ')}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
