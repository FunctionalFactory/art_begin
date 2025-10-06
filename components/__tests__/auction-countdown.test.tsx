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

    it('should display 0 when auction has ended', () => {
      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      render(<AuctionCountdown endTime={pastDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      const timeElements = screen.getAllByText('0');
      expect(timeElements.length).toBeGreaterThanOrEqual(4); // days, hours, minutes, seconds all 0
    });

    it('should handle negative time by displaying 0', () => {
      const pastDate = new Date(Date.now() - 86400000); // 1 day ago
      render(<AuctionCountdown endTime={pastDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      const timeElements = screen.getAllByText('0');
      expect(timeElements.length).toBeGreaterThanOrEqual(4);
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
});
