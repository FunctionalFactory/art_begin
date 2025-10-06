# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ART-XHIBIT is an art auction platform for emerging artists built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Shadcn UI. The platform allows users to browse artworks, participate in auctions, and purchase art directly from artists.

**Note: This is a UI-only implementation. No backend functionality has been implemented yet.**

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

The development server runs on `http://localhost:3000` by default.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (built on Radix UI)
- **Icons**: Lucide React

## Project Structure

```
art-xhibit/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with Header & Footer
│   ├── page.tsx             # Home page (main gallery)
│   ├── explore/             # Browse/search artworks page
│   ├── artwork/[id]/        # Artwork detail page
│   ├── artist/[id]/         # Artist profile page
│   ├── login/               # Login page
│   ├── signup/              # Sign up page
│   └── my-page/             # User dashboard (favorites, bids, orders)
├── components/              # React components
│   ├── ui/                  # Shadcn UI components (Button, Card, etc.)
│   ├── header.tsx           # Site header with navigation
│   ├── footer.tsx           # Site footer
│   └── artwork-card.tsx     # Reusable artwork card component
├── lib/                     # Utilities and data
│   ├── utils.ts            # Utility functions (cn helper)
│   └── data.ts             # Mock data for artworks and artists
└── public/                  # Static assets
```

## Key Architecture Patterns

### Server Components First
- All pages use Server Components by default (Next.js 14 App Router)
- Client Components (with `"use client"`) are only used when necessary for interactivity:
  - `app/explore/page.tsx` - for search/filter state management
  - UI components with Radix UI primitives (Tabs, Select, etc.)

### Data Flow
- Mock data is centralized in `lib/data.ts`
- Helper functions (`getArtworkById`, `getArtistById`, etc.) simulate data fetching
- In production, replace these with actual API calls or database queries

### Component Organization
- **UI Components** (`components/ui/`): Reusable Shadcn UI primitives
- **Feature Components** (`components/`): Application-specific components (Header, Footer, ArtworkCard)
- **Pages** (`app/`): Route-based pages using App Router conventions

### Dynamic Routes
- `/artwork/[id]` - Dynamic artwork detail pages
- `/artist/[id]` - Dynamic artist profile pages
- Uses `params` prop for accessing route parameters

## Styling Approach

- **Tailwind CSS**: Utility-first styling throughout
- **CSS Variables**: Theme colors defined in `app/globals.css` using HSL values
- **Shadcn UI**: Consistent component styling via `tailwind.config.js`
- **cn() helper**: Used for conditional class merging (from `lib/utils.ts`)

## Mock Data Structure

### Artwork Interface
```typescript
{
  id: string
  title: string
  artistId: string
  artistName: string
  imageUrl: string
  description: string
  category: string
  currentPrice?: number       // For auctions
  fixedPrice?: number         // For direct purchase
  saleType: "auction" | "fixed"
  auctionEndTime?: Date
  bidCount?: number
  views: number
  likes: number
  status: "active" | "sold" | "upcoming"
}
```

### Artist Interface
```typescript
{
  id: string
  name: string
  username: string
  bio: string
  profileImage: string
  totalArtworks: number
  soldArtworks: number
}
```

## Adding New Features

When implementing backend functionality:

1. **Authentication**: Replace mock login/signup pages with actual auth (e.g., NextAuth.js)
2. **Database**: Replace `lib/data.ts` with database queries (Prisma, MongoDB, etc.)
3. **API Routes**: Create API endpoints in `app/api/` for CRUD operations
4. **Image Upload**: Implement artwork image upload functionality
5. **Auction System**: Add real-time bidding with WebSockets or polling
6. **Payment Integration**: Integrate PG (Payment Gateway) for transactions

## UI Component Patterns

### ArtworkCard Component
- Displays artwork thumbnail, title, artist, price
- Shows auction countdown for auction items
- Links to artwork detail page
- Reused across home, explore, artist, and my-page

### Layout Components
- Header: Site-wide navigation with links and auth buttons
- Footer: Footer links and copyright information
- Automatically included in all pages via `app/layout.tsx`

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

The project uses Jest for unit testing with comprehensive coverage of business logic and components.

**Test Structure:**
```
├── lib/__tests__/              # Utils & transform tests
├── lib/queries/__tests__/      # Database query tests (Supabase)
├── app/**/[tests]/            # Server Actions tests
└── components/__tests__/       # Component tests
```

**Running Unit Tests:**
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Generate coverage report
```

**Coverage Goals:**
- Business Logic (lib/queries): 90%+
- Server Actions: 85%+
- Components: 80%+

### E2E Tests (Playwright)

E2E tests validate complete user journeys using Playwright with the Page Object Model (POM) pattern.

**Test Structure:**
```
e2e/
├── fixtures/                   # Test fixtures (auth, database)
│   ├── auth.fixture.ts        # Authentication state management
│   ├── database.fixture.ts    # DB seed data setup
│   └── test.ts                # Custom test fixtures
│
├── pages/                      # Page Object Model (POM)
│   ├── base.page.ts           # Base page class
│   ├── home.page.ts           # Home page POM
│   ├── explore.page.ts        # Browse artworks POM
│   ├── artwork-detail.page.ts # Artwork detail POM
│   ├── login.page.ts          # Login POM
│   └── my-page.page.ts        # User dashboard POM
│
├── tests/                      # Test scenarios
│   ├── auth/                  # Authentication flows
│   │   ├── login.spec.ts
│   │   └── signup.spec.ts
│   ├── artwork/               # Artwork features
│   │   ├── browse.spec.ts
│   │   ├── search.spec.ts
│   │   └── detail.spec.ts
│   ├── auction/               # Auction features
│   │   ├── bid.spec.ts
│   │   └── countdown.spec.ts
│   ├── purchase/              # Purchase flows
│   │   └── buy-now.spec.ts
│   └── critical-flows/        # End-to-end user journeys
│       └── guest-to-buyer.spec.ts
│
├── utils/                      # Test utilities
│   ├── auth.ts                # Authentication helpers
│   ├── database.ts            # Database helpers
│   └── assertions.ts          # Custom assertions
│
└── data/                       # Test data
    ├── users.json
    └── artworks.json
```

**Running E2E Tests:**
```bash
npm run test:e2e            # Run all E2E tests
npm run test:e2e:ui         # Run with UI mode
npm run test:e2e:headed     # Run in headed mode (see browser)
npm run test:e2e:debug      # Debug mode
npm run test:e2e:chromium   # Run on Chromium only
npm run test:e2e:report     # Show HTML report
```

**Page Object Model Example:**
```typescript
// e2e/pages/artwork-detail.page.ts
export class ArtworkDetailPage {
  constructor(private page: Page) {}

  async goto(artworkId: string) {
    await this.page.goto(`/artwork/${artworkId}`);
  }

  async placeBid(amount: number) {
    await this.page.fill('[data-testid="bid-input"]', String(amount));
    await this.page.click('[data-testid="bid-submit"]');
  }

  async expectBidSuccess() {
    await expect(this.page.locator('text=입찰이 완료되었습니다')).toBeVisible();
  }
}
```

**Test Priorities:**
- 🔴 **Critical**: Authentication, Artwork detail, Bidding, Purchase
- 🟡 **High**: Search/Filter, Likes, Artist dashboard
- 🟢 **Medium**: Profile, Favorites

**Environment Setup:**
- Tests run against `http://localhost:3000` (auto-started by Playwright)
- Test database: Isolated Supabase instance
- Test users: Defined in `.env.test`

**Best Practices:**
1. Use Page Object Model for maintainability
2. Use `data-testid` attributes for stable selectors
3. Leverage test fixtures for auth and data seeding
4. Run critical tests in CI/CD pipeline
5. Keep tests isolated and idempotent

## Important Notes

- All images use Next.js Image component for optimization
- Remote image patterns are configured in `next.config.js`
- Date formatting uses Korean locale (`ko-KR`)
- Price formatting uses Korean Won (원)
- Currently no server-side data fetching - all data is static
- No state management library - uses React hooks for client-side state
