'use client';

import { useState, useEffect, useCallback } from 'react';
import { differenceInDays, isToday, isYesterday, parseISO, format } from 'date-fns';

export interface Problem {
  id: string;
  name: string;
  url: string;
  isProblem: boolean;
  platform: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
}

export interface Topic {
  id: string;
  name: string;
  problems: Problem[];
  resources: Problem[]; // resource matches same schema
}

export interface Category {
  id: string;
  name: string;
  topics: Topic[];
}

export interface UserProfile {
  name: string;
  targetRole: string;
  targetCompany: string;
  targetCompletionDate: string;
  dailyGoal: number; // in items (checklist items)
  weeklyGoal: number;
}

export interface LearningSession {
  id: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface UserState {
  completedItems: Record<string, boolean>; // id -> completed
  problemStatuses: Record<string, 'Not Started' | 'In Progress' | 'Solved' | 'Revisit'>;
  problemDifficulties: Record<string, 'Easy' | 'Medium' | 'Hard'>; // custom override or default
  notes: Record<string, string>; // topicId -> markdown note string
  bookmarks: Record<string, boolean>; // itemUrl/id -> bookmarked
  profile: UserProfile;
  sessions: LearningSession[];
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
  };
  activityHistory: Record<string, number>; // dateString (YYYY-MM-DD) -> items completed count
  languageFilter: 'All' | 'Java' | 'C++' | 'Python' | 'JavaScript';
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Code Explorer',
  targetRole: 'Software Engineer',
  targetCompany: 'FAANG',
  targetCompletionDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  dailyGoal: 3,
  weeklyGoal: 15,
};

const INITIAL_STATE: UserState = {
  completedItems: {},
  problemStatuses: {},
  problemDifficulties: {},
  notes: {},
  bookmarks: {},
  profile: DEFAULT_PROFILE,
  sessions: [],
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  },
  activityHistory: {},
  languageFilter: 'All',
};

export function useAppState() {
  const [state, setState] = useState<UserState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dsa_os_user_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({
          ...INITIAL_STATE,
          ...parsed,
          profile: { ...DEFAULT_PROFILE, ...parsed.profile },
          streak: parsed.streak || INITIAL_STATE.streak,
        });
      }
    } catch (e) {
      console.error('Failed to parse user state from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  const saveState = useCallback((newState: UserState) => {
    setState(newState);
    localStorage.setItem('dsa_os_user_state', JSON.stringify(newState));
  }, []);

  // Set Language Filter
  const setLanguageFilter = useCallback((language: 'All' | 'Java' | 'C++' | 'Python' | 'JavaScript') => {
    saveState({
      ...state,
      languageFilter: language,
    });
  }, [state, saveState]);

  // Toggle checklist item completion
  const toggleItemCompletion = useCallback((itemId: string) => {
    const isCompleted = !state.completedItems[itemId];
    const completedItems = { ...state.completedItems, [itemId]: isCompleted };
    
    // Update problem status if it's a problem
    const problemStatuses = { ...state.problemStatuses };
    if (isCompleted) {
      problemStatuses[itemId] = 'Solved';
    } else {
      problemStatuses[itemId] = 'Not Started';
    }

    // Streak / Activity updates
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const activityHistory = { ...state.activityHistory };
    
    if (isCompleted) {
      activityHistory[todayStr] = (activityHistory[todayStr] || 0) + 1;
    } else {
      activityHistory[todayStr] = Math.max(0, (activityHistory[todayStr] || 1) - 1);
    }

    // Recalculate streak
    let currentStreak = state.streak.currentStreak;
    let longestStreak = state.streak.longestStreak;
    let lastActiveDate = state.streak.lastActiveDate;

    if (isCompleted) {
      if (!lastActiveDate) {
        currentStreak = 1;
      } else {
        const diff = differenceInDays(new Date(), parseISO(lastActiveDate));
        if (diff === 1) {
          currentStreak += 1;
        } else if (diff > 1) {
          currentStreak = 1;
        }
      }
      lastActiveDate = todayStr;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      // If we uncompleted something, only reset streak if we have no activity today
      const todayCount = activityHistory[todayStr] || 0;
      if (todayCount === 0 && lastActiveDate === todayStr) {
        // Find previous active date in history
        const activeDates = Object.keys(activityHistory)
          .filter(d => activityHistory[d] > 0)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        
        if (activeDates.length > 0) {
          lastActiveDate = activeDates[0];
          // Recalculate active streak up to that date
          let tempStreak = 1;
          let tempLast = parseISO(lastActiveDate);
          for (let i = 1; i < activeDates.length; i++) {
            const prev = parseISO(activeDates[i]);
            const d = differenceInDays(tempLast, prev);
            if (d === 1) {
              tempStreak += 1;
              tempLast = prev;
            } else if (d > 1) {
              break;
            }
          }
          currentStreak = tempStreak;
        } else {
          currentStreak = 0;
          lastActiveDate = null;
        }
      }
    }

    saveState({
      ...state,
      completedItems,
      problemStatuses,
      activityHistory,
      streak: {
        currentStreak,
        longestStreak,
        lastActiveDate,
      },
    });
  }, [state, saveState]);

  // Update problem status manually (Not Started, In Progress, Solved, Revisit)
  const updateProblemStatus = useCallback((problemId: string, status: 'Not Started' | 'In Progress' | 'Solved' | 'Revisit') => {
    const problemStatuses = { ...state.problemStatuses, [problemId]: status };
    const completedItems = { ...state.completedItems };
    
    // Automatically keep completed items in sync
    if (status === 'Solved') {
      completedItems[problemId] = true;
      // Trigger streak record if not already recorded today
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const activityHistory = { ...state.activityHistory };
      if (!state.completedItems[problemId]) {
        activityHistory[todayStr] = (activityHistory[todayStr] || 0) + 1;
      }
      
      let currentStreak = state.streak.currentStreak;
      let longestStreak = state.streak.longestStreak;
      let lastActiveDate = state.streak.lastActiveDate;

      if (!state.completedItems[problemId]) {
        if (!lastActiveDate) {
          currentStreak = 1;
        } else {
          const diff = differenceInDays(new Date(), parseISO(lastActiveDate));
          if (diff === 1) {
            currentStreak += 1;
          } else if (diff > 1) {
            currentStreak = 1;
          }
        }
        lastActiveDate = todayStr;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      }

      saveState({
        ...state,
        completedItems,
        problemStatuses,
        activityHistory,
        streak: {
          currentStreak,
          longestStreak,
          lastActiveDate,
        },
      });
      return;
    } else {
      // If was Solved and now changed, unmark completed
      if (state.completedItems[problemId]) {
        completedItems[problemId] = false;
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const activityHistory = { ...state.activityHistory };
        activityHistory[todayStr] = Math.max(0, (activityHistory[todayStr] || 1) - 1);
        
        saveState({
          ...state,
          completedItems,
          problemStatuses,
          activityHistory,
        });
        return;
      }
    }

    saveState({
      ...state,
      problemStatuses,
    });
  }, [state, saveState]);

  // Update problem difficulty manually
  const updateProblemDifficulty = useCallback((problemId: string, difficulty: 'Easy' | 'Medium' | 'Hard') => {
    saveState({
      ...state,
      problemDifficulties: {
        ...state.problemDifficulties,
        [problemId]: difficulty,
      },
    });
  }, [state, saveState]);

  // Update Notes
  const saveNote = useCallback((topicId: string, noteText: string) => {
    saveState({
      ...state,
      notes: {
        ...state.notes,
        [topicId]: noteText,
      },
    });
  }, [state, saveState]);

  // Toggle Bookmarks
  const toggleBookmark = useCallback((itemId: string) => {
    saveState({
      ...state,
      bookmarks: {
        ...state.bookmarks,
        [itemId]: !state.bookmarks[itemId],
      },
    });
  }, [state, saveState]);

  // Save User Profile
  const saveProfile = useCallback((profile: UserProfile) => {
    saveState({
      ...state,
      profile,
    });
  }, [state, saveState]);

  // Track Study Sessions
  const addSession = useCallback((startTime: string, endTime: string) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));
    
    const newSession: LearningSession = {
      id: `session-${Date.now()}`,
      startTime,
      endTime,
      durationMinutes,
    };

    saveState({
      ...state,
      sessions: [...state.sessions, newSession],
    });
  }, [state, saveState]);

  return {
    state,
    isLoaded,
    toggleItemCompletion,
    updateProblemStatus,
    updateProblemDifficulty,
    saveNote,
    toggleBookmark,
    saveProfile,
    addSession,
    setLanguageFilter,
  };
}
export type AppState = ReturnType<typeof useAppState>;
