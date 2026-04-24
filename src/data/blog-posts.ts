import { generateBlogPosts } from './blog-templates';

/**
 * 블로그 포스트 목록
 *
 * regions.ts의 지역 데이터(시/구/동)에서 자동 생성됩니다.
 * 새 지역을 추가하려면 regions.ts만 수정하세요.
 *
 * 서비스 타입은 동별로 순환 배정: 변기막힘 → 싱크대막힘 → 하수구막힘 → ...
 */
export const blogPosts = generateBlogPosts();
