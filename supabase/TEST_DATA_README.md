# E2E 테스트 데이터 설정 가이드

## 개요
`seed_test.sql` 파일은 E2E 테스트를 위한 테스트 사용자, 경매 작품, 입찰 데이터를 포함합니다.

## 사전 준비사항

### 1. 테스트 사용자 생성
먼저 Supabase Auth에서 다음 테스트 사용자들을 생성해야 합니다:

```
사용자 1:
- Email: test1@example.com
- Password: TestUser123!
- ID: test1111-1111-1111-1111-111111111111

사용자 2:
- Email: test2@example.com
- Password: TestUser123!
- ID: test2222-2222-2222-2222-222222222222

사용자 3:
- Email: test3@example.com
- Password: TestUser123!
- ID: test3333-3333-3333-3333-333333333333
```

**Supabase Dashboard에서 생성 방법:**
1. Supabase Dashboard → Authentication → Users
2. "Add user" 클릭
3. Email과 Password 입력
4. "Create user" 클릭
5. 생성된 사용자의 UUID를 복사하여 `seed_test.sql`의 해당 ID와 일치시킴

**또는 SQL로 생성 (권장):**
```sql
-- Supabase SQL Editor에서 실행
-- Note: Supabase Auth API를 통해 생성하는 것이 더 안전합니다
```

### 2. 테스트 데이터 적용

#### 로컬 환경 (Supabase CLI)
```bash
# Docker Desktop이 실행 중인지 확인
docker ps

# Supabase 로컬 환경 시작
npx supabase start

# 테스트 데이터 적용
npx supabase db reset
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/seed_test.sql
```

#### 원격 환경 (Supabase Dashboard)
1. Supabase Dashboard → SQL Editor
2. `supabase/seed_test.sql` 파일의 내용을 복사
3. SQL Editor에 붙여넣기
4. "Run" 클릭

## 테스트 데이터 구조

### 테스트 사용자

#### Test User 1 (에스크로 활성)
- **Username:** test_user_1
- **전체 잔고:** 600,000원
- **활성 에스크로:** 517,500원
  - 작품 1 입찰: 172,500원 (150,000원 + 15% 수수료)
  - 작품 2 입찰: 345,000원 (300,000원 + 15% 수수료)
- **사용 가능 잔고:** 82,500원

#### Test User 2 (에스크로 없음)
- **Username:** test_user_2
- **전체 잔고:** 1,000,000원
- **활성 에스크로:** 0원
- **사용 가능 잔고:** 1,000,000원

#### Test User 3 (잔고 없음)
- **Username:** test_user_3
- **전체 잔고:** 0원
- **활성 에스크로:** 0원
- **사용 가능 잔고:** 0원

### 테스트 경매 작품

1. **[테스트] 마감 임박 경매 작품**
   - 현재가: 150,000원
   - 마감: 1시간 후
   - 입찰 수: 5

2. **[테스트] 일반 경매 작품**
   - 현재가: 300,000원
   - 마감: 3일 후
   - 입찰 수: 3

3. **[테스트] 입찰 없는 경매 작품**
   - 시작가: 100,000원
   - 마감: 5일 후
   - 입찰 수: 0

4. **[테스트] 즉시 구매 작품**
   - 고정가: 200,000원
   - 경매 아님

## E2E 테스트 시나리오

### 1. 잔고 요약 표시 테스트
- 마이페이지에서 3가지 잔고 (전체/에스크로/사용가능) 확인
- 잔고 충전 페이지에서 동일한 정보 확인
- **테스트 계정:** test1, test2, test3 모두

### 2. 에스크로 내역 표시 테스트
- 잔고 충전 페이지에서 활성 에스크로 입찰 내역 확인
- 에스크로가 있는 경우와 없는 경우 비교
- **테스트 계정:** test1 (에스크로 있음), test2 (에스크로 없음)

### 3. 잔고 논리 검증 테스트
- 전체 잔고 = 에스크로 + 사용 가능 잔고
- 모든 페이지에서 일관성 확인
- **테스트 계정:** 모두

### 4. 입찰 시 에스크로 경고 테스트
- 경매 작품 상세 페이지에서 입찰 금액 입력 시
- "입찰 시 이 금액이 에스크로로 묶입니다" 경고 표시
- **테스트 계정:** test1 또는 test2

### 5. 사용 가능 잔고 표시 테스트
- 경매 작품 상세 페이지에서 사용 가능 잔고 확인
- 로그인 상태에서만 표시
- **테스트 계정:** test1 또는 test2

## 데이터 검증 쿼리

### 테스트 사용자 확인
```sql
SELECT id, username, display_name, balance
FROM profiles
WHERE username LIKE 'test_user_%';
```

### 테스트 작품 확인
```sql
SELECT id, title, sale_type, current_price, fixed_price, auction_end_time
FROM artworks
WHERE title LIKE '[테스트]%';
```

### 에스크로 입찰 확인
```sql
SELECT
  b.id,
  b.artwork_id,
  b.user_id,
  b.bid_amount,
  b.escrow_status,
  b.escrow_amount,
  a.title
FROM bids b
JOIN artworks a ON b.artwork_id = a.id
WHERE b.user_id LIKE 'test%'
ORDER BY b.created_at DESC;
```

### 에스크로 총액 확인 (RPC 함수 테스트)
```sql
SELECT
  p.username,
  p.balance as total_balance,
  COALESCE(SUM(b.escrow_amount) FILTER (WHERE b.escrow_status = 'active'), 0) as escrow_total,
  p.balance - COALESCE(SUM(b.escrow_amount) FILTER (WHERE b.escrow_status = 'active'), 0) as available_balance
FROM profiles p
LEFT JOIN bids b ON p.id = b.user_id
WHERE p.username LIKE 'test_user_%'
GROUP BY p.id, p.username, p.balance;
```

## 데이터 정리

테스트 후 데이터를 정리하려면:

```sql
-- 테스트 입찰 삭제
DELETE FROM bids WHERE user_id LIKE 'test%';

-- 테스트 작품 삭제
DELETE FROM artworks WHERE title LIKE '[테스트]%';

-- 테스트 작가 삭제
DELETE FROM artists WHERE username = 'test_artist';

-- 테스트 거래 내역 삭제
DELETE FROM transactions WHERE user_id LIKE 'test%';

-- 테스트 프로필 삭제
DELETE FROM profiles WHERE username LIKE 'test_user_%';

-- 테스트 Auth 사용자 삭제는 Supabase Dashboard에서 수동으로 진행
```

## 주의사항

1. **UUID 일치**: Auth에서 생성한 사용자 UUID와 `seed_test.sql`의 profile ID가 일치해야 합니다.
2. **타임스탬프**: 경매 마감 시간은 현재 시간 기준으로 상대적입니다. 오래된 데이터는 재적용하세요.
3. **외래 키 제약**: artists → artworks → bids 순서로 데이터가 생성되어야 합니다.
4. **트랜잭션**: 전체 스크립트는 트랜잭션으로 실행되므로 실패 시 롤백됩니다.

## 트러블슈팅

### "사용자 ID가 존재하지 않습니다" 에러
→ Supabase Auth에서 테스트 사용자를 먼저 생성하세요.

### "외래 키 제약 위반" 에러
→ artists 데이터가 먼저 삽입되었는지 확인하세요.

### 에스크로 금액이 0으로 표시됨
→ RPC 함수 `get_user_escrow_total`과 `get_user_available_balance`가 제대로 적용되었는지 확인하세요.
→ Migration 014 (`add_escrow_system.sql`)가 적용되었는지 확인하세요.

### 경매가 이미 종료됨
→ `seed_test.sql`을 다시 실행하여 경매 마감 시간을 갱신하세요.
