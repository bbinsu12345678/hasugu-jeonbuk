/**
 * 블로그 포스트 썸네일 풀 — 서비스별 분리
 *
 * public/images/blog-content/{slug}/{slug}-NNNN.webp
 *   slug ∈ toilet · sink · drain · leak · aircon · sewage · stormwater · manhole
 *
 * 각 파일은 scripts/process-workimages.py 로 생성되며 다음이 모두 다름:
 * - 파일 해시 · 픽셀 해시 · EXIF · DCT · 색상 · 크롭 · 브랜딩 오버레이
 *
 * 서비스별 오버레이 문구는 PROMO_BY_SERVICE 풀에서 선택되므로
 * 제목↔이미지 매칭 보장.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { ServiceType } from '@/data/url-suffixes';

/** 한글 ServiceType → 폴더 슬러그 (영문) 매핑 */
export const SERVICE_TO_SLUG: Record<ServiceType, string> = {
  변기막힘: 'toilet',
  싱크대막힘: 'sink',
  하수구막힘: 'drain',
  누수탐지: 'leak',
  에어컨배관청소: 'aircon',
  오수관막힘: 'sewage',
  우수관막힘: 'stormwater',
  맨홀청소: 'manhole',
};

const BLOG_DIR = path.join(process.cwd(), 'public/images/blog-content');

/** 서비스별 webp 파일 목록 (빌드 타임에 디스크 스캔) */
export const thumbnailsByService: Record<ServiceType, string[]> =
  Object.fromEntries(
    (Object.keys(SERVICE_TO_SLUG) as ServiceType[]).map((svc) => {
      const slug = SERVICE_TO_SLUG[svc];
      const dir = path.join(BLOG_DIR, slug);
      const files = fs.existsSync(dir)
        ? fs
            .readdirSync(dir)
            .filter((f) => f.endsWith('.webp'))
            .sort()
        : [];
      return [svc, files.map((f) => `/images/blog-content/${slug}/${f}`)];
    }),
  ) as Record<ServiceType, string[]>;

/**
 * 서비스별 fallback chain — 풀이 비어 있을 때 가까운 서비스 풀 재사용.
 * 분류 결과 불균형(sewage/manhole = 0) 대응.
 */
const FALLBACK_CHAIN: Record<ServiceType, ServiceType[]> = {
  변기막힘: ['변기막힘', '싱크대막힘', '하수구막힘'],
  싱크대막힘: ['싱크대막힘', '변기막힘', '하수구막힘'],
  하수구막힘: ['하수구막힘', '오수관막힘', '우수관막힘', '맨홀청소', '변기막힘'],
  누수탐지: ['누수탐지', '하수구막힘', '변기막힘'],
  에어컨배관청소: ['에어컨배관청소', '하수구막힘'],
  오수관막힘: ['오수관막힘', '하수구막힘', '맨홀청소'],
  우수관막힘: ['우수관막힘', '하수구막힘', '오수관막힘'],
  맨홀청소: ['맨홀청소', '하수구막힘', '오수관막힘'],
};

/**
 * 서비스 타입에 해당하는 썸네일 풀에서 해시 기반 선택.
 * offset 으로 섹션별 다른 이미지 선택 가능.
 *
 * 풀이 비어 있으면 fallback chain 순서로 대체 서비스 풀 사용.
 */
/**
 * 서비스 풀 확보 — 매칭 우선, 부족할 때만 fallback chain.
 *  - 자기 풀이 충분(≥30)하면 **자기 풀만** 사용 (서비스↔오버레이 매칭 보장)
 *  - 부족/0장이면 fallback chain 합쳐서 보충
 */
const MIN_POOL = 30;

function expandedPool(service: ServiceType): string[] {
  const primary = thumbnailsByService[service];
  if (primary && primary.length >= MIN_POOL) {
    return primary; // 매칭 유지
  }
  const chain = FALLBACK_CHAIN[service] ?? [service];
  const merged: string[] = [];
  for (const svc of chain) {
    const pool = thumbnailsByService[svc];
    if (pool && pool.length > 0) merged.push(...pool);
  }
  return merged;
}

export function pickThumbnail(
  service: ServiceType,
  hash: number,
  offset = 0,
): string {
  const pool = expandedPool(service);
  if (pool.length === 0) return '/images/blog-content/placeholder.webp';
  // offset 을 큰 소수로 곱해 풀 전반에 분산 시킴.
  // hash + offset 이면 인접 인덱스만 선택돼 같은 원본의 30 변형만 반복되는 문제 해결.
  const scattered = hash + offset * 997;
  return pool[Math.abs(scattered) % pool.length];
}

/**
 * @deprecated 서비스 매칭 없음 — pickThumbnail(service, hash) 사용 권장.
 * 기존 코드 호환용으로 전체 풀 반환 (서비스별 풀 합산).
 */
export const thumbnails: string[] = Object.values(thumbnailsByService).flat();
