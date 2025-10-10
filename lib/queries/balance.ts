import { createClient } from "@/utils/supabase/server";
import { Database } from "@/lib/types";

/**
 * Get user's current balance
 * @param userId - User's ID
 * @returns User's balance or null if not found
 */
export async function getUserBalance(userId: string): Promise<number | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user balance:", error);
    return null;
  }

  return data?.balance ?? 0;
}

/**
 * Get user's balance transactions
 * @param userId - User's ID
 * @param limit - Maximum number of transactions to fetch (default: 50)
 * @returns Array of balance transactions
 */
export async function getBalanceTransactions(
  userId: string,
  limit: number = 50
): Promise<Database.BalanceTransaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("balance_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching balance transactions:", error);
    return [];
  }

  return data || [];
}

/**
 * Get current user's balance (authenticated user)
 * @returns Current user's balance or null
 */
export async function getCurrentUserBalance(): Promise<number | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  return getUserBalance(user.id);
}

/**
 * Get current user's balance transactions (authenticated user)
 * @param limit - Maximum number of transactions to fetch
 * @returns Array of balance transactions
 */
export async function getCurrentUserTransactions(
  limit: number = 50
): Promise<Database.BalanceTransaction[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

  return getBalanceTransactions(user.id, limit);
}

/**
 * Get balance transaction by ID
 * @param transactionId - Transaction ID
 * @returns Balance transaction or null
 */
export async function getBalanceTransactionById(
  transactionId: string
): Promise<Database.BalanceTransaction | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("balance_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (error) {
    console.error("Error fetching balance transaction:", error);
    return null;
  }

  return data;
}

/**
 * Get balance transactions by type
 * @param userId - User's ID
 * @param type - Transaction type ('deposit' | 'bid' | 'refund')
 * @param limit - Maximum number of transactions to fetch
 * @returns Array of balance transactions
 */
export async function getBalanceTransactionsByType(
  userId: string,
  type: "deposit" | "bid" | "refund",
  limit: number = 50
): Promise<Database.BalanceTransaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("balance_transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("transaction_type", type)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching balance transactions by type:", error);
    return [];
  }

  return data || [];
}

/**
 * Get user's total escrow amount (locked in active bids)
 * @param userId - User's ID
 * @returns Total escrow amount
 */
export async function getUserEscrowTotal(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_user_escrow_total", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error fetching user escrow total:", error);
    return 0;
  }

  return data ?? 0;
}

/**
 * Get user's available balance (total balance - escrow)
 * @param userId - User's ID
 * @returns Available balance
 */
export async function getUserAvailableBalance(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_user_available_balance", {
    p_user_id: userId,
  });

  if (error) {
    console.error("Error fetching user available balance:", error);
    return 0;
  }

  return data ?? 0;
}

/**
 * Get comprehensive balance info (total, escrow, available)
 * @param userId - User's ID
 * @returns Object containing totalBalance, escrowTotal, and availableBalance
 */
export async function getBalanceInfo(userId: string): Promise<{
  totalBalance: number;
  escrowTotal: number;
  availableBalance: number;
}> {
  const [totalBalance, escrowTotal, availableBalance] = await Promise.all([
    getUserBalance(userId),
    getUserEscrowTotal(userId),
    getUserAvailableBalance(userId),
  ]);

  return {
    totalBalance: totalBalance ?? 0,
    escrowTotal,
    availableBalance,
  };
}
