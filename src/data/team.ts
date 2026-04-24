/**
 * 기사 프로필 — 신뢰 지표 (사진 · 경력 · 한마디).
 * 사진은 실물 촬영본 교체 전까지 placeholder 사용.
 */
export type TeamMember = {
  name: string;
  role: string;
  experience: string;
  quote: string;
  avatar: string;
  skills: string[];
};

export const TEAM: TeamMember[] = [
  {
    name: '오다희 대표',
    role: '현장 총괄 · 견적',
    experience: '배관 분야 7년 경력',
    quote: '눈에 보이지 않는 배관일수록, 투명하게 설명드리는 게 원칙입니다.',
    avatar: '/images/avatar-1.webp',
    skills: ['현장 진단', '견적 투명성', '고객 상담'],
  },
  {
    name: '김기사 (전주 · 완주)',
    role: '전주 · 완주권 전담',
    experience: '고압세척 · CCTV 진단 5년',
    quote: '막힘 원인을 잡고 가야 재발이 없습니다. CCTV로 꼼꼼히 확인해요.',
    avatar: '/images/avatar-2.webp',
    skills: ['CCTV 진단', '고압세척', '긴급 출동'],
  },
  {
    name: '박기사 (군산 · 익산 · 김제)',
    role: '군산 · 익산 · 김제권 전담',
    experience: '누수탐지 · 해빙기 전문 6년',
    quote: '겨울철 동파부터 여름 역류까지, 계절 원인별 대응이 다릅니다.',
    avatar: '/images/avatar-3.webp',
    skills: ['누수 탐지', '해빙', '배관 정비'],
  },
];
