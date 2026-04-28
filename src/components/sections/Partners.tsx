import { partners } from '@/data/partners';

/**
 * 시공·출장 경험 있는 시설 / 브랜드 마키 섹션.
 * 실 로고(Simple Icons CDN) + 한글 텍스트 배지 하이브리드.
 */
export default function Partners() {
  // 마키 루프용 2회 복제
  const loop = [...partners, ...partners];

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        <div className="mb-10 text-center">
          <p className="section-label mb-2">시공·출장 경험</p>
          <h2 className="text-2xl font-bold md:text-3xl">
            전북 전 지역 · 다양한 시설에서 작업 진행
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
            관공서·대형마트·프랜차이즈·아파트·상가까지.
            <br className="hidden sm:inline" />
            규모에 관계없이 동일한 기준으로 현장 상담 후 진행합니다.
          </p>
        </div>

        <div
          className="partners-marquee relative overflow-hidden"
          style={{
            WebkitMaskImage:
              'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
            maskImage:
              'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
        >
          <div className="partners-track flex gap-4 py-4">
            {loop.map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="flex h-24 w-44 flex-shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                title={p.name}
              >
                {/* 로고 이미지 또는 컬러 배지 */}
                {p.logoUrl ? (
                  <img
                    src={p.logoUrl}
                    alt={`${p.name} 로고`}
                    width="110"
                    height="40"
                    className="h-10 w-auto max-w-[110px] rounded object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span
                    className="flex h-10 min-w-[60px] items-center justify-center rounded-md px-3 text-sm font-bold text-white"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.symbol}
                  </span>
                )}
                {/* 브랜드명 */}
                <span className="text-xs font-semibold tracking-wide text-slate-700">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          * 시공·출장 경험이 있는 시설 예시이며, 공식 파트너쉽·계약 관계를 의미하지 않습니다.
        </p>
      </div>
    </section>
  );
}
