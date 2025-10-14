# ART-XHIBIT

신진 작가를 위한 미술품 경매 및 판매 플랫폼

[**🎨 개발자용 문서**](#개발자용-가이드) | [**🤖 AI 에이전트용 문서**](#ai-에이전트용-가이드) | [**📖 비개발자용 문서**](#비개발자용-가이드)

---

## 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# http://localhost:3000 접속
```

---

## 개발자용 가이드

### 📋 목차
- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [환경 설정](#환경-설정)
- [개발 명령어](#개발-명령어)
- [주요 기능](#주요-기능)
- [데이터베이스 스키마](#데이터베이스-스키마)
- [테스팅](#테스팅)
- [배포](#배포)
- [기여 가이드](#기여-가이드)

---

### 프로젝트 개요

**ART-XHIBIT**은 신진 작가들이 자신의 작품을 온라인으로 전시하고 판매할 수 있는 풀스택 웹 애플리케이션입니다. 경매와 즉시 구매 기능을 제공하며, 사용자는 작품을 감상하고, 입찰하고, 구매할 수 있습니다.

**핵심 가치:**
- 신진 작가 지원: 낮은 진입장벽으로 누구나 작품을 등록하고 판매
- 투명한 경매: 실시간 입찰 시스템과 자동 경매 종료
- 안전한 거래: 에스크로 시스템을 통한 안전한 결제 및 정산

---

### 기술 스택

#### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Shadcn UI (Radix UI 기반)
- **Icons:** Lucide React
- **Animation:** Framer Motion

#### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (작품 이미지)
- **Real-time:** Supabase Realtime (입찰 업데이트)
- **Cron Jobs:** Supabase Edge Functions (경매 자동 종료)

#### Testing
- **Unit Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright
- **Coverage:** Jest Coverage Reports

#### DevOps
- **Version Control:** Git
- **CI/CD:** GitHub Actions (예정)
- **Deployment:** Vercel (권장)

---

### 프로젝트 구조

```
art-xhibit/
├── app/                          # Next.js App Router 페이지
│   ├── layout.tsx               # 루트 레이아웃 (Header/Footer)
│   ├── page.tsx                 # 홈 페이지 (작품 갤러리)
│   ├── globals.css              # 전역 CSS (Tailwind + 테마 변수)
│   │
│   ├── (auth)/                  # 인증 관련 페이지 그룹
│   │   ├── login/               # 로그인 페이지
│   │   ├── signup/              # 회원가입 페이지
│   │   └── register/            # 작가 등록 페이지
│   │
│   ├── explore/                 # 작품 둘러보기 (검색/필터)
│   ├── artwork/[id]/            # 작품 상세 페이지 (동적 라우트)
│   ├── artist/[id]/             # 작가 프로필 페이지
│   ├── my-page/                 # 사용자 대시보드
│   ├── artist-dashboard/        # 작가 대시보드
│   │   ├── new-artwork/         # 작품 등록
│   │   └── edit/[id]/           # 작품 수정
│   ├── profile/edit/            # 프로필 수정
│   ├── balance/                 # 잔액 관리
│   │   └── history/             # 거래 내역
│   ├── genres/                  # 장르별 작품 보기
│   │   └── [slug]/              # 개별 장르 페이지
│   │
│   └── api/                     # API Routes (예정)
│
├── components/                   # React 컴포넌트
│   ├── ui/                      # Shadcn UI 컴포넌트
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── header.tsx               # 사이트 헤더 (네비게이션)
│   ├── footer.tsx               # 사이트 푸터
│   ├── artwork-card.tsx         # 작품 카드 컴포넌트
│   ├── bid-section.tsx          # 입찰 섹션
│   └── __tests__/               # 컴포넌트 단위 테스트
│
├── lib/                          # 유틸리티 및 핵심 로직
│   ├── utils.ts                 # 유틸리티 함수 (cn 헬퍼 등)
│   ├── data.ts                  # Mock 데이터 (개발용)
│   ├── supabase/                # Supabase 클라이언트
│   │   ├── client.ts            # 브라우저용 클라이언트
│   │   ├── server.ts            # 서버용 클라이언트
│   │   └── middleware.ts        # 미들웨어 설정
│   ├── queries/                 # 데이터 쿼리 함수
│   │   ├── artworks.ts          # 작품 쿼리
│   │   ├── artists.ts           # 작가 쿼리
│   │   ├── bids.ts              # 입찰 쿼리
│   │   └── __tests__/           # 쿼리 단위 테스트
│   └── actions/                 # Server Actions
│       ├── auth.ts              # 인증 액션
│       ├── artworks.ts          # 작품 액션
│       └── bids.ts              # 입찰 액션
│
├── supabase/                     # Supabase 설정 및 마이그레이션
│   ├── migrations/              # SQL 마이그레이션 파일
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_favorites.sql
│   │   ├── 004_bids.sql
│   │   ├── 007_orders_table.sql
│   │   ├── 013_add_balance_system.sql
│   │   ├── 014_add_escrow_system.sql
│   │   ├── 017_auction_cron_job.sql
│   │   └── ...
│   ├── seed.sql                 # 시드 데이터
│   └── seed_test_artworks_only.sql  # E2E 테스트용 시드
│
├── e2e/                          # E2E 테스트 (Playwright)
│   ├── fixtures/                # 테스트 픽스처
│   │   ├── auth.fixture.ts      # 인증 픽스처
│   │   └── database.fixture.ts  # 데이터베이스 픽스처
│   ├── pages/                   # Page Object Model (POM)
│   │   ├── base.page.ts
│   │   ├── home.page.ts
│   │   ├── explore.page.ts
│   │   └── artwork-detail.page.ts
│   └── tests/                   # 테스트 시나리오
│       ├── auth/
│       ├── artwork/
│       ├── auction/
│       └── critical-flows/
│
├── public/                       # 정적 파일
│   └── images/                  # 이미지 에셋
│
├── .env.local                    # 환경 변수 (개발용)
├── .env.example                 # 환경 변수 예시
├── next.config.js               # Next.js 설정
├── tailwind.config.js           # Tailwind CSS 설정
├── jest.config.js               # Jest 설정
├── playwright.config.ts         # Playwright 설정
├── package.json                 # NPM 의존성
└── tsconfig.json                # TypeScript 설정
```

---

### 환경 설정

#### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Auction Settings
BUYER_PREMIUM_RATE=0.10  # 구매자 수수료 (10%)

# Cron Job Secret (경매 자동 종료)
CRON_SECRET=your-secret-key-here
```

#### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com/)에서 새 프로젝트 생성
2. 데이터베이스 마이그레이션 실행:
   ```bash
   # Supabase CLI 설치
   npm install -g supabase

   # Supabase 프로젝트 연결
   supabase link --project-ref your-project-ref

   # 마이그레이션 실행
   supabase db push
   ```
3. 시드 데이터 삽입 (선택):
   ```bash
   supabase db execute -f supabase/seed.sql
   ```

#### 3. Storage 버킷 설정

Supabase Dashboard에서 다음 버킷 생성:
- `artwork-images`: 작품 이미지 저장 (Public)

---

### 개발 명령어

```bash
# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# ESLint 실행
npm run lint

# 단위 테스트 실행
npm test
npm run test:watch      # Watch 모드
npm run test:coverage   # Coverage 리포트 생성

# E2E 테스트 실행
npm run test:e2e
npm run test:e2e:ui         # UI 모드
npm run test:e2e:headed     # Headed 모드 (브라우저 보기)
npm run test:e2e:debug      # 디버그 모드
npm run test:e2e:report     # HTML 리포트 보기
```

---

### 주요 기능

#### 1. 인증 시스템
- **회원가입/로그인**: Supabase Auth 사용
- **작가 등록**: 추가 프로필 정보 입력
- **세션 관리**: 서버/클라이언트 양쪽에서 세션 유지

**구현 위치:**
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `lib/actions/auth.ts`

#### 2. 작품 관리
- **작품 등록**: 이미지 업로드, 카테고리, 가격 설정
- **경매/즉시구매**: 판매 유형 선택
- **작품 수정/삭제**: 작가 대시보드에서 관리

**구현 위치:**
- `app/artist-dashboard/new-artwork/page.tsx`
- `app/artist-dashboard/edit/[id]/page.tsx`
- `lib/actions/artworks.ts`

#### 3. 경매 시스템
- **실시간 입찰**: Supabase Realtime으로 입찰 업데이트
- **자동 경매 종료**: Cron Job으로 만료된 경매 자동 처리
- **최고가 낙찰**: 경매 종료 시 최고가 입찰자에게 주문 생성

**구현 위치:**
- `app/artwork/[id]/page.tsx` (입찰 UI)
- `lib/actions/bids.ts`
- `supabase/migrations/017_auction_cron_job.sql`

#### 4. 결제 및 정산 (에스크로)
- **잔액 시스템**: 사용자 잔액 충전 및 관리
- **에스크로**: 구매 시 금액 임시 보관
- **자동 정산**: 거래 완료 시 작가에게 자동 지급 (구매자 수수료 차감)

**구현 위치:**
- `app/balance/page.tsx`
- `supabase/migrations/014_add_escrow_system.sql`

#### 5. 검색 및 필터
- **전체 텍스트 검색**: PostgreSQL Full-Text Search
- **필터링**: 카테고리, 가격 범위, 판매 유형
- **정렬**: 인기순, 최신순, 가격순

**구현 위치:**
- `app/explore/page.tsx`
- `lib/queries/artworks.ts`

#### 6. 소셜 기능
- **좋아요**: 작품에 좋아요 추가/제거
- **조회수 추적**: 작품 페이지 방문 시 조회수 증가
- **관심 작품**: 사용자별 좋아요한 작품 목록

**구현 위치:**
- `components/like-button.tsx`
- `app/my-page/page.tsx`

---

### 데이터베이스 스키마

#### 주요 테이블

**`profiles`** - 사용자 프로필
```sql
- id (uuid, PK, FK to auth.users)
- display_name (text)
- bio (text)
- avatar_url (text)
- balance (numeric, default 0)
- is_artist (boolean, default false)
- created_at (timestamptz)
- updated_at (timestamptz)
```

**`artists`** - 작가 정보
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles.id)
- name (text, 작가명)
- username (text, 고유)
- bio (text)
- profile_image (text)
- created_at (timestamptz)
```

**`artworks`** - 작품
```sql
- id (uuid, PK)
- artist_id (uuid, FK to artists.id)
- title (text)
- description (text)
- image_url (text)
- category (text)
- current_price (numeric, 경매가)
- fixed_price (numeric, 즉시구매가)
- sale_type (text, 'auction' | 'fixed')
- auction_end_time (timestamptz)
- bid_count (integer)
- views (integer)
- likes (integer)
- status (text, 'active' | 'sold' | 'upcoming')
- created_at (timestamptz)
```

**`bids`** - 입찰
```sql
- id (uuid, PK)
- artwork_id (uuid, FK to artworks.id)
- user_id (uuid, FK to profiles.id)
- amount (numeric)
- created_at (timestamptz)
```

**`favorites`** - 좋아요
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles.id)
- artwork_id (uuid, FK to artworks.id)
- created_at (timestamptz)
```

**`orders`** - 주문
```sql
- id (uuid, PK)
- artwork_id (uuid, FK to artworks.id)
- buyer_id (uuid, FK to profiles.id)
- artist_id (uuid, FK to artists.id)
- amount (numeric, 총 금액)
- buyer_premium (numeric, 구매자 수수료)
- artist_revenue (numeric, 작가 수익)
- status (text, 'pending' | 'completed' | 'cancelled')
- created_at (timestamptz)
```

**`balance_transactions`** - 잔액 거래 내역
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles.id)
- type (text, 'charge' | 'purchase' | 'escrow_hold' | 'escrow_release')
- amount (numeric)
- balance_after (numeric)
- description (text)
- created_at (timestamptz)
```

**RLS (Row Level Security) 정책:**
- 모든 테이블에 RLS 활성화
- 사용자는 자신의 데이터만 수정 가능
- 작가는 자신의 작품만 수정/삭제 가능
- 공개 데이터는 모두 읽기 가능

---

### 테스팅

#### 단위 테스트 (Jest)

**테스트 구조:**
- `lib/__tests__/`: 유틸리티 함수 테스트
- `lib/queries/__tests__/`: 데이터베이스 쿼리 테스트
- `components/__tests__/`: 컴포넌트 테스트

**커버리지 목표:**
- Business Logic: 90%+
- Server Actions: 85%+
- Components: 80%+

**실행:**
```bash
npm test
npm run test:coverage
```

#### E2E 테스트 (Playwright)

**테스트 구조:**
- `e2e/fixtures/`: 테스트 픽스처 (Auth, DB)
- `e2e/pages/`: Page Object Model (POM)
- `e2e/tests/`: 테스트 시나리오

**주요 테스트:**
- 인증 플로우 (로그인, 회원가입)
- 작품 검색 및 필터링
- 입찰 및 구매
- 작가 대시보드 (작품 등록/수정)
- Critical User Journey (Guest → Buyer)

**실행:**
```bash
npm run test:e2e
npm run test:e2e:ui      # UI 모드
npm run test:e2e:headed  # 브라우저 보기
```

---

### 배포

#### Vercel 배포 (권장)

1. **GitHub 연동:**
   - GitHub에 레포지토리 푸시
   - Vercel에서 프로젝트 Import

2. **환경 변수 설정:**
   - Vercel Dashboard에서 환경 변수 추가
   - `.env.local` 내용 복사

3. **자동 배포:**
   - `main` 브랜치에 푸시 시 자동 배포
   - PR 생성 시 프리뷰 배포 자동 생성

#### Supabase Edge Functions (Cron Job)

경매 자동 종료를 위한 Cron Job 설정:

1. Supabase Dashboard → Database → Extensions
2. `pg_cron` 확장 활성화
3. `supabase/migrations/017_auction_cron_job.sql` 실행

---

### 기여 가이드

#### 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `bugfix/*`: 버그 수정 브랜치

#### 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅 (기능 변경 없음)
refactor: 리팩토링
test: 테스트 추가/수정
chore: 빌드/설정 변경
```

#### Pull Request 프로세스

1. `develop` 브랜치에서 feature 브랜치 생성
2. 기능 개발 및 테스트 작성
3. PR 생성 (템플릿 사용)
4. 코드 리뷰 및 승인
5. `develop` 브랜치에 머지

---

## AI 에이전트용 가이드

### 프로젝트 메타데이터

**프로젝트명:** ART-XHIBIT
**버전:** 1.0.0
**라이선스:** ISC
**저장소:** (프라이빗)
**메인테이너:** Handyman

---

### 아키텍처 개요

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 15 App Router                │
│                     (React 19 + TypeScript)             │
├─────────────────────────────────────────────────────────┤
│  Pages (app/)                                           │
│  ├─ Server Components (기본)                            │
│  ├─ Client Components ("use client")                    │
│  └─ Server Actions (lib/actions/)                       │
├─────────────────────────────────────────────────────────┤
│  Data Layer (lib/queries/)                              │
│  └─ Supabase Client (Browser/Server)                    │
├─────────────────────────────────────────────────────────┤
│  Supabase Backend                                       │
│  ├─ PostgreSQL (Database + RLS)                         │
│  ├─ Auth (이메일/비밀번호)                                │
│  ├─ Storage (작품 이미지)                                │
│  ├─ Realtime (입찰 업데이트)                             │
│  └─ Edge Functions (Cron Job)                           │
└─────────────────────────────────────────────────────────┘
```

---

### 핵심 패턴

#### 1. Server Components First
- 모든 페이지는 기본적으로 Server Component
- 클라이언트 상호작용이 필요한 경우에만 `"use client"` 사용

#### 2. Server Actions
- 폼 제출 및 데이터 변경은 Server Actions 사용
- `lib/actions/` 디렉토리에 위치
- `"use server"` 지시자 필수

#### 3. Data Fetching
- `lib/queries/` 디렉토리에 쿼리 함수 정의
- Server Component에서 직접 호출
- Client Component에서는 Server Actions 통해 호출

#### 4. 스타일링
- Tailwind CSS 유틸리티 클래스 사용
- Shadcn UI 컴포넌트 활용
- `cn()` 헬퍼로 조건부 클래스 병합

---

### 디렉토리별 역할

| 디렉토리 | 역할 | 예시 |
|---------|------|------|
| `app/` | 페이지 라우팅 | `app/artwork/[id]/page.tsx` |
| `components/` | 재사용 컴포넌트 | `components/artwork-card.tsx` |
| `components/ui/` | Shadcn UI 컴포넌트 | `components/ui/button.tsx` |
| `lib/actions/` | Server Actions | `lib/actions/bids.ts` |
| `lib/queries/` | 데이터 쿼리 | `lib/queries/artworks.ts` |
| `lib/supabase/` | Supabase 클라이언트 | `lib/supabase/client.ts` |
| `supabase/migrations/` | DB 마이그레이션 | `001_initial_schema.sql` |
| `e2e/` | E2E 테스트 | `e2e/tests/auth/login.spec.ts` |

---

### 데이터 흐름 예시

#### 사용자가 작품에 입찰하는 플로우:

```
1. 사용자: 입찰 금액 입력 → 버튼 클릭
   ↓
2. Client Component (bid-section.tsx)
   - handleSubmit 함수 호출
   - Server Action 호출: placeBid(artworkId, amount)
   ↓
3. Server Action (lib/actions/bids.ts)
   - 인증 확인
   - 유효성 검증
   - DB 쿼리 호출: createBid()
   ↓
4. Query Function (lib/queries/bids.ts)
   - Supabase 클라이언트로 INSERT
   - Trigger 실행: update_artwork_on_bid
   ↓
5. Database (Supabase)
   - bids 테이블에 레코드 삽입
   - artworks 테이블 업데이트 (current_price, bid_count)
   - Realtime 이벤트 발행
   ↓
6. Frontend (Realtime Subscription)
   - 입찰 업데이트 수신
   - UI 자동 업데이트 (최고가, 입찰 횟수)
```

---

### 중요한 비즈니스 로직

#### 1. 입찰 규칙
- 현재가보다 높아야 함
- 경매 종료 전에만 가능
- 사용자 잔액이 충분해야 함
- 자신의 작품에는 입찰 불가

**구현 위치:** `lib/actions/bids.ts:placeBid()`

#### 2. 경매 자동 종료
- 매 10분마다 Cron Job 실행
- `auction_end_time`이 지난 경매 검색
- 최고가 입찰자에게 주문 생성
- 작품 상태를 `sold`로 변경

**구현 위치:** `supabase/migrations/017_auction_cron_job.sql`

#### 3. 에스크로 시스템
- 구매 시 사용자 잔액에서 차감 (에스크로 홀드)
- 거래 완료 시 작가에게 지급 (구매자 수수료 차감)
- 거래 취소 시 사용자에게 환불

**구현 위치:**
- `lib/actions/orders.ts:createOrder()`
- `supabase/migrations/015_add_escrow_release_trigger.sql`

#### 4. 구매자 수수료 (Buyer Premium)
- 낙찰가의 10% (환경 변수 설정 가능)
- 총 금액 = 낙찰가 × 1.1
- 작가 수익 = 낙찰가

**예시:**
- 낙찰가: 100,000원
- 구매자 수수료: 10,000원
- 구매자 지불: 110,000원
- 작가 수익: 100,000원

---

### 환경 변수

```bash
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Auction Settings (선택, 기본값: 0.10)
BUYER_PREMIUM_RATE=0.10

# Cron Secret (Cron Job 보안)
CRON_SECRET=your-secret-key-here
```

---

### API 엔드포인트 (미래 확장용)

현재는 Server Actions 사용 중이지만, 필요 시 API Routes 추가 가능:

```
app/api/
├── artworks/
│   ├── route.ts              # GET /api/artworks (목록)
│   └── [id]/route.ts         # GET /api/artworks/:id (상세)
├── bids/
│   └── route.ts              # POST /api/bids (입찰)
└── auth/
    └── callback/route.ts     # GET /api/auth/callback (OAuth)
```

---

### 성능 최적화

#### 이미지 최적화
- Next.js `<Image>` 컴포넌트 사용
- Supabase Storage에서 이미지 제공
- 자동 리사이징 및 WebP 변환

#### 데이터베이스 인덱스
- `artworks.artist_id` (작가별 작품 검색)
- `artworks.category` (카테고리별 필터링)
- `artworks.created_at` (최신순 정렬)
- `bids.artwork_id` (작품별 입찰 조회)

#### Realtime 최적화
- 특정 작품 페이지에서만 Realtime 구독
- 페이지 이탈 시 자동 구독 해제

---

### 보안 고려사항

#### RLS (Row Level Security)
- 모든 테이블에 RLS 정책 적용
- 사용자는 자신의 데이터만 수정 가능
- 작가는 자신의 작품만 수정/삭제 가능

#### 인증
- Supabase Auth 사용 (세션 기반)
- Server Component에서 `createClient(cookies())` 사용
- Client Component에서 `createBrowserClient()` 사용

#### SQL Injection 방지
- Supabase 클라이언트의 Parameterized Query 사용
- 사용자 입력 직접 쿼리에 삽입 금지

---

### 디버깅 팁

#### 1. Supabase 로그 확인
```typescript
const { data, error } = await supabase
  .from('artworks')
  .select('*')

if (error) {
  console.error('Supabase error:', error)
}
```

#### 2. Server Actions 에러 핸들링
```typescript
export async function placeBid(artworkId: string, amount: number) {
  try {
    // ... 로직
    return { success: true }
  } catch (error) {
    console.error('placeBid error:', error)
    return { success: false, error: error.message }
  }
}
```

#### 3. Realtime 이벤트 디버깅
```typescript
supabase
  .channel('artworks')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'artworks'
  }, (payload) => {
    console.log('Realtime update:', payload)
  })
  .subscribe()
```

---

### 개발 워크플로우

#### 새 기능 추가 시:

1. **데이터베이스 스키마 변경 필요?**
   - `supabase/migrations/`에 새 마이그레이션 파일 생성
   - `supabase db push` 실행

2. **쿼리 함수 작성**
   - `lib/queries/`에 쿼리 함수 정의
   - 단위 테스트 작성 (`__tests__/`)

3. **Server Actions 작성**
   - `lib/actions/`에 Server Action 정의
   - 인증 및 유효성 검증 추가

4. **페이지/컴포넌트 구현**
   - `app/` 또는 `components/`에 UI 구현
   - Server Component 우선, 필요 시 Client Component

5. **테스트 작성**
   - 단위 테스트 (Jest)
   - E2E 테스트 (Playwright)

6. **커밋 및 PR**
   - 커밋 메시지 컨벤션 준수
   - PR 템플릿 작성

---

### 트러블슈팅

#### 일반적인 문제:

| 문제 | 원인 | 해결 방법 |
|-----|------|----------|
| Hydration Error | Server/Client 렌더링 불일치 | `Date` 객체 포맷팅 시 `suppressHydrationWarning` 사용 |
| RLS 정책 오류 | 권한 부족 | Supabase Dashboard에서 RLS 정책 확인 |
| Realtime 미작동 | Realtime 미활성화 | `migration/016_enable_realtime.sql` 실행 |
| 이미지 로딩 실패 | `next.config.js` 설정 누락 | `remotePatterns` 추가 |

---

## 비개발자용 가이드

### ART-XHIBIT이란?

**ART-XHIBIT**은 신진 작가들이 자신의 작품을 온라인으로 전시하고 판매할 수 있는 플랫폼입니다. 마치 온라인 갤러리와 경매장을 합쳐놓은 것처럼, 작가는 작품을 쉽게 등록하고, 구매자는 작품을 감상하고 구매할 수 있습니다.

---

### 주요 기능

#### 👨‍🎨 작가를 위한 기능

1. **작품 등록**
   - 작품 사진 업로드
   - 제목, 설명, 카테고리 입력
   - 판매 방식 선택 (경매 또는 즉시 구매)

2. **작가 대시보드**
   - 등록한 작품 관리
   - 판매 현황 확인
   - 수익 통계 확인

3. **안전한 정산**
   - 작품 판매 시 자동으로 수익 지급
   - 거래 내역 투명하게 확인 가능

#### 🎨 구매자를 위한 기능

1. **작품 둘러보기**
   - 다양한 작품 검색 및 필터링
   - 카테고리별, 가격대별 분류
   - 인기 작품, 마감 임박 경매 확인

2. **경매 참여**
   - 실시간으로 입찰 참여
   - 자동으로 최고가 업데이트
   - 낙찰 시 자동 구매 완료

3. **즉시 구매**
   - 경매 없이 바로 구매 가능한 작품
   - 간편한 결제 프로세스

4. **마이페이지**
   - 좋아요한 작품 모아보기
   - 입찰 내역 확인
   - 구매 내역 확인

---

### 사용 방법

#### 1. 회원가입 및 로그인

1. 홈페이지 우측 상단 "로그인" 버튼 클릭
2. 이메일과 비밀번호로 회원가입
3. 작가로 활동하고 싶다면 "작가 등록" 추가 진행

#### 2. 작품 둘러보기

1. 홈페이지에서 추천 작품 확인
2. "둘러보기" 메뉴에서 모든 작품 검색
3. 필터로 원하는 카테고리, 가격대 선택
4. 작품 클릭하여 상세 정보 확인

#### 3. 작품 구매하기

**즉시 구매:**
1. 작품 상세 페이지에서 "지금 구매" 버튼 클릭
2. 잔액 충전 (필요 시)
3. 구매 확인

**경매 입찰:**
1. 작품 상세 페이지에서 입찰 금액 입력
2. "입찰하기" 버튼 클릭
3. 경매 종료 시 최고가 입찰자가 자동 낙찰

#### 4. 작품 등록하기 (작가)

1. "작가 대시보드" → "새 작품 등록" 클릭
2. 작품 사진 업로드
3. 제목, 설명, 카테고리 입력
4. 판매 방식 선택:
   - **경매**: 시작가와 경매 종료 시간 설정
   - **즉시 구매**: 고정 가격 설정
5. "등록하기" 버튼 클릭

---

### 거래 안전 시스템

#### 에스크로 (Escrow) 시스템

ART-XHIBIT은 안전한 거래를 위해 에스크로 시스템을 사용합니다:

1. **구매자가 결제하면:**
   - 금액이 일시적으로 플랫폼에 보관됩니다
   - 작가에게 즉시 지급되지 않습니다

2. **거래가 완료되면:**
   - 보관된 금액이 자동으로 작가에게 지급됩니다
   - 구매자는 안전하게 작품을 받을 수 있습니다

3. **문제가 생기면:**
   - 거래를 취소하고 환불 가능
   - 투명한 거래 내역 확인

#### 구매자 수수료

- 경매 낙찰 시 낙찰가의 **10%** 추가 부담
- 예시: 10만원 낙찰 → 총 11만원 결제
- 작가는 10만원 전액 수령

---

### 자주 묻는 질문 (FAQ)

#### Q1. 작가 등록 조건이 있나요?
A. 특별한 조건은 없습니다! 누구나 회원가입 후 작가 등록을 할 수 있습니다.

#### Q2. 작품 수수료는 얼마인가요?
A. 현재 작가에게 별도 수수료는 부과하지 않습니다. 구매자가 10% 구매 수수료를 부담합니다.

#### Q3. 경매는 언제 종료되나요?
A. 작가가 설정한 경매 종료 시간에 자동으로 종료됩니다. 작품 페이지에서 남은 시간을 실시간으로 확인할 수 있습니다.

#### Q4. 입찰 후 취소할 수 있나요?
A. 입찰 후에는 취소가 불가능합니다. 신중하게 입찰해 주세요!

#### Q5. 낙찰되면 자동으로 구매되나요?
A. 네, 경매 종료 시 최고가 입찰자에게 자동으로 주문이 생성됩니다. 잔액이 부족하면 낙찰이 취소될 수 있으니 충분한 잔액을 유지해 주세요.

#### Q6. 작품 배송은 어떻게 하나요?
A. 현재 버전에서는 작가와 구매자가 직접 연락하여 배송 방법을 결정합니다. (추후 배송 시스템 추가 예정)

#### Q7. 환불은 가능한가요?
A. 거래 완료 전이라면 환불이 가능합니다. 마이페이지 → 주문 내역에서 취소 요청을 할 수 있습니다.

---

### 용어 설명

| 용어 | 설명 |
|-----|------|
| **경매 (Auction)** | 일정 시간 동안 여러 구매자가 입찰하여 최고가로 낙찰되는 판매 방식 |
| **즉시 구매 (Fixed Price)** | 정해진 가격에 바로 구매 가능한 판매 방식 |
| **입찰 (Bid)** | 경매에서 특정 금액을 제시하는 행위 |
| **낙찰 (Winning Bid)** | 경매 종료 시 최고가 입찰자가 작품을 구매하게 되는 것 |
| **에스크로 (Escrow)** | 안전한 거래를 위해 플랫폼이 금액을 일시적으로 보관하는 시스템 |
| **구매자 수수료 (Buyer Premium)** | 낙찰가에 추가로 부과되는 수수료 (10%) |
| **잔액 (Balance)** | 사용자가 플랫폼에서 충전한 금액 |
| **작가 대시보드 (Artist Dashboard)** | 작가가 작품을 관리하는 페이지 |
| **마이페이지 (My Page)** | 사용자가 좋아요, 입찰, 구매 내역을 확인하는 페이지 |

---

### 문의 및 지원

- **이메일:** support@art-xhibit.com (예시)
- **FAQ:** 홈페이지 하단 "도움말" 링크 참조
- **버그 리포트:** GitHub Issues (개발자용)

---

## 유저 플로우 (User Flow)

ART-XHIBIT의 모든 기능을 **일반 유저(구매자)**와 **작가** 관점에서 단계별로 정리한 유저플로우입니다.

### 📋 목차
- [일반 유저(구매자) 플로우](#일반-유저구매자-플로우)
- [작가 플로우](#작가-플로우)
- [공통 플로우](#공통-플로우)

---

### 일반 유저(구매자) 플로우

#### 1️⃣ 회원가입 및 로그인

**1.1 회원가입**
```
1. 진입: 홈페이지 우측 상단 "회원가입" 버튼 클릭
2. 정보 입력:
   - 이메일 주소
   - 비밀번호 (8자 이상)
   - 비밀번호 확인
3. 약관 동의
4. "가입하기" 버튼 클릭
5. 시스템 동작:
   - Supabase Auth로 계정 생성
   - profiles 테이블에 사용자 정보 저장
   - role = 'buyer' (일반 구매자)
6. 결과: 이메일 인증 요청 메시지 표시
7. 이메일 인증:
   - 받은 이메일의 인증 링크 클릭
   - 자동 로그인 및 홈페이지로 리디렉션
```

**1.2 로그인**
```
1. 진입: 홈페이지 우측 상단 "로그인" 버튼 클릭
2. 정보 입력:
   - 이메일
   - 비밀번호
3. "로그인" 버튼 클릭
4. 시스템 동작:
   - Supabase Auth로 인증
   - 세션 생성 및 쿠키 저장
5. 결과: 로그인 성공, 이전 페이지 또는 홈으로 리디렉션
```

---

#### 2️⃣ 작품 둘러보기 및 검색

**2.1 홈페이지에서 작품 둘러보기**
```
1. 진입: 홈페이지 (/)
2. 제공 콘텐츠:
   - Hero Section: 메인 메시지 + "작품 둘러보기" CTA
   - 지금 주목받는 신진 작가 작품 (조회수 기준 상위 6개)
   - 마감 임박 경매 (경매 종료 시간 임박 순 4개)
   - 작가 등록 CTA 섹션
3. 액션:
   - 작품 카드 클릭 → 작품 상세 페이지로 이동
   - "작품 둘러보기" 버튼 → 탐색 페이지로 이동
   - 하트 아이콘 클릭 → 좋아요 추가/제거
```

**2.2 작품 탐색 페이지**
```
1. 진입: 홈 → "작품 둘러보기" 또는 헤더 "둘러보기" 메뉴
2. 페이지 구성:
   - 좌측/상단: 필터 사이드바 (모바일: 위, 데스크톱: 오른쪽)
   - 우측/하단: 작품 그리드 (1열/2열/3열 반응형)
3. 검색 및 필터:
   - 텍스트 검색: 작품명, 작가명 검색
   - 카테고리 필터: 회화, 조각, 사진, 디지털아트, 판화, 설치미술, 기타
   - 판매 방식: 전체, 경매, 즉시구매
   - 가격 범위: 최소가 ~ 최대가 슬라이더
   - 작가 필터: 드롭다운 선택
4. 정렬 옵션:
   - 인기순 (조회수 높은 순)
   - 최신순 (등록일 최신 순)
   - 가격 낮은 순
   - 가격 높은 순
5. 시스템 동작:
   - PostgreSQL Full-Text Search
   - 페이지네이션 (12개씩)
   - URL 쿼리 파라미터로 필터 상태 저장
6. 결과: 필터링된 작품 목록 표시
   - 결과 없음 → 추천 작품 표시
```

---

#### 3️⃣ 작품 상세보기

**3.1 작품 상세 페이지 접근**
```
1. 진입: 작품 카드 클릭 → /artwork/[id]
2. 시스템 동작:
   - 작품 정보 조회 (DB)
   - 조회수 자동 1 증가 (트리거)
   - 현재 사용자의 좋아요 상태 조회
   - 사용자 잔액 정보 조회 (로그인 시)
3. 페이지 구성:
   좌측:
   - 이미지 갤러리 (여러 이미지 슬라이드)
   우측:
   - 카테고리 뱃지
   - 작품 제목
   - 작가 이름 (클릭 → 작가 프로필)
   - 좋아요 버튼 + 카운트
   - 조회수
   - 작품 정보 (카테고리, 제작일)
   - 가격 정보 카드 (경매 또는 즉시구매)
   하단:
   - 작품 설명
   - 입찰 히스토리 (경매인 경우)
   - 작가 정보 카드
   - 같은 작가의 다른 작품
   - 비슷한 카테고리 작품
```

**3.2 좋아요 기능**
```
1. 액션: 하트 아이콘 클릭
2. 시스템 동작:
   - 로그인 확인 (비로그인 시 로그인 페이지로)
   - favorites 테이블에 레코드 추가/삭제
   - artworks.likes 카운트 자동 업데이트 (트리거)
3. 결과:
   - UI 즉시 업데이트 (하트 색상 변경)
   - 좋아요 카운트 증가/감소
   - 마이페이지 > 관심 작품 목록에 추가/제거
```

---

#### 4️⃣ 경매 입찰

**4.1 경매 작품 입찰 프로세스**
```
1. 진입: 작품 상세 페이지 (경매 작품)
2. 표시 정보:
   - 현재가 (입찰 없으면 "경매 시작가", 있으면 "현재가")
   - 입찰 횟수
   - 경매 종료까지 남은 시간 (실시간 카운트다운)
   - 구매자 수수료 안내 (10%)
3. 입찰 조건 확인:
   - 로그인 상태 ✓
   - 작품 status = 'active' ✓
   - 경매 종료 시간 이전 ✓
   - 본인 작품 아님 ✓
   - 잔액 충분 (입찰금액 × 1.1 이상) ✓
4. 입찰 액션:
   - 입찰 금액 입력 (현재가보다 높아야 함)
   - "입찰하기" 버튼 클릭
5. 시스템 동작:
   a. 유효성 검증:
      - 현재가보다 높은지 확인
      - 잔액 충분한지 확인
      - 경매 종료 시간 확인
   b. 에스크로 처리:
      - 이전 최고 입찰자의 에스크로 금액 해제
      - 새 입찰자의 잔액에서 (입찰금액 × 1.1) 에스크로 홀드
   c. 입찰 기록:
      - bids 테이블에 입찰 기록 생성
      - artworks.current_price 업데이트 (트리거)
      - artworks.bid_count 증가 (트리거)
   d. Realtime 이벤트 발행:
      - 해당 작품 페이지를 보고 있는 모든 사용자에게 가격 업데이트 전송
6. 결과:
   - 입찰 성공 메시지
   - 현재가 실시간 업데이트
   - 입찰 히스토리에 추가
   - 마이페이지 > 입찰 내역에 추가
   - 잔액 페이지에서 에스크로 상태 확인 가능
```

**4.2 입찰 히스토리 확인**
```
1. 위치: 작품 상세 페이지 하단
2. 표시 정보:
   - 입찰 금액
   - 입찰자 (본인 입찰은 "내 입찰" 표시)
   - 입찰 시간
   - 최고 입찰 뱃지
3. 정렬: 최신순 (최대 10개)
```

**4.3 경매 자동 종료 (Cron Job)**
```
1. 트리거: 매 10분마다 자동 실행
2. 시스템 동작:
   a. 만료된 경매 검색:
      - status = 'active'
      - auction_end_time < 현재 시간
   b. 최고 입찰자 확인:
      - 입찰이 있는 경우:
        * orders 테이블에 주문 생성
        * 작품 status = 'sold'로 변경
        * 에스크로 금액 정산 (작가에게 지급)
      - 입찰이 없는 경우:
        * 작품 status = 'active' 유지 (경매 재시작 가능)
3. 정산 프로세스:
   - 총 금액 = 낙찰가 × 1.1
   - 작가 수익 = 낙찰가
   - 플랫폼 수수료 = 낙찰가 × 0.1
   - 작가 잔액 자동 증가
4. 알림:
   - 낙찰자: 주문 생성 알림
   - 작가: 판매 완료 알림
```

---

#### 5️⃣ 즉시 구매

**5.1 즉시 구매 프로세스**
```
1. 진입: 작품 상세 페이지 (즉시구매 작품)
2. 표시 정보:
   - 즉시 구매가
   - "지금 구매" 버튼
3. 구매 조건 확인:
   - 로그인 상태 ✓
   - 작품 status = 'active' ✓
   - 잔액 충분 (구매가 이상) ✓
   - 본인 작품 아님 ✓
4. 구매 액션:
   - "지금 구매" 버튼 클릭
   - 확인 다이얼로그 표시
   - "구매 확인" 클릭
5. 시스템 동작:
   a. 유효성 검증:
      - 작품 상태 확인
      - 잔액 확인
   b. 결제 처리:
      - 구매자 잔액 차감 (구매가)
      - balance_transactions 테이블에 거래 기록
   c. 주문 생성:
      - orders 테이블에 레코드 생성
      - status = 'pending'
      - 작품 status = 'sold'
   d. 정산:
      - 작가 잔액 증가 (구매가)
      - 작가에게 정산 거래 기록 생성
6. 결과:
   - 구매 완료 메시지
   - 주문 상세 페이지로 리디렉션
   - 마이페이지 > 구매 내역에 추가
   - 작가 대시보드 > 판매 내역에 추가
```

---

#### 6️⃣ 잔액 충전 및 관리

**6.1 잔액 충전**
```
1. 진입:
   - 헤더 "잔액 충전" 메뉴
   - 마이페이지 → "충전하기" 버튼
   - 입찰/구매 시 잔액 부족 알림 → "충전하기" 링크
2. 충전 페이지 구성:
   - 현재 잔액 표시
   - 사용 가능 잔액 (현재 잔액 - 에스크로 금액)
   - 충전 금액 입력 (1,000원 ~ 1억원)
   - 빠른 충전 버튼 (10,000원, 50,000원, 100,000원, 500,000원)
   - 활성 에스크로 내역 (입찰로 묶인 금액)
3. 충전 액션:
   - 충전 금액 입력
   - "충전하기" 버튼 클릭
4. 시스템 동작:
   - 유효성 검증 (최소/최대 금액)
   - profiles.balance 업데이트
   - balance_transactions 테이블에 거래 기록 (type='charge')
5. 결과:
   - 충전 완료 메시지
   - 잔액 즉시 업데이트
   - 거래 내역에 기록
```

**6.2 거래 내역 확인**
```
1. 진입: 잔액 페이지 → "거래 내역" 버튼
2. 표시 정보:
   - 거래 유형 (충전, 구매, 에스크로 홀드, 에스크로 해제, 정산)
   - 금액 (+ 증가, - 감소)
   - 거래 후 잔액
   - 설명
   - 거래 시간
3. 정렬: 최신순
4. 필터:
   - 전체
   - 충전 내역
   - 구매 내역
   - 에스크로 내역
```

---

#### 7️⃣ 마이페이지 (구매자 대시보드)

**7.1 마이페이지 구성**
```
1. 진입: 헤더 "마이페이지" 메뉴 (로그인 후)
2. 페이지 구조:
   상단:
   - 제목: "마이페이지"
   - 프로필 수정 버튼

   잔고 현황 섹션:
   - 총 잔액
   - 사용 가능 잔액
   - 에스크로 금액
   - "충전하기" 버튼

   통계 카드:
   - 관심 작품 (좋아요 개수)
   - 참여 경매 (입찰 중인 작품 개수)
   - 구매 내역 (구매한 작품 개수)

   탭 메뉴:
   - 관심 작품
   - 입찰 내역
   - 구매 내역
```

**7.2 관심 작품 탭**
```
1. 표시 내용:
   - 좋아요 누른 작품 목록
   - 작품 카드 그리드
2. 기능:
   - 작품 클릭 → 상세 페이지
   - 하트 클릭 → 좋아요 해제
3. 정렬: 좋아요 추가 최신순
```

**7.3 입찰 내역 탭**
```
1. 표시 내용:
   - 입찰한 작품 목록
   - 각 작품별:
     * 작품 이미지 및 정보
     * 내 입찰 금액
     * 현재 최고가
     * 입찰 상태 (최고가 입찰, 입찰 패배, 낙찰, 유찰)
     * 경매 종료 시간 또는 종료 여부
2. 상태별 분류:
   - 진행 중 (최고가 입찰 / 입찰 패배)
   - 종료됨 (낙찰 / 유찰)
3. 기능:
   - 작품 클릭 → 상세 페이지 (재입찰 가능)
4. 정렬: 경매 종료 시간 임박 순
```

**7.4 구매 내역 탭**
```
1. 표시 내용:
   - 구매한 작품 목록 (경매 낙찰 + 즉시구매)
   - 각 주문별:
     * 작품 이미지 및 정보
     * 구매 금액
     * 구매 방식 (경매/즉시구매)
     * 주문 상태 (결제 완료, 배송 중, 완료, 취소)
     * 주문 날짜
2. 기능:
   - 작품 클릭 → 주문 상세 페이지
   - 주문 취소 (pending 상태인 경우)
3. 정렬: 주문 날짜 최신순
```

---

### 작가 플로우

#### 1️⃣ 작가 회원가입 및 등록

**1.1 작가로 회원가입**
```
1. 진입: 홈페이지 → "작가로 시작하기" 버튼
2. 단계:
   Step 1 - 일반 회원가입:
   - 이메일, 비밀번호 입력
   - 계정 생성 (role = 'buyer' 기본)

   Step 2 - 작가 등록:
   - 작가명 (실명 또는 예명)
   - 사용자명 (고유, URL에 사용)
   - 작가 소개
   - 프로필 이미지 업로드

3. 시스템 동작:
   - artists 테이블에 작가 정보 생성
   - profiles.role을 'artist'로 업데이트
   - profiles.is_artist = true
4. 결과:
   - 작가 등록 완료
   - 작가 대시보드로 리디렉션
   - 헤더에 "작가 대시보드" 메뉴 추가
```

**1.2 기존 구매자가 작가로 전환**
```
1. 진입:
   - 마이페이지 → 프로필 수정 → "작가로 등록" 버튼
2. 이후 프로세스는 1.1의 Step 2와 동일
3. 결과:
   - 구매자 기능 유지
   - 작가 기능 추가 활성화
   - 마이페이지에 "작가 대시보드" 버튼 추가
```

---

#### 2️⃣ 작품 등록

**2.1 작품 등록 프로세스**
```
1. 진입: 작가 대시보드 → "새 작품 등록" 버튼
2. 작품 정보 입력 폼:
   필수 정보:
   - 작품 제목
   - 작품 설명
   - 카테고리 선택 (회화, 조각, 사진, 디지털아트, 판화, 설치미술, 기타)
   - 작품 이미지 업로드 (최대 5개)

   판매 정보:
   - 판매 방식 선택:
     * 경매 (Auction):
       - 경매 시작가 입력
       - 경매 종료 시간 선택 (최소 1시간, 최대 30일)
     * 즉시 구매 (Fixed Price):
       - 고정 가격 입력

   선택 정보:
   - 제작일
   - 재료/기법
   - 크기

3. 이미지 업로드 시스템:
   - Supabase Storage 'artwork-images' 버킷
   - 이미지 리사이징 및 최적화
   - 파일명: {artwork_id}/{timestamp}_{original_name}

4. 시스템 동작:
   a. 유효성 검증:
      - 필수 항목 입력 확인
      - 가격 범위 확인 (1,000원 ~ 1억원)
      - 경매 종료 시간 유효성 확인
   b. 작품 생성:
      - artworks 테이블에 레코드 생성
      - status = 'active'
      - artist_id = 현재 로그인한 작가 ID
   c. 이미지 저장:
      - Supabase Storage에 업로드
      - image_url 및 images 배열에 URL 저장

5. 결과:
   - 작품 등록 완료 메시지
   - 작품 상세 페이지로 리디렉션
   - 작가 대시보드 > 내 작품 목록에 추가
   - 탐색 페이지에 노출 시작
```

---

#### 3️⃣ 작품 수정 및 삭제

**3.1 작품 수정**
```
1. 진입:
   - 작가 대시보드 > 내 작품 목록 → 작품 카드 "수정" 버튼
   - 작품 상세 페이지 (본인 작품) → "수정" 버튼
2. 수정 가능 항목:
   - 작품 상태가 'active'인 경우:
     * 제목, 설명, 카테고리
     * 이미지 추가/삭제/순서 변경
     * 즉시구매 작품: 가격 변경 가능
     * 경매 작품: 입찰 전이면 시작가 변경 가능

   - 작품 상태가 'sold'인 경우:
     * 수정 불가 (읽기 전용)
3. 제한 사항:
   - 경매 진행 중 (입찰이 있는 경우):
     * 가격 변경 불가
     * 경매 종료 시간 변경 불가
     * 판매 방식 변경 불가
   - 판매 완료된 작품:
     * 모든 수정 불가
4. 시스템 동작:
   - 수정 권한 확인 (작가 본인만)
   - artworks 테이블 업데이트
   - updated_at 자동 갱신
5. 결과:
   - 수정 완료 메시지
   - 작품 상세 페이지로 리디렉션
```

**3.2 작품 삭제**
```
1. 진입: 작가 대시보드 > 내 작품 목록 → 작품 카드 "삭제" 버튼
2. 삭제 가능 조건:
   - 작품 상태가 'active'
   - 입찰 내역이 없음 (경매인 경우)
   - 주문 내역이 없음
3. 확인 프로세스:
   - 삭제 확인 다이얼로그 표시
   - "정말로 삭제하시겠습니까?" 메시지
   - "삭제" 버튼 클릭
4. 시스템 동작:
   - 작품 이미지 Storage에서 삭제
   - artworks 레코드 삭제 (Cascade: favorites도 함께 삭제)
5. 결과:
   - 삭제 완료 메시지
   - 작가 대시보드로 리디렉션
   - 작품 목록에서 제거
```

---

#### 4️⃣ 작가 대시보드

**4.1 대시보드 구성**
```
1. 진입: 헤더 "작가 대시보드" 메뉴
2. 페이지 구조:
   상단:
   - 제목: "작가 대시보드"
   - "새 작품 등록" 버튼

   통계 카드:
   - 총 작품 수 (전체 등록 작품)
   - 판매된 작품 (sold 상태 작품)
   - 총 조회수 (모든 작품 조회수 합계)

   내 작품 목록:
   - 등록한 모든 작품 카드
   - 각 작품별:
     * 작품 이미지 및 제목
     * 상태 뱃지 (판매중, 경매중, 판매완료)
     * 가격 정보
     * 조회수, 좋아요 수
     * 수정/삭제 버튼

   판매 내역:
   - 판매 완료된 작품 목록
   - 각 판매별:
     * 구매자 정보
     * 판매 금액
     * 판매 방식 (경매/즉시구매)
     * 판매 날짜
```

**4.2 작품 관리**
```
1. 작품 목록 필터:
   - 전체
   - 판매 중 (status = 'active')
   - 판매 완료 (status = 'sold')
   - 경매 진행 중 (sale_type = 'auction' && bid_count > 0)
2. 정렬 옵션:
   - 최신 등록순
   - 조회수 높은 순
   - 좋아요 많은 순
3. 빠른 액션:
   - 작품 클릭 → 상세 페이지
   - 수정 버튼 → 수정 페이지
   - 삭제 버튼 → 삭제 확인
   - 공유 버튼 → SNS 공유
```

**4.3 판매 내역 및 수익 관리**
```
1. 판매 내역 테이블:
   - 판매 날짜
   - 작품 제목
   - 구매자 (익명 처리)
   - 판매 금액 (작가 수익)
   - 판매 방식
2. 수익 통계:
   - 총 수익 (판매 완료된 작품 합계)
   - 이번 달 수익
   - 평균 작품가
3. 정산 정보:
   - 정산 예정 금액 (주문 완료 후 대기 중)
   - 정산 완료 금액 (잔액으로 입금 완료)
4. 시스템:
   - 경매 낙찰 시: 자동 정산 (즉시 잔액 증가)
   - 즉시 구매 시: 자동 정산 (즉시 잔액 증가)
```

---

#### 5️⃣ 작가 프로필 관리

**5.1 작가 프로필 수정**
```
1. 진입:
   - 작가 대시보드 → 프로필 설정 버튼
   - 헤더 → 프로필 수정
2. 수정 가능 항목:
   작가 정보:
   - 작가명
   - 사용자명 (URL에 사용, 고유해야 함)
   - 작가 소개
   - 프로필 이미지

   계정 정보:
   - 이메일
   - 비밀번호 변경

   프로필 공개 설정:
   - 작가 프로필 공개/비공개
   - 판매 통계 공개/비공개
3. 시스템 동작:
   - 사용자명 중복 확인
   - artists 테이블 업데이트
   - profiles 테이블 업데이트
4. 결과:
   - 수정 완료 메시지
   - 작가 프로필 페이지 반영
```

**5.2 작가 프로필 페이지 (공개 페이지)**
```
1. 접근: /artist/[username] 또는 /artist/[id]
2. 표시 정보:
   상단:
   - 프로필 이미지
   - 작가명 및 사용자명
   - 작가 소개
   - 팔로우 버튼 (향후 기능)

   통계:
   - 총 작품 수
   - 판매된 작품 수
   - 판매율

   작품 갤러리:
   - 작가의 모든 활성 작품
   - 작품 카드 그리드

   정렬 옵션:
   - 최신순
   - 인기순 (조회수)
   - 가격순
3. 기능:
   - 작품 클릭 → 작품 상세 페이지
   - 작가 팔로우 (향후 구현)
   - SNS 공유
```

---

### 공통 플로우

#### 1️⃣ 네비게이션 및 헤더

**헤더 메뉴 구성**
```
게스트 (비로그인):
- 로고 (홈으로)
- 둘러보기
- 장르별 보기
- 로그인
- 회원가입

일반 유저 (구매자):
- 로고
- 둘러보기
- 장르별 보기
- 잔액: ₩XXX,XXX (클릭 → 충전 페이지)
- 프로필 드롭다운:
  * 마이페이지
  * 프로필 수정
  * 로그아웃

작가:
- 로고
- 둘러보기
- 장르별 보기
- 잔액: ₩XXX,XXX
- 프로필 드롭다운:
  * 작가 대시보드
  * 마이페이지
  * 프로필 수정
  * 로그아웃
```

---

#### 2️⃣ 알림 시스템 (향후 구현 예정)

```
알림 타입:
- 입찰 알림: 내 작품에 입찰 발생
- 경매 종료 알림: 참여한 경매 종료
- 낙찰 알림: 경매 낙찰
- 판매 완료 알림: 작품 판매
- 정산 알림: 수익 정산 완료
- 좋아요 알림: 작품에 좋아요 추가

알림 채널:
- 인앱 알림 (헤더 벨 아이콘)
- 이메일 알림
- (옵션) 푸시 알림
```

---

#### 3️⃣ 장르별 보기

**장르별 작품 탐색**
```
1. 진입: 헤더 "장르별 보기" 드롭다운 메뉴
2. 제공 장르:
   - 회화 (Painting)
   - 조각 (Sculpture)
   - 사진 (Photography)
   - 디지털아트 (Digital Art)
   - 판화 (Printmaking)
   - 설치미술 (Installation)
   - 기타 (Other)
3. 페이지: /genres/[slug]
4. 기능:
   - 해당 장르의 모든 작품 표시
   - 추가 필터 및 정렬 가능
   - 둘러보기 페이지와 동일한 기능
```

---

#### 4️⃣ 검색 기능

**전역 검색**
```
1. 진입: 헤더 검색 바 (모든 페이지)
2. 검색 범위:
   - 작품 제목
   - 작가 이름
   - 작품 설명
3. 검색 동작:
   - 입력 시 자동 완성 제안 (Debounce 300ms)
   - Enter 키 → /explore?q={검색어} 로 이동
4. 검색 결과 페이지:
   - 일치하는 작품 목록
   - 필터 및 정렬 옵션 제공
   - "검색 결과: N개" 표시
```

---

#### 5️⃣ 에러 처리 및 로딩 상태

**에러 페이지**
```
404 Not Found:
- 존재하지 않는 작품/작가 페이지
- "페이지를 찾을 수 없습니다" 메시지
- 홈으로 돌아가기 버튼

403 Forbidden:
- 권한 없는 페이지 접근 (작가 전용 페이지 등)
- "접근 권한이 없습니다" 메시지
- 이전 페이지로 돌아가기

500 Server Error:
- 서버 오류 발생 시
- "일시적인 오류가 발생했습니다" 메시지
- 새로고침 버튼
```

**로딩 상태**
```
- 페이지 전환 시: 로딩 스피너
- 데이터 로딩 시: 스켈레톤 UI
- 이미지 로딩 시: 블러 placeholder
- 버튼 클릭 시: 버튼 비활성화 + 로딩 인디케이터
```

---

## 유저 플로우 다이어그램 요약

### 구매자 여정 (Buyer Journey)
```
게스트 → 회원가입/로그인 → 작품 둘러보기 → 작품 상세보기
  → 좋아요 또는 입찰/구매
  → 입찰: 잔액 충전 → 입찰 → 경매 참여 → 낙찰/유찰
  → 구매: 잔액 충전 → 즉시 구매 → 주문 완료
  → 마이페이지에서 관리 (관심 작품, 입찰 내역, 구매 내역)
```

### 작가 여정 (Artist Journey)
```
게스트 → 회원가입 → 작가 등록 → 작가 대시보드
  → 새 작품 등록 → 작품 정보 입력 → 이미지 업로드 → 판매 방식 선택
  → 작품 게시 → 작품 관리 (수정/삭제)
  → 판매 발생 → 수익 정산 → 잔액 증가
  → 판매 내역 및 통계 확인
```

---

## 라이선스

ISC License

Copyright (c) 2025 ART-XHIBIT

---

## 변경 이력

### v1.0.2 (2025-10-14)

#### 작품 관리 안전성 강화 (Issue #10)
- **경매 중/낙찰된 작품 삭제 방지**: 입찰이 있거나 주문이 생성된 작품은 삭제 불가
- **작품 삭제 조건 검증**: 삭제 전 입찰 내역과 주문 내역 확인
- **에러 메시지 개선**: 삭제 불가 사유를 명확히 안내
- **데이터 무결성 보장**: 거래 중인 작품의 의도치 않은 삭제 방지

**변경 파일:**
- `app/artist-dashboard/actions.ts`: `deleteArtwork()` 함수에 검증 로직 추가

#### 마이페이지 작품 관리 통합 (Issue #11)
- **통합 대시보드**: 구매자와 작가 기능을 하나의 마이페이지로 통합
- **역할 기반 탭**: 역할(작가/구매자)에 따라 동적으로 탭 표시
- **작가 작품 관리**: 마이페이지에서 등록한 작품 수정/삭제 가능
- **판매 내역 확인**: 작가가 판매 완료된 작품과 수익 확인 가능
- **UI/UX 개선**: 일관된 사용자 경험 제공

**변경 파일:**
- `app/my-page/page.tsx`: 역할 기반 탭 및 통합 레이아웃 구현
- 기존 `artist-dashboard` 기능을 마이페이지로 통합

#### 탐색 페이지 필터 토글 기능 (Issue #12)
- **필터 접기/펼치기**: 우측 상단 토글 버튼으로 필터 표시/숨김 제어
- **동적 레이아웃**: 필터 숨김 시 작품 그리드 4열 확장 (3열 → 4열)
- **상태 지속성**: localStorage로 사용자 선택 저장, 재방문 시 유지
- **부드러운 애니메이션**: transition 효과로 자연스러운 UI 전환
- **반응형 디자인**: 모바일에서는 토글 버튼 숨김 (기존 동작 유지)
- **접근성 준수**: aria-label, aria-expanded 속성 추가

**변경 파일:**
- `app/explore/explore-client.tsx`: 필터 토글 기능 및 동적 레이아웃 구현

---

### v1.0.1 (2025-10-13)
- **경매 UI 개선**: 입찰 수에 따라 "경매 시작가" vs "현재가" 동적 표시
- **수수료 안내 명확화**: "구매자 수수료 별도" 안내 추가
- **입찰 폼 개선**: 경매 시작가와 최소 입찰가 구분하여 표시
- **에러 메시지 개선**: 입찰 검증 실패 시 더 명확한 메시지 제공
- **안전성 강화**: `currentPrice`가 0일 때 안전하게 처리

**변경 파일:**
- `components/realtime-artwork-price.tsx`: 입찰 수 기반 가격 라벨 동적 변경
- `components/bid-form.tsx`: 최소 입찰가 표시 개선 및 안전 처리
- `app/artwork/[id]/bid-actions.ts`: 에러 메시지 개선

### v1.0.0 (2025-01-XX)
- 초기 릴리스
- 기본 경매 및 즉시 구매 기능
- 에스크로 시스템
- 잔액 관리 시스템
- 작가 대시보드
- E2E 테스트 구축

---

**마지막 업데이트:** 2025-10-14
**문서 버전:** 1.0.2
