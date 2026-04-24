-- 전북하수구 문의 수집 테이블 (2026-04-22)
-- 프로젝트: ofcqhpatmembkwbajmte (공용 Supabase, jeonbuk-hasugu와 동일 인스턴스)
-- 네이밍: `_hasugu` 접미사로 타 프로젝트(jeonbuk-hasugu) 테이블과 완전 분리

-- 1) ContactForm 문의
create table if not exists public.inquiries_hasugu (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  address text,
  message text,
  source_url text,
  created_at timestamptz default now(),
  status text default 'new'
);

alter table public.inquiries_hasugu enable row level security;

drop policy if exists "anon_insert_inquiries_hasugu" on public.inquiries_hasugu;
create policy "anon_insert_inquiries_hasugu"
  on public.inquiries_hasugu
  for insert
  to anon
  with check (true);

-- 2) 증상 진단 리드
create table if not exists public.symptom_leads_hasugu (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  symptoms text[] not null,
  city text,
  source_url text,
  created_at timestamptz default now(),
  status text default 'new'
);

alter table public.symptom_leads_hasugu enable row level security;

drop policy if exists "anon_insert_symptom_leads_hasugu" on public.symptom_leads_hasugu;
create policy "anon_insert_symptom_leads_hasugu"
  on public.symptom_leads_hasugu
  for insert
  to anon
  with check (true);

-- 3) 조회는 관리자(service_role)만 — anon SELECT 정책 없음 (기본 deny)

create index if not exists inquiries_hasugu_created_at_idx on public.inquiries_hasugu (created_at desc);
create index if not exists symptom_leads_hasugu_created_at_idx on public.symptom_leads_hasugu (created_at desc);
