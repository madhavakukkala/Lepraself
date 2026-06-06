'use client';

import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  parseISO, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Award } from 'lucide-react';
import { LearningSession } from '../hooks/useAppState';

interface LearningCalendarProps {
  completedHistory: Record<string, number>;
  sessions: LearningSession[];
}

export function LearningCalendar({ completedHistory, sessions }: LearningCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get active session count / durations
  const totalSessionTime = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="flex flex-col gap-6 p-6 bg-[var(--card)] rounded-[var(--radius)] border border-[var(--border)] apple-shadow">
      
      {/* Calendar Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 opacity-75" />
          <span>Learning Log</span>
        </h3>
        
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1 hover:bg-[var(--border)] rounded-full transition text-[var(--foreground)]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold px-2 min-w-[100px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-[var(--border)] rounded-full transition text-[var(--foreground)]">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[var(--muted)] border-b border-[var(--border)] pb-2">
        <span>Su</span>
        <span>Mo</span>
        <span>Tu</span>
        <span>We</span>
        <span>Th</span>
        <span>Fr</span>
        <span>Sa</span>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Fill empty starting days */}
        {Array.from({ length: monthStart.getDay() }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-9 w-full" />
        ))}

        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const tasksCompleted = completedHistory[dateStr] || 0;
          const hasActivity = tasksCompleted > 0;
          const isTodayDate = isSameDay(day, new Date());

          return (
            <div
              key={dateStr}
              className={`h-9 w-full rounded-xl flex flex-col items-center justify-center relative transition-all ${
                isTodayDate ? 'border border-[var(--foreground)] font-bold' : ''
              } ${
                hasActivity 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' 
                  : 'hover:bg-[var(--border)]/30'
              }`}
            >
              <span className="text-xs">{format(day, 'd')}</span>
              {hasActivity && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Learning session summary statistics */}
      <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Session Overview</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Total Hours</span>
            </div>
            <p className="text-lg font-bold">{(totalSessionTime / 60).toFixed(1)} hrs</p>
          </div>

          <div className="p-3 bg-[var(--background)] rounded-2xl border border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Sessions</span>
            </div>
            <p className="text-lg font-bold">{sessions.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
