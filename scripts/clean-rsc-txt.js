#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '..', 'out');
const KEEP = new Set(['robots.txt']);
const INDEXNOW_RE = /^[a-f0-9]{32}\.txt$/i;

let removed = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(p); continue; }
    if (!entry.name.endsWith('.txt')) continue;
    if (KEEP.has(entry.name)) continue;
    if (INDEXNOW_RE.test(entry.name)) continue;
    fs.unlinkSync(p);
    removed++;
  }
}

if (!fs.existsSync(OUT)) {
  console.log('[clean-rsc-txt] no out/ dir, skip');
  process.exit(0);
}
const t = Date.now();
walk(OUT);
console.log(`[clean-rsc-txt] removed ${removed} RSC .txt files in ${Date.now()-t}ms`);
