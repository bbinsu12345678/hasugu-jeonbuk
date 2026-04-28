import type { SiteConfig, NavItem } from '@/types';

// ============================================================
// 멀티사이트 템플릿: 이 파일만 수정하면 새 사이트 생성 가능
// ============================================================

export const siteConfig: SiteConfig = {
  // --- 기본 정보 ---
  name: '전북하수구',
  phone: '010-8184-3496',
  phoneRaw: '01081843496',
  kakaoUrl: 'https://open.kakao.com/o/sfIQ14li',
  domain: 'https://hasugu-jeonbuk.com',
  description:
    '변기막힘, 싱크대막힘, 하수구막힘 전문가가 전주 익산 군산 정읍 남원 김제 완주 고창 부안 진안 무주 장수 임실 순창 24시간 빠른 방문 해드립니다.',

  // --- 사업자 정보 ---
  business: {
    company: '전북하수구',
    representative: '오다희',
    number: '284-14-02826',
    address: '전라북도 전주시 덕진구 쪽구름로 42',
  },

  // --- EmailJS 설정 ---
  emailjs: {
    serviceId: 'service_example',
    templateId: 'template_example',
    publicKey: 'YOUR_PUBLIC_KEY',
  },

  // --- 검색엔진 인증 ---
  verification: {
    naver: '8798183b1fa3719bcc6a55c30c4a0b539fd4300f',
    google: '', // Google Search Console 도메인 방식 (DNS TXT) 인증 완료 — meta 태그 불필요
  },

  // --- IndexNow 키 (빙/얀덱스/세즈남 즉시 색인) ---
  // public/{key}.txt 에도 동일 값이 있어야 함 (프로토콜 필수)
  indexNowKey: '3578809e434106335a30185a7e5c5284',

  // --- SEO 설정 ---
  seo: {
    h1: '변기막힘 싱크대막힘 하수구막힘\n24시 뚫는 업체',
    h1Accent: '전북 전 지역 빠른 방문',
    description:
      '변기막힘 하수구막힘 싱크대막힘 하수구고압세척 등 하수구뚫음 전문가로써 전주 익산 군산 정읍 남원 김제 완주 고창 부안 진안 무주 장수 임실 순창 어디든 24시 방문하여 현장 상담 후 견적해 드립니다. 출장비 무료, 친절 상담.',
    keywords: [
      // 공통 서비스 키워드 (경쟁사 패턴)
      '변기막힘', '싱크대막힘', '하수구막힘',
      '변기뚫는업체', '하수구뚫는곳', '24시배관',
      '하수구고압세척', '하수구뚫음', '싱크대뚫는곳',
      '변기수리', '배관막힘', '배수구막힘',
      '변기뚫는법', '싱크대뚫는업체', '하수구뚫는업체',
      '변기막힘업체', '변기막힘비용', '하수구역류',
      '24시변기', '24시하수구', '배관청소',
      // 지역 키워드 (경쟁사 = 서울 25구, 우리 = 전북 14시군)
      '전주변기막힘', '군산변기막힘', '익산변기막힘',
      '정읍변기막힘', '남원변기막힘', '김제변기막힘',
      '완주변기막힘', '고창변기막힘', '부안변기막힘',
      '진안변기막힘', '무주변기막힘', '장수변기막힘',
      '임실변기막힘', '순창변기막힘',
      '변기막혔을때',
    ],
    ogImage: '/images/og-image.png',
  },
};

// 네비게이션 메뉴
export const navItems: NavItem[] = [
  { label: '홈', href: '/' },
  { label: '서비스', href: '/#services' },
  { label: '후기', href: '/#testimonials' },
  { label: '블로그', href: '/#blog' },
  { label: '문의하기', href: '/#contact' },
];
