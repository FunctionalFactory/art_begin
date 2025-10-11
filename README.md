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

## 라이선스

ISC License

Copyright (c) 2025 ART-XHIBIT

---

## 변경 이력

### v1.0.0 (2025-01-XX)
- 초기 릴리스
- 기본 경매 및 즉시 구매 기능
- 에스크로 시스템
- 잔액 관리 시스템
- 작가 대시보드
- E2E 테스트 구축

---

**마지막 업데이트:** 2025-01-XX
**문서 버전:** 1.0.0
