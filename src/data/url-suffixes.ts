/**
 * URL 접미사 패턴 (동당 60개)
 *
 * 키워드 순서를 변형하여 고유 URL 생성.
 *
 * 각 suffix는 slug에 붙어 최종 URL이 됨:
 *   /{city}/{dong}{suffix}
 *   예: /전주시/덕진동변기막힘뚫는곳업체비용해결후기
 *
 * 서비스 타입은 suffix의 첫 번째 키워드로 자동 감지.
 */

/**
 * 검색 의도 5종 (인트로/결론 톤 결정)
 * - 긴급: "갑자기 막혔어요" 류
 * - 비교: "어디가 좋을까" 류
 * - 비용: "얼마예요" 류
 * - 후기: "후기 찾는" 류
 * - 방법: "어떻게 해결" 류
 */
export type SearchIntent = '긴급' | '비교' | '비용' | '후기' | '방법';

/** 8개 서비스 타입 (기존 3개 + 신규 5개) */
export type ServiceType =
  | '변기막힘'
  | '싱크대막힘'
  | '하수구막힘'
  | '누수탐지'
  | '에어컨배관청소'
  | '오수관막힘'
  | '우수관막힘'
  | '맨홀청소';

export const SERVICE_TYPES: ServiceType[] = [
  '변기막힘',
  '싱크대막힘',
  '하수구막힘',
  '누수탐지',
  '에어컨배관청소',
  '오수관막힘',
  '우수관막힘',
  '맨홀청소',
];

export interface UrlSuffix {
  /** URL에 붙는 접미사 */
  suffix: string;
  /** 서비스 타입 (템플릿 매칭용) */
  serviceType: ServiceType;
  /** 검색 의도 (인트로/결론 톤 매칭) */
  intent: SearchIntent;
  /** 주요 키워드 (Title/Description 생성용) */
  primaryKeywords: string[];
}

/** suffix에서 의도 자동 추출 */
function detectIntent(suffix: string): SearchIntent {
  if (suffix.includes('24시') || suffix.includes('막혔을때') || suffix.includes('긴급')) return '긴급';
  if (suffix.includes('비용') || suffix.includes('가격')) return '비용';
  if (suffix.includes('후기') || suffix.includes('해결후기')) return '후기';
  if (suffix.includes('추천') || suffix.includes('잘하는') || suffix.includes('잘뚫는')) return '비교';
  return '방법';
}

type RawSuffix = Omit<UrlSuffix, 'intent'>;

const rawSuffixes: RawSuffix[] = [
  // ======================================================
  // 변기 카테고리 (15개)
  // ======================================================
  { suffix: '변기막힘뚫는곳업체비용해결후기', serviceType: '변기막힘', primaryKeywords: ['변기막힘', '뚫는곳', '비용', '후기'] },
  { suffix: '24시변기막힘뚫는업체비용해결후기', serviceType: '변기막힘', primaryKeywords: ['24시', '변기막힘', '비용', '후기'] },
  { suffix: '변기막힘고치는곳뚫는업체비용', serviceType: '변기막힘', primaryKeywords: ['변기막힘', '고치는곳', '비용'] },
  { suffix: '변기뚫음막힘해결후기추천', serviceType: '변기막힘', primaryKeywords: ['변기뚫음', '해결', '추천'] },
  { suffix: '24시변기막힘업체해결후기추천', serviceType: '변기막힘', primaryKeywords: ['24시', '변기막힘', '해결', '추천'] },
  { suffix: '변기막혔을때뚫는곳24시업체비용후기', serviceType: '변기막힘', primaryKeywords: ['변기막혔을때', '24시', '비용'] },
  { suffix: '변기막혔을때잘뚫는업체24시추천후기', serviceType: '변기막힘', primaryKeywords: ['변기막혔을때', '24시', '추천'] },
  { suffix: '변기막힘변기뚫음24시잘뚫는곳추천', serviceType: '변기막힘', primaryKeywords: ['변기막힘', '변기뚫음', '추천'] },
  { suffix: '변기뚫음비용변기막힘잘뚫는곳추천', serviceType: '변기막힘', primaryKeywords: ['변기뚫음', '비용', '추천'] },
  { suffix: '변기막힘원인뚫는업체비용해결후기', serviceType: '변기막힘', primaryKeywords: ['변기막힘', '원인', '비용'] },
  { suffix: '변기막힘뚫는업체하수구뚫음후기', serviceType: '변기막힘', primaryKeywords: ['변기막힘', '하수구뚫음', '후기'] },
  { suffix: '변기막힘싱크대뚫음하수구뚫는업체추천', serviceType: '변기막힘', primaryKeywords: ['변기막힘', '싱크대뚫음', '하수구'] },
  { suffix: '변기막힘싱크대뚫음하수구뚫는업체후기', serviceType: '변기막힘', primaryKeywords: ['변기막힘', '싱크대뚫음', '후기'] },
  { suffix: '변기막힘싱크대역류하수구역류비용업체추천', serviceType: '변기막힘', primaryKeywords: ['변기막힘', '역류', '비용'] },
  { suffix: '싱크대막힘변기막힘하수구뚫음업체추천', serviceType: '변기막힘', primaryKeywords: ['싱크대막힘', '변기막힘', '하수구뚫음'] },

  // ======================================================
  // 싱크대 카테고리 (17개)
  // ======================================================
  { suffix: '싱크대막힘뚫는업체비용해결후기', serviceType: '싱크대막힘', primaryKeywords: ['싱크대막힘', '비용', '후기'] },
  { suffix: '24시싱크대막힘뚫는업체해결후기추천', serviceType: '싱크대막힘', primaryKeywords: ['24시', '싱크대막힘', '추천'] },
  { suffix: '싱크대막힘뚫는곳비용업체해결추천', serviceType: '싱크대막힘', primaryKeywords: ['싱크대막힘', '뚫는곳', '비용'] },
  { suffix: '싱크대막힘뚫음해결후기추천', serviceType: '싱크대막힘', primaryKeywords: ['싱크대막힘', '뚫음', '추천'] },
  { suffix: '싱크대뚫음막힘잘뚫는곳추천', serviceType: '싱크대막힘', primaryKeywords: ['싱크대뚫음', '추천'] },
  { suffix: '싱크대막혔을때뚫는곳24시업체비용후기', serviceType: '싱크대막힘', primaryKeywords: ['싱크대막혔을때', '24시', '비용'] },
  { suffix: '싱크대막혔을때잘뚫는업체24시추천후기', serviceType: '싱크대막힘', primaryKeywords: ['싱크대막혔을때', '24시', '추천'] },
  { suffix: '싱크대막힘24시고치는업체뚫는곳비용', serviceType: '싱크대막힘', primaryKeywords: ['싱크대막힘', '24시', '고치는업체'] },
  { suffix: '싱크대막힘하수구막힘뚫는업체추천', serviceType: '싱크대막힘', primaryKeywords: ['싱크대막힘', '하수구막힘', '추천'] },
  { suffix: '싱크대막힘하수구뚫는업체뚫음후기', serviceType: '싱크대막힘', primaryKeywords: ['싱크대막힘', '하수구뚫는업체', '후기'] },
  { suffix: '싱크대막힘하수구뚫음뚫는업체후기', serviceType: '싱크대막힘', primaryKeywords: ['싱크대막힘', '하수구뚫음', '후기'] },
  { suffix: '싱크대막힘변기막힘비용뚫는업체후기', serviceType: '싱크대막힘', primaryKeywords: ['싱크대막힘', '변기막힘', '비용'] },
  { suffix: '싱크대역류변기역류싱크대막힘비용업체추천', serviceType: '싱크대막힘', primaryKeywords: ['싱크대역류', '변기역류', '비용'] },
  { suffix: '하수구막힘싱크대뚫음배관막힘뚫는업체후기', serviceType: '싱크대막힘', primaryKeywords: ['하수구막힘', '싱크대뚫음', '배관'] },
  { suffix: '하수구막힘싱크대뚫음잘뚫는곳추천', serviceType: '싱크대막힘', primaryKeywords: ['하수구막힘', '싱크대뚫음', '추천'] },
  { suffix: '하수구배관막힘싱크대뚫음고압세척업체추천', serviceType: '싱크대막힘', primaryKeywords: ['하수구', '배관막힘', '고압세척'] },
  { suffix: '고압세척싱크대막힘하수구해빙뚫는업체추천', serviceType: '싱크대막힘', primaryKeywords: ['고압세척', '싱크대막힘', '하수구해빙'] },

  // ======================================================
  // 하수구 카테고리 (14개)
  // ======================================================
  { suffix: '하수구막힘뚫는업체비용해결후기', serviceType: '하수구막힘', primaryKeywords: ['하수구막힘', '비용', '후기'] },
  { suffix: '24시하수구막힘고압세척업체해결추천', serviceType: '하수구막힘', primaryKeywords: ['24시', '하수구막힘', '고압세척'] },
  { suffix: '하수구막힘고압세척뚫는업체비용추천', serviceType: '하수구막힘', primaryKeywords: ['하수구막힘', '고압세척', '비용'] },
  { suffix: '하수구막힘뚫음해결후기추천', serviceType: '하수구막힘', primaryKeywords: ['하수구막힘', '뚫음', '추천'] },
  { suffix: '하수구뚫음24시변기막힘잘뚫는곳추천', serviceType: '하수구막힘', primaryKeywords: ['하수구뚫음', '24시', '변기막힘'] },
  { suffix: '하수구막혔을때뚫는곳24시업체비용후기', serviceType: '하수구막힘', primaryKeywords: ['하수구막혔을때', '24시', '비용'] },
  { suffix: '하수구막혔을때잘뚫는업체24시추천후기', serviceType: '하수구막힘', primaryKeywords: ['하수구막혔을때', '24시', '추천'] },
  { suffix: '하수구막힘24시고치는업체고압세척비용', serviceType: '하수구막힘', primaryKeywords: ['하수구막힘', '24시', '고압세척'] },
  { suffix: '하수구막힘24시뚫는업체해결후기추천', serviceType: '하수구막힘', primaryKeywords: ['하수구막힘', '24시', '후기'] },
  { suffix: '하수구막힘고압세척비용역류뚫는업체추천', serviceType: '하수구막힘', primaryKeywords: ['하수구막힘', '고압세척', '역류'] },
  { suffix: '하수구막힘변기막힘싱크대뚫음업체추천', serviceType: '하수구막힘', primaryKeywords: ['하수구막힘', '변기막힘', '싱크대뚫음'] },
  { suffix: '고압세척하수구막힘뚫는업체후기', serviceType: '하수구막힘', primaryKeywords: ['고압세척', '하수구막힘', '후기'] },
  { suffix: '하수구고압세척뚫음뚫는업체추천', serviceType: '하수구막힘', primaryKeywords: ['하수구고압세척', '뚫음', '추천'] },
  { suffix: '하수구해빙막힘고압세척뚫는업체후기', serviceType: '하수구막힘', primaryKeywords: ['하수구해빙', '고압세척', '후기'] },

  // ======================================================
  // 기타 카테고리 (14개) - 오수관/배관/배수구/세면대/욕조/동파/누수
  // ======================================================
  { suffix: '배관막혔을때뚫는곳24시업체비용후기', serviceType: '하수구막힘', primaryKeywords: ['배관막힘', '24시', '비용'] },
  { suffix: '배수구막혔을때뚫는곳24시업체비용후기', serviceType: '싱크대막힘', primaryKeywords: ['배수구막힘', '24시', '비용'] },
  { suffix: '세면대막혔을때뚫는곳24시업체비용후기', serviceType: '싱크대막힘', primaryKeywords: ['세면대막힘', '24시', '비용'] },
  { suffix: '세면대배수구막힘배수관청소업체', serviceType: '싱크대막힘', primaryKeywords: ['세면대', '배수구', '청소'] },
  { suffix: '욕조막혔을때뚫는곳24시업체비용후기', serviceType: '싱크대막힘', primaryKeywords: ['욕조막힘', '24시', '비용'] },
  { suffix: '싱크대하수구변기막힘24시종합뚫는업체추천', serviceType: '하수구막힘', primaryKeywords: ['종합', '24시', '추천'] },

  // ======================================================
  // 누수탐지 카테고리 (5개)
  // ======================================================
  { suffix: '누수탐지전문업체비용해결후기', serviceType: '누수탐지', primaryKeywords: ['누수탐지', '비용', '후기'] },
  { suffix: '누수탐지24시출동전문업체추천', serviceType: '누수탐지', primaryKeywords: ['누수탐지', '24시', '추천'] },
  { suffix: '천장누수벽누수정밀탐지전문', serviceType: '누수탐지', primaryKeywords: ['천장누수', '벽누수', '정밀탐지'] },
  { suffix: '누수의심수도요금급증탐지업체', serviceType: '누수탐지', primaryKeywords: ['누수의심', '수도요금', '탐지'] },
  { suffix: '비파괴누수탐지장비전문업체비용', serviceType: '누수탐지', primaryKeywords: ['비파괴', '누수탐지', '장비'] },

  // ======================================================
  // 에어컨배관청소 카테고리 (5개)
  // ======================================================
  { suffix: '에어컨배관청소전문업체비용후기', serviceType: '에어컨배관청소', primaryKeywords: ['에어컨배관청소', '비용', '후기'] },
  { suffix: '에어컨드레인배관막힘청소업체', serviceType: '에어컨배관청소', primaryKeywords: ['에어컨', '드레인', '배관청소'] },
  { suffix: '에어컨곰팡이냄새배관청소전문', serviceType: '에어컨배관청소', primaryKeywords: ['에어컨', '곰팡이', '냄새'] },
  { suffix: '에어컨물샘배관청소24시출동', serviceType: '에어컨배관청소', primaryKeywords: ['에어컨', '물샘', '24시'] },
  { suffix: '천장형시스템에어컨배관청소전문', serviceType: '에어컨배관청소', primaryKeywords: ['천장형', '시스템에어컨', '청소'] },

  // ======================================================
  // 오수관막힘 카테고리 (5개)
  // ======================================================
  { suffix: '오수관막힘24시뚫는업체비용추천', serviceType: '오수관막힘', primaryKeywords: ['오수관막힘', '24시', '추천'] },
  { suffix: '오수관막혔을때뚫는곳업체비용후기', serviceType: '오수관막힘', primaryKeywords: ['오수관', '뚫는곳', '비용'] },
  { suffix: '공용오수관막힘다세대주택뚫는업체', serviceType: '오수관막힘', primaryKeywords: ['공용오수관', '다세대', '뚫는업체'] },
  { suffix: '오수관역류긴급출동24시업체', serviceType: '오수관막힘', primaryKeywords: ['오수관역류', '긴급', '24시'] },
  { suffix: '오수관고압세척정기점검전문', serviceType: '오수관막힘', primaryKeywords: ['오수관', '고압세척', '정기점검'] },

  // ======================================================
  // 우수관막힘 카테고리 (5개)
  // ======================================================
  { suffix: '우수관막힘청소전문업체비용추천', serviceType: '우수관막힘', primaryKeywords: ['우수관막힘', '청소', '추천'] },
  { suffix: '옥상빗물배수관청소전문업체', serviceType: '우수관막힘', primaryKeywords: ['옥상', '빗물배수', '청소'] },
  { suffix: '우수관낙엽막힘청소장마전점검', serviceType: '우수관막힘', primaryKeywords: ['우수관', '낙엽', '장마'] },
  { suffix: '외벽우수관누수긴급출동업체', serviceType: '우수관막힘', primaryKeywords: ['외벽', '우수관누수', '긴급'] },
  { suffix: '빌라아파트우수관정기점검전문', serviceType: '우수관막힘', primaryKeywords: ['빌라', '아파트', '우수관'] },

  // ======================================================
  // 맨홀청소 카테고리 (5개)
  // ======================================================
  { suffix: '맨홀청소준설업체비용추천', serviceType: '맨홀청소', primaryKeywords: ['맨홀청소', '준설', '추천'] },
  { suffix: '맨홀막힘슬러지제거전문업체', serviceType: '맨홀청소', primaryKeywords: ['맨홀막힘', '슬러지', '전문'] },
  { suffix: '단독주택맨홀냄새역류해결업체', serviceType: '맨홀청소', primaryKeywords: ['단독주택', '맨홀', '냄새'] },
  { suffix: '상가공장맨홀청소정기점검전문', serviceType: '맨홀청소', primaryKeywords: ['상가', '공장', '맨홀'] },
  { suffix: '맨홀고압세척흡입작업24시', serviceType: '맨홀청소', primaryKeywords: ['맨홀', '고압세척', '24시'] },
];

// 의도 자동 주입 (suffix 내용 기반)
export const urlSuffixes: UrlSuffix[] = rawSuffixes.map((raw) => ({
  ...raw,
  intent: detectIntent(raw.suffix),
}));

// 검증: 60개(기존) - 8개(폐기 누수/오수관/동파 → 신규 카테고리로 이동) + 25개(신규 5 서비스) = 77개
const EXPECTED_SUFFIX_COUNT = 77;
if (urlSuffixes.length !== EXPECTED_SUFFIX_COUNT) {
  throw new Error(
    `urlSuffixes는 정확히 ${EXPECTED_SUFFIX_COUNT}개여야 함 (현재 ${urlSuffixes.length}개)`,
  );
}
