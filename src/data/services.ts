import type { Service } from '@/types';

export const services: Service[] = [
  {
    slug: 'toilet',
    title: '변기막힘',
    image: '/images/service-toilet.webp',
    bgImage: '/images/services/toilet-bg.webp',
    description:
      '변기 막힘의 주요 특징을 파악하면 원인을 이해하고 적절한 해결책을 찾는 데 도움이 됩니다. 아래에 변기 막힘의 일반적인 특징을 설명해 드리겠습니다.',
    symptoms: [
      { label: '배수가 느리거나 멈춤', detail: '물이 천천히 빠지면서 수면 위에 고이는 경우' },
      { label: '물 수위 상승', detail: '넘칠 것 같음' },
      { label: '불쾌한 냄새', detail: '하수구 냄새가 올라오는 경우' },
      { label: '변기 주변 누수', detail: '배관이 막혀있거나 손상' },
    ],
  },
  {
    slug: 'sink',
    title: '싱크대막힘',
    image: '/images/service-sink.webp',
    bgImage: '/images/services/sink-bg.webp',
    description:
      '싱크대 막힘의 주요 특징과 원인을 파악하면 문제를 효과적으로 해결할 수 있습니다. 다음은 싱크대 막힘의 일반적인 특징과 그 원인들입니다.',
    symptoms: [
      { label: '배수가 느리거나 멈춤', detail: '물이 빠져나가는 길이 막힘' },
      { label: '물 고임', detail: '넘칠 정도로 차오르는 현상이 발생' },
      { label: '불쾌한 냄새', detail: '배수관에 음식물 찌꺼기나 기름이 쌓여 부패하면서 발생' },
      { label: '슬러지 축적', detail: '시간이 지나면서 자연스럽게 생성되는 기름때' },
    ],
  },
  {
    slug: 'drain',
    title: '하수구막힘',
    image: '/images/service-drain.webp',
    bgImage: '/images/services/drain-bg.webp',
    description:
      '하수구 막힘의 주요 특징과 원인을 이해하면 문제를 효과적으로 해결할 수 있습니다. 다음은 하수구 막힘의 일반적인 특징과 원인들입니다.',
    symptoms: [
      { label: '배수 속도 저하', detail: '배수 속도가 현저히 느려짐' },
      { label: '역류 현상', detail: '배수관이 심하게 막힌 경우' },
      { label: '악취 발생', detail: '음식물 찌꺼기, 기름, 머리카락 등 유기물이 쌓여 부패' },
      { label: '이물질 축적', detail: '기름과 음식물 찌꺼기가 주된 원인' },
    ],
  },
  {
    slug: 'leak',
    title: '누수탐지',
    image: '/images/service-leak.webp',
    bgImage: '/images/services/leak-bg.webp',
    description: '최첨단 청음식·가스식 탐지기로 미세한 누수 지점까지 정확하게 찾아냅니다. 불필요한 굴착 없이 최소한의 공사로 해결합니다.',
    symptoms: [
      { label: '수도요금 급증', detail: '평소보다 과도하게 청구된 요금' },
      { label: '벽면 곰팡이', detail: '습기가 차고 곰팡이가 피는 현상' },
      { label: '천장 물 고임', detail: '아랫집 천장으로 물이 새는 경우' },
      { label: '계량기 회전', detail: '물을 안 써도 별침이 도는 경우' },
    ],
  },
  {
    slug: 'aircon',
    title: '에어컨배관청소',
    image: '/images/service-aircon.webp',
    bgImage: '/images/services/aircon-bg.webp',
    description: '에어컨 배관 내 이물질과 슬러지를 제거하여 냉방 효율을 높이고 악취를 방지합니다. 정기적인 세척으로 수명을 연장하세요.',
    symptoms: [
      { label: '냉방 성능 저하', detail: '바람이 예전만큼 시원하지 않음' },
      { label: '불쾌한 냄새', detail: '가동 시 곰팡이/퀴퀴한 냄새 발생' },
      { label: '물 넘침 현상', detail: '드레인 배관이 막혀 물이 새는 경우' },
      { label: '소음 발생', detail: '막힘으로 인한 비정상적인 소음' },
    ],
  },
  {
    slug: 'sewage',
    title: '오수관막힘',
    image: '/images/service-sewage.webp',
    bgImage: '/images/services/sewage-bg.webp',
    description: '공동주택이나 상가의 메인 오수관 막힘을 고압세척기로 완벽하게 해결합니다. 대형 관로 작업도 전문 장비로 안전하게 처리합니다.',
    symptoms: [
      { label: '전체 변기 역류', detail: '하단층 세대 변기가 동시에 역류' },
      { label: '오수관 넘침', detail: '정화조 주변으로 오수가 새는 경우' },
      { label: '심한 악취', detail: '건물 주변에 상시 발생하는 악취' },
      { label: '배수 정지', detail: '오수가 전혀 빠지지 않는 상태' },
    ],
  },
  {
    slug: 'stormwater',
    title: '우수관막힘',
    image: '/images/service-stormwater.webp',
    bgImage: '/images/services/stormwater-bg.webp',
    description: '옥상이나 마당의 우수관에 쌓인 낙엽, 토사 등을 제거하여 침수 피해를 예방합니다. 장마철 전 정기 점검이 필수입니다.',
    symptoms: [
      { label: '옥상 물 고임', detail: '비가 올 때 옥상에 물이 차는 현상' },
      { label: '베란다 역류', detail: '우수관을 통해 아래층으로 누수' },
      { label: '배관 소음', detail: '물이 내려갈 때 쿨럭이는 소음' },
      { label: '낙엽/토사 유입', detail: '배수구 입구가 가려진 상태' },
    ],
  },
  {
    slug: 'manhole',
    title: '맨홀청소',
    image: '/images/service-manhole.webp',
    bgImage: '/images/services/manhole-bg.webp',
    description: '집수정 및 맨홀 내부에 쌓인 슬러지와 퇴적물을 고압세척 및 흡입 장비로 깨끗하게 청소합니다. 주기적 관리로 막힘을 예방하세요.',
    symptoms: [
      { label: '맨홀 수위 상승', detail: '맨홀 내부 물이 가득 찬 상태' },
      { label: '악취 및 벌레', detail: '퇴적물 부패로 인한 환경 문제' },
      { label: '배수 속도 저하', detail: '단지 내 전체적인 배수 불량' },
      { label: '슬러지 고착', detail: '기름때 등이 딱딱하게 굳은 상태' },
    ],
  },
];
