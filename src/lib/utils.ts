import { siteConfig } from '@/config/site';

/** 전화번호 tel: 링크 */
export function phoneLink(): string {
  return `tel:${siteConfig.phoneRaw}`;
}

/** 전화번호 표시용 포맷 */
export function formatPhone(): string {
  return siteConfig.phone;
}

/** 카카오톡 링크 */
export function kakaoLink(): string {
  return siteConfig.kakaoUrl;
}

/** 메타 타이틀 생성 */
export function metaTitle(page?: string): string {
  if (!page) return siteConfig.name;
  return `${page} | ${siteConfig.name}`;
}

/** CSS 클래스 결합 (cn 유틸) */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
