import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly featuredSection: Locator;
  readonly endingSoonSection: Locator;
  readonly artworkCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.featuredSection = page.locator('section').filter({ hasText: '지금 주목받는 신진 작가 작품' });
    this.endingSoonSection = page.locator('section').filter({ hasText: '마감 임박 경매' });
    // ArtworkCard는 Card 컴포넌트로 되어있고 role="button"을 가지고 있음
    this.artworkCards = page.locator('[role="button"]').filter({ has: page.locator('h3') });
  }

  async goto() {
    await this.page.goto('/');
  }

  async expectArtworkCardsToBeVisible() {
    await expect(this.artworkCards.first()).toBeVisible();
  }

  async getArtworkCardCount() {
    return await this.artworkCards.count();
  }

  async clickFirstArtworkCard() {
    await this.artworkCards.first().click();
  }

  async getFirstAuctionArtworkCard() {
    // Find artwork card with countdown timer (auction item) - has "현재가" text
    const auctionCard = this.page.locator('[role="button"]').filter({
      has: this.page.locator('text=현재가')
    }).first();
    return auctionCard;
  }

  async clickFirstAuctionArtworkCard() {
    const auctionCard = await this.getFirstAuctionArtworkCard();
    await auctionCard.click();
  }
}
