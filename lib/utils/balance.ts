/**
 * Balance-related utility functions
 */

/**
 * Get preset deposit amounts
 * @returns Array of preset amounts in KRW
 */
export function getPresetDepositAmounts(): number[] {
  return [100000, 500000, 1000000, 5000000];
}

/**
 * Validate deposit amount
 * @param amount - Amount to validate
 * @returns Object with valid flag and error message if invalid
 */
export function validateDepositAmount(amount: number): {
  valid: boolean;
  error?: string;
} {
  if (!amount || amount <= 0) {
    return {
      valid: false,
      error: "충전 금액은 0보다 커야 합니다.",
    };
  }

  if (amount > 100000000) {
    return {
      valid: false,
      error: "1회 최대 충전 금액은 1억원입니다.",
    };
  }

  if (amount < 1000) {
    return {
      valid: false,
      error: "최소 충전 금액은 1,000원입니다.",
    };
  }

  return { valid: true };
}

/**
 * Format balance with Korean Won currency
 * @param balance - Balance amount
 * @returns Formatted string
 */
export function formatBalance(balance: number): string {
  return new Intl.NumberFormat("ko-KR").format(balance) + " 원";
}

/**
 * Get transaction type label in Korean
 * @param type - Transaction type
 * @returns Korean label
 */
export function getTransactionTypeLabel(
  type: "deposit" | "bid" | "refund"
): string {
  switch (type) {
    case "deposit":
      return "충전";
    case "bid":
      return "입찰";
    case "refund":
      return "환불";
    default:
      return type;
  }
}
