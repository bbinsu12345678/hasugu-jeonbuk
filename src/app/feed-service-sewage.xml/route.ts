import { buildFeedXml, filterByService } from '@/lib/feed-builder';

export const dynamic = 'force-static';

export async function GET() {
  const xml = buildFeedXml({
    posts: filterByService('오수관막힘'),
    titleSuffix: '- 오수관막힘 전체 피드',
    selfPath: '/feed-service-sewage.xml',
  });
  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
