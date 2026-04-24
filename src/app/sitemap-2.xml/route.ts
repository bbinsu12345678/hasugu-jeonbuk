import { paginatedParts, buildPartXml } from '@/lib/sitemap-builder';

export const dynamic = 'force-static';

export function GET(): Response {
  const parts = paginatedParts();
  const entries = parts[1] ?? [];
  const body = buildPartXml(entries);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
