'use client';

import { useState, type FormEvent } from 'react';
import { siteConfig } from '@/config/site';
import { submitSymptomLead } from '@/lib/supabase';

const SYMPTOMS = [
  '변기 물이 내려가지 않아요',
  '싱크대 물이 빠지지 않아요',
  '하수구에서 역류가 있어요',
  '배수구에서 악취가 나요',
  '세면대·욕실 배수 불량',
  '동파로 배관이 얼었어요',
  '벽·천장에서 누수 흔적이 보여요',
  '관리실에서 공용 배관 점검 요청을 받았어요',
];

const SUPABASE_READY =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function SymptomChecker() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const toggle = (s: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (checked.size === 0) {
      alert('해당하는 증상을 1개 이상 선택해주세요.');
      return;
    }
    if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g, ''))) {
      alert('연락처 형식을 확인해주세요. (예: 010-1234-5678)');
      return;
    }

    if (!SUPABASE_READY) {
      window.location.href = `tel:${siteConfig.phone}`;
      return;
    }

    setStatus('sending');
    try {
      await submitSymptomLead({
        phone,
        symptoms: Array.from(checked),
        sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      });
      setStatus('success');
      setChecked(new Set());
      setPhone('');
    } catch (err) {
      console.error('[SymptomChecker] submit failed:', err);
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <p className="text-sm font-bold text-[--color-accent]">1단계 · 증상을 선택해주세요</p>
      <h3 className="mt-2 text-xl font-black text-slate-800 md:text-2xl">
        현장 출동 전 <span className="hub-accent-gradient">빠른 진단</span>
      </h3>
      <p className="mt-2 text-sm text-slate-500">
        증상을 체크하면 원인과 대응 방안을 먼저 안내드립니다.
      </p>

      {/* 증상 체크박스 */}
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {SYMPTOMS.map((s) => {
          const on = checked.has(s);
          return (
            <label
              key={s}
              className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition ${
                on
                  ? 'border-[--color-accent] bg-[--color-accent]/5'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[--color-accent]"
                checked={on}
                onChange={() => toggle(s)}
              />
              <span className={on ? 'font-semibold text-slate-800' : 'text-slate-700'}>{s}</span>
            </label>
          );
        })}
      </div>

      {/* 연락처 */}
      <div className="mt-6">
        <label htmlFor="symptom-phone" className="mb-1 block text-sm font-semibold text-slate-700">
          연락처
        </label>
        <input
          id="symptom-phone"
          type="tel"
          required
          maxLength={13}
          placeholder="010-1234-5678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-[--color-primary] focus:outline-none focus:ring-1 focus:ring-[--color-primary]"
        />
        <p className="mt-2 text-[11px] text-slate-400">
          * 연락처는 상담 목적으로만 사용되며 외부에 공유되지 않습니다.
        </p>
      </div>

      {/* 제출 */}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="hub-btn-primary mt-6 w-full justify-center"
      >
        {status === 'sending' ? '접수 중...' : `무료 진단 요청 (${checked.size})`}
      </button>

      {status === 'success' && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          접수되었습니다. 입력하신 번호로 곧 연락드립니다.
        </p>
      )}
      {status === 'error' && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          일시적 오류가 발생했습니다. 직접 전화 {siteConfig.phone} 부탁드립니다.
        </p>
      )}
    </form>
  );
}
