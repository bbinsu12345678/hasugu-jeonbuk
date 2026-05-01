import { siteConfig } from '@/config/site';
import type { FaqItem, BlogPost } from '@/types';
import { SERVICE_TYPES } from '@/data/url-suffixes';

/** 서비스 한글 → 영문 slug (gen-service-og.py 와 동기) */
const SERVICE_SLUG: Record<string, string> = {
  변기막힘: 'toilet',
  싱크대막힘: 'sink',
  하수구막힘: 'drain',
  누수탐지: 'leak',
  에어컨배관청소: 'aircon',
  오수관막힘: 'sewage',
  우수관막힘: 'stormwater',
  맨홀청소: 'manhole',
};

/** placeholder 필터 — "example" 포함 시 omit */
function realOrUndef(value: string | undefined): string | undefined {
  if (!value) return undefined;
  if (value.includes('example') || value.includes('YOUR_')) return undefined;
  return value;
}

/** 결정론적 해시 (slug 기반, same as [city]/[slug]/page.tsx hashSlug) */
function hashSlug(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** slug 해시 → 결정론적 ISO 날짜 (2024-01-01 ~ 2026-04-20 범위) */
function deterministicDate(slug: string, offsetDays = 0): string {
  const BASE = new Date('2024-01-01T00:00:00Z').getTime();
  const SPAN_DAYS = 840;
  const h = hashSlug(slug + offsetDays);
  const days = h % SPAN_DAYS;
  const dt = new Date(BASE + days * 86400_000);
  return dt.toISOString();
}

/** 2026-04-20 고정 dateModified (FAQ 섹션용, 사이트 리뉴얼 기준일) */
const SITE_DATE_MODIFIED = '2026-04-20T00:00:00Z';

/** LocalBusiness / Plumber JSON-LD — schema.org 2025 필드 반영 */
export function generateLocalBusinessJsonLd() {
  const areaServed = [
    '전주시', '군산시', '익산시', '정읍시', '남원시', '김제시',
    '완주군', '고창군', '부안군', '진안군', '무주군', '장수군',
    '임실군', '순창군',
  ];

  const makesOffer = SERVICE_TYPES.map((svc) => {
    const slug = SERVICE_SLUG[svc];
    return {
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: svc,
        serviceType: svc,
        areaServed: areaServed.map((c) => `전라북도 ${c}`),
        provider: {
          '@type': 'Organization',
          name: siteConfig.business.company,
        },
        ...(slug
          ? {
              image: `${siteConfig.domain}/images/og/service-${slug}.png`,
            }
          : {}),
      },
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
    };
  });

  const kakaoUrl = realOrUndef(siteConfig.kakaoUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    '@id': `${siteConfig.domain}/#business`,
    name: siteConfig.business.company,
    legalName: siteConfig.business.company,
    description: siteConfig.description,
    url: siteConfig.domain,
    telephone: siteConfig.phone,
    taxID: siteConfig.business.number,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.business.address,
      addressLocality: '전주시',
      addressRegion: '전라북도',
      addressCountry: 'KR',
    },
    areaServed: areaServed.map((city) => ({
      '@type': 'City',
      name: `전라북도 ${city}`,
    })),
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday', 'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    priceRange: '₩₩',
    paymentAccepted: ['현금', '계좌이체', '카드'],
    currenciesAccepted: 'KRW',
    knowsAbout: [...SERVICE_TYPES],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: '전북하수구 서비스 카탈로그',
      itemListElement: makesOffer,
    },
    ...(kakaoUrl ? { sameAs: [kakaoUrl] } : {}),
    image: `${siteConfig.domain}/images/og/jeonbuk.png`,
    logo: `${siteConfig.domain}/images/logo.png`,
  };
}

/** SiteNavigationElement JSON-LD */
export function generateSiteNavigationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: ['홈', '서비스', '후기', '블로그', '문의하기'],
    url: [
      `${siteConfig.domain}/`,
      `${siteConfig.domain}/#services`,
      `${siteConfig.domain}/#testimonials`,
      `${siteConfig.domain}/#blog`,
      `${siteConfig.domain}/#contact`,
    ],
  };
}

/** ItemList JSON-LD (서비스 8종 전체) */
export function generateItemListJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: SERVICE_TYPES.length,
    itemListElement: SERVICE_TYPES.map((svc, idx) => {
      const slug = SERVICE_SLUG[svc];
      return {
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Service',
          name: svc,
          serviceType: svc,
          url: `${siteConfig.domain}/`,
          ...(slug
            ? { image: `${siteConfig.domain}/images/og/service-${slug}.png` }
            : {}),
          provider: {
            '@type': 'Organization',
            name: siteConfig.business.company,
          },
        },
      };
    }),
  };
}

/** FAQPage JSON-LD */
export function generateFaqJsonLd(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    dateModified: SITE_DATE_MODIFIED,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/** BreadcrumbList JSON-LD */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Article JSON-LD (블로그 포스트용) — 2025 필드: speakable · articleBody · wordCount · 결정론적 date */
export function generateArticleJsonLd(post: BlogPost) {
  const publishedAt = deterministicDate(post.slug, 0);
  const modifiedAt = deterministicDate(post.slug, 1);
  const sectionsText = post.sections.map((s) => s.content).join(' ');
  const wordCount = sectionsText.replace(/\s+/g, '').length;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    articleBody: post.excerpt.slice(0, 120),
    wordCount,
    image: `${siteConfig.domain}${post.thumbnail}`,
    datePublished: publishedAt,
    dateModified: modifiedAt,
    inLanguage: 'ko-KR',
    author: {
      '@type': 'Organization',
      name: siteConfig.business.company,
      url: siteConfig.domain,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.business.company,
      url: siteConfig.domain,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.domain}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.domain}/${post.city}/${post.slug}`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2'],
    },
    keywords: post.keywords.slice(0, 10).join(', '),
  };
}
