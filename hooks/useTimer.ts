
import { useState, useEffect, useRef } from 'react';

export const useTimer = (durationSeconds: number, onTimeout: () => void) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  // FIX: In browser environments, setInterval returns a number, not a NodeJS.Timeout object.
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (durationSeconds <= 0) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if(intervalRef.current) clearInterval(intervalRef.current);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [durationSeconds, onTimeout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return {
    minutes,
    seconds,
    timeLeft,
  };
};
