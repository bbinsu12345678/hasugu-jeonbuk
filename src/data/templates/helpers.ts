/**
 * 결정론적 해시 + 변형 선택 헬퍼
 *
 * 같은 입력에 대해 항상 같은 결과를 반환하여
 * 빌드 결과의 일관성을 보장합니다.
 */

/** 문자열 → 양의 정수 해시 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** 동 이름 + offset 기반 단일 항목 선택 */
export function pickVariation<T>(items: T[], dong: string, offset = 0): T {
  return items[(hashString(dong) + offset) % items.length];
}

/** 동 이름 기반 여러 항목 선택 (순환) */
export function pickMultiple<T>(items: T[], dong: string, count: number): T[] {
  const start = hashString(dong) % items.length;
  const result: T[] = [];
  for (let i = 0; i < count && i < items.length; i++) {
    result.push(items[(start + i) % items.length]);
  }
  return result;
}

/** {dong}, {city} 플레이스홀더 치환 */
export function fill(pattern: string, dong: string, city: string): string {
  return pattern.replace(/\{dong\}/g, dong).replace(/\{city\}/g, city);
}
