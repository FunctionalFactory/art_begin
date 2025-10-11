"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface AuctionCountdownProps {
  endTime: Date;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeRemaining(endTime: Date): TimeRemaining {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export function AuctionCountdown({ endTime }: AuctionCountdownProps) {
  // Initialize with null to avoid hydration mismatch
  // Server and client will both render the same initial state
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Calculate immediately on mount (client-side only)
    const remaining = getTimeRemaining(endTime);
    setTimeRemaining(remaining);

    // Check if auction has already expired
    if (remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0 && remaining.seconds === 0) {
      setIsExpired(true);
    }

    // Then update every second
    const interval = setInterval(() => {
      const newRemaining = getTimeRemaining(endTime);
      setTimeRemaining(newRemaining);

      // Check if timer just reached zero
      if (newRemaining.days === 0 && newRemaining.hours === 0 && newRemaining.minutes === 0 && newRemaining.seconds === 0) {
        setIsExpired(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  // If timeRemaining is null, show placeholder (prevents hydration mismatch)
  const displayTime = timeRemaining || { days: 0, hours: 0, minutes: 0, seconds: 0 };

  // Show "Auction Ended" message if expired
  if (isExpired) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="w-4 h-4 text-destructive" />
          <p className="text-sm font-semibold text-destructive">경매 종료</p>
        </div>
        <p className="text-sm text-muted-foreground">
          이 경매는 종료되었습니다. 낙찰 처리가 진행 중입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted p-4 rounded-lg">
      <div className="flex items-center space-x-2 mb-2">
        <Clock className="w-4 h-4" />
        <p className="text-sm font-semibold">남은 시간</p>
      </div>
      <div className="flex space-x-4 text-center">
        <div>
          <p className="text-2xl font-bold">{displayTime.days}</p>
          <p className="text-xs text-muted-foreground">일</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{displayTime.hours}</p>
          <p className="text-xs text-muted-foreground">시간</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{displayTime.minutes}</p>
          <p className="text-xs text-muted-foreground">분</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{displayTime.seconds}</p>
          <p className="text-xs text-muted-foreground">초</p>
        </div>
      </div>
    </div>
  );
}
