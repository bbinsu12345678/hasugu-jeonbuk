import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { regions } from '@/data/regions';
import { blogPosts } from '@/data/blog-posts';
import { siteConfig } from '@/config/site';
import { partners } from '@/data/partners';
import {
  generateBreadcrumbJsonLd,
  generateLocalBusinessJsonLd,
  generateFaqJsonLd,
} from '@/lib/seo';
import { phoneLink, formatPhone } from '@/lib/utils';
import { decodeCityParam } from '@/lib/route-params';

interface Props {
  params: Promise<{ city: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return regions.map((r) => ({ city: r.city }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: rawCity } = await params;
  const city = decodeCityParam(rawCity);
  const region = regions.find((r) => r.city === city);
  if (!region) return {};

  const pageUrl = `${siteConfig.domain}/${city}`;
  const districtCount = region.districts.length;

  return {
    title: `${city} 변기막힘 싱크대막힘 하수구막힘 24시 뚫는 업체 - 빠른 방문!`,
    description: `${city} 전 지역(${districtCount}개 동/읍/면) 변기막힘 싱크대막힘 하수구막힘 24시 긴급출동. 출장비 무료, 현장 상담 후 견적! ${formatPhone()}로 바로 연락하세요.`,
    keywords: [
      `${city}변기막힘`, `${city}싱크대막힘`, `${city}하수구막힘`,
      `${city}배관`, `${city}24시`, `${city}고압세척`, `${city}뚫는업체`,
      ...region.districts.slice(0, 10).map((d) => `${d}변기막힘`),
    ],
    openGraph: {
      type: 'website',
      title: `${city} 변기막힘 싱크대막힘 하수구막힘 24시 빠른 방문`,
      description: `${city} 전 지역 ${districtCount}개 동 24시 긴급출동 배관 전문`,
      url: pageUrl,
      images: [{ url: `${siteConfig.domain}/images/og/${city}.png`, width: 1200, height: 630, alt: `${city} 배관 전문 업체` }],
    },
    twitter: { card: 'summary_large_image', title: `${city} 변기막힘 하수구막힘 24시 빠른 방문`, description: `${city} 전 지역 24시 긴급출동` },
    alternates: { canonical: pageUrl },
  };
}

const SERVICES = [
  { name: '변기막힘', icon: '🚽', desc: '이물질·역류·악취 원인 진단', tags: ['이물질제거', '고압세척', '악취차단'] },
  { name: '싱크대막힘', icon: '🚰', desc: '기름·음식물 찌꺼기 제거', tags: ['기름제거', '주방배수', '거름망점검'] },
  { name: '하수구막힘', icon: '🕳️', desc: '고압세척 + CCTV 진단', tags: ['CCTV진단', '고압세척', '슬러지제거'] },
  { name: '누수탐지', icon: '💧', desc: '벽·바닥 무손상 위치 특정', tags: ['열화상', '음파탐지', '무손상'] },
  { name: '에어컨배관', icon: '❄️', desc: '드레인·결로 배수 점검', tags: ['드레인', '결로제거', '배수정비'] },
  { name: '오수관막힘', icon: '🚽', desc: '정화조·맨홀 연결부 처리', tags: ['정화조', '맨홀연결', '역류차단'] },
  { name: '우수관막힘', icon: '🌧️', desc: '빗물받이·배수관 준설', tags: ['빗물받이', '준설', '배수정비'] },
  { name: '맨홀청소', icon: '⚙️', desc: '침전물 준설 · 악취 차단', tags: ['침전물제거', '고압세척', '악취차단'] },
];

const TRUST_BADGES = [
  { icon: '✅', label: '배상책임보험 가입', desc: '안전한 작업 보장' },
  { icon: '⚡', label: '평균 30분 도착', desc: '전 지역 상시 대기' },
  { icon: '💰', label: '출장비 무료', desc: '현장 상담 후 견적' },
  { icon: '🛡️', label: '작업 후 A/S', desc: '일정 기간 무상 재방문' },
];

export default async function CityHubPage({ params }: Props) {
  const { city: rawCity } = await params;
  const city = decodeCityParam(rawCity);
  const region = regions.find((r) => r.city === city);
  if (!region) notFound();

  const cityPosts = blogPosts.filter((p) => p.city === city).slice(0, 12);

  const breadcrumbLd = generateBreadcrumbJsonLd([
    { name: '홈', url: siteConfig.domain },
    { name: '전라북도', url: `${siteConfig.domain}/jeonbuk` },
    { name: city, url: `${siteConfig.domain}/${city}` },
  ]);

  const localBusinessLd = generateLocalBusinessJsonLd();

  const cityFaq = [
    { question: `${city} 변기막힘 24시 출동 가능한가요?`, answer: `네, ${city} ${region.districts.length}개 동/읍/면 전 지역 365일 24시간 긴급 출동 가능합니다. 평균 30분 내 도착합니다.` },
    { question: `${city} 출장비는 얼마인가요?`, answer: `${city} 전 지역 출장비는 무료입니다. 현장 진단 후 작업 비용을 사전에 안내드리며, 현장 상담 후 합리적으로 견적을 드립니다.` },
    { question: `${city}에서 어떤 서비스가 가능한가요?`, answer: `변기막힘, 싱크대막힘, 하수구막힘, 고압세척, 누수 탐지, 동파 해빙 등 ${city} 전 지역에서 종합 배관 서비스가 가능합니다.` },
    { question: `${city} 배관 작업 후 보장이 되나요?`, answer: `네, ${city} 모든 작업에 대해 일정 기간 무상 A/S를 제공합니다. 안심하고 의뢰하세요.` },
  ];
  const faqLd = generateFaqJsonLd(cityFaq);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="hub-dark">
        {/* HERO */}
        <section className="hub-hero">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:py-24 md:items-center">
            <div>
              <p className="hub-eyebrow mb-5">전라북도 · {city}</p>
              <h1 className="text-4xl font-black leading-[1.15] tracking-tight text-white md:text-5xl">
                {city} <span className="hub-accent-gradient">배관 문제</span> 365일 해결
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
                {city} 전 지역 {region.districts.length}개 동·읍·면 긴급 출동.
                현장 상담 후 합리적 견적, 평균 30분 이내 도착.
              </p>
              <div className="mt-8 rounded-xl bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-wider text-white/70">24시 전화 상담</p>
                <a href={phoneLink()} className="mt-1 block font-mono text-3xl font-black text-white md:text-4xl">{formatPhone()}</a>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={phoneLink()} className="hub-btn-primary hub-btn-lg">📞 바로 전화</a>
                <a href="#services" className="hub-btn-ghost hub-btn-lg">서비스 보기</a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="hub-tag">출장비 무료</span>
                <span className="hub-tag">365일 운영</span>
                <span className="hub-tag">현장 상담 후 견적</span>
              </div>
            </div>
            <div className="hub-hero-image">
              <img src="/images/hero/banner-1.webp" alt={`${city} 전담 배관 전문 기사 현장 출동`} loading="eager" width={1024} height={1024} />
              <div className="hub-hero-image-meta">
                <p className="text-xs font-bold text-white/95">{city} 전담 기사 · 평균 30분 도착</p>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <section className="hub-section border-b border-slate-200">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-10 md:grid-cols-4">
            {TRUST_BADGES.map((b) => (
              <div key={b.label} className="flex items-start gap-3">
                <div className="text-2xl">{b.icon}</div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{b.label}</p>
                  <p className="mt-0.5 text-xs text-slate-600">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="hub-stats">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 py-14 md:grid-cols-4">
            <div className="hub-stat">
              <div className="hub-stat-num">{region.districts.length}</div>
              <div className="hub-stat-label">{city} 동·읍·면</div>
            </div>
            <div className="hub-stat">
              <div className="hub-stat-num">8</div>
              <div className="hub-stat-label">전문 서비스</div>
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

        {/* PARTNERS */}
        <section className="hub-partners">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">시공·출장 경험</p>
              <h2 className="text-2xl font-black leading-tight tracking-tight text-slate-800 md:text-3xl">
                {city} 전 지역 <span className="hub-accent-gradient">다양한 시설</span>에서 작업
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600">
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
                  <div key={`${p.name}-${i}`} className="flex h-20 w-40 flex-shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md" title={p.name}>
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={`${p.name} 로고`} width="90" height="32" className="h-8 w-auto max-w-[90px] object-contain" loading="lazy" />
                    ) : (
                      <span className="flex h-8 min-w-[50px] items-center justify-center rounded-md px-2.5 text-xs font-bold text-white" style={{ backgroundColor: p.color }}>{p.symbol}</span>
                    )}
                    <span className="text-[11px] font-semibold text-slate-700">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-center text-[10px] text-slate-600">* 시공·출장 경험이 있는 시설 예시이며, 공식 파트너쉽·계약 관계를 의미하지 않습니다.</p>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="hub-section">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">서비스 범위</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                {city}에서 가능한 <span className="hub-accent-gradient">8개 서비스</span>
              </h2>
              <p className="mt-3 text-base text-slate-600">현장 진단 후 투명 견적. 원인부터 재발 방지까지 통합 해결.</p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {SERVICES.map((s) => (
                <div key={s.name} className="hub-svc">
                  <div className="hub-svc-icon">{s.icon}</div>
                  <h3 className="mt-4 text-base font-bold text-slate-800">{s.name}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{s.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {s.tags.map((t) => (
                      <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DISTRICTS */}
        <section className="hub-cities">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">서비스 지역</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                {city} <span className="hub-accent-gradient">{region.districts.length}개 동·읍·면</span>
              </h2>
              <p className="mt-3 text-base text-slate-600">{city} 전 지역 어디든 24시간 긴급 출동합니다</p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {region.districts.map((district) => (
                <Link key={district} href={`/${city}/${district}변기막힘뚫는곳업체비용해결후기`} prefetch={false} className="hub-city">
                  <div className="text-sm font-bold text-slate-800">{district}</div>
                  <div className="mt-1 text-[11px] text-slate-600">24시 출동</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* BLOG CASES */}
        {cityPosts.length > 0 && (
          <section className="hub-section">
            <div className="mx-auto max-w-6xl px-6 py-20">
              <div className="text-center">
                <p className="hub-eyebrow mb-3">해결 사례</p>
                <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                  {city} <span className="hub-accent-gradient">현장 후기</span>
                </h2>
                <p className="mt-3 text-base text-slate-600">실 작업 진행 과정과 결과</p>
              </div>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cityPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/${post.city}/${post.slug}`}
                    prefetch={false}
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                  >
                    <div className="overflow-hidden bg-slate-100">
                      <img src={post.thumbnail} alt={post.title} className="aspect-[3/2] w-full object-cover transition group-hover:scale-105" loading="lazy" width={1200} height={800} />
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-2 text-sm font-bold leading-snug text-slate-800">{post.title}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="hub-section-alt">
          <div className="mx-auto max-w-3xl px-6 py-20">
            <div className="text-center">
              <p className="hub-eyebrow mb-3">FAQ</p>
              <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">
                {city} 자주 <span className="hub-accent-gradient">묻는 질문</span>
              </h2>
              <p className="mt-3 text-base text-slate-600">현장 출동 전 알려드리는 실제 답변</p>
            </div>
            <div className="mt-10 space-y-3">
              {cityFaq.map((item, idx) => (
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
              {city} 배관 문제, <span className="hub-accent-gradient">지금 바로</span> 해결
            </h2>
            <p className="mt-4 text-base text-white/80">{city} 전 지역 24시간 긴급 출동 · 평균 30분 도착</p>
            <div className="mt-8 inline-flex flex-col items-center gap-2 rounded-2xl bg-white/10 px-8 py-5 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">24시 전화 상담</p>
              <a href={phoneLink()} className="font-mono text-3xl font-black text-white md:text-4xl">{formatPhone()}</a>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={phoneLink()} className="hub-btn-primary hub-btn-lg">📞 바로 전화</a>
              <a href={siteConfig.kakaoUrl} className="hub-btn-ghost hub-btn-lg">💬 카카오톡 상담</a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
