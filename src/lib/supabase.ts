/**
 * Supabase 클라이언트 — 전북하수구 (hasugu-jeonbuk.com)
 *
 * 인프라 공유: jeonbuk-hasugu 프로젝트와 동일 Supabase 프로젝트 사용.
 * 테이블은 사이트별 접미사로 분리 (inquiries_hasugu, ...).
 *
 * 싱글톤 패턴 — 리렌더링 시 여러 인스턴스 생성 방지.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

let browserInstance: SupabaseClient | null = null;

/** 브라우저/클라이언트사이드용 (anon key) — dynamic import 로 form-submit 시점 로드 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  if (browserInstance) return browserInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase env 누락: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 확인 필요',
    );
  }

  const { createClient } = await import('@supabase/supabase-js');
  browserInstance = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
  return browserInstance;
}

/**
 * 문의 submit — ContactForm 에서 호출.
 * SECURITY DEFINER RPC 경유 (서버사이드 검증 + RLS 우회).
 * 직접 .from().insert() 는 RLS 정책이 deny 하므로 반드시 RPC 사용.
 */
export async function submitInquiry(input: {
  name: string;
  phone: string;
  address?: string;
  message?: string;
  sourceUrl?: string;
}): Promise<string> {
  const client = await getSupabaseClient();
  const { data, error } = await client.rpc('submit_inquiry_hasugu', {
    p_name: input.name,
    p_phone: input.phone,
    p_address: input.address ?? null,
    p_message: input.message ?? null,
    p_source_url: input.sourceUrl ?? null,
  });
  if (error) throw new Error(`문의 접수 실패: ${error.message}`);
  return data as string;
}

/**
 * 증상 진단 리드 — SymptomChecker 에서 호출.
 * SECURITY DEFINER RPC 경유.
 */
export async function submitSymptomLead(input: {
  phone: string;
  symptoms: string[];
  city?: string;
  sourceUrl?: string;
}): Promise<string> {
  const client = await getSupabaseClient();
  const { data, error } = await client.rpc('submit_symptom_lead_hasugu', {
    p_phone: input.phone,
    p_symptoms: input.symptoms,
    p_city: input.city ?? null,
    p_source_url: input.sourceUrl ?? null,
  });
  if (error) throw new Error(`증상 진단 접수 실패: ${error.message}`);
  return data as string;
}
