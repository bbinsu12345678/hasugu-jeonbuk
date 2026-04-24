/**
 * Before / After 비교 이미지 쌍.
 * 실제 작업 전/후 사진 (workimages/before-NNN.jpg vs after-NNN.jpg).
 */
export type BeforeAfterPair = {
  label: string;
  service: string;
  before: string;
  after: string;
};

export const BEFORE_AFTER: BeforeAfterPair[] = [
  {
    label: '아파트 변기 고압세척 현장',
    service: '변기막힘',
    before: '/images/cases/toilet-before.webp',
    after: '/images/cases/toilet-after.webp',
  },
  {
    label: '주방 싱크대 기름 제거 현장',
    service: '싱크대막힘',
    before: '/images/cases/sink-before.webp',
    after: '/images/cases/sink-after.webp',
  },
  {
    label: '하수구 슬러지 고압세척 현장',
    service: '하수구막힘',
    before: '/images/cases/drain-before.webp',
    after: '/images/cases/drain-after.webp',
  },
];
