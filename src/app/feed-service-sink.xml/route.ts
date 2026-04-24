import { buildFeedXml, filterByService } from '@/lib/feed-builder';

export const dynamic = 'force-static';

export async function GET() {
  const xml = buildFeedXml({
    posts: filterByService('싱크대막힘'),
    titleSuffix: '- 싱크대막힘 전체 피드',
    selfPath: '/feed-service-sink.xml',
  });
  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
