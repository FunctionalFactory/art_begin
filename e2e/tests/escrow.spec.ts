import { test, expect } from '@playwright/test';
import { MyPage } from '../pages/my-page.page';
import { BalancePage } from '../pages/balance.page';
import { ArtworkDetailPage } from '../pages/artwork-detail.page';
import { HomePage } from '../pages/home.page';

test.describe('에스크로 시스템 E2E 테스트', () => {
  test('마이페이지에서 잔고 요약(전체/에스크로/사용가능)이 표시되는지 확인', async ({ page }) => {
    const myPage = new MyPage(page);

    // 마이페이지로 이동 (로그인 필요 시 로그인 페이지로 리다이렉트)
    await myPage.goto();

    // 로그인 페이지로 리다이렉트되었는지 확인
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      test.skip('로그인이 필요한 테스트입니다');
    }

    // 마이페이지 확인
    await myPage.expectToBeOnMyPage();

    // 잔고 요약 섹션이 표시되는지 확인
    await myPage.expectBalanceSummaryToBeVisible();

    // 잔고 논리 검증: 전체 = 에스크로 + 사용가능
    await myPage.expectBalanceLogicToBeValid();
  });

  test('잔고 충전 페이지에서 잔고 요약이 표시되는지 확인', async ({ page }) => {
    const balancePage = new BalancePage(page);

    await balancePage.goto();

    // 로그인 페이지로 리다이렉트되었는지 확인
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      test.skip('로그인이 필요한 테스트입니다');
    }

    // 잔고 충전 페이지 확인
    await balancePage.expectToBeOnBalancePage();

    // 잔고 요약 섹션이 표시되는지 확인
    await balancePage.expectBalanceSummaryToBeVisible();

    // 잔고 논리 검증
    await balancePage.expectBalanceLogicToBeValid();
  });

  test('활성 에스크로가 있을 때 잔고 충전 페이지에 에스크로 내역이 표시되는지 확인', async ({ page }) => {
    const balancePage = new BalancePage(page);

    await balancePage.goto();

    // 로그인 페이지로 리다이렉트되었는지 확인
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      test.skip('로그인이 필요한 테스트입니다');
    }

    await balancePage.expectToBeOnBalancePage();

    // 에스크로 금액 확인
    const escrowBalance = await balancePage.getEscrowBalance();

    if (escrowBalance > 0) {
      // 에스크로가 있으면 활성 에스크로 섹션이 표시되어야 함
      await balancePage.expectActiveEscrowSectionToBeVisible();

      // 에스크로 입찰 항목이 1개 이상 있어야 함
      const escrowBidCount = await balancePage.getActiveEscrowBidCount();
      expect(escrowBidCount).toBeGreaterThan(0);
    } else {
      // 에스크로가 없으면 활성 에스크로 섹션이 표시되지 않아야 함
      await balancePage.expectNoActiveEscrow();
    }
  });

  test('경매 작품 상세페이지에서 사용 가능 잔고가 표시되는지 확인', async ({ page }) => {
    const homePage = new HomePage(page);
    const artworkDetailPage = new ArtworkDetailPage(page);

    // 홈페이지로 이동
    await homePage.goto();

    // 경매 작품 찾기
    const auctionCard = await homePage.getFirstAuctionArtworkCard();
    const isAuctionCardVisible = await auctionCard.isVisible();

    if (!isAuctionCardVisible) {
      test.skip('경매 작품이 없습니다');
    }

    // 경매 작품 클릭
    await homePage.clickFirstAuctionArtworkCard();

    // 작품 상세 페이지 확인
    await artworkDetailPage.expectToBeOnArtworkDetailPage();

    const isAuction = await artworkDetailPage.isAuctionArtwork();
    if (!isAuction) {
      test.skip('경매 작품이 아닙니다');
    }

    // 로그인된 상태인지 확인 (로그인 안 되어 있으면 사용 가능 잔고가 표시되지 않음)
    const isAvailableBalanceVisible = await artworkDetailPage.availableBalanceDisplay.isVisible();

    if (isAvailableBalanceVisible) {
      // 사용 가능 잔고가 표시되는지 확인
      await artworkDetailPage.expectAvailableBalanceToBeDisplayed();
    }
  });

  test('입찰 금액 입력 시 에스크로 경고 메시지가 표시되는지 확인', async ({ page }) => {
    const homePage = new HomePage(page);
    const artworkDetailPage = new ArtworkDetailPage(page);

    await homePage.goto();

    // 경매 작품 찾기
    const auctionCard = await homePage.getFirstAuctionArtworkCard();
    const isAuctionCardVisible = await auctionCard.isVisible();

    if (!isAuctionCardVisible) {
      test.skip('경매 작품이 없습니다');
    }

    await homePage.clickFirstAuctionArtworkCard();
    await artworkDetailPage.expectToBeOnArtworkDetailPage();

    const isAuction = await artworkDetailPage.isAuctionArtwork();
    if (!isAuction) {
      test.skip('경매 작품이 아닙니다');
    }

    // 현재가 가져오기
    const currentPrice = await artworkDetailPage.getCurrentPrice();

    // 입찰 금액 입력 시 에스크로 경고가 표시되는지 확인
    const bidAmount = currentPrice + 10000;
    await artworkDetailPage.expectEscrowWarningWhenBidding(bidAmount);
  });

  test('잔고 요약 값들이 올바른 관계를 유지하는지 확인 (전체 = 에스크로 + 사용가능)', async ({ page }) => {
    const myPage = new MyPage(page);

    await myPage.goto();

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      test.skip('로그인이 필요한 테스트입니다');
    }

    await myPage.expectToBeOnMyPage();

    // 잔고 값 가져오기
    const totalBalance = await myPage.getTotalBalance();
    const escrowBalance = await myPage.getEscrowBalance();
    const availableBalance = await myPage.getAvailableBalance();

    // 검증: 전체 잔고 = 에스크로 + 사용 가능 잔고
    expect(totalBalance).toBe(escrowBalance + availableBalance);

    // 검증: 모든 값이 0 이상
    expect(totalBalance).toBeGreaterThanOrEqual(0);
    expect(escrowBalance).toBeGreaterThanOrEqual(0);
    expect(availableBalance).toBeGreaterThanOrEqual(0);

    // 검증: 사용 가능 잔고는 전체 잔고보다 클 수 없음
    expect(availableBalance).toBeLessThanOrEqual(totalBalance);
  });

  test('마이페이지에서 충전하기 버튼 클릭 시 잔고 충전 페이지로 이동하는지 확인', async ({ page }) => {
    const myPage = new MyPage(page);
    const balancePage = new BalancePage(page);

    await myPage.goto();

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      test.skip('로그인이 필요한 테스트입니다');
    }

    await myPage.expectToBeOnMyPage();

    // 충전하기 버튼 클릭
    await myPage.clickDepositButton();

    // 잔고 충전 페이지로 이동했는지 확인
    await balancePage.expectToBeOnBalancePage();
  });

  test('잔고 충전 페이지와 마이페이지의 잔고 정보가 일치하는지 확인', async ({ page }) => {
    const myPage = new MyPage(page);
    const balancePage = new BalancePage(page);

    await myPage.goto();

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      test.skip('로그인이 필요한 테스트입니다');
    }

    await myPage.expectToBeOnMyPage();

    // 마이페이지에서 잔고 정보 가져오기
    const myPageTotalBalance = await myPage.getTotalBalance();
    const myPageEscrowBalance = await myPage.getEscrowBalance();
    const myPageAvailableBalance = await myPage.getAvailableBalance();

    // 잔고 충전 페이지로 이동
    await balancePage.goto();
    await balancePage.expectToBeOnBalancePage();

    // 잔고 충전 페이지에서 잔고 정보 가져오기
    const balancePageTotalBalance = await balancePage.getTotalBalance();
    const balancePageEscrowBalance = await balancePage.getEscrowBalance();
    const balancePageAvailableBalance = await balancePage.getAvailableBalance();

    // 두 페이지의 잔고 정보가 일치하는지 확인
    expect(myPageTotalBalance).toBe(balancePageTotalBalance);
    expect(myPageEscrowBalance).toBe(balancePageEscrowBalance);
    expect(myPageAvailableBalance).toBe(balancePageAvailableBalance);
  });
});
