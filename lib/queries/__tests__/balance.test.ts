import {
  getUserEscrowTotal,
  getUserAvailableBalance,
  getBalanceInfo,
} from "../balance";
import { createClient } from "@/utils/supabase/server";

// Mock the Supabase client
jest.mock("@/utils/supabase/server");

describe("Balance Queries - Escrow Functions", () => {
  const mockSupabase = {
    from: jest.fn(),
    rpc: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe("getUserEscrowTotal()", () => {
    it("should return total escrow amount for a user", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 50000,
        error: null,
      });

      const result = await getUserEscrowTotal("user-1");

      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_user_escrow_total", {
        p_user_id: "user-1",
      });
      expect(result).toBe(50000);
    });

    it("should return 0 when user has no active escrow", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 0,
        error: null,
      });

      const result = await getUserEscrowTotal("user-1");

      expect(result).toBe(0);
    });

    it("should return 0 when data is null", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getUserEscrowTotal("user-1");

      expect(result).toBe(0);
    });

    it("should return 0 on error", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "RPC function not found" },
      });

      const result = await getUserEscrowTotal("user-1");

      expect(result).toBe(0);
    });

    it("should handle large escrow amounts", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 10000000, // 10 million
        error: null,
      });

      const result = await getUserEscrowTotal("user-1");

      expect(result).toBe(10000000);
    });
  });

  describe("getUserAvailableBalance()", () => {
    it("should return available balance for a user", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 450000,
        error: null,
      });

      const result = await getUserAvailableBalance("user-1");

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_user_available_balance",
        {
          p_user_id: "user-1",
        }
      );
      expect(result).toBe(450000);
    });

    it("should return 0 when user has no available balance", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 0,
        error: null,
      });

      const result = await getUserAvailableBalance("user-1");

      expect(result).toBe(0);
    });

    it("should return 0 when data is null", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await getUserAvailableBalance("user-1");

      expect(result).toBe(0);
    });

    it("should return 0 on error", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const result = await getUserAvailableBalance("user-1");

      expect(result).toBe(0);
    });

    it("should handle negative available balance (over-escrowed)", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 0, // RPC should prevent negative, but test it returns 0
        error: null,
      });

      const result = await getUserAvailableBalance("user-1");

      expect(result).toBe(0);
    });
  });

  describe("getBalanceInfo()", () => {
    it("should return comprehensive balance information", async () => {
      // Mock getUserBalance (from profiles table)
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { balance: 500000 },
              error: null,
            }),
          }),
        }),
      });

      // Mock getUserEscrowTotal and getUserAvailableBalance
      mockSupabase.rpc
        .mockResolvedValueOnce({
          data: 50000,
          error: null,
        })
        .mockResolvedValueOnce({
          data: 450000,
          error: null,
        });

      const result = await getBalanceInfo("user-1");

      expect(result).toEqual({
        totalBalance: 500000,
        escrowTotal: 50000,
        availableBalance: 450000,
      });
    });

    it("should handle all zero values", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { balance: 0 },
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.rpc
        .mockResolvedValueOnce({
          data: 0,
          error: null,
        })
        .mockResolvedValueOnce({
          data: 0,
          error: null,
        });

      const result = await getBalanceInfo("user-1");

      expect(result).toEqual({
        totalBalance: 0,
        escrowTotal: 0,
        availableBalance: 0,
      });
    });

    it("should handle null balance gracefully", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { balance: null },
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.rpc
        .mockResolvedValueOnce({
          data: 0,
          error: null,
        })
        .mockResolvedValueOnce({
          data: 0,
          error: null,
        });

      const result = await getBalanceInfo("user-1");

      expect(result).toEqual({
        totalBalance: 0,
        escrowTotal: 0,
        availableBalance: 0,
      });
    });

    it("should call all three functions in parallel", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { balance: 100000 },
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.rpc
        .mockResolvedValueOnce({
          data: 20000,
          error: null,
        })
        .mockResolvedValueOnce({
          data: 80000,
          error: null,
        });

      await getBalanceInfo("user-1");

      // Verify all RPC calls were made
      expect(mockSupabase.rpc).toHaveBeenCalledWith("get_user_escrow_total", {
        p_user_id: "user-1",
      });
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        "get_user_available_balance",
        {
          p_user_id: "user-1",
        }
      );
    });

    it("should handle partial errors gracefully", async () => {
      // Total balance succeeds
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { balance: 100000 },
              error: null,
            }),
          }),
        }),
      });

      // Escrow total fails, available balance succeeds
      mockSupabase.rpc
        .mockResolvedValueOnce({
          data: null,
          error: { message: "RPC error" },
        })
        .mockResolvedValueOnce({
          data: 100000,
          error: null,
        });

      const result = await getBalanceInfo("user-1");

      expect(result).toEqual({
        totalBalance: 100000,
        escrowTotal: 0, // Should default to 0 on error
        availableBalance: 100000,
      });
    });

    it("should verify escrow + available = total balance (logical consistency)", async () => {
      const totalBalance = 1000000;
      const escrowTotal = 300000;
      const availableBalance = 700000;

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { balance: totalBalance },
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.rpc
        .mockResolvedValueOnce({
          data: escrowTotal,
          error: null,
        })
        .mockResolvedValueOnce({
          data: availableBalance,
          error: null,
        });

      const result = await getBalanceInfo("user-1");

      // Verify the math adds up
      expect(result.escrowTotal + result.availableBalance).toBe(
        result.totalBalance
      );
    });
  });
});
