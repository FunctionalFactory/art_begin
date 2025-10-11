# 경매 자동 낙찰 처리 구현

## 개요

경매 시간이 종료되면 자동으로 최종 낙찰 처리를 수행하는 시스템입니다.

## 주요 기능

### 1. 자동 경매 종료 처리
- 경매 시간 종료 시 자동으로 작품 상태를 'sold'로 변경
- 최고 입찰가를 최종 낙찰가로 설정
- 최고 입찰자의 주문 내역에 자동 추가

### 2. 실행 방식 (3가지 옵션)

#### 옵션 1: pg_cron (권장 - Supabase)
PostgreSQL의 pg_cron extension을 사용하여 데이터베이스 레벨에서 자동 실행

**설정 방법:**
```sql
-- migration 017_auction_cron_job.sql 적용
-- 매분마다 자동 실행됨
```

**장점:**
- 서버리스 환경에서도 안정적으로 동작
- 별도의 인프라 불필요
- Supabase에서 공식 지원

**단점:**
- Supabase 플랜에 따라 사용 제한 가능
- 일부 호스팅 환경에서는 pg_cron 미지원

#### 옵션 2: Vercel Cron Jobs (대안)
Vercel의 Cron Jobs 기능을 사용하여 API Route를 주기적으로 호출

**설정 방법:**
1. `vercel.json`에 이미 설정되어 있음:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/process-auctions",
         "schedule": "* * * * *"
       }
     ]
   }
   ```

2. 환경 변수 설정 (Vercel Dashboard):
   ```bash
   CRON_SECRET=your-secret-key-here
   ```

**장점:**
- Vercel에 배포된 경우 별도 설정 없이 사용 가능
- 무료 플랜에서도 사용 가능 (제한 있음)
- 실행 로그 확인 가능

**단점:**
- Vercel에 종속적
- 무료 플랜에서는 매분 실행 제한 가능

#### 옵션 3: 수동 트리거 (개발/테스트용)
API Route를 직접 호출하여 경매 처리

**사용 방법:**
```bash
# CRON_SECRET이 설정되지 않은 경우
curl http://localhost:3000/api/cron/process-auctions

# CRON_SECRET이 설정된 경우
curl -H "Authorization: Bearer YOUR_SECRET" \
  http://localhost:3000/api/cron/process-auctions
```

## 구현된 파일들

### 1. Database Migration
**파일:** `supabase/migrations/017_auction_cron_job.sql`

- pg_cron extension 활성화
- 매분마다 `process_expired_auctions_with_logging()` 실행
- 실행 로그를 `auction_processing_log` 테이블에 저장

### 2. API Route
**파일:** `app/api/cron/process-auctions/route.ts`

- GET/POST 메서드 지원
- CRON_SECRET 인증 (설정된 경우)
- `processExpiredAuctions()` 함수 호출
- 처리 결과 JSON 반환

### 3. Vercel Cron 설정
**파일:** `vercel.json`

- Cron job 스케줄 정의 (매분 실행)
- API route 경로 지정

### 4. Frontend 컴포넌트
**파일:** `components/auction-countdown.tsx`

경매 카운트다운 타이머 표시 및 종료 상태 UI 처리:
- 실시간 카운트다운 (일/시간/분/초)
- 시간 종료 시 "경매 종료" 메시지 표시
- 낙찰 처리 진행 중 안내

**파일:** `components/bid-form.tsx`

입찰 폼 컴포넌트 (기존 구현 활용):
- 경매 종료 시 입찰 폼 비활성화
- "경매가 종료되었습니다" 메시지 표시

## 데이터베이스 함수

### process_expired_auctions()
기존에 구현된 데이터베이스 함수 (007_orders_table.sql):

```sql
-- 만료된 경매를 찾아 처리
-- 1. 활성 상태이고 auction_end_time이 지난 경매 찾기
-- 2. 최고 입찰자 확인
-- 3. 주문 생성 (order_type='auction')
-- 4. 작품 상태를 'sold'로 변경
```

**특징:**
- **Idempotent**: 여러 번 실행해도 안전 (status='active' 체크)
- **Transaction 안전**: 각 경매는 독립적으로 처리
- **입찰자 없는 경매 처리**: FOUND 체크로 입찰이 없으면 스킵

### process_expired_auctions_with_logging()
로깅 기능이 추가된 버전 (017_auction_cron_job.sql):

- 실행 시간 측정
- 처리된 경매 개수 기록
- `auction_processing_log` 테이블에 저장

## 테스트

### 단위 테스트
**파일:** `lib/queries/__tests__/orders.test.ts`

- `processExpiredAuctions()` 함수 테스트
- RPC 호출 성공/실패 시나리오
- 반환값 검증

**파일:** `components/__tests__/auction-countdown.test.tsx`

- 카운트다운 계산 정확성
- 시간 업데이트 (1초마다)
- 경매 종료 상태 UI 표시
- Hydration 안전성

### E2E 테스트
**파일:** `e2e/tests/auction-expiry.spec.ts`

- 경매 만료 UI 표시 확인
- 종료된 경매 입찰 차단
- API 엔드포인트 응답 확인
- 카운트다운 컴포넌트 동작

## 모니터링

### 로그 확인
```sql
-- 최근 실행 로그 조회
SELECT * FROM auction_processing_log
ORDER BY executed_at DESC
LIMIT 10;

-- 처리된 경매 통계
SELECT
  DATE(executed_at) as date,
  COUNT(*) as total_runs,
  SUM(processed_count) as total_processed,
  AVG(execution_time_ms) as avg_execution_time
FROM auction_processing_log
GROUP BY DATE(executed_at)
ORDER BY date DESC;
```

### Vercel Cron 로그
Vercel Dashboard > Cron Jobs 섹션에서 확인:
- 실행 성공/실패 이력
- 응답 시간
- 에러 로그

## 환경 변수

### 필수 (Vercel Cron 사용 시)
```bash
CRON_SECRET=your-secret-key-here
```

### 선택 (Buyer's Premium)
```bash
BUYER_PREMIUM_RATE=0.10  # 10% (기본값)
```

## 배포 체크리스트

### Supabase (pg_cron 사용)
- [ ] Migration 017 적용
- [ ] pg_cron extension이 활성화되었는지 확인
- [ ] Cron job이 등록되었는지 확인:
  ```sql
  SELECT * FROM cron.job WHERE jobname = 'process-expired-auctions';
  ```

### Vercel (Vercel Cron 사용)
- [ ] `vercel.json` 파일이 저장소에 포함되었는지 확인
- [ ] Vercel Dashboard에서 CRON_SECRET 환경 변수 설정
- [ ] Vercel Dashboard > Cron Jobs에서 job이 활성화되었는지 확인
- [ ] 수동으로 API Route 호출하여 동작 확인

### 테스트
- [ ] 단위 테스트 실행: `npm test`
- [ ] E2E 테스트 실행: `npm run test:e2e`
- [ ] 수동으로 경매 종료 시나리오 테스트

## 문제 해결

### pg_cron이 작동하지 않는 경우
1. Extension 활성화 확인:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```

2. Cron job 목록 확인:
   ```sql
   SELECT * FROM cron.job;
   ```

3. Cron job 실행 이력 확인:
   ```sql
   SELECT * FROM cron.job_run_details
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-expired-auctions')
   ORDER BY start_time DESC
   LIMIT 10;
   ```

### Vercel Cron이 작동하지 않는 경우
1. Vercel Dashboard > Cron Jobs에서 상태 확인
2. 무료 플랜 제한 확인 (매분 실행은 제한될 수 있음)
3. 로그에서 에러 메시지 확인
4. CRON_SECRET 환경 변수가 올바르게 설정되었는지 확인

### API Route가 401 에러를 반환하는 경우
- CRON_SECRET이 설정된 경우, Authorization 헤더 필요:
  ```bash
  curl -H "Authorization: Bearer YOUR_SECRET" \
    http://localhost:3000/api/cron/process-auctions
  ```

## 성능 고려사항

- **실행 빈도**: 매분 실행으로 최대 1분 지연 가능
- **동시성**: 함수가 idempotent하므로 중복 실행 안전
- **데이터베이스 부하**: 경매 수에 비례하여 증가 (인덱스 최적화됨)
- **Timeout**: API Route는 Vercel의 Serverless Function 시간 제한 적용 (10초)

## 향후 개선 사항

1. **실시간 알림**: 낙찰 시 사용자에게 알림 전송
2. **낙찰 확인 이메일**: 최고 입찰자에게 이메일 발송
3. **자동 결제 처리**: 에스크로 해제 및 결제 완료
4. **경매 종료 전 알림**: 종료 10분 전 알림
5. **분석 대시보드**: 경매 성과 분석 및 통계

## 관련 문서

- [Supabase pg_cron 문서](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [Vercel Cron Jobs 문서](https://vercel.com/docs/cron-jobs)
- [PostgreSQL 트리거 문서](https://www.postgresql.org/docs/current/triggers.html)
