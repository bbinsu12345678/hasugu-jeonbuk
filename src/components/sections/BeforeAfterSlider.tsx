'use client';

import { useRef, useState, useCallback, type PointerEvent } from 'react';

export type BeforeAfterSliderProps = {
  before: string;
  after: string;
  label?: string;
  alt?: string;
};

/**
 * Drag-to-compare Before/After 슬라이더.
 * - 기본 50% 위치에서 시작
 * - 포인터 드래그로 reveal 영역 조절
 * - 접근성: 라벨 + 좌우 표시
 */
export default function BeforeAfterSlider({
  before,
  after,
  label,
  alt,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updateFromEvent = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromEvent(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateFromEvent(e.clientX);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full cursor-ew-resize select-none bg-slate-900"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="slider"
        aria-label={`Before/After 비교 — ${alt ?? label ?? '작업 전후'}`}
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
      >
        {/* AFTER (뒤, 전체 표시) */}
        <img
          src={after}
          alt={`After — ${alt ?? label ?? ''}`}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
          loading="lazy"
        />
        {/* BEFORE (앞, clipPath 로 slider 왼쪽만 표시) */}
        <img
          src={before}
          alt={`Before — ${alt ?? label ?? ''}`}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          draggable={false}
          loading="lazy"
        />
        {/* 슬라이더 핸들 */}
        <div
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
          style={{ left: `${position}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
            <span className="text-xs font-black text-slate-700">↔</span>
          </div>
        </div>
        {/* 좌상단 BEFORE 라벨 */}
        <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-slate-900/80 px-2.5 py-1 text-[11px] font-black tracking-wider text-white">
          BEFORE
        </span>
        {/* 우상단 AFTER 라벨 */}
        <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-[var(--color-accent)] px-2.5 py-1 text-[11px] font-black tracking-wider text-white">
          AFTER
        </span>
      </div>
      {label && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-sm font-bold text-slate-800">{label}</p>
        </div>
      )}
    </div>
  );
}
