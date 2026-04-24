/**
 * sitemap.xml — sitemap **index** (경쟁사 jianhomecare.com 방식).
 *
 * 경쟁사: 72,212 URL 을 sitemap2~13.xml 로 12분할 + sitemap_index.xml.
 * 우리: 19,420 URL 을 sitemap-1/2.xml 로 2분할 + 본 파일이 index.
 *
 * 장점: Cloudflare Pages 25MB 한도 통과 + 19,420 전체 색인 유지.
 */

import { paginatedParts, buildIndexXml } from '@/lib/sitemap-builder';

export const dynamic = 'force-static';

export function GET(): Response {
  const parts = paginatedParts();
  const partNames = parts.map((_, idx) => `sitemap-${idx + 1}.xml`);
  const body = buildIndexXml(partNames);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
