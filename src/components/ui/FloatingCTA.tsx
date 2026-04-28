import { Phone, MessageCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { phoneLink, formatPhone } from '@/lib/utils';

export default function FloatingCTA() {
  return (
    <div className="floating-cta md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2">
        {/* 카카오 버튼 */}
        <a
          href={siteConfig.kakaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[var(--color-border)] bg-white text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)]"
          aria-label="카카오 문의"
        >
          <MessageCircle size={20} />
        </a>

        {/* 전화 CTA (주요) */}
        <a
          href={phoneLink()}
          className="btn-cta pulse-btn flex-1"
        >
          <Phone size={18} aria-hidden="true" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[11px] font-semibold opacity-80">
              24시 상담
            </span>
            <span className="tabular font-mono text-[15px]">
              {formatPhone()}
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
