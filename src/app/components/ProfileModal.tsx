'use client';

import React, { useState } from 'react';
import { UserProfile } from '../hooks/useAppState';
import { User, Target, Calendar, Briefcase, Award, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onClose: () => void;
}

export function ProfileModal({
  isOpen,
  profile,
  onSaveProfile,
  onClose,
}: ProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [targetRole, setTargetRole] = useState(profile.targetRole);
  const [targetCompany, setTargetCompany] = useState(profile.targetCompany);
  const [targetCompletionDate, setTargetCompletionDate] = useState(profile.targetCompletionDate);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoal);
  const [weeklyGoal, setWeeklyGoal] = useState(profile.weeklyGoal);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name,
      targetRole,
      targetCompany,
      targetCompletionDate,
      dailyGoal: Number(dailyGoal),
      weeklyGoal: Number(weeklyGoal),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-[var(--card)] rounded-[var(--radius)] border border-[var(--border)] apple-shadow overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--border)]">
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 opacity-75" />
            <span>Target Learning Profile</span>
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1">Configure goals and tracking details saved locally</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none focus:border-[var(--foreground)]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none focus:border-[var(--foreground)]"
                placeholder="Software Engineer"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Target Company</label>
              <input
                type="text"
                value={targetCompany}
                onChange={e => setTargetCompany(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none focus:border-[var(--foreground)]"
                placeholder="Google"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Target Completion Date</label>
            <input
              type="date"
              value={targetCompletionDate}
              onChange={e => setTargetCompletionDate(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none focus:border-[var(--foreground)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Daily Goal (Items)</label>
              <input
                type="number"
                value={dailyGoal}
                onChange={e => setDailyGoal(Number(e.target.value))}
                min="1"
                max="50"
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none focus:border-[var(--foreground)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Weekly Goal (Items)</label>
              <input
                type="number"
                value={weeklyGoal}
                onChange={e => setWeeklyGoal(Number(e.target.value))}
                min="1"
                max="200"
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm outline-none focus:border-[var(--foreground)]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-xs font-semibold hover:bg-[var(--border)]/20 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 px-5 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Goals</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
