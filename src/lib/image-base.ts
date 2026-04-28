/**
 * R2 이미지 베이스 URL 헬퍼
 *
 * blog-content 이미지만 R2 CDN URL로 변환.
 * Hero / avatar / og / logo 등 다른 이미지는 그대로 반환.
 *
 * 환경변수 NEXT_PUBLIC_IMAGE_BASE 가 설정되면 R2 URL prefix 사용.
 * 미설정(로컬 개발) 시 원래 상대 경로 그대로 반환.
 */

const IMAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGE_BASE?.replace(/\/$/, '') ?? '';

/**
 * blog-content 이미지 경로를 R2 절대 URL로 변환.
 * - 이미 http로 시작하면 그대로 반환
 * - /images/blog-content/ 포함 경로만 prefix 적용
 * - 그 외 (avatar, hero, og 등)는 그대로 반환
 */
export function imageUrl(path: string): string {
  if (!path) return path;
  if (path.startsWith('http')) return path;
  if (!path.includes('/images/blog-content/')) return path;
  return `${IMAGE_BASE}${path}`;
}
