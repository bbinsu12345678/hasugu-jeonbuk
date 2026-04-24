/**
 * 시공·출장 경험 시설 · 브랜드 — 로컬 로고 이미지 (빌드타임 다운로드).
 *
 * 로고: public/images/partners/{slug}.svg|.png
 *  - Simple Icons 출처 (컬러 SVG)
 *  - Google S2 Favicons 출처 (PNG 128px)
 *  - 외부 CDN 실패한 브랜드는 logoUrl 생략 → 컬러 배지 + 한글 텍스트 폴백
 *
 * 갱신: `node scripts/download-partner-logos.mjs`
 */

export type Partner = {
  name: string;
  symbol: string;
  category:
    | 'public'
    | 'conglomerate'
    | 'retail'
    | 'franchise'
    | 'residential'
    | 'finance'
    | 'logistics';
  color: string;
  /** 로컬 로고 경로 (없으면 색 배지) */
  logoUrl?: string;
  /** true = 흰 배경에 그대로 (keepColor), false = 다크 반전 */
  keepColor?: boolean;
};

export const partners: Partner[] = [
  // 관공서 · 공공기관
  { name: '전주시청', symbol: '전주', category: 'public', color: '#003974', logoUrl: '/images/partners/jeonju-city.png', keepColor: true },
  { name: '익산시청', symbol: '익산', category: 'public', color: '#006699' }, // favicon 없음 → 색 배지
  { name: '익산역', symbol: 'KTX', category: 'public', color: '#0055A4', logoUrl: '/images/partners/iksan-ktx.png', keepColor: true },
  { name: '우체국', symbol: '우체국', category: 'public', color: '#ED1C24' }, // favicon 없음

  // 대기업
  { name: '삼성', symbol: '삼성', category: 'conglomerate', color: '#1428A0', logoUrl: '/images/partners/samsung.svg', keepColor: true },
  { name: 'LG', symbol: 'LG', category: 'conglomerate', color: '#A50034', logoUrl: '/images/partners/lg.svg', keepColor: true },
  { name: '현대', symbol: 'HYUNDAI', category: 'conglomerate', color: '#002C5F', logoUrl: '/images/partners/hyundai.svg', keepColor: true },
  { name: 'SK', symbol: 'SK', category: 'conglomerate', color: '#E8340F', logoUrl: '/images/partners/sk.png', keepColor: true },
  { name: '롯데', symbol: '롯데', category: 'conglomerate', color: '#ED1C24', logoUrl: '/images/partners/lotte.png', keepColor: true },
  { name: '한화', symbol: '한화', category: 'conglomerate', color: '#F37321', logoUrl: '/images/partners/hanwha.png', keepColor: true },

  // 유통 · 쇼핑
  { name: '쿠팡', symbol: 'Coupang', category: 'retail', color: '#F02020' }, // CDN 404
  { name: '이마트', symbol: '이마트', category: 'retail', color: '#FFC300', logoUrl: '/images/partners/emart.png', keepColor: true },
  { name: '홈플러스', symbol: 'HP', category: 'retail', color: '#ED1A3B', logoUrl: '/images/partners/homeplus.png', keepColor: true },
  { name: '롯데마트', symbol: '롯데마트', category: 'retail', color: '#DA291C', logoUrl: '/images/partners/lottemart.png', keepColor: true },
  { name: '코스트코', symbol: 'COSTCO', category: 'retail', color: '#005DAA' }, // CDN 404

  // 음식점 · 프랜차이즈
  { name: '스타벅스', symbol: '스타벅스', category: 'franchise', color: '#00704A', logoUrl: '/images/partners/starbucks.svg', keepColor: true },
  { name: '맥도날드', symbol: 'McD', category: 'franchise', color: '#FFC72C', logoUrl: '/images/partners/mcdonalds.svg', keepColor: true },
  { name: 'BBQ', symbol: 'BBQ', category: 'franchise', color: '#E31F24', logoUrl: '/images/partners/bbq.png', keepColor: true },
  { name: '교촌치킨', symbol: '교촌', category: 'franchise', color: '#E52421', logoUrl: '/images/partners/kyochon.png', keepColor: true },
  { name: '롯데리아', symbol: '롯데리아', category: 'franchise', color: '#D21033', logoUrl: '/images/partners/lotteria.png', keepColor: true },
  { name: '파리바게뜨', symbol: '파리바게뜨', category: 'franchise', color: '#002C5F' }, // favicon 없음
  { name: 'GS25', symbol: 'GS25', category: 'franchise', color: '#002F87', logoUrl: '/images/partners/gs25.png', keepColor: true },
  { name: 'CU', symbol: 'CU', category: 'franchise', color: '#662D91', logoUrl: '/images/partners/cu.png', keepColor: true },

  // 주거 · 건설
  { name: '힐스테이트', symbol: '힐스', category: 'residential', color: '#002C5F', logoUrl: '/images/partners/hillstate.png', keepColor: true },
  { name: '자이', symbol: 'XI', category: 'residential', color: '#000000' }, // favicon 없음
  { name: '푸르지오', symbol: '푸르지오', category: 'residential', color: '#007A33' }, // favicon 없음
  { name: '래미안', symbol: '래미안', category: 'residential', color: '#00205B' }, // favicon 없음

  // 금융
  { name: 'KB', symbol: 'KB', category: 'finance', color: '#FFC400', logoUrl: '/images/partners/kb.png', keepColor: true },
  { name: '신한', symbol: '신한', category: 'finance', color: '#0046FF' }, // favicon 없음
  { name: '우리', symbol: '우리', category: 'finance', color: '#0083CA', logoUrl: '/images/partners/woori.png', keepColor: true },
  { name: 'NH', symbol: 'NH', category: 'finance', color: '#034EA2' }, // favicon 없음

  // 물류
  { name: 'CJ', symbol: 'CJ', category: 'logistics', color: '#EC1D23', logoUrl: '/images/partners/cj.png', keepColor: true },
  { name: '한진', symbol: '한진', category: 'logistics', color: '#F58220', logoUrl: '/images/partners/hanjin.png', keepColor: true },
];
