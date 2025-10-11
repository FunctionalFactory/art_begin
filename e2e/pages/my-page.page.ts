import { Page, Locator, expect } from '@playwright/test';

export class MyPage {
  readonly page: Page;
  readonly pageTitle: Locator;

  // Balance Summary Section (3 cards)
  readonly totalBalanceCard: Locator;
  readonly escrowBalanceCard: Locator;
  readonly availableBalanceCard: Locator;

  // Action buttons
  readonly depositButton: Locator;
  readonly historyButton: Locator;

  // Tabs
  readonly favoritesTab: Locator;
  readonly bidsTab: Locator;
  readonly ordersTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("마이페이지")');

    // Balance cards
    this.totalBalanceCard = page.locator('text=전체 잔고').locator('..');
    this.escrowBalanceCard = page.locator('text=에스크로 금액').locator('..');
    this.availableBalanceCard = page.locator('text=사용 가능 잔고').locator('..');

    // Buttons
    this.depositButton = page.locator('a:has-text("충전하기")');
    this.historyButton = page.locator('a:has-text("거래 내역")');

    // Tabs
    this.favoritesTab = page.locator('button:has-text("관심 작품")');
    this.bidsTab = page.locator('button:has-text("입찰 내역")');
    this.ordersTab = page.locator('button:has-text("구매 내역")');
  }

  async goto() {
    await this.page.goto('/my-page');
  }

  async expectToBeOnMyPage() {
    await expect(this.pageTitle).toBeVisible();
  }

  async expectBalanceSummaryToBeVisible() {
    await expect(this.totalBalanceCard).toBeVisible();
    await expect(this.escrowBalanceCard).toBeVisible();
    await expect(this.availableBalanceCard).toBeVisible();
  }

  async getTotalBalance(): Promise<number> {
    const balanceText = await this.totalBalanceCard.locator('div.text-2xl').textContent();
    return this.extractNumberFromPrice(balanceText);
  }

  async getEscrowBalance(): Promise<number> {
    const balanceText = await this.escrowBalanceCard.locator('div.text-2xl').textContent();
    return this.extractNumberFromPrice(balanceText);
  }

  async getAvailableBalance(): Promise<number> {
    const balanceText = await this.availableBalanceCard.locator('div.text-2xl').textContent();
    return this.extractNumberFromPrice(balanceText);
  }

  async clickDepositButton() {
    await this.depositButton.click();
  }

  async clickHistoryButton() {
    await this.historyButton.click();
  }

  async clickBidsTab() {
    await this.bidsTab.click();
  }

  async clickFavoritesTab() {
    await this.favoritesTab.click();
  }

  async clickOrdersTab() {
    await this.ordersTab.click();
  }

  private extractNumberFromPrice(priceText: string | null): number {
    if (!priceText) return 0;
    const priceMatch = priceText.match(/[\d,]+/);
    return priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
  }

  async expectBalanceLogicToBeValid() {
    const total = await this.getTotalBalance();
    const escrow = await this.getEscrowBalance();
    const available = await this.getAvailableBalance();

    // Validate: Total = Escrow + Available
    expect(total).toBe(escrow + available);
  }
}
