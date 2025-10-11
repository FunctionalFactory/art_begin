import { render, screen, waitFor, act } from '@testing-library/react';
import { AuctionCountdown } from '../auction-countdown';

describe('AuctionCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Time Calculation', () => {
    it('should calculate remaining time accurately', () => {
      const futureDate = new Date(Date.now() + 86400000); // 1 day from now
      render(<AuctionCountdown endTime={futureDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('일')).toBeInTheDocument();
    });

    it('should update countdown every second', () => {
      const futureDate = new Date(Date.now() + 5000); // 5 seconds from now
      render(<AuctionCountdown endTime={futureDate} />);

      // Initial state
      act(() => {
        jest.advanceTimersByTime(0);
      });

      const initialSeconds = screen.getByText(/^\d+$/, { selector: 'p.text-2xl' });
      const initialValue = parseInt(initialSeconds.textContent || '0');

      // Advance 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      const updatedSeconds = screen.getByText(/^\d+$/, { selector: 'p.text-2xl' });
      const updatedValue = parseInt(updatedSeconds.textContent || '0');

      expect(updatedValue).toBeLessThan(initialValue);
    });

    it('should show expired message when auction has ended', () => {
      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      render(<AuctionCountdown endTime={pastDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      // Should show "경매 종료" message instead of countdown
      expect(screen.getByText('경매 종료')).toBeInTheDocument();
      expect(screen.getByText(/이 경매는 종료되었습니다/)).toBeInTheDocument();
    });

    it('should show expired message for negative time', () => {
      const pastDate = new Date(Date.now() - 86400000); // 1 day ago
      render(<AuctionCountdown endTime={pastDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      // Should show "경매 종료" message
      expect(screen.getByText('경매 종료')).toBeInTheDocument();
      expect(screen.queryByText('일')).not.toBeInTheDocument();
    });
  });

  describe('Hydration & Initial Rendering', () => {
    it('should prevent hydration mismatch by initializing with null', () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
      const { container } = render(<AuctionCountdown endTime={futureDate} />);

      // Initial render should show placeholder (0,0,0,0) before useEffect runs
      expect(container.querySelector('.text-2xl')).toBeInTheDocument();
    });

    it('should calculate and display time after mount', async () => {
      const futureDate = new Date(Date.now() + 7200000); // 2 hours from now
      render(<AuctionCountdown endTime={futureDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('시간')).toBeInTheDocument();
      });
    });
  });

  describe('Formatting', () => {
    it('should format days correctly', () => {
      const futureDate = new Date(Date.now() + 172800000); // 2 days from now
      render(<AuctionCountdown endTime={futureDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.getByText('일')).toBeInTheDocument();
      expect(screen.getByText('시간')).toBeInTheDocument();
      expect(screen.getByText('분')).toBeInTheDocument();
      expect(screen.getByText('초')).toBeInTheDocument();
    });

    it('should display all time units (days, hours, minutes, seconds)', () => {
      const futureDate = new Date(Date.now() + 90061000); // 1 day, 1 hour, 1 minute, 1 second
      render(<AuctionCountdown endTime={futureDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.getByText('일')).toBeInTheDocument();
      expect(screen.getByText('시간')).toBeInTheDocument();
      expect(screen.getByText('분')).toBeInTheDocument();
      expect(screen.getByText('초')).toBeInTheDocument();
    });
  });

  describe('Cleanup & Props Changes', () => {
    it('should cleanup interval on unmount', () => {
      const futureDate = new Date(Date.now() + 10000);
      const { unmount } = render(<AuctionCountdown endTime={futureDate} />);

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('should recalculate when endTime prop changes', () => {
      const initialDate = new Date(Date.now() + 3600000); // 1 hour
      const { rerender } = render(<AuctionCountdown endTime={initialDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      const newDate = new Date(Date.now() + 7200000); // 2 hours
      rerender(<AuctionCountdown endTime={newDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      // Should show updated time
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Auction Ended State', () => {
    it('should show "경매 종료" message when auction has expired', () => {
      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      render(<AuctionCountdown endTime={pastDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.getByText('경매 종료')).toBeInTheDocument();
      expect(screen.getByText(/이 경매는 종료되었습니다/)).toBeInTheDocument();
      expect(screen.getByText(/낙찰 처리가 진행 중입니다/)).toBeInTheDocument();
    });

    it('should transition to expired state when timer reaches zero', () => {
      const futureDate = new Date(Date.now() + 2000); // 2 seconds from now
      render(<AuctionCountdown endTime={futureDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      // Initially should show countdown
      expect(screen.queryByText('경매 종료')).not.toBeInTheDocument();

      // Fast forward past the end time
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should now show expired message
      expect(screen.getByText('경매 종료')).toBeInTheDocument();
    });

    it('should apply destructive styling when expired', () => {
      const pastDate = new Date(Date.now() - 1000);
      const { container } = render(<AuctionCountdown endTime={pastDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      // Check for destructive styling classes
      const expiredContainer = container.querySelector('.bg-destructive\\/10');
      expect(expiredContainer).toBeInTheDocument();
    });

    it('should not show countdown numbers when expired', () => {
      const pastDate = new Date(Date.now() - 1000);
      render(<AuctionCountdown endTime={pastDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      // Should not show time unit labels when expired
      expect(screen.queryByText('일')).not.toBeInTheDocument();
      expect(screen.queryByText('시간')).not.toBeInTheDocument();
      expect(screen.queryByText('분')).not.toBeInTheDocument();
      expect(screen.queryByText('초')).not.toBeInTheDocument();
    });
  });
});
