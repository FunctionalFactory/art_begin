import { purchaseArtwork } from '../purchase-actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/utils/supabase/server');
jest.mock('next/navigation');
jest.mock('next/cache');

describe('purchaseArtwork', () => {
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
    it('should redirect to login when user is not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      // Act
      try {
        await purchaseArtwork('artwork-123');
      } catch (error) {
        // redirect throws in tests
      }

      // Assert
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('Artwork validation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
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
      const result = await purchaseArtwork('non-existent');

      // Assert
      expect(result).toEqual({
        success: false,
        message: '작품을 찾을 수 없습니다.',
      });
    });

    it('should reject purchase of already sold artwork', async () => {
      // Arrange
      const mockArtwork = {
        id: 'artwork-123',
        status: 'sold',
        sale_type: 'fixed',
        fixed_price: 100000,
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
      const result = await purchaseArtwork('artwork-123');

      // Assert
      expect(result).toEqual({
        success: false,
        message: '이미 판매된 작품입니다.',
      });
    });

    it('should reject purchase of auction type artwork', async () => {
      // Arrange
      const mockArtwork = {
        id: 'artwork-123',
        status: 'active',
        sale_type: 'auction',
        fixed_price: 100000,
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
      const result = await purchaseArtwork('artwork-123');

      // Assert
      expect(result).toEqual({
        success: false,
        message: '즉시 구매가 불가능한 작품입니다. 경매에 입찰해주세요.',
      });
    });

    it('should reject artwork without fixed_price', async () => {
      // Arrange
      const mockArtwork = {
        id: 'artwork-123',
        status: 'active',
        sale_type: 'fixed',
        fixed_price: null,
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
      const result = await purchaseArtwork('artwork-123');

      // Assert
      expect(result).toEqual({
        success: false,
        message: '가격 정보가 올바르지 않습니다.',
      });
    });

    it('should reject artwork with zero or negative price', async () => {
      // Arrange
      const mockArtwork = {
        id: 'artwork-123',
        status: 'active',
        sale_type: 'fixed',
        fixed_price: 0,
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
      const result = await purchaseArtwork('artwork-123');

      // Assert
      expect(result).toEqual({
        success: false,
        message: '가격 정보가 올바르지 않습니다.',
      });
    });
  });

  describe('Successful purchase', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });
    });

    it('should purchase artwork successfully', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const mockArtwork = {
        id: artworkId,
        status: 'active',
        sale_type: 'fixed',
        fixed_price: 100000,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockArtworkUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      // Chain eq() calls: first returns this, second returns promise
      mockArtworkUpdate.eq
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockResolvedValueOnce({ error: null });

      const mockOrderInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'order-123' },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockReturnValueOnce(mockOrderInsert);

      // Act
      const result = await purchaseArtwork(artworkId);

      // Assert
      expect(result).toEqual({
        success: true,
        message: '구매가 완료되었습니다! 주문 내역에서 확인하세요.',
        orderId: 'order-123',
      });
    });

    it('should update artwork status to sold', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const mockArtwork = {
        id: artworkId,
        status: 'active',
        sale_type: 'fixed',
        fixed_price: 100000,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockArtworkUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      mockArtworkUpdate.eq
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockResolvedValueOnce({ error: null });

      const mockOrderInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'order-123' },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockReturnValueOnce(mockOrderInsert);

      // Act
      await purchaseArtwork(artworkId);

      // Assert
      expect(mockArtworkUpdate.update).toHaveBeenCalledWith({ status: 'sold' });
      const eqCalls = mockArtworkUpdate.eq.mock.calls;
      expect(eqCalls[0]).toEqual(['id', artworkId]);
      expect(eqCalls[1]).toEqual(['status', 'active']);
    });

    it('should create order with order_type: purchase', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const userId = 'user-123';
      const fixedPrice = 100000;

      const mockArtwork = {
        id: artworkId,
        status: 'active',
        sale_type: 'fixed',
        fixed_price: fixedPrice,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockArtworkUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      mockArtworkUpdate.eq
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockResolvedValueOnce({ error: null });

      const mockOrderInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'order-123' },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockReturnValueOnce(mockOrderInsert);

      // Act
      await purchaseArtwork(artworkId);

      // Assert
      expect(mockOrderInsert.insert).toHaveBeenCalledWith({
        user_id: userId,
        artwork_id: artworkId,
        order_type: 'purchase',
        price: fixedPrice,
        status: 'pending',
      });
    });

    it('should call revalidatePath after successful purchase', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const mockArtwork = {
        id: artworkId,
        status: 'active',
        sale_type: 'fixed',
        fixed_price: 100000,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockArtworkUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      mockArtworkUpdate.eq
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockResolvedValueOnce({ error: null });

      const mockOrderInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'order-123' },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockReturnValueOnce(mockOrderInsert);

      // Act
      await purchaseArtwork(artworkId);

      // Assert
      expect(revalidatePath).toHaveBeenCalledWith(`/artwork/${artworkId}`);
      expect(revalidatePath).toHaveBeenCalledWith('/my-page');
      expect(revalidatePath).toHaveBeenCalledWith('/explore');
      expect(revalidatePath).toHaveBeenCalledTimes(3);
    });
  });

  describe('Transaction rollback', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });
    });

    it('should rollback artwork status when order creation fails', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const mockArtwork = {
        id: artworkId,
        status: 'active',
        sale_type: 'fixed',
        fixed_price: 100000,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockArtworkUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      mockArtworkUpdate.eq
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockResolvedValueOnce({ error: null });

      const mockOrderInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Order creation failed' },
        }),
      };

      const mockArtworkRollback = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockReturnValueOnce(mockOrderInsert)
        .mockReturnValueOnce(mockArtworkRollback);

      // Act
      const result = await purchaseArtwork(artworkId);

      // Assert
      expect(mockArtworkRollback.update).toHaveBeenCalledWith({ status: 'active' });
      expect(result).toEqual({
        success: false,
        message: '주문 생성 중 오류가 발생했습니다.',
      });
    });
  });

  describe('Race condition prevention', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });
    });

    it('should use status check to prevent race condition', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const mockArtwork = {
        id: artworkId,
        status: 'active',
        sale_type: 'fixed',
        fixed_price: 100000,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockArtworkUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      mockArtworkUpdate.eq
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockResolvedValueOnce({ error: null });

      const mockOrderInsert = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'order-123' },
          error: null,
        }),
      };

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockReturnValueOnce(mockOrderInsert);

      // Act
      await purchaseArtwork(artworkId);

      // Assert
      // Verify update was called with both eq conditions
      const eqCalls = mockArtworkUpdate.eq.mock.calls;
      expect(eqCalls).toContainEqual(['id', artworkId]);
      expect(eqCalls).toContainEqual(['status', 'active']);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });
    });

    it('should handle artwork update error', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const mockArtwork = {
        id: artworkId,
        status: 'active',
        sale_type: 'fixed',
        fixed_price: 100000,
      };

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      const mockArtworkUpdate = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };

      mockArtworkUpdate.eq
        .mockReturnValueOnce(mockArtworkUpdate)
        .mockResolvedValueOnce({ error: { message: 'Update failed' } });

      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect)
        .mockReturnValueOnce(mockArtworkUpdate);

      // Act
      const result = await purchaseArtwork(artworkId);

      // Assert
      expect(result).toEqual({
        success: false,
        message: '구매 처리 중 오류가 발생했습니다.',
      });
    });

    it('should handle unexpected errors during update', async () => {
      // Arrange
      const artworkId = 'artwork-123';
      const mockArtwork = {
        id: artworkId,
        status: 'active',
        sale_type: 'fixed',
        fixed_price: 100000,
      };

      // Suppress console.error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockArtworkSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockArtwork,
          error: null,
        }),
      };

      // Mock from to throw error during update (inside try-catch)
      mockSupabase.from
        .mockReturnValueOnce(mockArtworkSelect) // First call for select
        .mockImplementation(() => {
          throw new Error('Unexpected database error');
        });

      // Act
      const result = await purchaseArtwork(artworkId);

      // Assert
      expect(result).toEqual({
        success: false,
        message: '예상치 못한 오류가 발생했습니다.',
      });

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
