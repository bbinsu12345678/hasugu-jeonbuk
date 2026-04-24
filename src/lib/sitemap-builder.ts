/**
 * sitemap 분할 공통 빌더.
 *
 * 경쟁사(jianhomecare.com) 방식: sitemap index + 파트 파일 12개.
 * 우리: 19,420 URL 을 10,000 단위로 분할 → index + part1 + part2.
 *
 * 각 파트 ≤ 10,000 URL · 각 파일 ≤ 10MB (Cloudflare Pages 25MB 한도 통과).
 */

import { siteConfig } from '@/config/site';
import { blogPosts } from '@/data/blog-posts';
import { regions } from '@/data/regions';

export const LASTMOD = '2026-04-20';
export const BASE = siteConfig.domain;

export const PART_SIZE = 10_000;

export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function encodePath(url: string): string {
  try {
    return new URL(url).toString();
  } catch {
    return url;
  }
}

export interface SitemapEntry {
  loc: string;
  priority: number;
  image?: string;
  imageCaption?: string;
}

/** 전체 URL entry 목록 (홈 + 광역 + 시 허브 14 + 블로그 19,404) */
export function allEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  entries.push({
    loc: `${BASE}/`,
    priority: 1.0,
    image: `${BASE}/images/og/jeonbuk.png`,
    imageCaption: '전북하수구 · 전라북도 배관 전문',
  });
  entries.push({
    loc: `${BASE}/jeonbuk`,
    priority: 0.95,
    image: `${BASE}/images/og/jeonbuk.png`,
    imageCaption: '전라북도 14 시/군 배관 서비스',
  });
  for (const r of regions) {
    entries.push({
      loc: `${BASE}/${r.city}`,
      priority: 0.9,
      image: `${BASE}/images/og/${r.city}.png`,
      imageCaption: `${r.city} 배관 · 24시 긴급 출동`,
    });
  }
  for (const post of blogPosts) {
    entries.push({
      loc: `${BASE}/${post.city}/${post.slug}`,
      priority: 0.8,
      image: `${BASE}${post.thumbnail}`,
      imageCaption: post.title,
    });
  }
  return entries;
}

function buildUrlXml(e: SitemapEntry): string {
  const loc = xmlEscape(encodePath(e.loc));
  const imgBlock = e.image
    ? `\n    <image:image><image:loc>${xmlEscape(encodePath(e.image))}</image:loc>${e.imageCaption ? `<image:caption>${xmlEscape(e.imageCaption)}</image:caption>` : ''}</image:image>`
    : '';
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${e.priority.toFixed(2)}</priority>${imgBlock}
  </url>`;
}

/** sitemap 파트 XML (개별 urlset) */
export function buildPartXml(entries: SitemapEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(buildUrlXml).join('\n')}
</urlset>
`;
}

/** sitemap index XML (루트 sitemap.xml 용) */
export function buildIndexXml(partNames: string[]): string {
  const sitemaps = partNames
    .map(
      (name) => `  <sitemap>
    <loc>${xmlEscape(`${BASE}/${name}`)}</loc>
    <lastmod>${LASTMOD}</lastmod>
  </sitemap>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>
`;
}

/** PART_SIZE 단위로 분할된 entries 배열 */
export function paginatedParts(): SitemapEntry[][] {
  const all = allEntries();
  const parts: SitemapEntry[][] = [];
  for (let i = 0; i < all.length; i += PART_SIZE) {
    parts.push(all.slice(i, i + PART_SIZE));
  }
  return parts;
}
