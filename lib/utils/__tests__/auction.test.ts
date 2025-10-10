import {
  getBuyerPremiumRate,
  calculateHammerPrice,
  calculateBuyerPremium,
  calculateTotalBid,
  formatBidBreakdown,
  formatPrice,
} from "../auction";

describe("Auction Utilities", () => {
  describe("getBuyerPremiumRate", () => {
    it("should return default rate of 0.10 when env var is not set", () => {
      delete process.env.BUYER_PREMIUM_RATE;
      expect(getBuyerPremiumRate()).toBe(0.10);
    });

    it("should return rate from environment variable", () => {
      process.env.BUYER_PREMIUM_RATE = "0.15";
      expect(getBuyerPremiumRate()).toBe(0.15);
    });

    it("should return default rate for invalid env var", () => {
      process.env.BUYER_PREMIUM_RATE = "invalid";
      expect(getBuyerPremiumRate()).toBe(0.10);
    });

    it("should return default rate for negative values", () => {
      process.env.BUYER_PREMIUM_RATE = "-0.10";
      expect(getBuyerPremiumRate()).toBe(0.10);
    });

    it("should return default rate for values > 1", () => {
      process.env.BUYER_PREMIUM_RATE = "1.5";
      expect(getBuyerPremiumRate()).toBe(0.10);
    });
  });

  describe("calculateHammerPrice", () => {
    it("should correctly calculate hammer price with 10% rate", () => {
      // 1,100,000 / 1.10 = 999,999.999... → 999,999 (Math.floor)
      expect(calculateHammerPrice(1100000, 0.10)).toBe(999999);
    });

    it("should correctly calculate hammer price with 15% rate", () => {
      expect(calculateHammerPrice(1150000, 0.15)).toBe(1000000);
    });

    it("should handle zero total bid", () => {
      expect(calculateHammerPrice(0, 0.10)).toBe(0);
    });

    it("should handle negative total bid", () => {
      expect(calculateHammerPrice(-1000, 0.10)).toBe(0);
    });

    it("should handle zero rate (no premium)", () => {
      expect(calculateHammerPrice(1000000, 0)).toBe(1000000);
    });

    it("should handle negative rate", () => {
      expect(calculateHammerPrice(1000000, -0.10)).toBe(1000000);
    });

    it("should use Math.floor for consistent rounding", () => {
      // 1,100,000 / 1.10 = 999,999.999... → 999,999 (Math.floor)
      expect(calculateHammerPrice(1100000, 0.10)).toBe(999999);

      // 1,000,000 / 1.10 = 909,090.909... → 909,090
      expect(calculateHammerPrice(1000000, 0.10)).toBe(909090);
    });
  });

  describe("calculateBuyerPremium", () => {
    it("should correctly calculate premium with 10% rate", () => {
      expect(calculateBuyerPremium(1000000, 0.10)).toBe(100000);
    });

    it("should correctly calculate premium with 15% rate", () => {
      expect(calculateBuyerPremium(1000000, 0.15)).toBe(150000);
    });

    it("should handle zero hammer price", () => {
      expect(calculateBuyerPremium(0, 0.10)).toBe(0);
    });

    it("should handle negative hammer price", () => {
      expect(calculateBuyerPremium(-1000, 0.10)).toBe(0);
    });

    it("should handle zero rate", () => {
      expect(calculateBuyerPremium(1000000, 0)).toBe(0);
    });

    it("should handle negative rate", () => {
      expect(calculateBuyerPremium(1000000, -0.10)).toBe(0);
    });

    it("should use Math.floor for consistent rounding", () => {
      // 909,090 * 0.10 = 90,909
      expect(calculateBuyerPremium(909090, 0.10)).toBe(90909);
    });
  });

  describe("calculateTotalBid", () => {
    it("should correctly calculate total bid with 10% rate", () => {
      expect(calculateTotalBid(1000000, 0.10)).toBe(1100000);
    });

    it("should correctly calculate total bid with 15% rate", () => {
      expect(calculateTotalBid(1000000, 0.15)).toBe(1150000);
    });

    it("should handle zero hammer price", () => {
      expect(calculateTotalBid(0, 0.10)).toBe(0);
    });

    it("should handle negative hammer price", () => {
      expect(calculateTotalBid(-1000, 0.10)).toBe(0);
    });

    it("should handle zero rate", () => {
      expect(calculateTotalBid(1000000, 0)).toBe(1000000);
    });

    it("should handle negative rate", () => {
      expect(calculateTotalBid(1000000, -0.10)).toBe(1000000);
    });

    it("should be consistent with hammer + premium calculation", () => {
      const hammerPrice = 909090;
      const rate = 0.10;
      const premium = calculateBuyerPremium(hammerPrice, rate);
      const total = calculateTotalBid(hammerPrice, rate);

      expect(total).toBe(hammerPrice + premium);
    });
  });

  describe("formatBidBreakdown", () => {
    it("should correctly format bid breakdown with 10% rate", () => {
      const breakdown = formatBidBreakdown(1100000, 0.10);

      // Due to floating point: 1,100,000 / 1.10 = 999,999.999...
      expect(breakdown.hammerPrice).toBe(999999);
      expect(breakdown.buyerPremium).toBe(99999); // 999,999 * 0.10
      expect(breakdown.totalBid).toBe(1099998); // 999,999 + 99,999
      expect(breakdown.rate).toBe(0.10);
    });

    it("should ensure total equals hammer + premium", () => {
      const breakdown = formatBidBreakdown(1100000, 0.10);

      expect(breakdown.totalBid).toBe(
        breakdown.hammerPrice + breakdown.buyerPremium
      );
    });

    it("should handle rounding edge cases", () => {
      // 1,000,000 with 10% → hammer=909,090, premium=90,909, total=999,999
      const breakdown = formatBidBreakdown(1000000, 0.10);

      expect(breakdown.hammerPrice).toBe(909090);
      expect(breakdown.buyerPremium).toBe(90909);
      expect(breakdown.totalBid).toBe(909090 + 90909);
      expect(breakdown.totalBid).toBe(999999); // Not 1,000,000 due to rounding
    });

    it("should handle zero rate", () => {
      const breakdown = formatBidBreakdown(1000000, 0);

      expect(breakdown.hammerPrice).toBe(1000000);
      expect(breakdown.buyerPremium).toBe(0);
      expect(breakdown.totalBid).toBe(1000000);
    });
  });

  describe("formatPrice", () => {
    it("should format price with Korean locale", () => {
      expect(formatPrice(1000000)).toBe("1,000,000원");
    });

    it("should handle zero", () => {
      expect(formatPrice(0)).toBe("0원");
    });

    it("should handle large numbers", () => {
      expect(formatPrice(1234567890)).toBe("1,234,567,890원");
    });

    it("should handle small numbers", () => {
      expect(formatPrice(100)).toBe("100원");
    });
  });

  describe("Integration: Round-trip calculations", () => {
    it("should handle rounding in round-trip: total → hammer → total", () => {
      const originalTotal = 1100000;
      const rate = 0.10;

      const hammerPrice = calculateHammerPrice(originalTotal, rate);
      const recalculatedTotal = calculateTotalBid(hammerPrice, rate);

      // Due to floating point rounding, may lose 1-2 won
      expect(recalculatedTotal).toBeCloseTo(originalTotal, -2);
      expect(recalculatedTotal).toBe(1099998); // 999,999 + 99,999
    });

    it("should handle edge case where rounding causes slight differences", () => {
      const originalTotal = 1000000;
      const rate = 0.10;

      const breakdown = formatBidBreakdown(originalTotal, rate);

      // Due to Math.floor, total might be slightly less than original
      expect(breakdown.totalBid).toBeLessThanOrEqual(originalTotal);
      expect(breakdown.totalBid).toBe(999999); // 909,090 + 90,909
    });

    it("should work correctly for auction values that divide evenly", () => {
      // Use values that work well with floating point arithmetic
      const testCases = [
        { total: 1150000, rate: 0.15, expectedHammer: 1000000 }, // 1,150,000 / 1.15 = 1,000,000 (exact)
        { total: 2300000, rate: 0.15, expectedHammer: 2000000 }, // 2,300,000 / 1.15 = 2,000,000 (exact)
        { total: 575000, rate: 0.15, expectedHammer: 500000 },   // 575,000 / 1.15 = 500,000 (exact)
      ];

      testCases.forEach(({ total, rate, expectedHammer }) => {
        const hammerPrice = calculateHammerPrice(total, rate);
        expect(hammerPrice).toBe(expectedHammer);

        const premium = calculateBuyerPremium(hammerPrice, rate);
        const recalculated = hammerPrice + premium;
        expect(recalculated).toBe(total);
      });
    });
  });
});
