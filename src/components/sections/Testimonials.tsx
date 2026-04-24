import { Quote } from 'lucide-react';
import { testimonials } from '@/data/testimonials';

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        {/* 섹션 타이틀 */}
        <div className="mb-10 text-center">
          <p className="section-label mb-2">후기</p>
          <h2 className="text-2xl font-bold md:text-3xl">
            변기막힘 하수구막힘 해결 고객 후기
          </h2>
        </div>

        {/* 캐러셀 (CSS scroll-snap) */}
        <div className="testimonial-carousel">
          {testimonials.map((review, i) => (
            <div key={i} className="card-shadow flex flex-col p-5">
              {/* 후기 내용 */}
              <div className="mb-4 flex-1 rounded-lg bg-[--color-bg-light] p-4">
                <Quote
                  size={20}
                  className="mb-2 text-[--color-primary]"
                />
                <p className="text-sm leading-relaxed text-gray-700">
                  {review.content}
                </p>
              </div>

              {/* 고객 정보 */}
              <div className="flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={`${review.name} 고객님`}
                  className="h-12 w-12 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {review.location} {review.name} 고객님
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
