import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LikeButton } from '../like-button';
import { toggleLike } from '@/app/artwork/[id]/actions';
import { useRouter } from 'next/navigation';

// Mock the server action
jest.mock('@/app/artwork/[id]/actions', () => ({
  toggleLike: jest.fn(),
}));

// Get mocked functions
const mockToggleLike = toggleLike as jest.MockedFunction<typeof toggleLike>;

describe('LikeButton', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = (useRouter as jest.MockedFunction<typeof useRouter>)().push as jest.Mock;
  });

  describe('Initial Rendering', () => {
    it('should render with initial liked state', () => {
      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={true}
          initialLikesCount={10}
        />
      );

      const button = screen.getByRole('button', { name: '좋아요 취소' });
      expect(button).toBeInTheDocument();
    });

    it('should render with initial unliked state', () => {
      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={5}
        />
      );

      const button = screen.getByRole('button', { name: '좋아요' });
      expect(button).toBeInTheDocument();
    });

    it('should display likes count', () => {
      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={42}
        />
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should hide count when showCount is false', () => {
      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={42}
          showCount={false}
        />
      );

      expect(screen.queryByText('42')).not.toBeInTheDocument();
    });
  });

  describe('Heart Icon State', () => {
    it('should show filled heart when liked', () => {
      const { container } = render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={true}
          initialLikesCount={10}
        />
      );

      const heart = container.querySelector('svg');
      expect(heart).toHaveClass('fill-red-500', 'text-red-500');
    });

    it('should show empty heart when not liked', () => {
      const { container } = render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={10}
        />
      );

      const heart = container.querySelector('svg');
      expect(heart).toHaveClass('fill-none');
    });
  });

  describe('Size Prop', () => {
    it('should render small size correctly', () => {
      const { container } = render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={10}
          size="sm"
        />
      );

      const heart = container.querySelector('svg');
      expect(heart).toHaveClass('w-4', 'h-4');
    });

    it('should render medium size correctly', () => {
      const { container } = render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={10}
          size="md"
        />
      );

      const heart = container.querySelector('svg');
      expect(heart).toHaveClass('w-5', 'h-5');
    });

    it('should render large size correctly', () => {
      const { container } = render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={10}
          size="lg"
        />
      );

      const heart = container.querySelector('svg');
      expect(heart).toHaveClass('w-6', 'h-6');
    });
  });

  describe('Optimistic UI Updates', () => {
    it('should update UI optimistically on click', async () => {
      const user = userEvent.setup();
      mockToggleLike.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, isLiked: true, likesCount: 11 }), 100))
      );

      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={10}
        />
      );

      const button = screen.getByRole('button', { name: '좋아요' });
      await user.click(button);

      // Should update immediately (optimistic)
      expect(screen.getByText('11')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '좋아요 취소' })).toBeInTheDocument();
    });

    it('should increment count on like', async () => {
      const user = userEvent.setup();
      mockToggleLike.mockResolvedValue({ success: true, isLiked: true, likesCount: 43 });

      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={42}
        />
      );

      expect(screen.getByText('42')).toBeInTheDocument();

      const button = screen.getByRole('button');
      await user.click(button);

      // Optimistic update: 42 + 1 = 43
      expect(screen.getByText('43')).toBeInTheDocument();
    });

    it('should decrement count on unlike', async () => {
      const user = userEvent.setup();
      mockToggleLike.mockResolvedValue({ success: true, isLiked: false, likesCount: 41 });

      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={true}
          initialLikesCount={42}
        />
      );

      expect(screen.getByText('42')).toBeInTheDocument();

      const button = screen.getByRole('button');
      await user.click(button);

      // Optimistic update: 42 - 1 = 41
      expect(screen.getByText('41')).toBeInTheDocument();
    });
  });

  describe('Server Action Integration', () => {
    it('should call toggleLike server action on click', async () => {
      const user = userEvent.setup();
      mockToggleLike.mockResolvedValue({ success: true, isLiked: true, likesCount: 11 });

      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={10}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(mockToggleLike).toHaveBeenCalledWith('artwork-123');
      });
    });

    it('should maintain state on successful server action', async () => {
      const user = userEvent.setup();
      mockToggleLike.mockResolvedValue({ success: true, isLiked: true, likesCount: 11 });

      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={10}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '좋아요 취소' })).toBeInTheDocument();
        expect(screen.getByText('11')).toBeInTheDocument();
      });
    });

    it('should rollback optimistic update on server error', async () => {
      const user = userEvent.setup();
      mockToggleLike.mockResolvedValue({ success: false, error: '오류가 발생했습니다.' });

      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={10}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        // Should rollback to original state
        expect(screen.getByRole('button', { name: '좋아요' })).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication', () => {
    it('should redirect to login when not authenticated', async () => {
      const user = userEvent.setup();
      mockToggleLike.mockResolvedValue({ success: false, error: '로그인이 필요합니다.' });

      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={10}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Pending State', () => {
    it('should disable button while request is pending', async () => {
      const user = userEvent.setup();
      mockToggleLike.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, isLiked: true, likesCount: 11 }), 100))
      );

      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={10}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should prevent duplicate clicks while pending', async () => {
      const user = userEvent.setup();
      mockToggleLike.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true, isLiked: true, likesCount: 11 }), 100))
      );

      render(
        <LikeButton
          artworkId="artwork-123"
          initialIsLiked={false}
          initialLikesCount={10}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button); // Try to click again

      await waitFor(() => {
        expect(mockToggleLike).toHaveBeenCalledTimes(1);
      });
    });
  });
});
