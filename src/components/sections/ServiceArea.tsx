import { Check } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { phoneLink } from '@/lib/utils';

const areaItems = [
  '변기막힘 · 싱크대막힘 · 하수구막힘',
  '전주 · 익산 · 군산 · 정읍 · 남원 · 김제 · 완주 · 고창 · 부안 · 진안 · 무주 · 장수 · 임실 · 순창 출동 가능',
  '24시간 365일 긴급 대응',
];

export default function ServiceArea() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col items-center gap-10 lg:flex-row">
          {/* 이미지 */}
          <div className="lg:w-5/12">
            <img
              src="/images/area-main.webp"
              alt="배관 서비스 출동 지역"
              className="w-full rounded-xl shadow-md"
              loading="lazy"
            />
          </div>

          {/* 텍스트 */}
          <div className="lg:w-7/12">
            <p className="section-label mb-2">
              변기막힘/싱크대막힘/하수구막힘
            </p>
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              변기막힘 싱크대막힘 하수구막힘 출동 지역
            </h2>
            <p className="mb-6 leading-relaxed text-gray-600">
              전주, 익산, 군산 등 전라북도 14개 시/군 전 지역 24시로 출동 가능합니다.
              <br />
              (거리가 먼 경우 대기 시간이 소요될 수 있습니다.)
            </p>

            <ul className="mb-6 space-y-3">
              {areaItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 border-b pb-3 text-sm"
                >
                  <Check
                    size={18}
                    className="mt-0.5 flex-shrink-0 text-[var(--color-primary)]"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <a
              href={phoneLink()}
              className="inline-block rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
            >
              {siteConfig.name} 문의
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
