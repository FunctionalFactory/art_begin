"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endTime: Date;
  onComplete?: () => void;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function getTimeRemaining(endTime: Date): TimeRemaining {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isExpired: false };
}

function formatTimeRemaining(time: TimeRemaining): string {
  if (time.isExpired) {
    return "경매 종료";
  }

  if (time.days > 0) {
    return `${time.days}일 남음`;
  }

  if (time.hours > 0) {
    return `${time.hours}시간 남음`;
  }

  if (time.minutes > 0) {
    return `${time.minutes}분 남음`;
  }

  return `${time.seconds}초 남음`;
}

export function CountdownTimer({ endTime, onComplete, className }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    getTimeRemaining(endTime)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = getTimeRemaining(endTime);
      setTimeRemaining(newTime);

      if (newTime.isExpired && onComplete) {
        onComplete();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  return (
    <span className={className}>
      {formatTimeRemaining(timeRemaining)}
    </span>
  );
}
