/**
 * 의도(intent) 기반 인트로/결론 선택 헬퍼
 */

import type { SearchIntent } from '../url-suffixes';
import { introPool } from './intro-pool';
import { conclusionPool } from './conclusion-pool';

export function pickIntro(intent: SearchIntent, hash: number): string {
  const pool = introPool[intent];
  return pool[hash % pool.length];
}

export function pickConclusion(intent: SearchIntent, hash: number): string {
  const pool = conclusionPool[intent];
  return pool[hash % pool.length];
}
