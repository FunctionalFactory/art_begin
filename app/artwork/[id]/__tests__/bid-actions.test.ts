import { placeBid } from '../bid-actions';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/utils/supabase/server');
jest.mock('next/cache');

// Constants from bid-actions.ts
const MIN_BID_INCREMENT = 10000;

describe('placeBid', () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  describe('Authentication', () => {
    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      // Act
      const result = await placeBid('artwork-123', 50000);

      // Assert
      expect(result).toEqual({
        success: false,
        error: '로그인이 필요합니다.',
      });
    });

    it('should return error when auth error occurs', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth error' },
      });

      // Act
      const result = await placeBid('artwork-123', 50000);

      // Assert
      expect(result).toEqual({
        success: false,
        error: '로그인이 필요합니다.',
      });
    });
  });

  describe('Artwork validation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should return error when artwork does not exist', async () => {
      // Arrange
      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      };

      mockSupabase.from.mockReturnValue(mockArtworkSelect);

      // Act
      const result = await placeBid('non-existent', 50000);

      // Assert
      expect(result).toEqual({
        success: false,
        error: '작품을 찾을 수 없습니다.',
      });
    });

    it('should return error when artwork is not auction type', async () => {
      // Arrange
      const mockArtwork = {
        id: 'artwork-123',
        sale_type: 'fixed',
        current_price: 100000,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockArtworkSelect);

      // Act
      const result = await placeBid('artwork-123', 50000);

      // Assert
      expect(result).toEqual({
        success: false,
        error: '경매 작품이 아닙니다.',
      });
    });

    it('should return error when auction has ended', async () => {
      // Arrange
      const pastDate = new Date('2024-01-01T00:00:00Z');
      const mockArtwork = {
        id: 'artwork-123',
        sale_type: 'auction',
        auction_end_time: pastDate.toISOString(),
        current_price: 100000,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockArtworkSelect);

      // Act
      const result = await placeBid('artwork-123', 150000);

      // Assert
      expect(result).toEqual({
        success: false,
        error: '경매가 종료되었습니다.',
      });
    });
  });

  describe('Bid amount validation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should reject bid below minimum increment (MIN_BID_INCREMENT = 10000)', async () => {
      // Arrange
      const currentPrice = 100000;
      const invalidBidAmount = currentPrice + 5000; // Below MIN_BID_INCREMENT

      const futureDate = new Date(Date.now() + 86400000); // +1 day
      const mockArtwork = {
        id: 'artwork-123',
        sale_type: 'auction',
        auction_end_time: futureDate.toISOString(),
        current_price: currentPrice,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockArtworkSelect);

      // Act
      const result = await placeBid('artwork-123', invalidBidAmount);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('10,000원 이상 높아야 합니다');
      expect(result.minBidAmount).toBe(currentPrice + MIN_BID_INCREMENT);
      expect(result.currentPrice).toBe(currentPrice);
    });

    it('should accept bid meeting minimum increment requirement', async () => {
      // Arrange
      const currentPrice = 100000;
      const validBidAmount = currentPrice + MIN_BID_INCREMENT;

      const futureDate = new Date(Date.now() + 86400000);
      const mockArtwork = {
        id: 'artwork-123',
        sale_type: 'auction',
        auction_end_time: futureDate.toISOString(),
        current_price: currentPrice,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockBidInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockUpdatedArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            current_price: validBidAmount,
            bid_count: 1,
            highest_bidder: 'user-123',
          },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockBidInsert)
        .mockReturnValueOnce(mockUpdatedArtworkSelect);

      // Act
      const result = await placeBid('artwork-123', validBidAmount);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('입찰이 완료되었습니다!');
    });
  });

  describe('Successful bid placement', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should place bid successfully with valid data', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const currentPrice = 100000;
      const bidAmount = currentPrice + MIN_BID_INCREMENT;

      const futureDate = new Date(Date.now() + 86400000);
      const mockArtwork = {
        id: artworkId,
        sale_type: 'auction',
        auction_end_time: futureDate.toISOString(),
        current_price: currentPrice,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockBidInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockUpdatedArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            current_price: bidAmount,
            bid_count: 5,
            highest_bidder: 'user-123',
          },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockBidInsert)
        .mockReturnValueOnce(mockUpdatedArtworkSelect);

      // Act
      const result = await placeBid(artworkId, bidAmount);

      // Assert
      expect(result).toEqual({
        success: true,
        message: '입찰이 완료되었습니다!',
        currentPrice: bidAmount,
        bidCount: 5,
        isHighestBidder: true,
      });
    });

    it('should update current_price after successful bid', async () => {
      // Arrange
      const currentPrice = 100000;
      const bidAmount = 150000;

      const futureDate = new Date(Date.now() + 86400000);
      const mockArtwork = {
        id: 'artwork-123',
        sale_type: 'auction',
        auction_end_time: futureDate.toISOString(),
        current_price: currentPrice,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockBidInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockUpdatedArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            current_price: bidAmount,
            bid_count: 1,
            highest_bidder: 'user-123',
          },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockBidInsert)
        .mockReturnValueOnce(mockUpdatedArtworkSelect);

      // Act
      const result = await placeBid('artwork-123', bidAmount);

      // Assert
      expect(result.currentPrice).toBe(bidAmount);
    });

    it('should update bid_count after successful bid', async () => {
      // Arrange
      const currentPrice = 100000;
      const bidAmount = currentPrice + MIN_BID_INCREMENT;

      const futureDate = new Date(Date.now() + 86400000);
      const mockArtwork = {
        id: 'artwork-123',
        sale_type: 'auction',
        auction_end_time: futureDate.toISOString(),
        current_price: currentPrice,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockBidInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockUpdatedArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            current_price: bidAmount,
            bid_count: 3,
            highest_bidder: 'user-123',
          },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockBidInsert)
        .mockReturnValueOnce(mockUpdatedArtworkSelect);

      // Act
      const result = await placeBid('artwork-123', bidAmount);

      // Assert
      expect(result.bidCount).toBe(3);
    });

    it('should update highest_bidder to current user', async () => {
      // Arrange
      const userId = 'user-123';
      const currentPrice = 100000;
      const bidAmount = currentPrice + MIN_BID_INCREMENT;

      const futureDate = new Date(Date.now() + 86400000);
      const mockArtwork = {
        id: 'artwork-123',
        sale_type: 'auction',
        auction_end_time: futureDate.toISOString(),
        current_price: currentPrice,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockBidInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockUpdatedArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            current_price: bidAmount,
            bid_count: 1,
            highest_bidder: userId,
          },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockBidInsert)
        .mockReturnValueOnce(mockUpdatedArtworkSelect);

      // Act
      const result = await placeBid('artwork-123', bidAmount);

      // Assert
      expect(result.isHighestBidder).toBe(true);
    });

    it('should call revalidatePath after successful bid', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const currentPrice = 100000;
      const bidAmount = currentPrice + MIN_BID_INCREMENT;

      const futureDate = new Date(Date.now() + 86400000);
      const mockArtwork = {
        id: artworkId,
        sale_type: 'auction',
        auction_end_time: futureDate.toISOString(),
        current_price: currentPrice,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockBidInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockUpdatedArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            current_price: bidAmount,
            bid_count: 1,
            highest_bidder: 'user-123',
          },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockBidInsert)
        .mockReturnValueOnce(mockUpdatedArtworkSelect);

      // Act
      await placeBid(artworkId, bidAmount);

      // Assert
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(revalidatePath).toHaveBeenCalledWith('/explore');
      expect(revalidatePath).toHaveBeenCalledWith(`/artwork/${artworkId}`);
      expect(revalidatePath).toHaveBeenCalledWith('/my-page');
      expect(revalidatePath).toHaveBeenCalledTimes(4);
    });
  });

  describe('Database error handling', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should handle bid insertion error', async () => {
      // Arrange
      const currentPrice = 100000;
      const bidAmount = currentPrice + MIN_BID_INCREMENT;

      const futureDate = new Date(Date.now() + 86400000);
      const mockArtwork = {
        id: 'artwork-123',
        sale_type: 'auction',
        auction_end_time: futureDate.toISOString(),
        current_price: currentPrice,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockBidInsert = {
        insert: jest.fn().mockResolvedValue({
          error: { message: 'Database error' },
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockBidInsert);

      // Act
      const result = await placeBid('artwork-123', bidAmount);

      // Assert
      expect(result).toEqual({
        success: false,
        error: '입찰 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
      });
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
    });

    it('should handle artwork with no current price (starting bid)', async () => {
      // Arrange
      const bidAmount = MIN_BID_INCREMENT;

      const futureDate = new Date(Date.now() + 86400000);
      const mockArtwork = {
        id: 'artwork-123',
        sale_type: 'auction',
        auction_end_time: futureDate.toISOString(),
        current_price: null,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockBidInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockUpdatedArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            current_price: bidAmount,
            bid_count: 1,
            highest_bidder: 'user-123',
          },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockBidInsert)
        .mockReturnValueOnce(mockUpdatedArtworkSelect);

      // Act
      const result = await placeBid('artwork-123', bidAmount);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should handle auction without end time (ongoing auction)', async () => {
      // Arrange
      const currentPrice = 100000;
      const bidAmount = currentPrice + MIN_BID_INCREMENT;

      const mockArtwork = {
        id: 'artwork-123',
        sale_type: 'auction',
        auction_end_time: null,
        current_price: currentPrice,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockBidInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockUpdatedArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            current_price: bidAmount,
            bid_count: 1,
            highest_bidder: 'user-123',
          },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockBidInsert)
        .mockReturnValueOnce(mockUpdatedArtworkSelect);

      // Act
      const result = await placeBid('artwork-123', bidAmount);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should handle large bid amounts', async () => {
      // Arrange
      const currentPrice = 10000000;
      const bidAmount = currentPrice + MIN_BID_INCREMENT;

      const futureDate = new Date(Date.now() + 86400000);
      const mockArtwork = {
        id: 'artwork-123',
        sale_type: 'auction',
        auction_end_time: futureDate.toISOString(),
        current_price: currentPrice,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockBidInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockUpdatedArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            current_price: bidAmount,
            bid_count: 1,
            highest_bidder: 'user-123',
          },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockBidInsert)
        .mockReturnValueOnce(mockUpdatedArtworkSelect);

      // Act
      const result = await placeBid('artwork-123', bidAmount);

      // Assert
      expect(result.success).toBe(true);
      expect(result.currentPrice).toBe(bidAmount);
    });

    it('should create bid record with correct data', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const userId = 'user-123';
      const currentPrice = 100000;
      const bidAmount = currentPrice + MIN_BID_INCREMENT;

      const futureDate = new Date(Date.now() + 86400000);
      const mockArtwork = {
        id: artworkId,
        sale_type: 'auction',
        auction_end_time: futureDate.toISOString(),
        current_price: currentPrice,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockBidInsert = {
        insert: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      const mockUpdatedArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            current_price: bidAmount,
            bid_count: 1,
            highest_bidder: userId,
          },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockBidInsert)
        .mockReturnValueOnce(mockUpdatedArtworkSelect);

      // Act
      await placeBid(artworkId, bidAmount);

      // Assert
      expect(mockBidInsert.insert).toHaveBeenCalledWith({
        artwork_id: artworkId,
        user_id: userId,
        bid_amount: bidAmount,
      });
    });
  });
});
