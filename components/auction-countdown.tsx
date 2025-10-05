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

  useEffect(() => {
    // Calculate immediately on mount (client-side only)
    setTimeRemaining(getTimeRemaining(endTime));

    // Then update every second
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(endTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  // If timeRemaining is null, show placeholder (prevents hydration mismatch)
  const displayTime = timeRemaining || { days: 0, hours: 0, minutes: 0, seconds: 0 };

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
