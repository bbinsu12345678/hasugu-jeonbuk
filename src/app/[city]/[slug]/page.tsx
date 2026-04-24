import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts } from '@/data/blog-posts';
import { siteConfig } from '@/config/site';
import {
  generateFaqJsonLd,
  generateItemListJsonLd,
  generateBreadcrumbJsonLd,
  generateArticleJsonLd,
} from '@/lib/seo';
import { decodeCityParam, decodeSlugParam } from '@/lib/route-params';

interface Props {
  params: Promise<{ city: string; slug: string }>;
}

// 정적 경로 생성
export const dynamicParams = false;

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    city: post.city,
    slug: post.slug,
  }));
}

// 메타데이터
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: rawCity, slug: rawSlug } = await params;
  const city = decodeCityParam(rawCity);
  const slug = decodeSlugParam(rawSlug);
  const post = blogPosts.find((p) => p.city === city && p.slug === slug);
  if (!post) return {};

  const pageUrl = `${siteConfig.domain}/${post.city}/${post.slug}`;

  return {
    title: `${post.city} ${post.title}`,
    description: `${post.city} ${post.title} - 변기막힘 싱크대막힘 하수구막힘 전문가가 24시간 빠른 방문 해드립니다. 출장비 무료, 현장 상담 후 견적! ${post.keywords.slice(0, 5).join(' ')}`,
    keywords: [...post.keywords, '변기막힘', '싱크대막힘', '하수구막힘', '24시', '뚫는업체'],
    openGraph: {
      type: 'article',
      title: `${post.city} ${post.title}`,
      description: `${post.city} ${post.title} - 변기막힘 싱크대막힘 하수구막힘 전문가가 24시간 빠른 방문 해드립니다.`,
      url: pageUrl,
      images: [
        {
          url: `${siteConfig.domain}${post.thumbnail}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.city} ${post.title}`,
      description: `${post.city} ${post.title} - 변기막힘 싱크대막힘 하수구막힘 24시 빠른 방문`,
      images: [`${siteConfig.domain}${post.thumbnail}`],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

// 색상 변형 팔레트 (배경 그라데이션 + 테두리 + 텍스트)
const colorThemes = [
  { bg: 'from-blue-50 to-blue-100', border: 'border-blue-300', text: 'text-blue-500', accent: 'text-blue-700' },
  { bg: 'from-green-50 to-green-100', border: 'border-green-300', text: 'text-green-500', accent: 'text-green-700' },
  { bg: 'from-orange-50 to-orange-100', border: 'border-orange-300', text: 'text-orange-500', accent: 'text-orange-700' },
  { bg: 'from-purple-50 to-purple-100', border: 'border-purple-300', text: 'text-purple-500', accent: 'text-purple-700' },
  { bg: 'from-red-50 to-red-100', border: 'border-red-300', text: 'text-red-500', accent: 'text-red-700' },
  { bg: 'from-teal-50 to-teal-100', border: 'border-teal-300', text: 'text-teal-500', accent: 'text-teal-700' },
  { bg: 'from-indigo-50 to-indigo-100', border: 'border-indigo-300', text: 'text-indigo-500', accent: 'text-indigo-700' },
  { bg: 'from-amber-50 to-amber-100', border: 'border-amber-300', text: 'text-amber-500', accent: 'text-amber-700' },
];

// 아이콘 이모지 풀 (섹션별 다른 아이콘)
const sectionIcons = ['🔧', '🚿', '🏠', '⭐', '💡', '📋', '🛠️', '✅', '📞', '🔍'];

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * 도시 + 섹션 인덱스 기반 CSS 필터 생성
 * 같은 이미지 파일이어도 도시마다 다른 색감으로 렌더링됨.
 *
 * - hue-rotate: 0~345도 (24단계, 15도 간격)
 * - brightness: 0.92~1.08
 * - contrast: 0.95~1.08
 * - saturate: 0.90~1.15
 */
function makeImageFilter(city: string, sectionIdx: number): string {
  const h = hashSlug(city + sectionIdx);
  const hue = (h % 24) * 15;                    // 0, 15, 30, ... 345
  const brightness = 0.92 + ((h >> 4) % 17) / 100;  // 0.92~1.08
  const contrast = 0.95 + ((h >> 8) % 14) / 100;    // 0.95~1.08
  const saturate = 0.90 + ((h >> 12) % 26) / 100;   // 0.90~1.15
  return `hue-rotate(${hue}deg) brightness(${brightness.toFixed(2)}) contrast(${contrast.toFixed(2)}) saturate(${saturate.toFixed(2)})`;
}

export default async function BlogPostPage({ params }: Props) {
  const { city: rawCity, slug: rawSlug } = await params;
  const city = decodeCityParam(rawCity);
  const slug = decodeSlugParam(rawSlug);
  const post = blogPosts.find((p) => p.city === city && p.slug === slug);
  if (!post) notFound();

  const faqLd = generateFaqJsonLd(post.faq);
  const itemListLd = generateItemListJsonLd();
  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: '홈', url: siteConfig.domain },
    { name: post.city, url: `${siteConfig.domain}/#blog` },
    { name: post.title, url: `${siteConfig.domain}/${post.city}/${post.slug}` },
  ]);
  const articleLd = generateArticleJsonLd(post);

  const pageHash = hashSlug(slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
        {/* 제목 */}
        <div className="mb-6">
          <h1 className="mb-3 text-2xl font-bold md:text-3xl">
            {post.title}
          </h1>
          <div className="flex gap-2 text-sm text-gray-500">
            <span>{post.city} 배관 전문</span>
            <span>|</span>
            <span>24시 빠른 방문</span>
          </div>
        </div>

        {/* 본문 */}
        <article className="card-shadow mb-8 p-6">
          {/* 목차 */}
          <nav className="toc">
            <strong>목차</strong>
            <ul>
              {post.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>{s.title}</a>
                </li>
              ))}
            </ul>
          </nav>

          <hr className="my-6" />

          {/* 섹션 */}
          {post.sections.map((section, idx) => {
            const theme = colorThemes[(pageHash + idx) % colorThemes.length];
            const icon = sectionIcons[(pageHash + idx) % sectionIcons.length];
            const imageFilter = makeImageFilter(post.city + post.slug, idx);

            return (
              <div key={section.id} className="mb-8">
                <h2
                  id={section.id}
                  className="mb-4 text-center text-xl font-bold md:text-2xl"
                >
                  {section.title}
                </h2>

                {/* 실제 이미지 + 도시별 CSS filter 변형 + 색상 프레임 */}
                <div
                  className={`mx-auto mb-4 overflow-hidden rounded-xl border-2 bg-gradient-to-br ${theme.bg} ${theme.border}`}
                  style={{ width: '85%', maxWidth: 600 }}
                >
                  <div className="relative">
                    <img
                      src={section.image}
                      alt={section.imageAlt}
                      className="aspect-[3/2] w-full object-contain bg-gray-50"
                      loading="lazy"
                      width={1200}
                      height={800}
                      style={{ filter: imageFilter }}
                    />
                    <div className="absolute top-2 right-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow">
                      <span className="mr-1">{icon}</span>
                      <span className={theme.accent}>{post.city}</span>
                    </div>
                  </div>
                  <div className="p-2 text-center">
                    <p className={`text-xs font-medium ${theme.accent}`}>
                      {section.imageAlt}
                    </p>
                  </div>
                </div>

                <p className="leading-relaxed text-gray-700">
                  {section.content}
                </p>

                <hr className="mt-6" />
              </div>
            );
          })}
        </article>

        {/* 지역 서비스 테이블 */}
        <div className="card-shadow mb-8 p-6">
          <p className="mb-4 text-sm text-gray-600">
            {post.city} 전 지역을 대상으로 변기막힘, 싱크대막힘,
            하수구막힘 서비스를 신속하게 제공하고 있습니다.
          </p>

          <div className="overflow-x-auto">
            <table className="region-table">
              <thead>
                <tr>
                  <th>변기막힘</th>
                  <th>싱크대막힘</th>
                  <th>하수구막힘</th>
                </tr>
              </thead>
              <tbody>
                {post.regionTable.map((row) => (
                  <tr key={row.district}>
                    <td>{row.district} 변기막힘</td>
                    <td>{row.district} 싱크대막힘</td>
                    <td>{row.district} 하수구막힘</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 관련 키워드 */}
        <div className="card-shadow p-6">
          <h3 className="mb-3 text-base font-bold">관련 키워드</h3>
          <div className="flex flex-wrap gap-2">
            {post.keywords.map((kw) => (
              <Link
                key={kw}
                href="/"
                className="rounded-full border border-[--color-primary] px-3 py-1 text-sm text-[--color-primary] transition hover:bg-[--color-primary] hover:text-white"
              >
                {kw}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
