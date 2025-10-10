/**
 * Auction utility functions for calculating buyer's premium and bid amounts
 */

export interface BidBreakdown {
  totalBid: number; // Total amount including premium (경매가)
  hammerPrice: number; // Artwork price without premium (작품가)
  buyerPremium: number; // Buyer's premium amount (수수료)
  rate: number; // Buyer's premium rate (수수료율, e.g., 0.10 = 10%)
}

/**
 * Get buyer's premium rate from environment variable
 * @returns Buyer's premium rate (e.g., 0.10 for 10%)
 */
export function getBuyerPremiumRate(): number {
  const rate = parseFloat(process.env.BUYER_PREMIUM_RATE || "0.10");
  if (isNaN(rate) || rate < 0 || rate > 1) {
    console.warn(
      `Invalid BUYER_PREMIUM_RATE: ${process.env.BUYER_PREMIUM_RATE}. Using default 0.10`
    );
    return 0.10;
  }
  return rate;
}

/**
 * Calculate hammer price (artwork price) from total bid amount
 * Formula: hammerPrice = totalBid / (1 + rate)
 *
 * @param totalBid - Total bid amount including premium (경매가)
 * @param rate - Buyer's premium rate (수수료율)
 * @returns Hammer price (작품가) - floored to integer
 *
 * @example
 * calculateHammerPrice(1100000, 0.10) // Returns 1000000
 */
export function calculateHammerPrice(totalBid: number, rate: number): number {
  if (totalBid <= 0) {
    return 0;
  }
  if (rate < 0) {
    return totalBid;
  }

  // Use Math.floor for consistent rounding with Korean Won (integer only)
  return Math.floor(totalBid / (1 + rate));
}

/**
 * Calculate buyer's premium from hammer price
 * Formula: buyerPremium = hammerPrice * rate
 *
 * @param hammerPrice - Hammer price (작품가)
 * @param rate - Buyer's premium rate (수수료율)
 * @returns Buyer's premium amount (수수료) - floored to integer
 *
 * @example
 * calculateBuyerPremium(1000000, 0.10) // Returns 100000
 */
export function calculateBuyerPremium(
  hammerPrice: number,
  rate: number
): number {
  if (hammerPrice <= 0 || rate < 0) {
    return 0;
  }

  return Math.floor(hammerPrice * rate);
}

/**
 * Calculate total bid amount from hammer price
 * Formula: totalBid = hammerPrice + (hammerPrice * rate)
 *
 * @param hammerPrice - Hammer price (작품가)
 * @param rate - Buyer's premium rate (수수료율)
 * @returns Total bid amount (경매가) - floored to integer
 *
 * @example
 * calculateTotalBid(1000000, 0.10) // Returns 1100000
 */
export function calculateTotalBid(hammerPrice: number, rate: number): number {
  if (hammerPrice <= 0) {
    return 0;
  }
  if (rate < 0) {
    return hammerPrice;
  }

  const premium = calculateBuyerPremium(hammerPrice, rate);
  return hammerPrice + premium;
}

/**
 * Format bid amount breakdown for UI display
 * Breaks down total bid into hammer price and buyer's premium
 *
 * @param totalBid - Total bid amount (경매가)
 * @param rate - Buyer's premium rate (수수료율)
 * @returns BidBreakdown object with all calculated values
 *
 * @example
 * formatBidBreakdown(1100000, 0.10)
 * // Returns: {
 * //   totalBid: 1100000,
 * //   hammerPrice: 1000000,
 * //   buyerPremium: 100000,
 * //   rate: 0.10
 * // }
 */
export function formatBidBreakdown(
  totalBid: number,
  rate: number
): BidBreakdown {
  const hammerPrice = calculateHammerPrice(totalBid, rate);
  const buyerPremium = calculateBuyerPremium(hammerPrice, rate);

  // Ensure total is consistent (recalculate to avoid rounding errors)
  const actualTotal = hammerPrice + buyerPremium;

  return {
    totalBid: actualTotal,
    hammerPrice,
    buyerPremium,
    rate,
  };
}

/**
 * Format price for display in Korean Won
 * @param price - Price amount
 * @returns Formatted price string (e.g., "1,000,000원")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR").format(price) + "원";
}
