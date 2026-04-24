/**
 * 일반 배관 업체 vs 전북하수구 비교 테이블 데이터.
 *
 * 과장 단정 금지 (표시광고법) — 사실 기반 + 비교 가능한 기준만 기술.
 */
export type ComparisonItem = {
  label: string;
  others: string;
  ours: string;
};

export const COMPARISON: ComparisonItem[] = [
  {
    label: '대응 시간',
    others: '연락 후 도착까지 불명확',
    ours: '전북 전 지역 평균 30분 내 도착',
  },
  {
    label: '출장비',
    others: '별도 청구 또는 후청구',
    ours: '출장비 무료 · 현장 상담 후 견적',
  },
  {
    label: '견적 투명성',
    others: '구두 견적 · 사후 청구',
    ours: '작업 전 항목별 견적 사전 공유',
  },
  {
    label: '작업 후 보증',
    others: '보증 없음 또는 불명확',
    ours: '일정 기간 무상 A/S 제공',
  },
  {
    label: '장비',
    others: '수동 뚫어뻥 위주',
    ours: 'CCTV 진단 + 고압세척기 + 해빙기',
  },
  {
    label: '배상책임',
    others: '가입 여부 확인 어려움',
    ours: '배상책임보험 가입 업체',
  },
];
