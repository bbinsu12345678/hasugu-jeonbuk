-- 전북하수구 문의 RPC (2026-04-22)
-- SECURITY DEFINER → RLS 우회. anon JWT 로도 INSERT 성공.
-- 방어심층: RLS 정책은 deny-all 로 남겨둠 (직접 .from().insert() 는 차단).

-- ────────── inquiries_hasugu RPC ──────────
create or replace function public.submit_inquiry_hasugu(
  p_name text,
  p_phone text,
  p_address text default null,
  p_message text default null,
  p_source_url text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  -- 입력 검증
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception '이름은 필수입니다';
  end if;
  if p_phone is null or length(trim(p_phone)) = 0 then
    raise exception '전화번호는 필수입니다';
  end if;
  if p_phone !~ '^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$' then
    raise exception '전화번호 형식이 올바르지 않습니다';
  end if;

  insert into public.inquiries_hasugu (name, phone, address, message, source_url)
  values (
    substring(trim(p_name), 1, 100),
    regexp_replace(p_phone, '[^0-9-]', '', 'g'),
    substring(coalesce(p_address, ''), 1, 500),
    substring(coalesce(p_message, ''), 1, 2000),
    substring(coalesce(p_source_url, ''), 1, 500)
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_inquiry_hasugu(text, text, text, text, text) from public;
grant execute on function public.submit_inquiry_hasugu(text, text, text, text, text) to anon, authenticated;

-- ────────── symptom_leads_hasugu RPC ──────────
create or replace function public.submit_symptom_lead_hasugu(
  p_phone text,
  p_symptoms text[],
  p_city text default null,
  p_source_url text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_phone is null or length(trim(p_phone)) = 0 then
    raise exception '전화번호는 필수입니다';
  end if;
  if p_phone !~ '^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$' then
    raise exception '전화번호 형식이 올바르지 않습니다';
  end if;
  if p_symptoms is null or array_length(p_symptoms, 1) is null then
    raise exception '증상은 최소 1개 이상 선택해야 합니다';
  end if;

  insert into public.symptom_leads_hasugu (phone, symptoms, city, source_url)
  values (
    regexp_replace(p_phone, '[^0-9-]', '', 'g'),
    p_symptoms[1:20],
    substring(coalesce(p_city, ''), 1, 50),
    substring(coalesce(p_source_url, ''), 1, 500)
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_symptom_lead_hasugu(text, text[], text, text) from public;
grant execute on function public.submit_symptom_lead_hasugu(text, text[], text, text) to anon, authenticated;
