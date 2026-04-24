/**
 * Route params 디코딩 유틸 (공통 센트럴라이즈)
 *
 * 배경: Next.js 16.2.2 정적 export 에서 한글 같은 non-ASCII dynamic segment 의
 * params 값이 페이지 컴포넌트 쪽에는 URL-encoded("%EC%A0%84...") 상태로 전달되는 비대칭 버그 존재.
 * generateMetadata 쪽은 raw("전주시") 로 전달되어 regions.find 가 성공하지만,
 * 페이지 본문 쪽은 encoded 값으로 들어와 `r.city === city` 가 실패하고
 * `if (!region) notFound()` 트리거 → `digest: NEXT_HTTP_ERROR_FALLBACK;404` → __next_error__ fallback HTML.
 *
 * 해결: 모든 route page·layout 에서 params 사용 시 이 함수로 decode.
 * 이미 decoded 된 값에 대해 decodeURIComponent 호출은 no-op (raw 한글 문자열은 그대로 반환).
 *
 * 8도 확장 시에도 동일 파일 import 만으로 안전 (template discipline 규율 반영).
 */

function safeDecode(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    // malformed encoding 은 원본 유지
    return raw;
  }
}

export function decodeCityParam(raw: string): string {
  return safeDecode(raw);
}

export function decodeSlugParam(raw: string): string {
  return safeDecode(raw);
}

/** 일반 용도: 어떤 route param 이든 안전 decode */
export const decodeParam = safeDecode;
