# Supabase Realtime 설정 가이드

## 문제 증상

다음과 같은 콘솔 에러가 발생하는 경우:

```
[BidHistory] Channel error: undefined
[RealtimeArtworkPrice] Channel error: undefined
```

이는 Supabase Realtime이 올바르게 설정되지 않았을 때 발생합니다.

## 해결 방법

### 1. Migration 016 적용 확인

먼저 Realtime 활성화 migration이 적용되었는지 확인합니다.

```bash
# Supabase CLI로 확인
npx supabase migration list

# 또는 SQL Editor에서 확인
SELECT * FROM supabase_migrations.schema_migrations
WHERE version = '016_enable_realtime';
```

Migration이 적용되지 않았다면:

```bash
# 로컬 개발
npx supabase db push

# 프로덕션
# Supabase Dashboard > Database > Migrations에서 적용
```

### 2. Realtime Publication 확인

SQL Editor에서 다음 쿼리를 실행하여 Realtime이 활성화되었는지 확인:

```sql
-- Publication에 테이블이 추가되었는지 확인
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

예상 결과:
```
schemaname | tablename
-----------+-----------
public     | artworks
public     | bids
```

테이블이 표시되지 않으면 수동으로 추가:

```sql
-- Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE public.artworks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
```

### 3. Supabase Dashboard 설정 (프로덕션)

Supabase Dashboard에서 직접 Realtime을 활성화할 수도 있습니다:

1. Supabase Dashboard 접속
2. **Database** > **Replication** 메뉴로 이동
3. `supabase_realtime` publication 선택
4. `artworks`와 `bids` 테이블 활성화

### 4. RLS (Row Level Security) 확인

Realtime이 작동하려면 RLS 정책이 올바르게 설정되어야 합니다.

```sql
-- RLS가 활성화되었는지 확인
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('artworks', 'bids');

-- RLS 정책 확인
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('artworks', 'bids');
```

### 5. Supabase Client 설정 확인

`utils/supabase/client.ts`에서 Realtime이 활성화되어 있는지 확인:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## 작동 방식

### Realtime이 활성화된 경우

1. 사용자가 입찰하면 Postgres trigger가 `artworks` 테이블 업데이트
2. Supabase Realtime이 변경 사항을 감지하고 구독자에게 브로드캐스트
3. 모든 연결된 클라이언트가 실시간으로 가격 업데이트 수신

### Realtime이 비활성화된 경우 (Fallback)

1. 사용자가 입찰하면 Server Action이 실행
2. Server Action이 custom event (`bid-placed`) 발생
3. 같은 브라우저 내에서만 UI 업데이트
4. 다른 사용자는 페이지 새로고침 필요

## 디버깅

### Console 로그 확인

브라우저 개발자 도구에서 다음 로그를 확인:

**성공 시:**
```
[BidHistory] Successfully subscribed to bids for artwork: xxx
[RealtimeArtworkPrice] Successfully subscribed to artwork: xxx
```

**실패 시:**
```
[BidHistory] Channel error (Realtime may not be enabled): undefined
[BidHistory] Falling back to custom events for updates
```

### Realtime 연결 상태 확인

```sql
-- 현재 활성 Realtime 연결 확인
SELECT
  application_name,
  state,
  query
FROM pg_stat_activity
WHERE application_name LIKE '%realtime%';
```

### 네트워크 탭 확인

브라우저 개발자 도구 > Network 탭에서:
- WebSocket 연결 확인 (`wss://...`)
- Status가 `101 Switching Protocols`인지 확인

## 주의사항

### 1. Local Development vs Production

- **로컬**: `npx supabase start`로 실행 시 Realtime 자동 활성화
- **프로덕션**: Dashboard에서 수동 설정 필요

### 2. Realtime 제한

Supabase Realtime에는 다음 제한이 있습니다:

- **Free Tier**: 최대 200 동시 연결
- **Pro Tier**: 최대 500 동시 연결
- **Enterprise**: 무제한

연결 수 초과 시 `CHANNEL_ERROR` 발생 가능

### 3. 성능 고려사항

- 많은 사용자가 동시에 입찰하는 경우 Realtime 부하 증가
- Custom event fallback으로 기본 기능은 항상 작동
- Realtime은 UX 향상을 위한 추가 기능

## 테스트

### 수동 테스트

1. 두 개의 브라우저 창을 엽니다
2. 같은 경매 작품 페이지로 이동
3. 한 창에서 입찰
4. 다른 창에서 실시간으로 가격이 업데이트되는지 확인

### 자동 테스트

```bash
# E2E 테스트 실행
npm run test:e2e -- e2e/tests/auction.spec.ts
```

## 관련 파일

- `supabase/migrations/016_enable_realtime.sql` - Realtime 활성화 migration
- `components/bid-history.tsx` - 입찰 내역 실시간 업데이트
- `components/realtime-artwork-price.tsx` - 가격 실시간 업데이트
- `app/artwork/[id]/bid-actions.ts` - 입찰 Server Action (custom event 발생)

## 추가 리소스

- [Supabase Realtime 문서](https://supabase.com/docs/guides/realtime)
- [Postgres Replication 문서](https://www.postgresql.org/docs/current/logical-replication.html)
- [Supabase RLS 문서](https://supabase.com/docs/guides/auth/row-level-security)
