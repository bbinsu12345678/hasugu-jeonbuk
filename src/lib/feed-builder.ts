/**
 * RSS feed 공통 빌더 — main feed + 8 서비스 분할 feed 재사용.
 *
 * 경쟁사(jianhomecare.com) 12개 sitemap 분할 방식을 RSS로 확장:
 * - main feed.xml = 최신 500건 + <atom:link rel="alternate"> × 8 service feeds
 * - feed-service-{slug}.xml = 서비스별 전체 item (크기 각 ~3MB)
 *
 * Cloudflare Pages 25MB 한도 통과 + 19,404 전체 색인 유지.
 */

import { siteConfig } from '@/config/site';
import { blogPosts } from '@/data/blog-posts';
import { urlSuffixes, type ServiceType } from '@/data/url-suffixes';
import type { BlogPost } from '@/types';

/** 서비스 한글 → 영문 slug (gen-service-og.py 와 동기) */
export const SERVICE_SLUG: Record<ServiceType, string> = {
  변기막힘: 'toilet',
  싱크대막힘: 'sink',
  하수구막힘: 'drain',
  누수탐지: 'leak',
  에어컨배관청소: 'aircon',
  오수관막힘: 'sewage',
  우수관막힘: 'stormwater',
  맨홀청소: 'manhole',
};

function hashSlug(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function deterministicPubDate(slug: string): string {
  const REF = new Date('2026-04-20T00:00:00Z').getTime();
  const SPAN_DAYS = 180;
  const h = hashSlug(slug);
  const offsetDays = h % SPAN_DAYS;
  return new Date(REF - offsetDays * 86400_000).toUTCString();
}

export function encodePath(url: string): string {
  try {
    return new URL(url).toString();
  } catch {
    return url;
  }
}

export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** post.slug 에서 서비스 타입 추출 */
export function detectServiceType(slug: string): ServiceType {
  for (const s of urlSuffixes) {
    if (slug.includes(s.suffix) || slug.endsWith(s.suffix)) {
      return s.serviceType;
    }
  }
  if (slug.includes('변기')) return '변기막힘';
  if (slug.includes('싱크대')) return '싱크대막힘';
  if (slug.includes('누수')) return '누수탐지';
  if (slug.includes('에어컨')) return '에어컨배관청소';
  if (slug.includes('오수')) return '오수관막힘';
  if (slug.includes('우수')) return '우수관막힘';
  if (slug.includes('맨홀')) return '맨홀청소';
  return '하수구막힘';
}

function renderItem(post: BlogPost, baseUrl: string): string {
  const link = encodePath(`${baseUrl}/${post.city}/${post.slug}`);
  const thumb = encodePath(`${baseUrl}${post.thumbnail}`);
  const pubDate = deterministicPubDate(post.slug);
  const serviceType = detectServiceType(post.slug);
  return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category>${xmlEscape(serviceType)}</category>
      <category>${xmlEscape(post.city)}</category>
      <media:content url="${thumb}" type="image/webp" medium="image" width="1200" height="800">
        <media:title><![CDATA[${post.title}]]></media:title>
      </media:content>
    </item>`;
}

interface BuildOptions {
  posts: BlogPost[];
  titleSuffix: string;
  selfPath: string;
  /** main feed 에 alternate 링크 포함할지 (8 service feeds) */
  includeAlternateLinks?: boolean;
}

export function buildFeedXml({
  posts,
  titleSuffix,
  selfPath,
  includeAlternateLinks = false,
}: BuildOptions): string {
  const baseUrl = siteConfig.domain;
  const buildDate = new Date('2026-04-20T00:00:00Z').toUTCString();
  const sorted = [...posts].sort((a, b) => {
    return (
      new Date(deterministicPubDate(b.slug)).getTime() -
      new Date(deterministicPubDate(a.slug)).getTime()
    );
  });
  const items = sorted.map((p) => renderItem(p, baseUrl)).join('');

  const alternateLinks = includeAlternateLinks
    ? Object.entries(SERVICE_SLUG)
        .map(
          ([name, slug]) =>
            `    <atom:link href="${baseUrl}/feed-service-${slug}.xml" rel="alternate" type="application/rss+xml" title="${xmlEscape(name)} 전체 피드"/>`
        )
        .join('\n')
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${xmlEscape(siteConfig.name)} ${xmlEscape(titleSuffix)}</title>
    <link>${baseUrl}</link>
    <description>${xmlEscape(siteConfig.seo.description)}</description>
    <language>ko-KR</language>
    <copyright>Copyright 2026 ${xmlEscape(siteConfig.business.company)}</copyright>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <generator>Next.js 16 Static Export</generator>
    <atom:link href="${baseUrl}${selfPath}" rel="self" type="application/rss+xml"/>
${alternateLinks}
    <image>
      <url>${baseUrl}/images/og/jeonbuk.png</url>
      <title>${xmlEscape(siteConfig.name)}</title>
      <link>${baseUrl}</link>
      <width>1200</width>
      <height>630</height>
    </image>
    ${items}
  </channel>
</rss>`;
}

export function filterByService(type: ServiceType): BlogPost[] {
  return blogPosts.filter((p) => detectServiceType(p.slug) === type);
}
