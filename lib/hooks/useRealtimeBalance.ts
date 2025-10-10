"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Real-time balance hook that subscribes to balance changes via Supabase Realtime
 * Automatically falls back to polling if Realtime connection fails
 *
 * @param userId - User ID to track balance for
 * @returns Balance information with loading and error states
 */
export function useRealtimeBalance(userId: string | undefined) {
  const [balance, setBalance] = useState<number>(0);
  const [escrowTotal, setEscrowTotal] = useState<number>(0);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [usePolling, setUsePolling] = useState<boolean>(false);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  /**
   * Fetch balance info from RPC functions
   */
  const fetchBalanceInfo = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch total balance
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      // Fetch escrow total via RPC
      const { data: escrowData, error: escrowError } = await supabase.rpc(
        "get_user_escrow_total",
        { p_user_id: userId }
      );

      if (escrowError) throw escrowError;

      // Fetch available balance via RPC
      const { data: availableData, error: availableError } = await supabase.rpc(
        "get_user_available_balance",
        { p_user_id: userId }
      );

      if (availableError) throw availableError;

      setBalance(profileData?.balance ?? 0);
      setEscrowTotal(escrowData ?? 0);
      setAvailableBalance(availableData ?? 0);
      setError(null);
    } catch (err) {
      console.error("Error fetching balance info:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  /**
   * Set up Realtime subscription
   */
  useEffect(() => {
    if (!userId || usePolling) {
      return;
    }

    // Initial fetch
    fetchBalanceInfo();

    // Set up Realtime channel
    const channel = supabase
      .channel(`balance:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log("Profile balance updated:", payload);
          // Update balance immediately
          if (payload.new && "balance" in payload.new) {
            setBalance((payload.new as { balance: number }).balance);
          }
          // Re-fetch to get updated escrow/available values
          fetchBalanceInfo();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bids",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("User bid updated:", payload);
          // Re-fetch balance info when bids change (affects escrow)
          fetchBalanceInfo();
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);

        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to balance updates");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("Realtime connection failed, switching to polling");
          setUsePolling(true);
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, usePolling, supabase, fetchBalanceInfo]);

  /**
   * Set up polling fallback
   */
  useEffect(() => {
    if (!userId || !usePolling) {
      return;
    }

    console.log("Starting polling fallback (5 second interval)");

    // Initial fetch
    fetchBalanceInfo();

    // Poll every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchBalanceInfo();
    }, 5000);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [userId, usePolling, fetchBalanceInfo]);

  return {
    balance,
    escrowTotal,
    availableBalance,
    isLoading,
    error,
    refetch: fetchBalanceInfo,
  };
}
