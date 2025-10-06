import { render, screen, waitFor, act } from '@testing-library/react';
import { CountdownTimer } from '../countdown-timer';

describe('CountdownTimer', () => {
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
      render(<CountdownTimer endTime={futureDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.getByText('1일 남음')).toBeInTheDocument();
    });

    it('should update in real-time every second', () => {
      const futureDate = new Date(Date.now() + 3000); // 3 seconds from now
      render(<CountdownTimer endTime={futureDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.getByText('3초 남음')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText('2초 남음')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(screen.getByText('1초 남음')).toBeInTheDocument();
    });
  });

  describe('Formatting Logic', () => {
    it('should prioritize days when available', () => {
      const futureDate = new Date(Date.now() + 90000000); // More than 1 day
      render(<CountdownTimer endTime={futureDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.getByText(/\d+일 남음/)).toBeInTheDocument();
    });

    it('should show hours when less than a day but more than an hour', () => {
      const futureDate = new Date(Date.now() + 7200000); // 2 hours
      render(<CountdownTimer endTime={futureDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.getByText('2시간 남음')).toBeInTheDocument();
    });

    it('should show minutes when less than an hour but more than a minute', () => {
      const futureDate = new Date(Date.now() + 120000); // 2 minutes
      render(<CountdownTimer endTime={futureDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.getByText('2분 남음')).toBeInTheDocument();
    });

    it('should show seconds when less than a minute', () => {
      const futureDate = new Date(Date.now() + 30000); // 30 seconds
      render(<CountdownTimer endTime={futureDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.getByText('30초 남음')).toBeInTheDocument();
    });

    it('should display "경매 종료" when auction has ended', () => {
      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      render(<CountdownTimer endTime={pastDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.getByText('경매 종료')).toBeInTheDocument();
    });
  });

  describe('onComplete Callback', () => {
    it('should call onComplete when auction ends', () => {
      const onComplete = jest.fn();
      const futureDate = new Date(Date.now() + 2000); // 2 seconds from now

      render(<CountdownTimer endTime={futureDate} onComplete={onComplete} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(onComplete).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should call onComplete immediately if already expired', () => {
      const onComplete = jest.fn();
      const pastDate = new Date(Date.now() - 1000);

      render(<CountdownTimer endTime={pastDate} onComplete={onComplete} />);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(onComplete).toHaveBeenCalled();
    });

    it('should not call onComplete if not provided', () => {
      const futureDate = new Date(Date.now() + 1000);

      expect(() => {
        render(<CountdownTimer endTime={futureDate} />);
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }).not.toThrow();
    });
  });

  describe('isExpired Flag', () => {
    it('should set isExpired to true when time is up', () => {
      const pastDate = new Date(Date.now() - 1000);
      render(<CountdownTimer endTime={pastDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.getByText('경매 종료')).toBeInTheDocument();
    });

    it('should set isExpired to false when time is remaining', () => {
      const futureDate = new Date(Date.now() + 10000);
      render(<CountdownTimer endTime={futureDate} />);

      act(() => {
        jest.advanceTimersByTime(0);
      });

      expect(screen.queryByText('경매 종료')).not.toBeInTheDocument();
      expect(screen.getByText(/남음/)).toBeInTheDocument();
    });
  });

  describe('Cleanup & Interval Management', () => {
    it('should cleanup interval on unmount', () => {
      const futureDate = new Date(Date.now() + 10000);
      const { unmount } = render(<CountdownTimer endTime={futureDate} />);

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('should stop interval when auction expires', () => {
      const onComplete = jest.fn();
      const futureDate = new Date(Date.now() + 1000);

      render(<CountdownTimer endTime={futureDate} onComplete={onComplete} />);

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });
});
