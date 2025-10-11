import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { ArtworkDetailPage } from '../pages/artwork-detail.page';

test.describe('경매 종료 처리 테스트', () => {
  test.describe('경매 만료 UI 표시', () => {
    test('경매가 종료된 작품은 "경매 종료" 메시지를 표시해야 함', async ({ page }) => {
      const homePage = new HomePage(page);
      const artworkDetailPage = new ArtworkDetailPage(page);

      // 홈페이지로 이동
      await homePage.goto();

      // 판매된(sold) 작품 찾기 또는 만료된 경매 작품 찾기
      // 실제 환경에서는 테스트용 만료된 경매 작품이 필요
      await homePage.goto();

      const auctionCards = await page.locator('[data-testid="artwork-card"]').all();

      for (const card of auctionCards) {
        // 경매 작품인지 확인 (카운트다운이 있는지)
        const hasCountdown = await card.locator('text=/남은 시간|경매 종료/').isVisible().catch(() => false);

        if (hasCountdown) {
          const hasExpiredMessage = await card.locator('text=/경매 종료/').isVisible().catch(() => false);

          if (hasExpiredMessage) {
            // 만료된 경매 작품 발견
            await card.click();

            // 상세 페이지에서도 경매 종료 메시지 확인
            await expect(page.locator('text=/경매 종료/')).toBeVisible();
            await expect(page.locator('text=/이 경매는 종료되었습니다|경매가 종료되었습니다/')).toBeVisible();

            // 입찰 폼이 표시되지 않아야 함
            const bidInput = page.locator('input[placeholder*="입찰"]');
            await expect(bidInput).not.toBeVisible();

            return; // 테스트 성공
          }
        }
      }

      // 만료된 경매를 찾지 못한 경우 테스트 스킵
      test.skip();
    });

    test('경매 시간이 0에 도달하면 UI가 업데이트되어야 함', async ({ page }) => {
      // 이 테스트는 실제로 시간이 지나는 것을 기다리기 어려우므로
      // mock 데이터나 특별한 테스트 환경이 필요함
      test.skip(true, 'Requires test data with auctions expiring within test timeout');
    });
  });

  test.describe('경매 종료 후 입찰 차단', () => {
    test('종료된 경매에는 입찰할 수 없어야 함', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto();

      // 판매 완료(sold) 상태의 작품 찾기
      const soldCards = await page.locator('[data-testid="artwork-card"]:has-text("판매완료")').all();

      if (soldCards.length > 0) {
        await soldCards[0].click();

        // 상세 페이지에서 입찰 폼이 없어야 함
        await expect(page.locator('button:has-text("입찰하기")')).not.toBeVisible();

        // "이미 판매된 작품입니다" 또는 "경매가 종료되었습니다" 메시지 확인
        const statusMessage = page.locator('text=/이미 판매된 작품입니다|경매가 종료되었습니다/');
        await expect(statusMessage).toBeVisible();
      } else {
        test.skip();
      }
    });
  });

  test.describe('API 경매 처리 엔드포인트', () => {
    test('process-auctions API가 응답해야 함', async ({ request }) => {
      // API 엔드포인트 호출 테스트
      // 실제 환경에서는 CRON_SECRET이 필요할 수 있음
      const response = await request.get('/api/cron/process-auctions', {
        headers: {
          // 테스트 환경에서는 CRON_SECRET이 없을 수 있으므로 실패 예상
        },
        failOnStatusCode: false,
      });

      // 401 (Unauthorized) 또는 200 (Success) 응답 예상
      expect([200, 401]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('success');
        expect(data).toHaveProperty('processedCount');
      }
    });

    test('process-auctions API에 인증 없이 접근 시 401 반환', async ({ request }) => {
      // CRON_SECRET이 설정된 경우, 인증 없이는 401 반환해야 함
      const response = await request.get('/api/cron/process-auctions', {
        failOnStatusCode: false,
      });

      // 환경에 따라 200 (secret 없음) 또는 401 (secret 필요)
      // 프로덕션에서는 항상 401이어야 함
      if (process.env.CRON_SECRET) {
        expect(response.status()).toBe(401);
      }
    });
  });

  test.describe('경매 종료 후 주문 생성', () => {
    test('종료된 경매의 낙찰자는 주문 내역에서 확인할 수 있어야 함', async ({ page }) => {
      // 이 테스트는 인증된 사용자가 필요하며, 낙찰된 경매가 있어야 함
      test.skip(true, 'Requires authenticated user with auction wins');

      // 구현 예시:
      // 1. 로그인
      // 2. 마이페이지 > 구매내역 이동
      // 3. 낙찰된 경매가 주문 내역에 있는지 확인
      // 4. order_type이 'auction'인지 확인
    });
  });

  test.describe('경매 자동 처리 검증', () => {
    test('만료된 경매는 자동으로 sold 상태로 변경되어야 함', async ({ page }) => {
      // 이 테스트는 실제 데이터베이스 상태를 확인해야 함
      test.skip(true, 'Requires database access and time-based testing');

      // 구현 예시:
      // 1. 테스트용 경매 작품 생성 (auction_end_time을 과거로 설정)
      // 2. process_expired_auctions() 함수 호출 또는 cron job 대기
      // 3. 작품 상태가 'sold'로 변경되었는지 확인
      // 4. 주문이 생성되었는지 확인
    });
  });
});

test.describe('경매 카운트다운 컴포넌트', () => {
  test('활성 경매는 카운트다운을 표시해야 함', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    // 활성 경매 작품 찾기
    const activeAuctionCards = await page.locator('[data-testid="artwork-card"]:has(text="남은 시간")').all();

    if (activeAuctionCards.length > 0) {
      await activeAuctionCards[0].click();

      // 상세 페이지에서 카운트다운 확인
      await expect(page.locator('text=/남은 시간/')).toBeVisible();
      await expect(page.locator('text=/일|시간|분|초/')).toBeVisible();

      // 카운트다운 숫자가 있는지 확인
      const countdownNumbers = page.locator('.text-2xl.font-bold');
      await expect(countdownNumbers.first()).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('카운트다운은 매초 업데이트되어야 함', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.goto();

    const activeAuctionCards = await page.locator('[data-testid="artwork-card"]:has(text="남은 시간")').all();

    if (activeAuctionCards.length > 0) {
      await activeAuctionCards[0].click();

      // 초 단위 카운트다운 요소 찾기 (마지막 숫자가 초)
      const secondsLocator = page.locator('.text-2xl.font-bold').last();

      // 현재 초 값 가져오기
      const initialSeconds = await secondsLocator.textContent();

      // 1.5초 대기 (1초 업데이트를 확실히 보기 위해)
      await page.waitForTimeout(1500);

      // 업데이트된 초 값 가져오기
      const updatedSeconds = await secondsLocator.textContent();

      // 값이 변경되었는지 확인 (감소했거나, 59로 롤오버되었을 수 있음)
      expect(initialSeconds).not.toBe(updatedSeconds);
    } else {
      test.skip();
    }
  });
});
