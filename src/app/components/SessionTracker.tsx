'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Pause, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SessionTrackerProps {
  onAddSession: (startTime: string, endTime: string) => void;
}

export function SessionTracker({ onAddSession }: SessionTrackerProps) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0); // seconds
  const [startTime, setStartTime] = useState<string | null>(null);
  const incrementRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isPaused) {
      incrementRef.current = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    } else {
      if (incrementRef.current) clearInterval(incrementRef.current);
    }
    return () => {
      if (incrementRef.current) clearInterval(incrementRef.current);
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    setStartTime(new Date().toISOString());
    setTime(0);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    if (startTime) {
      const endTime = new Date().toISOString();
      onAddSession(startTime, endTime);
    }
    setIsActive(false);
    setIsPaused(false);
    setTime(0);
    setStartTime(null);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${hours > 0 ? `${pad(hours)}:` : ''}${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="flex flex-col gap-4 p-5 bg-[var(--card)] rounded-[var(--radius)] border border-[var(--border)] apple-shadow">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold tracking-tight">Active Study Focus</h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">Track your learning session in real time</p>
        </div>
        <Clock className={`w-5 h-5 ${isActive && !isPaused ? 'text-emerald-500 animate-pulse' : 'text-[var(--muted)]'}`} />
      </div>

      <div className="flex items-center justify-between bg-[var(--background)] px-4 py-3 rounded-2xl border border-[var(--border)]">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Timer</span>
          <span className="text-xl font-mono font-bold tracking-tight">{formatTime(time)}</span>
        </div>

        <div className="flex gap-2">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 px-4 py-2 rounded-xl text-xs font-semibold transition"
            >
              <Play className="w-3.5 h-3.5 fill-[var(--background)]" />
              <span>Start Study</span>
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="p-2 hover:bg-[var(--border)] rounded-xl border border-[var(--border)] transition text-[var(--foreground)]"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-4 h-4 fill-[var(--foreground)]" /> : <Pause className="w-4 h-4" />}
              </button>
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Stop</span>
              </button>
            </>
          )}
        </div>
      </div>

      {isActive && !isPaused && (
        <div className="flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900/30">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Keep this tab open to preserve study timer state.</span>
        </div>
      )}
    </div>
  );
}
