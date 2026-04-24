import {
  Siren,
  Wrench,
  BadgeCheck,
  Settings,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import { facilities } from '@/data/facilities';

const iconMap: Record<string, React.ElementType> = {
  Siren,
  Wrench,
  BadgeCheck,
  Settings,
  ShieldCheck,
  Headphones,
};

export default function Facilities() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 lg:px-6">
        {/* 섹션 타이틀 */}
        <div className="mb-10 text-center">
          <p className="section-label mb-2">왜 저희인가요?</p>
          <h2 className="text-2xl font-bold md:text-3xl">
            변기막힘 하수구막힘 전문 해결 업체
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facilities.map((item) => {
            const Icon = iconMap[item.icon] ?? Wrench;
            return (
              <div
                key={item.title}
                className="card-shadow flex gap-4 border-t-4 border-[--color-primary] p-6"
              >
                <div className="flex-shrink-0 text-[--color-primary]">
                  <Icon size={36} />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-bold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
