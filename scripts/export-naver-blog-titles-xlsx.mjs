import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { once } from 'node:events';
import zlib from 'node:zlib';

const REGION_SOURCE_PATH = path.join(process.cwd(), 'src', 'data', 'regions.ts');
const DEFAULT_OUTPUT_PATH = path.join(
  process.cwd(),
  'generated',
  'naver-blog-titles',
  'naver-blog-titles-all.xlsx',
);

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

const HEADERS = ['city_full', 'city_short', 'district', 'place', 'keyword1', 'keyword2', 'modifier', 'title'];
const COLUMN_WIDTHS = [18, 12, 18, 14, 12, 14, 22, 44];
const TOTAL_COLUMNS = HEADERS.length;
const TITLES_PER_DISTRICT =
  PLACE_KEYWORDS.length *
  SERVICES.reduce((sum, service) => sum + service.keyword2.length, 0) *
  MODIFIERS.length;

function parseRegions(source) {
  const regionPattern = /\{\s*city: '([^']+)',\s*districts: \[((?:.|\n)*?)\],\s*\}/g;
  const districtPattern = /'([^']+)'/g;
  const regions = [];

  for (const match of source.matchAll(regionPattern)) {
    const cityFull = match[1];
    const cityShort = cityFull.replace(/[시군]$/, '');
    const districtBlock = match[2];
    const districts = [];
    const seen = new Set();

    for (const districtMatch of districtBlock.matchAll(districtPattern)) {
      const district = districtMatch[1];
      if (seen.has(district)) {
        continue;
      }

      seen.add(district);
      districts.push(district);
    }

    regions.push({ cityFull, cityShort, districts });
  }

  return regions;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function columnName(index) {
  let current = index + 1;
  let result = '';

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
}

function buildRowXml(rowIndex, values) {
  const cells = values
    .map((value, colIndex) => {
      const ref = `${columnName(colIndex)}${rowIndex}`;
      return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    })
    .join('');

  return `<row r="${rowIndex}">${cells}</row>`;
}

function createCrcTable() {
  const table = new Uint32Array(256);

  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }

  return table;
}

const CRC_TABLE = createCrcTable();

function updateCrc32(crc, buffer) {
  let current = crc >>> 0;

  for (let index = 0; index < buffer.length; index += 1) {
    current = CRC_TABLE[(current ^ buffer[index]) & 0xff] ^ (current >>> 8);
  }

  return current >>> 0;
}

async function writeBuffer(stream, buffer) {
  if (!stream.write(buffer)) {
    await once(stream, 'drain');
  }
}

function createLocalFileHeader(nameBuffer) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0808, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(0, 14);
  header.writeUInt32LE(0, 18);
  header.writeUInt32LE(0, 22);
  header.writeUInt16LE(nameBuffer.length, 26);
  header.writeUInt16LE(0, 28);
  return header;
}

function createCentralDirectoryHeader(entry) {
  const nameBuffer = Buffer.from(entry.name, 'utf8');
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0808, 8);
  header.writeUInt16LE(8, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0, 14);
  header.writeUInt32LE(entry.crc32, 16);
  header.writeUInt32LE(entry.compressedSize, 20);
  header.writeUInt32LE(entry.uncompressedSize, 24);
  header.writeUInt16LE(nameBuffer.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(entry.localHeaderOffset, 42);
  return Buffer.concat([header, nameBuffer]);
}

function createDataDescriptor(entry) {
  const descriptor = Buffer.alloc(16);
  descriptor.writeUInt32LE(0x08074b50, 0);
  descriptor.writeUInt32LE(entry.crc32, 4);
  descriptor.writeUInt32LE(entry.compressedSize, 8);
  descriptor.writeUInt32LE(entry.uncompressedSize, 12);
  return descriptor;
}

function createEndOfCentralDirectory(totalEntries, centralDirectorySize, centralDirectoryOffset) {
  const record = Buffer.alloc(22);
  record.writeUInt32LE(0x06054b50, 0);
  record.writeUInt16LE(0, 4);
  record.writeUInt16LE(0, 6);
  record.writeUInt16LE(totalEntries, 8);
  record.writeUInt16LE(totalEntries, 10);
  record.writeUInt32LE(centralDirectorySize, 12);
  record.writeUInt32LE(centralDirectoryOffset, 16);
  record.writeUInt16LE(0, 20);
  return record;
}

function buildWorkbookXml(regions) {
  const sheets = regions
    .map(
      (region, index) =>
        `    <sheet name="${escapeXml(region.cityShort)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
${sheets}
  </sheets>
</workbook>`;
}

function buildWorkbookRelsXml(regions) {
  const sheetRelationships = regions
    .map(
      (_, index) =>
        `  <Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
    )
    .join('\n');

  const styleRelationship = `  <Relationship Id="rId${regions.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheetRelationships}
${styleRelationship}
</Relationships>`;
}

function buildContentTypesXml(regions) {
  const sheetOverrides = regions
    .map(
      (_, index) =>
        `  <Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheetOverrides}
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
}

function buildRootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function buildStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1">
    <font>
      <sz val="11"/>
      <name val="Calibri"/>
      <family val="2"/>
    </font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>`;
}

function buildCoreXml() {
  const iso = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>전북 네이버 블로그 제목 전체</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${iso}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${iso}</dcterms:modified>
</cp:coreProperties>`;
}

function buildAppXml(regions) {
  const sheetNames = regions
    .map((region) => `      <vt:lpstr>${escapeXml(region.cityShort)}</vt:lpstr>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Excel</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs>
    <vt:vector size="2" baseType="variant">
      <vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant>
      <vt:variant><vt:i4>${regions.length}</vt:i4></vt:variant>
    </vt:vector>
  </HeadingPairs>
  <TitlesOfParts>
    <vt:vector size="${regions.length}" baseType="lpstr">
${sheetNames}
    </vt:vector>
  </TitlesOfParts>
  <Company>OpenAI</Company>
  <LinksUpToDate>false</LinksUpToDate>
  <SharedDoc>false</SharedDoc>
  <HyperlinksChanged>false</HyperlinksChanged>
  <AppVersion>16.0300</AppVersion>
</Properties>`;
}

function buildSheetColumnsXml() {
  return COLUMN_WIDTHS.map(
    (width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`,
  ).join('');
}

async function* createSheetXml(region) {
  const totalRows = region.districts.length * TITLES_PER_DISTRICT + 1;
  const lastCell = `${columnName(TOTAL_COLUMNS - 1)}${totalRows}`;
  const columnsXml = buildSheetColumnsXml();

  yield `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastCell}"/>
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
      <selection pane="bottomLeft" activeCell="A2" sqref="A2"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>${columnsXml}</cols>
  <sheetData>`;

  let rowIndex = 1;
  let chunk = `${buildRowXml(rowIndex, HEADERS)}`;
  rowIndex += 1;

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

            chunk += buildRowXml(rowIndex, row);
            rowIndex += 1;

            if (chunk.length >= 1_000_000) {
              yield chunk;
              chunk = '';
            }
          }
        }
      }
    }
  }

  if (chunk.length > 0) {
    yield chunk;
  }

  yield `</sheetData>
  <autoFilter ref="A1:${lastCell}"/>
</worksheet>`;
}

function sourceToAsyncIterable(source) {
  if (typeof source === 'string' || Buffer.isBuffer(source)) {
    return Readable.from([source]);
  }

  return source;
}

async function addZipEntry(outputStream, bytesWrittenRef, entries, name, source) {
  const nameBuffer = Buffer.from(name, 'utf8');
  const localHeaderOffset = bytesWrittenRef.value;
  const localHeader = createLocalFileHeader(nameBuffer);

  await writeBuffer(outputStream, localHeader);
  await writeBuffer(outputStream, nameBuffer);
  bytesWrittenRef.value += localHeader.length + nameBuffer.length;

  const deflater = zlib.createDeflateRaw();
  const writeCompressedPromise = (async () => {
    let compressedSize = 0;

    for await (const chunk of deflater) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      compressedSize += buffer.length;
      await writeBuffer(outputStream, buffer);
      bytesWrittenRef.value += buffer.length;
    }

    return compressedSize;
  })();

  let crc = 0xffffffff;
  let uncompressedSize = 0;

  for await (const chunk of sourceToAsyncIterable(source)) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    crc = updateCrc32(crc, buffer);
    uncompressedSize += buffer.length;

    if (!deflater.write(buffer)) {
      await once(deflater, 'drain');
    }
  }

  deflater.end();
  const compressedSize = await writeCompressedPromise;
  const entry = {
    name,
    crc32: (crc ^ 0xffffffff) >>> 0,
    compressedSize,
    uncompressedSize,
    localHeaderOffset,
  };
  const descriptor = createDataDescriptor(entry);

  await writeBuffer(outputStream, descriptor);
  bytesWrittenRef.value += descriptor.length;
  entries.push(entry);
}

async function exportWorkbook(targetPath) {
  const regions = parseRegions(fs.readFileSync(REGION_SOURCE_PATH, 'utf8'));
  const outputDir = path.dirname(targetPath);
  fs.mkdirSync(outputDir, { recursive: true });

  const outputStream = fs.createWriteStream(targetPath);
  const bytesWrittenRef = { value: 0 };
  const zipEntries = [];

  await addZipEntry(outputStream, bytesWrittenRef, zipEntries, '[Content_Types].xml', buildContentTypesXml(regions));
  await addZipEntry(outputStream, bytesWrittenRef, zipEntries, '_rels/.rels', buildRootRelsXml());
  await addZipEntry(outputStream, bytesWrittenRef, zipEntries, 'xl/workbook.xml', buildWorkbookXml(regions));
  await addZipEntry(outputStream, bytesWrittenRef, zipEntries, 'xl/_rels/workbook.xml.rels', buildWorkbookRelsXml(regions));
  await addZipEntry(outputStream, bytesWrittenRef, zipEntries, 'xl/styles.xml', buildStylesXml());

  for (const [index, region] of regions.entries()) {
    await addZipEntry(
      outputStream,
      bytesWrittenRef,
      zipEntries,
      `xl/worksheets/sheet${index + 1}.xml`,
      createSheetXml(region),
    );
  }

  await addZipEntry(outputStream, bytesWrittenRef, zipEntries, 'docProps/core.xml', buildCoreXml());
  await addZipEntry(outputStream, bytesWrittenRef, zipEntries, 'docProps/app.xml', buildAppXml(regions));

  const centralDirectoryOffset = bytesWrittenRef.value;
  let centralDirectorySize = 0;

  for (const entry of zipEntries) {
    const directoryRecord = createCentralDirectoryHeader(entry);
    await writeBuffer(outputStream, directoryRecord);
    bytesWrittenRef.value += directoryRecord.length;
    centralDirectorySize += directoryRecord.length;
  }

  const endRecord = createEndOfCentralDirectory(
    zipEntries.length,
    centralDirectorySize,
    centralDirectoryOffset,
  );

  await writeBuffer(outputStream, endRecord);
  bytesWrittenRef.value += endRecord.length;

  outputStream.end();
  await once(outputStream, 'finish');

  const totalDistricts = regions.reduce((sum, region) => sum + region.districts.length, 0);
  const totalTitles = totalDistricts * TITLES_PER_DISTRICT;

  return {
    path: targetPath,
    sheets: regions.length,
    districts: totalDistricts,
    totalTitles,
  };
}

const targetPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_OUTPUT_PATH;

exportWorkbook(targetPath)
  .then((result) => {
    console.log(`Saved ${result.path}`);
    console.log(`Sheets: ${result.sheets}`);
    console.log(`Districts: ${result.districts}`);
    console.log(`Titles: ${result.totalTitles}`);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
