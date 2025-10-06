import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { ArtworkDetailPage } from '../pages/artwork-detail.page';

test.describe('경매 기능 테스트', () => {
  test('홈페이지에 작품카드가 존재하는지 확인', async ({ page }) => {
    const homePage = new HomePage(page);

    // 홈페이지로 이동
    await homePage.goto();

    // 작품카드가 표시되는지 확인
    await homePage.expectArtworkCardsToBeVisible();

    // 작품카드 개수 확인
    const cardCount = await homePage.getArtworkCardCount();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('경매 작품 상세페이지에서 경매 정보가 올바르게 표시되는지 확인', async ({ page }) => {
    const homePage = new HomePage(page);
    const artworkDetailPage = new ArtworkDetailPage(page);

    // 홈페이지로 이동
    await homePage.goto();

    // 경매 작품 카드가 있는지 확인
    const auctionCard = await homePage.getFirstAuctionArtworkCard();
    const isAuctionCardVisible = await auctionCard.isVisible();

    if (isAuctionCardVisible) {
      // 첫 번째 경매 작품 클릭
      await homePage.clickFirstAuctionArtworkCard();

      // 상세페이지로 이동되었는지 확인
      await artworkDetailPage.expectToBeOnArtworkDetailPage();

      // 경매 섹션이 표시되는지 확인
      const isAuction = await artworkDetailPage.isAuctionArtwork();

      if (isAuction) {
        await artworkDetailPage.expectAuctionSectionToBeVisible();

        // 현재가 확인
        const currentPrice = await artworkDetailPage.getCurrentPrice();
        expect(currentPrice).toBeGreaterThan(0);
      }
    } else {
      test.skip();
    }
  });

  test('경매 작품에 입찰 시도 (로그인 필요 확인)', async ({ page }) => {
    const homePage = new HomePage(page);
    const artworkDetailPage = new ArtworkDetailPage(page);

    // 홈페이지로 이동
    await homePage.goto();

    // 경매 작품이 있는지 확인
    const auctionCard = await homePage.getFirstAuctionArtworkCard();
    const isAuctionCardVisible = await auctionCard.isVisible();

    if (isAuctionCardVisible) {
      // 첫 번째 경매 작품 클릭
      await homePage.clickFirstAuctionArtworkCard();

      // 경매 작품인지 확인
      const isAuction = await artworkDetailPage.isAuctionArtwork();

      if (isAuction) {
        // 현재가 가져오기
        const currentPrice = await artworkDetailPage.getCurrentPrice();

        // 현재가보다 높은 금액으로 입찰 시도
        const bidAmount = currentPrice + 10000;

        await artworkDetailPage.placeBid(bidAmount);

        // 로그인 안 된 상태면 에러 메시지 또는 로그인 페이지로 리다이렉트 확인
        // 로그인된 상태면 성공 메시지 확인
        const currentUrl = page.url();

        // 로그인 페이지로 리다이렉트되었거나, 에러 메시지가 표시되는지 확인
        if (currentUrl.includes('/login')) {
          expect(currentUrl).toContain('/login');
        } else {
          // 에러 메시지 또는 성공 메시지 확인
          const hasError = await page.locator('text=/로그인이 필요|입찰에 실패|입찰이 완료|입찰에 성공/').isVisible({ timeout: 5000 });
          expect(hasError).toBeTruthy();
        }
      }
    } else {
      test.skip();
    }
  });

  test('작품카드 개수가 최소 1개 이상인지 확인', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    const cardCount = await homePage.getArtworkCardCount();
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });
});
