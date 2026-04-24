/**
 * 보유 장비 쇼케이스 — 고압세척기 · CCTV 진단기 · 해빙기.
 * 스펙은 전문성 신호 (경쟁사 대비 차별화).
 */
export type Equipment = {
  icon: string;
  name: string;
  purpose: string;
  specs: string[];
};

export const EQUIPMENT: Equipment[] = [
  {
    icon: '🚿',
    name: '고압세척기',
    purpose: '배관 내벽 슬러지·기름 제거',
    specs: [
      '최대 압력 3000 PSI',
      '분당 토출량 20L',
      '케이블 길이 30m',
      '엔진 구동 (야외 현장 대응)',
    ],
  },
  {
    icon: '📹',
    name: 'CCTV 배관 진단기',
    purpose: '배관 내부 육안 확인 · 원인 특정',
    specs: [
      '방수 카메라 (IP68)',
      '탐지 거리 최대 50m',
      '회전·조명 기능',
      '녹화 기능으로 작업 전후 공유',
    ],
  },
  {
    icon: '🔥',
    name: '전기 해빙기',
    purpose: '동결된 배관 해동',
    specs: [
      '정격 출력 5kW',
      '안전 온도 제어',
      '가정용·상가용 겸용',
      '동파 진단 동시 수행',
    ],
  },
];
