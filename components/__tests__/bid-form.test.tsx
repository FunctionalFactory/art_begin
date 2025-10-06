import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BidForm } from '../bid-form';
import { placeBid } from '@/app/artwork/[id]/bid-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Mock the server action
jest.mock('@/app/artwork/[id]/bid-actions', () => ({
  placeBid: jest.fn(),
}));

// Get mocked functions
const mockPlaceBid = placeBid as jest.MockedFunction<typeof placeBid>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('BidForm', () => {
  const defaultProps = {
    artworkId: 'artwork-123',
    currentPrice: 100000,
    auctionEndTime: new Date(Date.now() + 86400000), // 1 day from now
    status: 'active' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render bid form with all elements', () => {
      render(<BidForm {...defaultProps} />);

      expect(screen.getByText('최소 입찰가: 110,000원')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('입찰 금액을 입력하세요')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /입찰하기/i })).toBeInTheDocument();
    });

    it('should display minimum bid amount correctly', () => {
      render(<BidForm {...defaultProps} />);

      expect(screen.getByText('최소 입찰가: 110,000원')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should allow user to input bid amount', async () => {
      const user = userEvent.setup();
      render(<BidForm {...defaultProps} />);

      const input = screen.getByPlaceholderText('입찰 금액을 입력하세요');

      await user.type(input, '150000');

      expect(input).toHaveValue(150000);
    });

    it('should submit form when bid button is clicked', async () => {
      const user = userEvent.setup();
      mockPlaceBid.mockResolvedValue({ success: true, message: '입찰이 완료되었습니다!' });

      render(<BidForm {...defaultProps} />);

      const input = screen.getByPlaceholderText('입찰 금액을 입력하세요');
      const button = screen.getByRole('button', { name: /입찰하기/i });

      await user.type(input, '150000');
      await user.click(button);

      await waitFor(() => {
        expect(mockPlaceBid).toHaveBeenCalledWith('artwork-123', 150000);
      });
    });
  });

  describe('Client-side Validation', () => {
    it('should show error for empty bid amount', async () => {
      const user = userEvent.setup();
      render(<BidForm {...defaultProps} />);

      const button = screen.getByRole('button', { name: /입찰하기/i });

      // Button should be disabled when input is empty
      expect(button).toBeDisabled();
    });

    it('should show error for bid amount below minimum', async () => {
      const user = userEvent.setup();
      render(<BidForm {...defaultProps} />);

      const input = screen.getByPlaceholderText('입찰 금액을 입력하세요');
      const button = screen.getByRole('button', { name: /입찰하기/i });

      await user.type(input, '100000'); // Below minimum
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('최소 입찰가는 110,000원입니다.')).toBeInTheDocument();
      });
    });

    it('should show error for non-numeric values', async () => {
      const user = userEvent.setup();
      render(<BidForm {...defaultProps} />);

      const input = screen.getByPlaceholderText('입찰 금액을 입력하세요');
      const button = screen.getByRole('button', { name: /입찰하기/i });

      await user.type(input, 'abc');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('유효한 금액을 입력해주세요.')).toBeInTheDocument();
      });
    });

    it('should clear error when user types', async () => {
      const user = userEvent.setup();
      render(<BidForm {...defaultProps} />);

      const input = screen.getByPlaceholderText('입찰 금액을 입력하세요');
      const button = screen.getByRole('button', { name: /입찰하기/i });

      // First create an error
      await user.type(input, '50000');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/최소 입찰가는/)).toBeInTheDocument();
      });

      // Clear and type again
      await user.clear(input);
      await user.type(input, '150000');

      expect(screen.queryByText(/최소 입찰가는/)).not.toBeInTheDocument();
    });
  });

  describe('Server Action Integration', () => {
    it('should call placeBid server action on submit', async () => {
      const user = userEvent.setup();
      mockPlaceBid.mockResolvedValue({ success: true, message: '입찰이 완료되었습니다!' });

      render(<BidForm {...defaultProps} />);

      const input = screen.getByPlaceholderText('입찰 금액을 입력하세요');
      await user.type(input, '150000');

      const button = screen.getByRole('button', { name: /입찰하기/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockPlaceBid).toHaveBeenCalledWith('artwork-123', 150000);
      });
    });

    it('should show success toast on successful bid', async () => {
      const user = userEvent.setup();
      mockPlaceBid.mockResolvedValue({ success: true, message: '입찰이 완료되었습니다!' });

      render(<BidForm {...defaultProps} />);

      const input = screen.getByPlaceholderText('입찰 금액을 입력하세요');
      await user.type(input, '150000');

      const button = screen.getByRole('button', { name: /입찰하기/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          '입찰이 완료되었습니다!',
          expect.objectContaining({
            description: '입찰 금액: 150,000원',
          })
        );
      });
    });

    it('should clear input field on successful bid', async () => {
      const user = userEvent.setup();
      mockPlaceBid.mockResolvedValue({ success: true, message: '입찰이 완료되었습니다!' });

      render(<BidForm {...defaultProps} />);

      const input = screen.getByPlaceholderText('입찰 금액을 입력하세요') as HTMLInputElement;
      await user.type(input, '150000');

      const button = screen.getByRole('button', { name: /입찰하기/i });
      await user.click(button);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should display error message on failed bid', async () => {
      const user = userEvent.setup();
      mockPlaceBid.mockResolvedValue({ success: false, error: '입찰에 실패했습니다.' });

      render(<BidForm {...defaultProps} />);

      const input = screen.getByPlaceholderText('입찰 금액을 입력하세요');
      await user.type(input, '150000');

      const button = screen.getByRole('button', { name: /입찰하기/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('입찰에 실패했습니다.')).toBeInTheDocument();
      });
    });

    it('should show toast with action for login required error', async () => {
      const user = userEvent.setup();
      mockPlaceBid.mockResolvedValue({ success: false, error: '로그인이 필요합니다.' });

      render(<BidForm {...defaultProps} />);

      const input = screen.getByPlaceholderText('입찰 금액을 입력하세요');
      await user.type(input, '150000');

      const button = screen.getByRole('button', { name: /입찰하기/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          '로그인이 필요합니다.',
          expect.objectContaining({
            action: expect.objectContaining({
              label: '로그인',
            }),
          })
        );
      });
    });
  });

  describe('Status-based Display', () => {
    it('should show message when auction has ended', () => {
      const pastDate = new Date(Date.now() - 1000);
      render(<BidForm {...defaultProps} auctionEndTime={pastDate} />);

      expect(screen.getByText('경매가 종료되었습니다')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('입찰 금액을 입력하세요')).not.toBeInTheDocument();
    });

    it('should show message for sold artwork', () => {
      render(<BidForm {...defaultProps} status="sold" />);

      expect(screen.getByText('이미 판매된 작품입니다')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('입찰 금액을 입력하세요')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission State', () => {
    it('should disable form during submission', async () => {
      const user = userEvent.setup();
      mockPlaceBid.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<BidForm {...defaultProps} />);

      const input = screen.getByPlaceholderText('입찰 금액을 입력하세요');
      const button = screen.getByRole('button', { name: /입찰하기/i });

      await user.type(input, '150000');
      await user.click(button);

      // Button should show loading state
      expect(screen.getByText('처리 중...')).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(input).toBeDisabled();

      await waitFor(() => {
        expect(mockPlaceBid).toHaveBeenCalled();
      });
    });

    it('should prevent multiple submissions', async () => {
      const user = userEvent.setup();
      mockPlaceBid.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<BidForm {...defaultProps} />);

      const input = screen.getByPlaceholderText('입찰 금액을 입력하세요');
      const button = screen.getByRole('button', { name: /입찰하기/i });

      await user.type(input, '150000');
      await user.click(button);
      await user.click(button); // Try to click again

      await waitFor(() => {
        expect(mockPlaceBid).toHaveBeenCalledTimes(1); // Should only be called once
      });
    });
  });
});
