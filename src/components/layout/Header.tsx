'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Phone } from 'lucide-react';
import { siteConfig, navItems } from '@/config/site';
import { phoneLink, formatPhone } from '@/lib/utils';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[--color-border] bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 lg:px-6">
        {/* 로고 워드마크 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-[--color-primary-deep]"
          aria-label={`${siteConfig.name} 홈`}
        >
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[--color-primary-deep] text-[--color-accent]"
            aria-hidden
          >
            <span className="font-extrabold">전</span>
          </span>
          <span>{siteConfig.name}</span>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="주요 메뉴"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative text-sm font-semibold text-[--color-text] transition hover:text-[--color-accent-deep]"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={phoneLink()}
            className="btn-cta text-sm"
            aria-label={`전화 ${formatPhone()}`}
          >
            <Phone size={15} />
            <span className="tabular font-mono">{formatPhone()}</span>
          </a>
        </nav>

        {/* 모바일 햄버거 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-2 text-[--color-primary-deep] transition hover:bg-[--color-primary-soft] lg:hidden"
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* 모바일 드로어 */}
      {isOpen && (
        <nav
          className="border-t border-[--color-border] bg-white px-4 pb-4 pt-2 lg:hidden"
          aria-label="모바일 메뉴"
        >
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block border-b border-[--color-border] py-3 text-sm font-semibold text-[--color-text]"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={phoneLink()}
            className="btn-cta mt-4 w-full justify-center"
          >
            <Phone size={16} />
            <span className="tabular font-mono">{formatPhone()}</span>
          </a>
        </nav>
      )}
    </header>
  );
}
