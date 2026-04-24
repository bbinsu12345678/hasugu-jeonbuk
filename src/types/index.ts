// 사이트 설정
export interface SiteConfig {
  name: string;
  phone: string;
  phoneRaw: string;
  kakaoUrl: string;
  domain: string;
  description: string;
  business: {
    company: string;
    representative: string;
    number: string;
    address: string;
  };
  emailjs: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
  verification: {
    naver: string;
    google: string;
  };
  /** IndexNow 키 (빙·얀덱스·세즈남 즉시 색인 제출용). 32자 hex. */
  indexNowKey: string;
  seo: {
    h1: string;
    h1Accent: string;
    description: string;
    keywords: string[];
    ogImage: string;
  };
}

// 네비게이션
export interface NavItem {
  label: string;
  href: string;
}

// 특징 카드 (6개)
export interface Facility {
  icon: string;
  title: string;
  description: string;
}

// 서비스 (3개: 변기/싱크대/하수구)
export interface ServiceSymptom {
  label: string;
  detail: string;
}

export interface Service {
  slug: string;
  title: string;
  image: string;
  bgImage?: string;
  description: string;
  symptoms: ServiceSymptom[];
}

// 고객 후기
export interface Testimonial {
  name: string;
  location: string;
  avatar: string;
  content: string;
}

// 블로그 포스트
export interface BlogPost {
  slug: string;
  city: string;
  title: string;
  thumbnail: string;
  excerpt: string;
  sections: BlogSection[];
  regionTable: RegionTableRow[];
  keywords: string[];
  faq: FaqItem[];
}

export interface BlogSection {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  content: string;
}

export interface RegionTableRow {
  district: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

// 지역 데이터
export interface Region {
  city: string;
  districts: string[];
}
