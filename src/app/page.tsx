import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { regions } from '@/data/regions';
import { blogPosts } from '@/data/blog-posts';
import { partners } from '@/data/partners';
import { testimonials } from '@/data/testimonials';
import { COMPARISON } from '@/data/comparison';
import { CAUSES } from '@/data/causes';
import { PRICING_SAMPLES } from '@/data/pricing-samples';
import { EQUIPMENT } from '@/data/equipment';
import { TEAM } from '@/data/team';
import { BEFORE_AFTER } from '@/data/before-after';
import BeforeAfterSlider from '@/components/sections/BeforeAfterSlider';
import SymptomChecker from '@/components/sections/SymptomChecker';
import {
  generateItemListJsonLd,
  generateFaqJsonLd,
  generateBreadcrumbJsonLd,
} from '@/lib/seo';
import { phoneLink, formatPhone } from '@/lib/utils';
import ContactForm from '@/components/sections/ContactForm';

const mainFaq = [
  { question: '하수구 막힘 24시 가능한가요?', answer: '네, 전주·익산·군산·정읍·남원·김제 등 전라북도 14개 시/군 전 지역 24시 작업 가능합니다. 언제든지 편하게 문의주세요.' },
  { question: '하수구 막힘 원인은 무엇인가요?', answer: '주방에선 기름 찌꺼기, 욕실에선 머리카락, 세면대에선 비누 찌꺼기 등이 주 원인입니다. 오래된 배관에는 녹·곰팡이·미생물 슬러지도 문제를 일으킬 수 있어요.' },
  { question: '싱크대막힘 방지하는 방법은?', answer: '기름은 절대 배수구로 버리지 말고, 배수구에는 거름망을 설치해 이물질 유입을 줄이세요. 월 1회 뜨거운 물 세척도 도움이 됩니다.' },
  { question: '출장비는 별도인가요?', answer: '출장비는 무료입니다. 현장 진단 후 작업 비용만 안내드리며, 사전 동의 후 작업을 진행합니다.' },
  { question: '대략적인 비용은 얼마인가요?', answer: '현장 상태에 따라 다릅니다. 출장 후 원인 · 작업 범위를 진단한 뒤 투명하게 견적을 드립니다. 동의 전까지는 비용 청구가 없습니다.' },
  { question: '야간·주말·공휴일도 같은 가격인가요?', answer: '네, 365일 24시간 동일 기준으로 안내드립니다. 야간·주말 할증 없이 출장비 무료로 방문합니다.' },
  { question: '작업 후 보증이 되나요?', answer: '네, 모든 작업에 일정 기간 무상 A/S를 제공합니다. 동일 원인 재발 시 무상으로 재방문합니다.' },
  { question: '결제는 어떻게 하나요?', answer: '현금·계좌이체·카드 결제 모두 가능합니다. 세금계산서 발행도 요청 주시면 처리해드립니다.' },
  { question: '아파트 관리규약 때문에 작업이 가능한가요?', answer: '네, 관리실 협조 여부를 미리 확인해드립니다. 공용 배관 구간인 경우 관리실 승인 절차를 함께 진행해 드려요.' },
  { question: '배관 교체까지 필요하나요?', answer: '대부분의 막힘은 고압세척·기계 뚫기로 해결 가능합니다. CCTV 진단 후 실제 교체가 필요한 구간만 최소 범위로 안내드립니다.' },
  { question: '작업 시간은 얼마나 걸리나요?', answer: '일반적인 변기·싱크대 막힘은 30분 내외, 하수구 고압세척은 1~2시간이 평균입니다. 현장 상태에 따라 변동될 수 있어 사전에 안내드립니다.' },
  { question: '배상책임보험에 가입되어 있나요?', answer: '네, 배상책임보험에 가입되어 있어 작업 중 발생할 수 있는 문제에 대해 보상 체계가 마련돼 있습니다. 안심하고 맡기세요.' },
];

const SERVICES = [
  {
    name: '변기막힘',
    desc: '이물질·역류·악취 원인 진단',
    tags: ['이물질제거', '고압세척', '악취차단'],
    gradient: { from: '#FF6B2C', to: '#FFA366' },
    icon: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="svcGrad1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF6B2C" /><stop offset="1" stopColor="#FFA366" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#svcGrad1)" />
        {/* Toilet bowl outline */}
        <ellipse cx="32" cy="36" rx="11" ry="8" stroke="#fff" strokeWidth="2.2" fill="none" opacity="0.95" />
        <rect x="24" y="20" width="16" height="10" rx="4" stroke="#fff" strokeWidth="2.2" fill="none" opacity="0.95" />
        {/* U-bend pipe */}
        <path d="M28 44 Q28 52 36 52 Q44 52 44 44" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.9" />
        {/* Water ripple top-right */}
        <path d="M43 24 Q46 22 49 24" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M44 27 Q47 25 50 27" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    name: '싱크대막힘',
    desc: '기름·음식물 찌꺼기 제거',
    tags: ['기름제거', '주방배수', '거름망점검'],
    gradient: { from: '#F97316', to: '#FDBA74' },
    icon: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="svcGrad2" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F97316" /><stop offset="1" stopColor="#FDBA74" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#svcGrad2)" />
        {/* Faucet arm */}
        <path d="M18 24 L18 19 Q18 17 20 17 L28 17" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.95" />
        <path d="M28 17 L34 17" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.95" />
        {/* Water drop from faucet */}
        <path d="M18 24 L18 28" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" fill="none" />
        <ellipse cx="18" cy="30" rx="2" ry="2.5" fill="rgba(255,255,255,0.8)" />
        {/* Sink bowl U-shape */}
        <path d="M13 36 L13 46 Q13 50 17 50 L47 50 Q51 50 51 46 L51 36 Z" stroke="#fff" strokeWidth="2.2" fill="none" opacity="0.95" />
        {/* Drain dot */}
        <circle cx="32" cy="47" r="2.5" fill="#fff" opacity="0.85" />
      </svg>
    ),
  },
  {
    name: '하수구막힘',
    desc: '고압세척 + CCTV 진단',
    tags: ['CCTV진단', '고압세척', '슬러지제거'],
    gradient: { from: '#EA580C', to: '#F97316' },
    icon: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="svcGrad3" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EA580C" /><stop offset="1" stopColor="#F97316" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#svcGrad3)" />
        {/* Drain cover outer ring */}
        <circle cx="32" cy="32" r="17" stroke="#fff" strokeWidth="2.2" fill="none" opacity="0.95" />
        {/* Drain cover inner ring */}
        <circle cx="32" cy="32" r="10" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.8" />
        {/* Grid lines horizontal */}
        <line x1="15" y1="32" x2="49" y2="32" stroke="#fff" strokeWidth="1.6" opacity="0.8" />
        <line x1="15" y1="25" x2="49" y2="25" stroke="#fff" strokeWidth="1.2" opacity="0.55" />
        <line x1="15" y1="39" x2="49" y2="39" stroke="#fff" strokeWidth="1.2" opacity="0.55" />
        {/* Grid lines vertical */}
        <line x1="32" y1="15" x2="32" y2="49" stroke="#fff" strokeWidth="1.6" opacity="0.8" />
        <line x1="25" y1="15" x2="25" y2="49" stroke="#fff" strokeWidth="1.2" opacity="0.55" />
        <line x1="39" y1="15" x2="39" y2="49" stroke="#fff" strokeWidth="1.2" opacity="0.55" />
      </svg>
    ),
  },
  {
    name: '누수탐지',
    desc: '벽·바닥 무손상 위치 특정',
    tags: ['열화상', '음파탐지', '무손상'],
    gradient: { from: '#FBBF24', to: '#F59E0B' },
    icon: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="svcGrad4" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FBBF24" /><stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#svcGrad4)" />
        {/* Water drop */}
        <path d="M32 16 C32 16 20 28 20 36 C20 42.6 25.4 48 32 48 C38.6 48 44 42.6 44 36 C44 28 32 16 32 16 Z" stroke="#fff" strokeWidth="2.2" fill="rgba(255,255,255,0.15)" opacity="0.95" />
        {/* Sonar ring 1 */}
        <path d="M24 26 Q20 30 20 36" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Sonar ring 2 */}
        <path d="M20 22 Q14 28 14 36" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Center dot */}
        <circle cx="32" cy="36" r="3" fill="#fff" opacity="0.9" />
      </svg>
    ),
  },
  {
    name: '에어컨배관청소',
    desc: '드레인·결로 배수 점검',
    tags: ['드레인', '결로제거', '배수정비'],
    gradient: { from: '#FCD34D', to: '#FBBF24' },
    icon: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="svcGrad5" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCD34D" /><stop offset="1" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#svcGrad5)" />
        {/* AC outdoor unit box */}
        <rect x="14" y="22" width="28" height="20" rx="3" stroke="#fff" strokeWidth="2.2" fill="none" opacity="0.95" />
        {/* Fan circle */}
        <circle cx="28" cy="32" r="6" stroke="#fff" strokeWidth="1.8" fill="none" opacity="0.9" />
        <circle cx="28" cy="32" r="2" fill="#fff" opacity="0.9" />
        {/* Vent lines on right */}
        <line x1="38" y1="26" x2="38" y2="38" stroke="#fff" strokeWidth="1.5" opacity="0.7" />
        <line x1="40" y1="26" x2="40" y2="38" stroke="#fff" strokeWidth="1.5" opacity="0.5" />
        {/* Wind lines */}
        <path d="M44 28 Q50 28 50 32 Q50 36 46 36" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M44 32 Q52 32 52 36 Q52 40 48 40" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M44 36 Q50 36 50 40" stroke="rgba(255,255,255,0.3)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    name: '오수관막힘',
    desc: '정화조·맨홀 연결부 처리',
    tags: ['정화조', '맨홀연결', '역류차단'],
    gradient: { from: '#C2410C', to: '#EA580C' },
    icon: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="svcGrad6" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C2410C" /><stop offset="1" stopColor="#EA580C" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#svcGrad6)" />
        {/* Y-pipe: vertical stem down */}
        <line x1="32" y1="42" x2="32" y2="52" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
        {/* Y-pipe: left branch up-left */}
        <line x1="32" y1="42" x2="19" y2="22" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
        {/* Y-pipe: right branch up-right */}
        <line x1="32" y1="42" x2="45" y2="22" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
        {/* Pipe ends capped */}
        <circle cx="32" cy="52" r="3.5" fill="#fff" opacity="0.85" />
        <circle cx="19" cy="22" r="3.5" fill="#fff" opacity="0.85" />
        <circle cx="45" cy="22" r="3.5" fill="#fff" opacity="0.85" />
      </svg>
    ),
  },
  {
    name: '우수관막힘',
    desc: '빗물받이·배수관 준설',
    tags: ['빗물받이', '준설', '배수정비'],
    gradient: { from: '#FB923C', to: '#FDBA74' },
    icon: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="svcGrad7" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FB923C" /><stop offset="1" stopColor="#FDBA74" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#svcGrad7)" />
        {/* Vertical drain pipe */}
        <rect x="28" y="34" width="8" height="18" rx="2" stroke="#fff" strokeWidth="2.2" fill="none" opacity="0.95" />
        {/* Rain drops — 3 drops */}
        <path d="M22 16 C22 16 18 20 18 22 C18 24.2 19.8 26 22 26 C24.2 26 26 24.2 26 22 C26 20 22 16 22 16 Z" fill="#fff" opacity="0.9" />
        <path d="M32 12 C32 12 28 16 28 18 C28 20.2 29.8 22 32 22 C34.2 22 36 20.2 36 18 C36 16 32 12 32 12 Z" fill="#fff" opacity="0.9" />
        <path d="M42 16 C42 16 38 20 38 22 C38 24.2 39.8 26 42 26 C44.2 26 46 24.2 46 22 C46 20 42 16 42 16 Z" fill="#fff" opacity="0.9" />
        {/* Horizontal gutter */}
        <rect x="16" y="30" width="32" height="5" rx="2" stroke="#fff" strokeWidth="2" fill="none" opacity="0.85" />
      </svg>
    ),
  },
  {
    name: '맨홀청소',
    desc: '침전물 준설 · 악취 차단',
    tags: ['침전물제거', '고압세척', '악취차단'],
    gradient: { from: '#F59E0B', to: '#D97706' },
    icon: (
      <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="svcGrad8" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" /><stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#svcGrad8)" />
        {/* Manhole lid outer */}
        <circle cx="32" cy="34" r="15" stroke="#fff" strokeWidth="2.2" fill="none" opacity="0.95" />
        {/* Manhole lid inner ring */}
        <circle cx="32" cy="34" r="9" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.7" />
        {/* Manhole ridges */}
        <line x1="32" y1="19" x2="32" y2="49" stroke="#fff" strokeWidth="1.4" opacity="0.55" />
        <line x1="17" y1="34" x2="47" y2="34" stroke="#fff" strokeWidth="1.4" opacity="0.55" />
        {/* Wrench — diagonal */}
        <line x1="14" y1="14" x2="26" y2="22" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
        <circle cx="13" cy="13" r="4" stroke="#fff" strokeWidth="2" fill="none" opacity="0.95" />
        <circle cx="27" cy="23" r="3" stroke="#fff" strokeWidth="2" fill="none" opacity="0.95" />
      </svg>
    ),
  },
];

const TRUST_BADGES = [
  { icon: '✅', label: '배상책임보험 가입', desc: '안전한 작업 보장' },
  { icon: '⚡', label: '평균 30분 도착', desc: '전북 전 지역 상시 대기' },
  { icon: '💰', label: '출장비 무료', desc: '현장 상담 후 견적' },
  { icon: '🛡️', label: '작업 후 A/S', desc: '일정 기간 무상 재방문' },
];

const PROCESS = [
  {
    n: 1,
    title: '전화·카톡 문의',
    desc: '상황을 알려주시면 예상 원인을 안내드립니다',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="32" cy="32" r="32" fill="url(#p1g)" />
        <defs>
          <linearGradient id="p1g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1b3b5f" /><stop offset="1" stopColor="#2a5a90" />
          </linearGradient>
        </defs>
        {/* Phone handset */}
        <path d="M22 20h4l2 6-3 2c1.5 3 3.5 5.5 6 7l2-3 6 2v4c0 1.1-.9 2-2 2C25.4 40 19 33.6 19 26c0-3.3 1.3-6 3-6z" fill="#fff" opacity="0.95"/>
        {/* Chat bubble */}
        <rect x="33" y="17" width="13" height="10" rx="3" fill="#f2751a"/>
        <path d="M36 30l1-3h-4v0l3 3z" fill="#f2751a"/>
        <circle cx="37" cy="22" r="1.2" fill="#fff"/>
        <circle cx="40" cy="22" r="1.2" fill="#fff"/>
        <circle cx="43" cy="22" r="1.2" fill="#fff"/>
      </svg>
    ),
    color: 'from-[#1b3b5f] to-[#2a5a90]',
  },
  {
    n: 2,
    title: '현장 도착',
    desc: '전북 전 지역 평균 30분 내 도착',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="32" cy="32" r="32" fill="url(#p2g)" />
        <defs>
          <linearGradient id="p2g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f2751a" /><stop offset="1" stopColor="#e56a14" />
          </linearGradient>
        </defs>
        {/* Van body */}
        <rect x="12" y="30" width="32" height="14" rx="3" fill="#fff" opacity="0.95"/>
        <rect x="12" y="30" width="16" height="10" rx="2" fill="#dde8f4"/>
        {/* Wheels */}
        <circle cx="20" cy="44" r="4" fill="#1b3b5f"/>
        <circle cx="20" cy="44" r="1.8" fill="#fff"/>
        <circle cx="36" cy="44" r="4" fill="#1b3b5f"/>
        <circle cx="36" cy="44" r="1.8" fill="#fff"/>
        {/* Speed lines */}
        <line x1="8" y1="33" x2="14" y2="33" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
        <line x1="6" y1="37" x2="12" y2="37" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
        <line x1="8" y1="41" x2="13" y2="41" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
        {/* Pin */}
        <circle cx="46" cy="24" r="5" fill="#fff"/>
        <circle cx="46" cy="24" r="2.5" fill="#f2751a"/>
        <line x1="46" y1="29" x2="46" y2="34" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    color: 'from-[#f2751a] to-[#e56a14]',
  },
  {
    n: 3,
    title: '진단 · 견적',
    desc: 'CCTV·고압세척기로 정확한 원인 파악',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="32" cy="32" r="32" fill="url(#p3g)" />
        <defs>
          <linearGradient id="p3g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1b3b5f" /><stop offset="1" stopColor="#0f2340" />
          </linearGradient>
        </defs>
        {/* Magnifier */}
        <circle cx="30" cy="29" r="10" stroke="#fff" strokeWidth="3" fill="none" opacity="0.95"/>
        <circle cx="30" cy="29" r="5" fill="#f2751a" opacity="0.7"/>
        <line x1="37" y1="37" x2="44" y2="44" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
        {/* CCTV lens dots */}
        <circle cx="30" cy="29" r="2" fill="#fff"/>
      </svg>
    ),
    color: 'from-[#1b3b5f] to-[#0f2340]',
  },
  {
    n: 4,
    title: '동의 후 작업',
    desc: '견적 동의 후에만 작업 시작',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="32" cy="32" r="32" fill="url(#p4g)" />
        <defs>
          <linearGradient id="p4g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f2751a" /><stop offset="1" stopColor="#1b3b5f" />
          </linearGradient>
        </defs>
        {/* Wrench */}
        <path d="M38 18c-4 0-7 3-7 7 0 .8.1 1.5.4 2.2L19.5 40.5a2.8 2.8 0 104 4L36 32.6c.7.2 1.4.4 2.2.4 4 0 7-3 7-7a7 7 0 00-1.2-4L40 26a2 2 0 01-2 2 2 2 0 01-2-2v-4l-2.4 1.4A5 5 0 0133 22c0-2.8 2.2-5 5-5z" fill="#fff" opacity="0.95"/>
        <circle cx="21" cy="43" r="2" fill="#fff" opacity="0.6"/>
      </svg>
    ),
    color: 'from-[#f2751a] to-[#1b3b5f]',
  },
  {
    n: 5,
    title: '완료 · A/S',
    desc: '작업 내용 설명 후 무상 A/S 안내',
    icon: (
      <svg aria-hidden="true" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="32" cy="32" r="32" fill="url(#p5g)" />
        <defs>
          <linearGradient id="p5g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#16a34a" /><stop offset="1" stopColor="#1b3b5f" />
          </linearGradient>
        </defs>
        {/* Shield */}
        <path d="M32 16l12 5v8c0 7-5 12-12 15-7-3-12-8-12-15v-8l12-5z" fill="#fff" opacity="0.15"/>
        <path d="M32 18l10 4.2v7c0 5.8-4.2 10-10 12.8-5.8-2.8-10-7-10-12.8v-7L32 18z" fill="#fff" opacity="0.95"/>
        {/* Checkmark */}
        <path d="M24 33l5 5 10-10" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: 'from-[#16a34a] to-[#1b3b5f]',
  },
];

export default function HomePage() {
  const itemListLd = generateItemListJsonLd();
  const faqLd = generateFaqJsonLd(mainFaq);
  const breadcrumbLd = generateBreadcrumbJsonLd([{ name: '홈', url: siteConfig.domain }]);
  const recentPosts = blogPosts.slice(0, 6);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="hub-dark">
        {/* HERO C-HYBRID — Gradient Mesh Typography + Polaroid */}
        <section className="hub-hero hub-hero-c" aria-label="전북하수구 메인 히어로">
          {/* Floating badges — desktop only */}
          <div className="hub-hero-badge hub-hero-badge-tl" aria-label="배상책임보험 가입">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.5L2.5 4v4.5C2.5 11.5 5 13.8 8 14.5c3-0.7 5.5-3 5.5-6V4L8 1.5z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.4"/></svg>
            배상책임보험 가입
          </div>
          <div className="hub-hero-badge hub-hero-badge-tr" aria-label="30분 평균 도착">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 5v3.5l2.2 1.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            30분 평균 도착
          </div>

          <div className="hub-hero-content">
            {/* Eyebrow pill badge */}
            <div className="hub-hero-eyebrow-pill">전북 14 시/군 · 365일 24시</div>

            {/* H1 — SEO anchor */}
            <h1 className="hub-hero-h1">
              변기·싱크대·하수구 막힘,{' '}
              <br className="hidden sm:block" />
              <span className="hub-hero-h1-accent">전문 해결사</span>가 바로 출동합니다
            </h1>

            {/* Sub copy */}
            <p className="hub-hero-sub">
              현장 상담 후 투명 견적. 출장비 무료·작업 후 무상 A/S. 배상책임보험 가입 업체.
            </p>

            {/* CTA pill group */}
            <div className="hub-hero-cta-group">
              <a href={phoneLink()} className="hub-hero-pill-phone" aria-label={`전화하기 ${formatPhone()}`}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" style={{flexShrink:0}}>
                  <path d="M4.5 3C4.5 3 6.5 2.5 7.5 5.5S7.5 9 6.5 9.5 6 11.5 7 13s4.5 4.5 6.5 4.5 2.5-1.2 3.2-2 .7-1.4-.8-3.4-2.4-2-2.4-2 .7-1.4 4-2.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-mono">{formatPhone()}</span>
                <span className="hub-hero-pill-label">바로 전화</span>
              </a>
              <a
                href={siteConfig.kakaoUrl}
                className="hub-hero-pill-ghost"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="카카오 상담"
              >
                💬 카카오 상담
              </a>
              <a href="#contact" className="hub-hero-pill-ghost" aria-label="문의 폼으로 이동">
                ✉️ 문의 하기
              </a>
            </div>

            {/* Proof row */}
            <div className="hub-hero-proof-row">
              <div className="hub-hero-proof-item">
                <span className="hub-hero-proof-num">14</span>
                <span className="hub-hero-proof-lbl">시·군 전담</span>
              </div>
              <div className="hub-hero-proof-divider" aria-hidden="true" />
              <div className="hub-hero-proof-item">
                <span className="hub-hero-proof-num">252</span>
                <span className="hub-hero-proof-lbl">동·읍·면 커버</span>
              </div>
              <div className="hub-hero-proof-divider" aria-hidden="true" />
              <div className="hub-hero-proof-item">
                <span className="hub-hero-proof-num">30분</span>
                <span className="hub-hero-proof-lbl">평균 도착</span>
              </div>
              <div className="hub-hero-proof-divider" aria-hidden="true" />
              <div className="hub-hero-proof-item">
                <span className="hub-hero-proof-num">365</span>
                <span className="hub-hero-proof-lbl">연중무휴</span>
              </div>
            </div>
          </div>

          {/* Floating polaroid — desktop 우하단, mobile 하단 중앙 */}
          <div className="hub-hero-polaroid" aria-label="전북하수구 실 출동 현장">
            <img
              src="/images/hero/banner-1.webp"
              alt="전북하수구 실 출동 현장"
              loading="eager"
              fetchPriority="auto"
              width={600}
              height={420}
            />
            <p className="hub-hero-polaroid-caption">실 출동 현장 · 전북 14 시/군</p>
          </div>
        </section>

        {/* SYMPTOM CHECKER — 증상 진단 리드 수집 */}
        <section className="hub-section-alt">
          <div className="mx-auto max-w-3xl px-6 py-16">
            <SymptomChecker />
          </div>
        </section>

        {/* TRUST BADGES — 신뢰 배지 행 (화이트 배경) */}
        <section className="hub-section border-b border-slate-200">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-10 md:grid-cols-4">
            {TRUST_BADGES.map((b) => (
              <div key={b.label} className="flex items-start gap-3">
                <div className="text-2xl">{b.icon}</div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{b.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="hub-stats">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-14 md:grid-cols-4">
            <div className="hub-stat">
              <div className="hub-stat-num">14</div>
              <div className="hub-stat-label">전북 시·군</div>
            </div>
            <div className="hub-stat">
              <div className="hub-stat-num">252</div>
              <div className="hub-stat-label">동·읍·면</div>
            </div>
            <div className="hub-stat">
              <div className="hub-stat-num">30분</div>
              <div className="hub-stat-label">평균 도착</div>
            </div>
            <div className="hub-stat">
              <div className="hub-stat-num">365</div>
              <div className="hub-stat-label">연중무휴</div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="hub-section">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">서비스 범위</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                8개 <span className="hub-accent-gradient">전문 서비스</span>
              </h2>
              <p className="mt-3 text-base text-slate-500">현장 진단 후 투명 견적. 원인부터 재발 방지까지 통합 해결.</p>
            </div>
            <div className="svc-bento mt-12">
              {SERVICES.map((s, idx) => (
                <div
                  key={s.name}
                  className="svc-bento-card"
                  style={{ '--svc-from': s.gradient.from, '--svc-to': s.gradient.to } as React.CSSProperties}
                >
                  <span className="svc-bento-number" aria-hidden="true">{String(idx + 1).padStart(2, '0')}</span>
                  <div className="svc-bento-icon-wrap">{s.icon}</div>
                  <div className="svc-bento-body">
                    <h3 className="svc-bento-title">{s.name}</h3>
                    <p className="svc-bento-desc">{s.desc}</p>
                    <div className="svc-bento-tags">
                      {s.tags.map((t) => (
                        <span key={t} className="svc-bento-tag">#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISON — 일반 업체 vs 전북하수구 */}
        <section className="hub-section-alt">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">비교</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                일반 업체 vs <span className="hub-accent-gradient">전북하수구</span>
              </h2>
              <p className="mt-3 text-base text-slate-500">6가지 기준으로 비교합니다</p>
            </div>
            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 md:px-6">항목</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-400 md:px-6">일반 업체</th>
                    <th className="px-4 py-3 text-left font-bold text-[--color-primary] md:px-6">전북하수구</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARISON.map((row) => (
                    <tr key={row.label}>
                      <td className="px-4 py-4 font-bold text-slate-800 md:px-6">{row.label}</td>
                      <td className="px-4 py-4 text-slate-500 md:px-6">{row.others}</td>
                      <td className="px-4 py-4 font-semibold text-slate-800 md:px-6">✓ {row.ours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* PROCESS — 5단계 흐름 */}
        <section className="hub-section-alt">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">작업 프로세스</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                문의부터 완료까지 <span className="hub-accent-gradient">5단계</span>
              </h2>
              <p className="mt-3 text-base text-slate-500">투명하게 진행합니다</p>
            </div>
            {/* desktop connector row */}
            <div className="hub-process-grid mt-12">
              {PROCESS.map((p, idx) => (
                <div key={p.n} className="hub-process-card group">
                  {/* step badge — top-left overlap */}
                  <div className="hub-process-badge">{p.n}</div>
                  {/* icon area */}
                  <div className="hub-process-icon-wrap">
                    {p.icon}
                  </div>
                  <div className="hub-process-body">
                    <h3 className="hub-process-title">{p.title}</h3>
                    <p className="hub-process-desc">{p.desc}</p>
                  </div>
                  {/* connector arrow — hidden on last item and on mobile */}
                  {idx < PROCESS.length - 1 && (
                    <div className="hub-process-arrow" aria-hidden="true">›</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PARTNERS */}
        <section className="hub-partners">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">시공·출장 경험</p>
              <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-800 md:text-3xl">
                전북 전 지역 <span className="hub-accent-gradient">다양한 시설</span>에서 작업
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-500">
                관공서·대형마트·프랜차이즈·아파트·상가까지. 규모에 관계없이 동일한 기준으로 현장 상담 후 진행합니다.
              </p>
            </div>
            <div
              className="partners-marquee relative mt-8 overflow-hidden"
              style={{
                WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
                maskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
              }}
            >
              <div className="partners-track flex gap-3 py-2">
                {[...partners, ...partners].map((p, i) => (
                  <div
                    key={`${p.name}-${i}`}
                    className="flex h-20 w-40 flex-shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                    title={p.name}
                  >
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={`${p.name} 로고`} className="h-8 w-auto max-w-[90px] object-contain" loading="lazy" />
                    ) : (
                      <span className="flex h-8 min-w-[50px] items-center justify-center rounded-md px-2.5 text-xs font-bold text-white" style={{ backgroundColor: p.color }}>
                        {p.symbol}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-slate-700">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-center text-[10px] text-slate-400">
              * 시공·출장 경험이 있는 시설 예시이며, 공식 파트너쉽·계약 관계를 의미하지 않습니다.
            </p>
          </div>
        </section>

        {/* CITIES */}
        <section className="hub-cities">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">서비스 지역</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                전북 <span className="hub-accent-gradient">14 시·군</span>
              </h2>
              <p className="mt-3 text-base text-slate-500">각 시·군 전담 기사가 30분 이내 현장 도착합니다</p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {regions.map((r) => (
                <Link key={r.city} href={`/${r.city}`} className="hub-city">
                  <div className="text-sm font-bold text-slate-800">{r.city}</div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {r.districts.length}개 {r.city.endsWith('시') ? '동' : '읍·면'}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* BLOG CASES */}
        <section className="hub-section">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">해결 사례</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                최근 <span className="hub-accent-gradient">현장 후기</span>
              </h2>
              <p className="mt-3 text-base text-slate-500">실 작업 진행 과정과 결과</p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/${post.city}/${post.slug}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                >
                  <div className="overflow-hidden bg-slate-100">
                    <img src={post.thumbnail} alt={post.title} className="aspect-[3/2] w-full object-cover transition group-hover:scale-105" loading="lazy" width={1200} height={800} />
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-800">{post.title}</p>
                    <p className="mt-2 text-xs text-slate-500">{post.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* BEFORE / AFTER — 3 페어 stacked · 좌우 드래그 비교 */}
        <section className="hub-section">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">작업 전후 비교</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                <span className="hub-accent-gradient">Before · After</span> 실 작업 결과
              </h2>
              <p className="mt-3 text-base text-slate-500">좌우 드래그로 비교해보세요</p>
            </div>
            <div className="mt-10 mx-auto max-w-4xl space-y-8">
              {BEFORE_AFTER.map((pair) => (
                <BeforeAfterSlider
                  key={pair.before}
                  before={pair.before}
                  after={pair.after}
                  label={pair.label}
                  alt={pair.service}
                />
              ))}
            </div>
          </div>
        </section>

        {/* TEAM — 기사 프로필 3명 */}
        <section className="hub-section-alt">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">전담 기사</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                <span className="hub-accent-gradient">전담 기사</span>가 직접 방문
              </h2>
              <p className="mt-3 text-base text-slate-500">지역별 전담 · 경력 · 전문 분야 공개</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {TEAM.map((m, idx) => (
                <div key={m.name} className="team-card">
                  <div className="team-card-photo-wrap">
                    <img
                      src={`/images/team/technician-${idx + 1}.webp`}
                      alt={`${m.name} 프로필`}
                      className="team-card-photo"
                      loading="lazy"
                      width={140}
                      height={140}
                    />
                    <span className="team-card-badge">{m.experience.replace(/[^0-9]/g, '')}년 경력</span>
                  </div>
                  <div className="team-card-body">
                    <h3 className="team-card-name">{m.name}</h3>
                    <p className="team-card-role">{m.role}</p>
                    <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm italic leading-relaxed text-slate-700">
                      &ldquo;{m.quote}&rdquo;
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1">
                      {m.skills.map((s) => (
                        <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">#{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EQUIPMENT — 장비 쇼케이스 */}
        <section className="hub-section">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">보유 장비</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                현장 전문 <span className="hub-accent-gradient">장비 3종</span>
              </h2>
              <p className="mt-3 text-base text-slate-500">상황에 맞는 장비로 정확하게 진단 · 해결합니다</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {EQUIPMENT.map((e) => (
                <div key={e.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[--color-accent]/10 text-4xl">{e.icon}</div>
                  <h3 className="mt-5 text-lg font-black text-slate-800">{e.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{e.purpose}</p>
                  <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-600">
                    {e.specs.map((s) => (
                      <li key={s} className="flex gap-2">
                        <span className="text-[--color-primary]">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING — 투명 견적 예시 영수증 */}
        <section className="hub-section-alt">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">견적 투명성</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                투명한 <span className="hub-accent-gradient">견적 예시</span>
              </h2>
              <p className="mt-3 text-base text-slate-500">실제 비용은 현장 상태에 따라 달라집니다</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {PRICING_SAMPLES.map((p) => (
                <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="border-b border-dashed border-slate-300 pb-4">
                    <h3 className="text-lg font-black text-slate-800">{p.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{p.subtitle}</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {p.items.map((item) => (
                      <li key={item.label} className="flex justify-between">
                        <span className="text-slate-600">{item.label}</span>
                        <span className="font-mono font-semibold text-slate-800">{item.amount}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <span className="text-sm font-bold text-slate-700">예상 총액</span>
                    <span className="font-mono font-black text-[--color-primary]">{p.total}</span>
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-slate-400">{p.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-slate-400">
              * 위 금액은 참고용 예시이며, 최종 견적은 현장 진단 후 동의 절차를 거쳐 확정됩니다.
            </p>
          </div>
        </section>

        {/* CAUSES — 원인 교육 4블록 */}
        <section className="hub-section">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">원인 이해</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                막힘 <span className="hub-accent-gradient">4가지 주 원인</span>
              </h2>
              <p className="mt-3 text-base text-slate-500">원인을 알면 재발을 막을 수 있습니다</p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {CAUSES.map((c) => (
                <div key={c.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{c.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{c.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.explanation}</p>
                      <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                        💡 예방 팁 · {c.tip}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="hub-section-alt">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">고객 후기</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                전북 <span className="hub-accent-gradient">실고객 평가</span>
              </h2>
              <p className="mt-3 text-base text-slate-500">14 시·군 현장에서 받은 리뷰</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <div key={i} className="review-card">
                  <div className="review-stars mb-3">★★★★★</div>
                  <p className="text-sm leading-relaxed text-slate-700">&ldquo;{t.content}&rdquo;</p>
                  <div className="review-footer">
                    {t.location} · {t.name} 고객
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="hub-section">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">문의</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                연락처를 <span className="hub-accent-gradient">남겨주세요</span>
              </h2>
              <p className="mt-3 text-base text-slate-500">빠르게 회신드립니다</p>
            </div>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="hub-section-alt">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">FAQ</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                자주 묻는 <span className="hub-accent-gradient">질문</span>
              </h2>
              <p className="mt-3 text-base text-slate-500">현장 출동 전 알려드리는 실제 답변</p>
            </div>
            <div className="mt-10 space-y-3">
              {mainFaq.map((item, idx) => (
                <div key={idx} className="hub-faq">
                  <h3 className="font-bold text-slate-800">Q. {item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">A. {item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="hub-cta">
          <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
            <h2 className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">
              지금 바로 <span className="hub-accent-gradient">전화 한 통</span>
            </h2>
            <p className="mt-4 text-base text-white/80">전북 전 지역 24시간 긴급 출동 · 평균 30분 도착</p>
            <div className="mt-8 inline-flex flex-col items-center gap-2 rounded-2xl bg-white/10 px-8 py-5 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">24시 전화 상담</p>
              <a href={phoneLink()} className="font-mono text-3xl font-black text-white md:text-4xl">{formatPhone()}</a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={phoneLink()} className="hub-btn-primary hub-btn-lg">📞 바로 전화</a>
              <a href={siteConfig.kakaoUrl} className="hub-btn-ghost hub-btn-lg">💬 카카오 상담</a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
