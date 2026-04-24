/**
 * feed.xml — main RSS (최신 500건 actual items) + 8 service feeds 에 alternate 링크.
 *
 * 경쟁사(jianhomecare.com) sitemap 12개 분할 논리를 RSS에 확장.
 * Feedly·Naver Yeti 호환: feed.xml 은 actual items 보유 (index-only 금지).
 * 전체 19,404 item 커버리지는 8개 service feeds + sitemap-index.xml 이 담당.
 */

import { blogPosts } from '@/data/blog-posts';
import { buildFeedXml } from '@/lib/feed-builder';

export const dynamic = 'force-static';

const MAIN_FEED_ITEMS = 500;

export async function GET() {
  const xml = buildFeedXml({
    posts: blogPosts.slice(0, MAIN_FEED_ITEMS),
    titleSuffix: '- 변기막힘 싱크대막힘 하수구막힘 블로그',
    selfPath: '/feed.xml',
    includeAlternateLinks: true,
  });

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
