import {
  getUserOrders,
  getArtistSales,
  createOrder,
  updateOrderStatus,
  processExpiredAuctions,
} from "../orders";
import { createClient } from "@/utils/supabase/server";
import type { Database, OrderWithArtwork } from "@/lib/types";

// Mock the Supabase client
jest.mock("@/utils/supabase/server");

describe("Orders Queries", () => {
  // Mock data
  const mockOrder: Database.Order = {
    id: "order-1",
    user_id: "user-1",
    artwork_id: "artwork-1",
    order_type: "purchase",
    price: 1000,
    status: "pending",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockArtwork = {
    id: "artwork-1",
    artist_id: "artist-1",
    title: "Test Artwork",
    description: "Test Description",
    image_url: "https://example.com/image.jpg",
    images: null,
    category: "painting",
    current_price: 1000,
    fixed_price: null,
    sale_type: "auction" as const,
    auction_end_time: "2024-12-31T23:59:59Z",
    highest_bidder: "user-1",
    bid_count: 5,
    views: 100,
    likes: 10,
    status: "active" as const,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockArtist = {
    id: "artist-1",
    user_id: "user-artist-1",
    name: "Test Artist",
    username: "test_artist",
    bio: "Test Bio",
    profile_image: "https://example.com/profile.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockSupabase = {
    from: jest.fn(),
    auth: {
      admin: {
        getUserById: jest.fn(),
      },
    },
    rpc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe("getUserOrders()", () => {
    it("should return all orders for a user with artwork and artist information", async () => {
      const mockData: OrderWithArtwork[] = [
        {
          ...mockOrder,
          artwork: {
            ...mockArtwork,
            artist: mockArtist,
          },
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockData,
              error: null,
            }),
          }),
        }),
      });

      const result = await getUserOrders("user-1");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockOrder.id,
        user_id: mockOrder.user_id,
        artwork_id: mockOrder.artwork_id,
      });
      expect(result[0].artwork).toBeDefined();
      expect(result[0].artwork.artist).toBeDefined();
    });

    it("should order orders by created_at descending", async () => {
      const orderMock = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: orderMock,
          }),
        }),
      });

      await getUserOrders("user-1");

      expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    });

    it("should return empty array on error", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      const result = await getUserOrders("user-1");

      expect(result).toEqual([]);
    });
  });

  describe("getArtistSales()", () => {
    it("should return all sales for an artist with buyer_email", async () => {
      const mockArtworks = [{ id: "artwork-1" }];
      const mockOrders: OrderWithArtwork[] = [
        {
          ...mockOrder,
          artwork: {
            ...mockArtwork,
            artist: mockArtist,
          },
        },
      ];

      // Mock artworks query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockArtworks,
            error: null,
          }),
        }),
      });

      // Mock orders query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockOrders,
              error: null,
            }),
          }),
        }),
      });

      // Mock user query
      mockSupabase.auth.admin.getUserById.mockResolvedValue({
        data: {
          user: {
            email: "buyer@example.com",
          },
        },
        error: null,
      });

      const result = await getArtistSales("artist-1");

      expect(result).toHaveLength(1);
      expect(result[0].buyer_email).toBe("buyer@example.com");
    });

    it("should return empty array when artist has no artworks", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const result = await getArtistSales("artist-1");

      expect(result).toEqual([]);
    });

    it("should return empty array on artworks query error", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: "Database error" },
          }),
        }),
      });

      const result = await getArtistSales("artist-1");

      expect(result).toEqual([]);
    });

    it("should return empty array on orders query error", async () => {
      const mockArtworks = [{ id: "artwork-1" }];

      // Mock artworks query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockArtworks,
            error: null,
          }),
        }),
      });

      // Mock orders query with error
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      const result = await getArtistSales("artist-1");

      expect(result).toEqual([]);
    });

    it("should handle multiple orders with Promise.all", async () => {
      const mockArtworks = [{ id: "artwork-1" }];
      const mockOrders: OrderWithArtwork[] = [
        {
          ...mockOrder,
          id: "order-1",
          user_id: "user-1",
          artwork: { ...mockArtwork, artist: mockArtist },
        },
        {
          ...mockOrder,
          id: "order-2",
          user_id: "user-2",
          artwork: { ...mockArtwork, artist: mockArtist },
        },
      ];

      // Mock artworks query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockArtworks,
            error: null,
          }),
        }),
      });

      // Mock orders query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockOrders,
              error: null,
            }),
          }),
        }),
      });

      // Mock user queries
      mockSupabase.auth.admin.getUserById
        .mockResolvedValueOnce({
          data: {
            user: { email: "buyer1@example.com" },
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: {
            user: { email: "buyer2@example.com" },
          },
          error: null,
        });

      const result = await getArtistSales("artist-1");

      expect(result).toHaveLength(2);
      expect(result[0].buyer_email).toBe("buyer1@example.com");
      expect(result[1].buyer_email).toBe("buyer2@example.com");
    });
  });

  describe("createOrder()", () => {
    it("should create a purchase type order successfully", async () => {
      const orderData = {
        userId: "user-1",
        artworkId: "artwork-1",
        orderType: "purchase" as const,
        price: 1000,
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockOrder,
              error: null,
            }),
          }),
        }),
      });

      const result = await createOrder(orderData);

      expect(result).toEqual(mockOrder);
      expect(mockSupabase.from).toHaveBeenCalledWith("orders");
    });

    it("should create an auction type order successfully", async () => {
      const orderData = {
        userId: "user-1",
        artworkId: "artwork-1",
        orderType: "auction" as const,
        price: 2000,
      };

      const auctionOrder = {
        ...mockOrder,
        order_type: "auction" as const,
        price: 2000,
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: auctionOrder,
              error: null,
            }),
          }),
        }),
      });

      const result = await createOrder(orderData);

      expect(result).toEqual(auctionOrder);
    });

    it("should set default status to pending", async () => {
      const orderData = {
        userId: "user-1",
        artworkId: "artwork-1",
        orderType: "purchase" as const,
        price: 1000,
      };

      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockOrder,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        insert: insertMock,
      });

      await createOrder(orderData);

      expect(insertMock).toHaveBeenCalledWith({
        user_id: orderData.userId,
        artwork_id: orderData.artworkId,
        order_type: orderData.orderType,
        price: orderData.price,
        status: "pending",
      });
    });

    it("should return null on database error", async () => {
      const orderData = {
        userId: "user-1",
        artworkId: "artwork-1",
        orderType: "purchase" as const,
        price: 1000,
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      const result = await createOrder(orderData);

      expect(result).toBeNull();
    });
  });

  describe("updateOrderStatus()", () => {
    it("should update order status successfully", async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      const result = await updateOrderStatus("order-1", "preparing");

      expect(result).toBe(true);
    });

    it("should accept all valid status values", async () => {
      const validStatuses: Database.Order["status"][] = [
        "pending",
        "preparing",
        "shipping",
        "delivered",
        "completed",
      ];

      for (const status of validStatuses) {
        mockSupabase.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
        });

        const result = await updateOrderStatus("order-1", status);

        expect(result).toBe(true);
      }
    });

    it("should return false when order does not exist", async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: "Order not found", code: "PGRST116" },
          }),
        }),
      });

      const result = await updateOrderStatus("non-existent-order", "preparing");

      expect(result).toBe(false);
    });

    it("should return false on database error", async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: { message: "Database error" },
          }),
        }),
      });

      const result = await updateOrderStatus("order-1", "preparing");

      expect(result).toBe(false);
    });
  });

  describe("processExpiredAuctions()", () => {
    it("should call RPC function successfully and return processed count", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 5,
        error: null,
      });

      const result = await processExpiredAuctions();

      expect(result).toBe(5);
      expect(mockSupabase.rpc).toHaveBeenCalledWith("process_expired_auctions");
    });

    it("should return 0 when no auctions are processed", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 0,
        error: null,
      });

      const result = await processExpiredAuctions();

      expect(result).toBe(0);
    });

    it("should return 0 on RPC error", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "RPC function error" },
      });

      const result = await processExpiredAuctions();

      expect(result).toBe(0);
    });

    it("should return 0 when data is null", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await processExpiredAuctions();

      expect(result).toBe(0);
    });
  });
});
