import { Phone } from 'lucide-react';
import { services } from '@/data/services';
import { phoneLink, formatPhone } from '@/lib/utils';

export default function ServiceCards() {
  return (
    <section
      id="services"
      className="relative bg-[var(--color-bg)] py-20 md:py-28"
    >
      {/* 섹션 배경 악센트 */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,66,0.12), transparent)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-6">
        {/* 섹션 헤더 */}
        <div className="mb-14 text-center">
          <p className="section-label mb-4">막힘 증상</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-primary-deep)] md:text-4xl">
            변기·싱크대·하수구 막힘
            <br className="md:hidden" />
            <span className="text-[var(--color-accent-deep)]"> 증상과 해결</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-text-muted)]">
            어떤 증상이든 현장 진단 후 투명 견적. 전북 14 시/군 전 지역
            24시 긴급 출동합니다.
          </p>
        </div>

        {/* 3개 카드 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {services.map((service) => (
            <article
              key={service.slug}
              className="card-shadow group flex flex-col overflow-hidden"
            >
              {/* 서비스 이미지 + 상단 뱃지 */}
              <div className="relative overflow-hidden bg-[var(--color-primary-soft)]">
                <img
                  src={service.image}
                  alt={service.title}
                  className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  width={1200}
                  height={800}
                />
                {/* 서비스 슬러그 뱃지 */}
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[var(--color-primary-deep)] backdrop-blur">
                  {service.title}
                </span>
              </div>

              {/* 카드 본문 */}
              <div className="flex flex-1 flex-col gap-5 p-6">
                <header>
                  <h3 className="mb-2 text-xl font-bold text-[var(--color-primary-deep)]">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {service.description}
                  </p>
                </header>

                {/* 증상 테이블 */}
                <div className="rounded-md bg-[var(--color-bg-light)] p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                    주요 증상
                  </p>
                  <table className="symptom-table">
                    <tbody>
                      {service.symptoms.map((s) => (
                        <tr key={s.label}>
                          <td>{s.label}</td>
                          <td>{s.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* CTA */}
                <a
                  href={phoneLink()}
                  className="btn-cta mt-auto w-full"
                  aria-label={`${service.title} 상담 ${formatPhone()}`}
                >
                  <Phone size={16} />
                  <span>{service.title} 상담</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
