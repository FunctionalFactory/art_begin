import {
  getBidsByUser,
  getHighestBidForArtwork,
  getUserBidForArtwork,
  getRecentBids,
  getUserBidsWithStatus,
  getUserBidArtworks,
} from "../bids";
import { createClient } from "@/utils/supabase/server";
import type { BidWithArtwork, Database } from "@/lib/types";

// Mock the Supabase client
jest.mock("@/utils/supabase/server");

describe("Bids Queries", () => {
  // Mock data
  const mockBid: Database.Bid = {
    id: "bid-1",
    artwork_id: "artwork-1",
    user_id: "user-1",
    bid_amount: 1000,
    created_at: "2024-01-01T00:00:00Z",
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

  describe("getBidsByUser()", () => {
    it("should return all bids for a user with artwork and artist information", async () => {
      const mockData = [
        {
          ...mockBid,
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

      const result = await getBidsByUser("user-1");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockBid.id,
        artwork_id: mockBid.artwork_id,
        user_id: mockBid.user_id,
        bid_amount: mockBid.bid_amount,
      });
      expect(result[0].artwork).toBeDefined();
      expect(result[0].artwork.artist).toBeDefined();
    });

    it("should order bids by created_at descending", async () => {
      const mockData = [
        {
          ...mockBid,
          created_at: "2024-01-03T00:00:00Z",
          artwork: { ...mockArtwork, artist: mockArtist },
        },
        {
          ...mockBid,
          id: "bid-2",
          created_at: "2024-01-02T00:00:00Z",
          artwork: { ...mockArtwork, artist: mockArtist },
        },
      ];

      const orderMock = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: orderMock,
          }),
        }),
      });

      await getBidsByUser("user-1");

      expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    });

    it("should return empty array when user has no bids", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const result = await getBidsByUser("user-1");

      expect(result).toEqual([]);
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

      const result = await getBidsByUser("user-1");

      expect(result).toEqual([]);
    });

    it("should handle nested artwork array transformation", async () => {
      const mockData = [
        {
          ...mockBid,
          artwork: [
            {
              ...mockArtwork,
              artist: [mockArtist],
            },
          ],
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

      const result = await getBidsByUser("user-1");

      expect(result[0].artwork).toBeDefined();
      expect(result[0].artwork.artist).toEqual(mockArtist);
    });
  });

  describe("getHighestBidForArtwork()", () => {
    it("should return the highest bid for a specific artwork", async () => {
      const maybeSingleMock = jest.fn().mockResolvedValue({
        data: mockBid,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: maybeSingleMock,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getHighestBidForArtwork("artwork-1");

      expect(result).toEqual(mockBid);
    });

    it("should return the earliest bid when amounts are equal", async () => {
      const orderByAmountMock = jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: mockBid,
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: orderByAmountMock,
          }),
        }),
      });

      await getHighestBidForArtwork("artwork-1");

      // First order by bid_amount descending
      expect(orderByAmountMock).toHaveBeenCalledWith("bid_amount", {
        ascending: false,
      });
      // Then order by created_at ascending (earliest first)
      expect(orderByAmountMock().order).toHaveBeenCalledWith("created_at", {
        ascending: true,
      });
    });

    it("should return null when no bids exist", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getHighestBidForArtwork("artwork-1");

      expect(result).toBeNull();
    });

    it("should return null on error", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: "Database error" },
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getHighestBidForArtwork("artwork-1");

      expect(result).toBeNull();
    });
  });

  describe("getUserBidForArtwork()", () => {
    it("should return user's highest bid for a specific artwork", async () => {
      const maybeSingleMock = jest.fn().mockResolvedValue({
        data: mockBid,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: maybeSingleMock,
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getUserBidForArtwork("user-1", "artwork-1");

      expect(result).toEqual(mockBid);
    });

    it("should return null when userId is undefined", async () => {
      const result = await getUserBidForArtwork(undefined, "artwork-1");

      expect(result).toBeNull();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("should return null when userId is empty string", async () => {
      const result = await getUserBidForArtwork("", "artwork-1");

      expect(result).toBeNull();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("should return null on error", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: "Database error" },
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getUserBidForArtwork("user-1", "artwork-1");

      expect(result).toBeNull();
    });
  });

  describe("getRecentBids()", () => {
    it("should return recent bids with limit applied", async () => {
      const mockData = [
        { ...mockBid, id: "bid-1" },
        { ...mockBid, id: "bid-2" },
        { ...mockBid, id: "bid-3" },
      ];

      const limitMock = jest.fn().mockResolvedValue({
        data: mockData,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: limitMock,
            }),
          }),
        }),
      });

      const result = await getRecentBids("artwork-1", "user-1", 5);

      expect(limitMock).toHaveBeenCalledWith(5);
      expect(result).toHaveLength(3);
    });

    it("should set isCurrentUser flag correctly", async () => {
      const mockData = [
        { ...mockBid, user_id: "user-1" },
        { ...mockBid, id: "bid-2", user_id: "user-2" },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockData,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getRecentBids("artwork-1", "user-1");

      expect(result[0].isCurrentUser).toBe(true);
      expect(result[1].isCurrentUser).toBe(false);
    });

    it("should anonymize user IDs except for current user", async () => {
      const mockData = [
        { ...mockBid, user_id: "user-1" },
        { ...mockBid, id: "bid-2", user_id: "user-2" },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: mockData,
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getRecentBids("artwork-1", "user-1");

      expect(result[0].userId).toBe("user-1");
      expect(result[1].userId).toBe("user-2");
      expect(result[0].isCurrentUser).toBe(true);
      expect(result[1].isCurrentUser).toBe(false);
    });

    it("should return empty array when no bids exist", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await getRecentBids("artwork-1");

      expect(result).toEqual([]);
    });

    it("should use default limit of 10 when not specified", async () => {
      const limitMock = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: limitMock,
            }),
          }),
        }),
      });

      await getRecentBids("artwork-1");

      expect(limitMock).toHaveBeenCalledWith(10);
    });
  });

  describe("getUserBidsWithStatus()", () => {
    it("should add status to user bids (highest)", async () => {
      const mockBidWithArtwork: BidWithArtwork = {
        ...mockBid,
        artwork: {
          ...mockArtwork,
          artist: mockArtist,
        },
      };

      // Mock getBidsByUser
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [
                {
                  ...mockBid,
                  artwork: { ...mockArtwork, artist: mockArtist },
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      // Mock getHighestBidForArtwork
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: mockBid,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getUserBidsWithStatus("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("highest");
      expect(result[0].isHighestBidder).toBe(true);
    });

    it("should add status to user bids (outbid)", async () => {
      const higherBid = {
        ...mockBid,
        user_id: "user-2",
        bid_amount: 2000,
      };

      // Mock getBidsByUser
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [
                {
                  ...mockBid,
                  artwork: { ...mockArtwork, artist: mockArtist },
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      // Mock getHighestBidForArtwork
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: higherBid,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getUserBidsWithStatus("user-1");

      expect(result[0].status).toBe("outbid");
      expect(result[0].isHighestBidder).toBe(false);
    });

    it("should handle multiple bids on different artworks", async () => {
      const bid1 = {
        ...mockBid,
        id: "bid-1",
        artwork_id: "artwork-1",
        artwork: { ...mockArtwork, id: "artwork-1", artist: mockArtist },
      };
      const bid2 = {
        ...mockBid,
        id: "bid-2",
        artwork_id: "artwork-2",
        artwork: { ...mockArtwork, id: "artwork-2", artist: mockArtist },
      };

      // Mock getBidsByUser
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [bid1, bid2],
              error: null,
            }),
          }),
        }),
      });

      // Mock getHighestBidForArtwork for artwork-1 (user is highest)
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: mockBid,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      // Mock getHighestBidForArtwork for artwork-2 (user is outbid)
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: { ...mockBid, user_id: "user-2", bid_amount: 2000 },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getUserBidsWithStatus("user-1");

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe("highest");
      expect(result[1].status).toBe("outbid");
    });
  });

  describe("getUserBidArtworks()", () => {
    it("should return one bid per artwork (user's highest)", async () => {
      const bid1 = {
        ...mockBid,
        id: "bid-1",
        bid_amount: 1000,
        created_at: "2024-01-01T00:00:00Z",
        artwork: { ...mockArtwork, artist: mockArtist },
      };
      const bid2 = {
        ...mockBid,
        id: "bid-2",
        bid_amount: 1500,
        created_at: "2024-01-02T00:00:00Z",
        artwork: { ...mockArtwork, artist: mockArtist },
      };

      // Mock getBidsByUser
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [bid2, bid1], // bid2 is higher
              error: null,
            }),
          }),
        }),
      });

      // Mock getHighestBidForArtwork (returns bid2 as highest)
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: bid2,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getUserBidArtworks("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].bid_amount).toBe(1500);
    });

    it("should remove duplicate artworks", async () => {
      const bid1 = {
        ...mockBid,
        id: "bid-1",
        artwork_id: "artwork-1",
        bid_amount: 1000,
        created_at: "2024-01-01T00:00:00Z",
        artwork: { ...mockArtwork, id: "artwork-1", artist: mockArtist },
      };
      const bid2 = {
        ...mockBid,
        id: "bid-2",
        artwork_id: "artwork-1",
        bid_amount: 1500,
        created_at: "2024-01-02T00:00:00Z",
        artwork: { ...mockArtwork, id: "artwork-1", artist: mockArtist },
      };

      // Mock getBidsByUser
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [bid2, bid1],
              error: null,
            }),
          }),
        }),
      });

      // Mock getHighestBidForArtwork
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: bid2,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await getUserBidArtworks("user-1");

      expect(result).toHaveLength(1);
      expect(result[0].bid_amount).toBe(1500);
    });

    it("should sort by created_at descending (most recent first)", async () => {
      const artwork1 = { ...mockArtwork, id: "artwork-1" };
      const artwork2 = { ...mockArtwork, id: "artwork-2" };

      const bid1 = {
        ...mockBid,
        id: "bid-1",
        artwork_id: "artwork-1",
        created_at: "2024-01-01T00:00:00Z",
        artwork: { ...artwork1, artist: mockArtist },
      };
      const bid2 = {
        ...mockBid,
        id: "bid-2",
        artwork_id: "artwork-2",
        created_at: "2024-01-03T00:00:00Z",
        artwork: { ...artwork2, artist: mockArtist },
      };

      // Mock getBidsByUser
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [bid1, bid2],
              error: null,
            }),
          }),
        }),
      });

      // Mock getHighestBidForArtwork for both
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({
                      data: bid1,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({
                      data: bid2,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        });

      const result = await getUserBidArtworks("user-1");

      expect(result).toHaveLength(2);
      expect(result[0].created_at).toBe("2024-01-03T00:00:00Z");
      expect(result[1].created_at).toBe("2024-01-01T00:00:00Z");
    });

    it("should include correct status for each artwork", async () => {
      const artwork1 = { ...mockArtwork, id: "artwork-1" };
      const artwork2 = { ...mockArtwork, id: "artwork-2" };

      const bid1 = {
        ...mockBid,
        id: "bid-1",
        artwork_id: "artwork-1",
        artwork: { ...artwork1, artist: mockArtist },
      };
      const bid2 = {
        ...mockBid,
        id: "bid-2",
        artwork_id: "artwork-2",
        artwork: { ...artwork2, artist: mockArtist },
      };

      // Mock getBidsByUser
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [bid1, bid2],
              error: null,
            }),
          }),
        }),
      });

      // Mock getHighestBidForArtwork for artwork-1 (user is highest)
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({
                      data: bid1,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        })
        // Mock getHighestBidForArtwork for artwork-2 (user is outbid)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({
                      data: { ...bid2, user_id: "user-2", bid_amount: 2000 },
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        });

      const result = await getUserBidArtworks("user-1");

      expect(result).toHaveLength(2);
      expect(result.find((r) => r.artwork_id === "artwork-1")?.status).toBe(
        "highest"
      );
      expect(result.find((r) => r.artwork_id === "artwork-2")?.status).toBe(
        "outbid"
      );
    });
  });
});
