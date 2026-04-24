# 문의 DB 저장 전략 — 전북하수구

> 작성: 2026-04-22
> 목적: 정적 export (Next.js `output: 'export'`) 환경에서 문의 폼 → DB 저장 실현.
> 전제: 서버사이드 API route 사용 불가 → 외부 서비스 필수.

---

## 1. 선택지 비교

| 서비스 | 무료 한도 | 구현 난이도 | 실시간 알림 | DB 조회/관리 UI | 총 평가 |
|---|---|---|---|---|---|
| 🥇 **Supabase** | 500MB DB · 5GB 전송 | 중 | ✅ Webhook | ✅ 대시보드 · SQL · REST | ★★★★★ |
| 🥈 **Google Sheets + Apps Script** | 무제한 | 하 | ✅ 이메일 | ✅ 스프레드시트 | ★★★★ |
| 🥉 **Firestore** | 1GB · 50k 읽기/일 | 중 | ✅ | ✅ | ★★★★ |
| Formspree | 50건/월 (Free) | 하 | ✅ | ✅ | ★★★ |
| Web3Forms | 250건/월 | 하 | ✅ 이메일만 | ❌ | ★★ |
| Airtable | 1,000 rec · 2GB | 중 | ✅ | ✅ | ★★★ |

---

## 2. 추천: Supabase (권장)

### 장점
- PostgreSQL 기반 → SQL 로 문의 검색·집계 가능
- REST API 자동 생성 → 클라이언트 직접 호출
- Row Level Security (RLS) 로 **쓰기만 허용, 조회는 관리자만**
- 무료 500MB DB 로 문의 3만 건 저장 가능
- Webhook → 이메일/슬랙/카톡 자동 알림

### 스키마 설계 (2개 테이블 필수)

**테이블 1 — 문의 폼 (ContactForm):**
```sql
create table if not exists inquiries_hasugu (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  address text,
  message text,
  source_url text,
  created_at timestamptz default now(),
  status text default 'new'
);
alter table inquiries_hasugu enable row level security;
create policy "anon_insert" on inquiries_hasugu
  for insert to anon with check (true);
```

**테이블 2 — 증상 진단 리드 (SymptomChecker):**
```sql
create table if not exists symptom_leads_hasugu (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  symptoms text[] not null,
  city text,
  source_url text,
  created_at timestamptz default now(),
  status text default 'new'
);
alter table symptom_leads_hasugu enable row level security;
create policy "anon_insert" on symptom_leads_hasugu
  for insert to anon with check (true);
```

두 테이블 모두 Supabase Dashboard → SQL Editor 에서 실행해주세요.

### 클라이언트 구현 (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function submitInquiry(data: {
  name: string;
  phone: string;
  address?: string;
  message?: string;
}) {
  const { error } = await supabase.from('inquiries').insert({
    ...data,
    source_url: window.location.href,
  });
  if (error) throw error;
}
```

### ContactForm 수정
`handleSubmit` 에서 EmailJS 대신 (또는 병행) `submitInquiry()` 호출.

### 실시간 알림 설정
- Supabase Dashboard → Database → Webhooks → "새 inquiry 삽입 시"
- 타겟: Discord Webhook · Slack Webhook · 또는 Zapier → 카카오톡 비즈니스 메시지

### 비용 (예상)
- 무료 tier 충분. 월 문의 1,000건까지 여유.
- 유료 $25/월 전환 시점: 500MB DB 초과 (대략 문의 200만 건 이후).

---

## 3. 대안: Google Sheets + Apps Script (가장 쉬움)

### 장점
- Google 계정만 있으면 즉시 시작
- Sheets UI 로 문의 조회·필터링·메모 직관적
- Apps Script Web App → POST 받아 Sheet 추가 + 이메일 발송 무료

### 구현
1. Google Drive → 새 스프레드시트 "전북하수구 문의"
2. 확장 프로그램 → Apps Script → 아래 코드:
```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.appendRow([
    new Date(),
    data.name,
    data.phone,
    data.address,
    data.message,
    data.sourceUrl
  ]);
  // 이메일 알림
  MailApp.sendEmail({
    to: 'bbinsu12345678@gmail.com',
    subject: `[전북하수구 문의] ${data.name} 고객`,
    body: `이름: ${data.name}\n전화: ${data.phone}\n주소: ${data.address}\n문의: ${data.message}\nURL: ${data.sourceUrl}`
  });
  return ContentService.createTextOutput(JSON.stringify({ ok: true }));
}
```
3. 배포 → 웹 앱 → "누구나 액세스" → URL 복사
4. `ContactForm` 에서 `fetch(URL, { method: 'POST', body: JSON.stringify(data) })`

### 단점
- Sheets 시트 너무 커지면 느려짐 (수만 행부터)
- 검색·집계는 Sheets 함수 제한적

---

## 4. 실행 순서 (권장)

### Step 1 — Supabase 계정 (인수님 5분)
1. https://supabase.com 가입 (GitHub/Google)
2. 새 프로젝트 생성 (region: 서울)
3. SQL Editor → 위 스키마 스크립트 실행
4. Settings → API → `URL`, `anon key` 복사

### Step 2 — 환경변수 (인수님 1분)
Vercel 프로젝트 Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL` = 복사한 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 복사한 anon key

### Step 3 — 코드 (Claude 30분)
- `npm i @supabase/supabase-js`
- `src/lib/supabase.ts` 작성
- `ContactForm.tsx` 에 `submitInquiry` 호출 추가
- 에러 핸들링 · 스팸 방지 (허니팟 필드)

### Step 4 — 알림 연동 (인수님 10분)
Supabase Database Webhooks 설정:
- 타겟: Discord 서버 Webhook (가장 간단) 또는 카카오 비즈니스 메시지 API

### Step 5 — 관리자 페이지 (선택)
- Supabase Dashboard → Table Editor → `inquiries` 테이블 → 수동 관리
- 별도 관리 UI 불필요

---

## 5. 스팸 방지 필수 장치

1. **허니팟 필드** — 화면엔 안 보이지만 폼에 숨은 input. 봇이 채우면 무시.
2. **레이트 리미트** — 동일 IP 5분 내 3회 초과 차단 (Supabase Edge Function)
3. **reCAPTCHA v3** (선택) — 사용자 경험 저해 없음, 점수 기반 차단
4. **전화번호 형식 검증** — 010-XXXX-XXXX 정규식
5. **필수 필드 서버사이드 재검증** — 프론트 검증은 우회 가능

---

## 6. 지금 상태 vs 구현 후

| 항목 | 현재 | Supabase 구현 후 |
|---|---|---|
| 문의 접수 | ❌ EmailJS 미설정 → 전화·카톡 유도만 | ✅ DB 저장 + 메일/알림 |
| 문의 조회 | ❌ | ✅ Supabase 대시보드 |
| 문의 통계 | ❌ | ✅ SQL (일별·지역별·서비스별) |
| 재문의 방지 | ❌ | ✅ 동일 번호 중복 체크 가능 |
| 스팸 차단 | ❌ | ✅ RLS + 레이트리미트 |
| 비용 | 0 | 0 (월 100만 건까지 무료) |

---

## 7. 블로커 (인수님 대기)

- [ ] **Supabase 계정 생성 + 프로젝트 URL·anon key 제공**
- [ ] Vercel 환경변수 등록 (또는 Claude가 .env.local 작성)
- [ ] 알림 받을 경로 결정: Discord / Slack / 카카오 / 이메일

위 3개 중 "Supabase 사용" vs "Google Sheets 사용" 중 선택만 주시면 즉시 구현 시작.

---

_업데이트 2026-04-22_
