import { Page, Locator, expect } from '@playwright/test';

export class BalancePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly totalBalanceCard: Locator;
  readonly escrowBalanceCard: Locator;
  readonly availableBalanceCard: Locator;
  readonly depositAmountInput: Locator;
  readonly depositButton: Locator;
  readonly activeEscrowSection: Locator;
  readonly escrowBidItems: Locator;
  readonly totalEscrowAmount: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1:has-text("잔고 충전")');

    // Balance cards - using text content to identify each card
    this.totalBalanceCard = page.locator('text=전체 잔고').locator('..');
    this.escrowBalanceCard = page.locator('text=에스크로 금액').locator('..');
    this.availableBalanceCard = page.locator('text=사용 가능 잔고').locator('..');

    // Deposit form
    this.depositAmountInput = page.locator('input[type="number"]');
    this.depositButton = page.locator('button:has-text("충전하기")');

    // Active escrow section
    this.activeEscrowSection = page.locator('text=활성 에스크로 내역').locator('..');
    this.escrowBidItems = page.locator('text=활성 에스크로 내역').locator('..').locator('a');
    this.totalEscrowAmount = page.locator('text=총 에스크로 금액');
  }

  async goto() {
    await this.page.goto('/balance');
  }

  async expectToBeOnBalancePage() {
    await expect(this.pageTitle).toBeVisible();
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

  async expectBalanceSummaryToBeVisible() {
    await expect(this.totalBalanceCard).toBeVisible();
    await expect(this.escrowBalanceCard).toBeVisible();
    await expect(this.availableBalanceCard).toBeVisible();
  }

  async expectActiveEscrowSectionToBeVisible() {
    await expect(this.activeEscrowSection).toBeVisible();
  }

  async expectNoActiveEscrow() {
    await expect(this.activeEscrowSection).not.toBeVisible();
  }

  async getActiveEscrowBidCount(): Promise<number> {
    const isVisible = await this.activeEscrowSection.isVisible();
    if (!isVisible) return 0;
    return await this.escrowBidItems.count();
  }

  async depositAmount(amount: number) {
    await this.depositAmountInput.fill(amount.toString());
    await this.depositButton.click();
  }

  async expectDepositSuccess() {
    await expect(this.page.locator('text=/충전이 완료|충전 성공/')).toBeVisible({ timeout: 5000 });
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
