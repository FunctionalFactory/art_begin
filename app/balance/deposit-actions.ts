"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { validateDepositAmount } from "@/lib/utils/balance";

interface DepositResult {
  success: boolean;
  message?: string;
  error?: string;
  balance?: number;
  amount?: number;
}

/**
 * Deposit balance into user's account
 * @param amount - Amount to deposit (in KRW)
 * @param description - Optional description for the transaction
 * @returns Result object with success status and new balance
 */
export async function depositBalance(
  amount: number,
  description?: string
): Promise<DepositResult> {
  const supabase = await createClient();

  // 1. Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "로그인이 필요합니다.",
    };
  }

  // 2. Validate amount
  if (!amount || amount <= 0) {
    return {
      success: false,
      error: "충전 금액은 0보다 커야 합니다.",
    };
  }

  if (amount > 100000000) {
    return {
      success: false,
      error: "1회 최대 충전 금액은 1억원입니다.",
    };
  }

  // Ensure amount is an integer (no decimals)
  const intAmount = Math.floor(amount);

  // 3. Call PostgreSQL function via RPC
  const { data, error } = await supabase.rpc("deposit_balance", {
    p_amount: intAmount,
    p_description: description || "잔고 충전",
  });

  if (error) {
    console.error("Deposit error:", error);
    return {
      success: false,
      error: "충전 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }

  // 4. Check if RPC returned an error
  if (data && !data.success) {
    return {
      success: false,
      error: data.error || "충전에 실패했습니다.",
    };
  }

  // 5. Revalidate relevant paths
  revalidatePath("/balance");
  revalidatePath("/balance/history");
  revalidatePath("/my-page");

  return {
    success: true,
    message: "충전이 완료되었습니다!",
    balance: data?.balance,
    amount: intAmount,
  };
}
