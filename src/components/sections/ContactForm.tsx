'use client';

import { useState, type FormEvent } from 'react';
import { siteConfig } from '@/config/site';
import { submitInquiry } from '@/lib/supabase';

const SUPABASE_READY =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [submittedName, setSubmittedName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    message: '',
    website: '', // 허니팟: 사용자는 안 보이고, 봇이 채우면 무시
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // 허니팟 — 봇 탐지
    if (formData.website) {
      setStatus('success');
      return;
    }

    if (!SUPABASE_READY) {
      // Supabase 미설정 — 전화·카카오톡으로 연결 유도
      const telHref = `tel:${siteConfig.phone}`;
      const msg = `[문의 접수 안내]\n\n현재 폼 연동 준비 중입니다.\n빠른 상담을 원하시면 전화 또는 카카오톡으로 연락 부탁드립니다.\n\n• 전화: ${siteConfig.phone}\n• 카카오톡: ${siteConfig.kakaoUrl}`;
      alert(msg);
      window.location.href = telHref;
      return;
    }

    setStatus('sending');

    try {
      await submitInquiry({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        message: formData.message,
        sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      });
      setSubmittedName(formData.name);
      setStatus('success');
      setFormData({ name: '', phone: '', address: '', message: '', website: '' });
    } catch (err) {
      console.error('[ContactForm] submit failed:', err);
      setStatus('error');
    }
  }

  return (
    <section id="contact" className="bg-[var(--color-bg-light)] py-16">
      <div className="mx-auto max-w-2xl px-4 lg:px-6">
        {/* 섹션 타이틀 */}
        <div className="mb-10 text-center">
          <p className="section-label mb-2">문의</p>
          <h2 className="text-2xl font-bold md:text-3xl">변기막힘 싱크대막힘 하수구막힘 문의하기</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 허니팟 — 봇 탐지용, 사용자에게 안 보임 */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, website: e.target.value }))
            }
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            aria-hidden="true"
          />
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              성함
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium">
              연락처
            </label>
            <input
              id="phone"
              type="tel"
              required
              maxLength={11}
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="address" className="mb-1 block text-sm font-medium">
              주소
            </label>
            <textarea
              id="address"
              required
              rows={2}
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium">
              문의내용
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-lg bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
          >
            {status === 'sending' ? '전송 중...' : '문의하기'}
          </button>

          {status === 'success' && (
            <p className="text-center text-sm text-green-600">
              {submittedName}님의 문의가 접수되었습니다. 감사합니다.
            </p>
          )}
          {status === 'error' && (
            <p className="text-center text-sm text-red-600">
              죄송합니다. 다시 시도해주세요.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
