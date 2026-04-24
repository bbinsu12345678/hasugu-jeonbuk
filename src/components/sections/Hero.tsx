import { Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { phoneLink, formatPhone } from '@/lib/utils';

export default function Hero() {
  const h1Lines = siteConfig.seo.h1.split('\n');

  return (
    <section className="hero-mesh relative overflow-hidden px-4 pb-16 pt-14 md:px-6 md:pb-24 md:pt-20 lg:pb-32 lg:pt-28">
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        {/* 텍스트 블록 (editorial asymmetric) */}
        <div>
          {/* 상단 뱃지 */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/95 backdrop-blur-md">
            <ShieldCheck size={14} className="text-[--color-accent]" />
            전북 14시군 · 24시 긴급출동
          </div>

          {/* H1 — bold display */}
          <h1 className="mb-5 text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-[4rem]">
            {h1Lines.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
            <span className="mt-2 block text-[--color-accent]">
              {siteConfig.seo.h1Accent}
            </span>
          </h1>

          {/* Body */}
          <p className="mb-7 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            변기·싱크대·하수구 어떤 막힘이든 현장 진단 후 투명 견적.
            출장비 무료 · 전 지역 평균 30분 내 도착.
          </p>

          {/* CTA 그룹 */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={phoneLink()}
              className="btn-cta pulse-btn text-base"
              aria-label={`전화 ${formatPhone()}`}
            >
              <Phone size={18} />
              <span>지금 전화 상담</span>
              <span className="tabular font-mono text-sm opacity-80">
                {formatPhone()}
              </span>
            </a>

            <a
              href={siteConfig.kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <MessageCircle size={16} />
              카카오 문의
            </a>
          </div>

          {/* 신뢰 지표 */}
          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6 text-center">
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/60">
                출장비
              </dt>
              <dd className="mt-1 font-display text-xl font-bold text-white md:text-2xl">
                무료
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/60">
                대응
              </dt>
              <dd className="mt-1 font-display text-xl font-bold text-white md:text-2xl">
                365일 24시
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/60">
                도착
              </dt>
              <dd className="mt-1 font-display text-xl font-bold text-white md:text-2xl">
                ~30분
              </dd>
            </div>
          </dl>
        </div>

        {/* 이미지 블록 — glassmorphism frame */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="card-glass p-2">
            <img
              src="/images/main_bg.webp"
              alt="전북하수구 배관 전문 해결"
              className="aspect-[4/5] w-full rounded-[calc(var(--radius-lg)-6px)] object-cover"
              loading="eager"
              width={1920}
              height={2400}
            />
          </div>

          {/* 플로팅 뱃지 */}
          <div className="absolute -left-4 bottom-6 hidden rounded-full bg-white px-4 py-2 shadow-lg md:flex md:items-center md:gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[--color-success]"></span>
            <span className="text-xs font-bold text-[--color-primary-deep]">
              지금 상담 가능
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
