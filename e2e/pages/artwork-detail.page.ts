import { Page, Locator, expect } from '@playwright/test';

export class ArtworkDetailPage {
  readonly page: Page;
  readonly artworkTitle: Locator;
  readonly artistName: Locator;
  readonly currentPrice: Locator;
  readonly bidCountdown: Locator;
  readonly bidInput: Locator;
  readonly bidButton: Locator;
  readonly bidHistory: Locator;
  readonly purchaseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.artworkTitle = page.locator('h1');
    this.artistName = page.locator('a[href^="/artist/"]').first();
    this.currentPrice = page.locator('text=/현재가|즉시 구매가/').locator('..').locator('p.text-3xl');
    this.bidCountdown = page.locator('text=/남은 시간/');
    this.bidInput = page.locator('input[type="number"]').first();
    this.bidButton = page.locator('button:has-text("입찰하기")');
    this.bidHistory = page.locator('text=/입찰 내역/');
    this.purchaseButton = page.locator('button:has-text("구매하기")');
  }

  async goto(artworkId: string) {
    await this.page.goto(`/artwork/${artworkId}`);
  }

  async expectToBeOnArtworkDetailPage() {
    await expect(this.artworkTitle).toBeVisible();
    await expect(this.artistName).toBeVisible();
  }

  async isAuctionArtwork() {
    return await this.bidButton.isVisible().catch(() => false);
  }

  async isFixedPriceArtwork() {
    return await this.purchaseButton.isVisible().catch(() => false);
  }

  async expectAuctionSectionToBeVisible() {
    await expect(this.currentPrice).toBeVisible();
    await expect(this.bidCountdown).toBeVisible();
    await expect(this.bidInput).toBeVisible();
    await expect(this.bidButton).toBeVisible();
  }

  async getCurrentPrice() {
    const priceText = await this.currentPrice.textContent();
    // Extract number from "1,000,000 원" format
    const priceMatch = priceText?.match(/[\d,]+/);
    return priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
  }

  async placeBid(amount: number) {
    await this.bidInput.fill(amount.toString());
    await this.bidButton.click();
  }

  async expectBidSuccess() {
    // Wait for toast notification or success message
    await expect(this.page.locator('text=/입찰이 완료되었습니다|입찰에 성공했습니다/')).toBeVisible({ timeout: 5000 });
  }

  async expectBidError(errorMessage?: string) {
    if (errorMessage) {
      await expect(this.page.locator(`text=${errorMessage}`)).toBeVisible({ timeout: 5000 });
    } else {
      // Generic error check
      await expect(this.page.locator('text=/입찰에 실패|오류가 발생|로그인이 필요/')).toBeVisible({ timeout: 5000 });
    }
  }

  async expectPurchaseButtonToBeVisible() {
    await expect(this.purchaseButton).toBeVisible();
  }
}
