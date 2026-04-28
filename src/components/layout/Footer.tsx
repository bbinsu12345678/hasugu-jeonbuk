import Link from 'next/link';
import { Phone, MessageCircle, Mail, Clock, MapPin } from 'lucide-react';
import { siteConfig, navItems } from '@/config/site';
import { phoneLink, formatPhone } from '@/lib/utils';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[var(--color-primary-deep)] pb-24 pt-16 text-white/80 md:pb-14">
      {/* 상단 accent bar */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent-deep)] to-[var(--color-accent)]" />

      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr]">
          {/* 브랜드 블록 */}
          <div>
            <div className="mb-4">
              <img
                src="/images/logo-white.png"
                alt={siteConfig.name}
                width="120"
                height="32"
                className="h-8 w-auto object-contain opacity-90 transition hover:opacity-100"
              />
            </div>
            <p className="mb-6 text-sm leading-relaxed text-white/70">
              변기·싱크대·하수구 막힘 전문.
              <br />
              전라북도 14 시/군 전 지역 24시 긴급 출동.
              <br />
              출장비 무료 · 현장 진단 후 투명 견적.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={phoneLink()}
                className="btn-cta text-sm"
              >
                <Phone size={16} aria-hidden="true" />
                <span className="tabular font-mono">{formatPhone()}</span>
              </a>
              <a
                href={siteConfig.kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <MessageCircle size={15} aria-hidden="true" />
                카카오 상담
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <Mail size={15} aria-hidden="true" />
                문의 하기
              </a>
            </div>
          </div>

          {/* 메뉴 */}
          <nav aria-label="푸터 메뉴">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
              메뉴
            </h3>
            <ul className="space-y-2.5">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    prefetch={false}
                    className="inline-block text-sm text-white/75 transition hover:text-white hover:translate-x-0.5"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 사업자 정보 */}
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
              사업자 정보
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-white/55">상호</dt>
                <dd className="text-white/90">{siteConfig.business.company}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-white/55">대표</dt>
                <dd className="text-white/90">
                  {siteConfig.business.representative}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-white/55">사업자</dt>
                <dd className="tabular font-mono text-white/90">
                  {siteConfig.business.number}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-white/55">
                  <MapPin size={13} className="mt-0.5 inline" />
                </dt>
                <dd className="text-white/90">{siteConfig.business.address}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-white/55">
                  <Clock size={13} className="mt-0.5 inline" />
                </dt>
                <dd className="text-white/90">365일 24시간 상담</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 전북 14 시/군 서브 사이트 (경쟁사 gangnam.jianhomecare.com 방식 동일) */}
        <section
          aria-labelledby="partner-regions"
          className="mt-14 border-t border-white/10 pt-8"
        >
          <h3
            id="partner-regions"
            className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]"
          >
            전라북도 시·군 전용 사이트
          </h3>
          <p className="mb-4 text-xs text-white/50">
            각 시·군별 특화 서비스 페이지에서 지역 상세 정보를 확인하세요.
          </p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/70 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {/*
              서브 오픈 시 주석을 실 링크로 교체 (상호 백링크 활성화).
              예: <a href="https://jeonju.hasugu-jeonbuk.com" rel="noopener" className="hover:text-white">전주시</a>
            */}
            <li className="text-white/50">전주시</li>
            <li className="text-white/50">군산시</li>
            <li className="text-white/50">익산시</li>
            <li className="text-white/50">정읍시</li>
            <li className="text-white/50">남원시</li>
            <li className="text-white/50">김제시</li>
            <li className="text-white/50">완주군</li>
            <li className="text-white/50">고창군</li>
            <li className="text-white/50">부안군</li>
            <li className="text-white/50">진안군</li>
            <li className="text-white/50">무주군</li>
            <li className="text-white/50">장수군</li>
            <li className="text-white/50">임실군</li>
            <li className="text-white/50">순창군</li>
          </ul>
          <p className="mt-4 text-xs text-white/70">
            시·군별 전용 사이트 준비 중 (서브 오픈 시 직접 이동 가능)
          </p>
        </section>

        {/* 하단 구분선 + 저작권 */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-xs text-white/50 md:flex-row">
          <p>&copy; {year} {siteConfig.name}. All rights reserved.</p>
          <p className="tabular font-mono">
            {siteConfig.domain.replace('https://', '')}
          </p>
        </div>
      </div>
    </footer>
  );
}
