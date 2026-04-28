import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import {
  generateLocalBusinessJsonLd,
  generateSiteNavigationJsonLd,
} from '@/lib/seo';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingCTA from '@/components/ui/FloatingCTA';
import ChatBot from '@/components/ui/ChatBot';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | 변기막힘 하수구막힘 싱크대막힘 하수구고압세척 24시 뚫는 업체 - 빠른 방문!`,
    template: `%s | ${siteConfig.name} - 변기막힘 하수구막힘 24시 빠른 방문`,
  },
  description: siteConfig.seo.description,
  keywords: siteConfig.seo.keywords,
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: siteConfig.domain,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | 변기막힘 하수구막힘 싱크대막힘 24시 빠른 방문`,
    description: siteConfig.seo.description,
    images: [
      {
        url: `${siteConfig.domain}/images/og/jeonbuk.png`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - 변기막힘 싱크대막힘 하수구막힘 전문`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | 변기막힘 하수구막힘 싱크대막힘 24시`,
    description: siteConfig.seo.description,
    images: [`${siteConfig.domain}/images/og/jeonbuk.png`],
  },
  verification: {
    google: siteConfig.verification.google || undefined,
    other: {
      ...(siteConfig.verification.naver && {
        'naver-site-verification': siteConfig.verification.naver,
      }),
    },
  },
  alternates: {
    canonical: siteConfig.domain,
  },
  // 모바일 SEO (네이버 모바일 최적화)
  formatDetection: {
    telephone: true,
    date: false,
    address: false,
    email: false,
    url: false,
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: 'default',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'theme-color': '#1B3B5F',
    'msapplication-TileColor': '#1B3B5F',
    // 네이버 Yeti 봇 (모바일 최적화 표시)
    'NaverBot': 'All',
    'Yeti': 'All',
    // 지역 좌표 메타 (로컬 검색 보조)
    'geo.region': 'KR-45',
    'geo.placename': '전라북도 전주시',
    'geo.position': '35.8242;127.1480',
    'ICBM': '35.8242, 127.1480',
    // 저자·발행자 정보
    'author': siteConfig.business.company,
    'publisher': siteConfig.business.company,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localBusinessLd = generateLocalBusinessJsonLd();
  const siteNavLd = generateSiteNavigationJsonLd();

  return (
    <html lang="ko">
      <head>
        {/* LCP image preload — browser fetches before render */}
        <link
          rel="preload"
          as="image"
          href="/images/hero/banner-1-600.webp"
          imageSrcSet="/images/hero/banner-1-600.webp 600w, /images/hero/banner-1-1200.webp 1200w"
          imageSizes="(max-width: 640px) 90vw, 600px"
          fetchPriority="high"
        />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${siteConfig.name} 블로그 RSS`}
          href={`${siteConfig.domain}/feed.xml`}
        />
        {/* canonical 은 페이지별 metadata.alternates.canonical 로 렌더.
            레이아웃에서 하드코드 시 전 페이지 canonical 이 홈으로 덮여 색인 실패. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteNavLd),
          }}
        />
      </head>
      <body className="bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <FloatingCTA />
        <ChatBot />
      </body>
    </html>
  );
}
