'use client';

import React, { useMemo } from 'react';
import { 
  subDays, 
  eachDayOfInterval, 
  format, 
  parseISO, 
  isSameDay, 
  startOfToday, 
  startOfWeek,
  subMonths
} from 'date-fns';
import { Flame, Trophy } from 'lucide-react';

interface StreaksHeatmapProps {
  activityHistory: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
}

export function StreaksHeatmap({
  activityHistory,
  currentStreak,
  longestStreak,
}: StreaksHeatmapProps) {
  // Let's generate the last 365 days (or custom columns)
  // To keep it clean, let's display the last 24 weeks (~168 days) on desktop, and last 8 weeks on mobile
  const today = startOfToday();
  const startDate = startOfWeek(subDays(today, 180)); // Approx 6 months back

  const days = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: today });
  }, [startDate, today]);

  // Group days into weeks (columns)
  const weeks = useMemo(() => {
    const cols: Date[][] = [];
    let currentWeek: Date[] = [];
    
    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || day.getDay() === 6) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      cols.push(currentWeek);
    }
    return cols;
  }, [days]);

  const getActivityColor = (count: number) => {
    if (!count) return 'bg-[#FAFAFA] dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#222222]';
    if (count === 1) return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 border border-emerald-200 dark:border-emerald-900';
    if (count <= 3) return 'bg-emerald-300 dark:bg-emerald-800 text-emerald-900';
    if (count <= 5) return 'bg-emerald-500 dark:bg-emerald-600 text-white';
    return 'bg-emerald-700 dark:bg-emerald-400 text-white';
  };

  const getDayLabel = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const count = activityHistory[dateStr] || 0;
    return `${format(day, 'MMM dd, yyyy')}: ${count} task${count === 1 ? '' : 's'} completed`;
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[var(--card)] rounded-[var(--radius)] border border-[var(--border)] apple-shadow">
      {/* Streak Dashboard stats */}
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-100 dark:border-orange-900/30">
            <Flame className="w-8 h-8 text-orange-500 fill-orange-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--muted)]">Current Streak</h3>
            <p className="text-2xl font-bold tracking-tight">{currentStreak} Day{currentStreak === 1 ? '' : 's'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
            <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--muted)]">Longest Streak</h3>
            <p className="text-2xl font-bold tracking-tight">{longestStreak} Day{longestStreak === 1 ? '' : 's'}</p>
          </div>
        </div>
      </div>

      {/* Grid Heatmap */}
      <div className="overflow-x-auto select-none py-2">
        <div className="flex gap-[4px] min-w-[500px]">
          {/* Weekday headers */}
          <div className="flex flex-col justify-between text-[10px] text-[var(--muted)] pr-2 py-1 select-none">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* Weeks columns */}
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-[4px]">
              {/* If first week, offset empty cells */}
              {wIdx === 0 && Array.from({ length: week[0].getDay() }).map((_, idx) => (
                <div key={`offset-${idx}`} className="w-[11px] h-[11px] bg-transparent" />
              ))}
              
              {week.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const count = activityHistory[dateStr] || 0;
                return (
                  <div
                    key={dateStr}
                    title={getDayLabel(day)}
                    className={`w-[11px] h-[11px] rounded-[3px] transition-all hover:scale-125 ${getActivityColor(count)} cursor-pointer`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Heatmap Labels */}
        <div className="flex justify-between text-[11px] text-[var(--muted)] mt-3 px-8">
          <span>{format(startDate, 'MMM yyyy')}</span>
          <span>{format(subMonths(today, 3), 'MMM yyyy')}</span>
          <span>Today</span>
        </div>
      </div>

      {/* Legend Info */}
      <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)]">
        <span>Total active days: {Object.keys(activityHistory).filter(k => activityHistory[k] > 0).length} days</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="w-[10px] h-[10px] bg-[#FAFAFA] dark:bg-[#151515] border border-[var(--border)] rounded-[2px]" />
          <div className="w-[10px] h-[10px] bg-emerald-200 rounded-[2px]" />
          <div className="w-[10px] h-[10px] bg-emerald-400 rounded-[2px]" />
          <div className="w-[10px] h-[10px] bg-emerald-600 rounded-[2px]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
