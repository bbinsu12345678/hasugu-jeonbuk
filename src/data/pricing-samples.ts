/**
 * 투명 견적 예시 (영수증 스타일).
 * 실제 비용은 현장 상태에 따라 달라질 수 있음 — "예시" 명시 필수.
 * 과장 단정·최저가 표현 금지 (표시광고법).
 */

export type PricingItem = {
  label: string;
  amount: string; // 문자열로 ('7~10만원' 같은 범위 표현 허용)
};

export type PricingSample = {
  title: string;
  subtitle: string;
  items: PricingItem[];
  total: string;
  note: string;
};

export const PRICING_SAMPLES: PricingSample[] = [
  {
    title: '변기막힘 · 이물질 제거',
    subtitle: '아파트 · 단독주택 가정용',
    items: [
      { label: '출장비', amount: '무료' },
      { label: '1차 진단 · 이물질 제거', amount: '5~7만원' },
      { label: '고압세척 (필요 시)', amount: '+2~3만원' },
    ],
    total: '예상 5~10만원',
    note: '현장 상태 · 작업 시간에 따라 달라질 수 있으며, 작업 전 동의 후 진행합니다.',
  },
  {
    title: '싱크대 · 주방배수 막힘',
    subtitle: '기름·음식물 찌꺼기 처리',
    items: [
      { label: '출장비', amount: '무료' },
      { label: '현장 진단 · 소형 장비 작업', amount: '5~8만원' },
      { label: '배관 고압세척 (2차)', amount: '+3~5만원' },
    ],
    total: '예상 5~13만원',
    note: '2차 작업은 필요한 경우에만 진행하며, 사전에 비용을 안내드립니다.',
  },
  {
    title: '하수구 · 오수관 고압세척',
    subtitle: 'CCTV 진단 포함',
    items: [
      { label: '출장비', amount: '무료' },
      { label: 'CCTV 진단', amount: '3~5만원' },
      { label: '고압세척 (구간별)', amount: '15~25만원' },
      { label: '악취 차단 마감', amount: '+2~3만원' },
    ],
    total: '예상 20~33만원',
    note: '작업 구간 길이 · 배관 상태에 따라 조정되며, 진단 후 최종 견적을 확정합니다.',
  },
];
