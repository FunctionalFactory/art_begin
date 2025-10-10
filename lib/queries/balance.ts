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
