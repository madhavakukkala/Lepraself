'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  BookOpen, 
  Code2, 
  Check, 
  Bookmark, 
  Home,
  Sun,
  Moon,
  ChevronRight,
  Notebook
} from 'lucide-react';
import { useAppState, Category, Topic } from '../../hooks/useAppState';
import roadmapJson from '../../data/roadmap.json';

const roadmapData = roadmapJson as Category[];

export default function TopicPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;

  const {
    state,
    isLoaded,
    toggleItemCompletion,
    updateProblemStatus,
    updateProblemDifficulty,
    saveNote,
    toggleBookmark,
  } = useAppState();

  const [darkMode, setDarkMode] = useState(false);

  // Initialize Dark Mode preference
  useEffect(() => {
    const isDark = localStorage.getItem('dsa_os_dark') === 'true' || 
      (!('dsa_os_dark' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    localStorage.setItem('dsa_os_dark', String(newDark));
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Find the current category and topic
  const { category, topic } = useMemo(() => {
    let foundCategory: Category | null = null;
    let foundTopic: Topic | null = null;

    for (const cat of roadmapData) {
      const t = cat.topics.find(t => t.id === topicId);
      if (t) {
        foundCategory = cat;
        foundTopic = t;
        break;
      }
    }

    return { category: foundCategory, topic: foundTopic };
  }, [topicId]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <img src="/logo.png" alt="LEPRASELF Logo" className="w-16 h-16 object-contain" />
          <span className="text-xs font-semibold text-[var(--muted)]">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold tracking-tight mb-2">Topic Not Found</h2>
        <p className="text-sm text-[var(--muted)] mb-6">The topic you are looking for does not exist or has been removed.</p>
        <Link 
          href="/"
          className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold transition hover:opacity-90"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col font-sans transition-colors duration-300">
      
      {/* --- TOP HEADER --- */}
      <header className="border-b border-[var(--border)] bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 hover:bg-[var(--border)]/30 rounded-xl transition border border-[var(--border)] flex items-center justify-center text-[var(--foreground)]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            <div className="h-4 w-[1px] bg-[var(--border)]" />
            
            {/* Branding Logo and Name */}
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="LEPRASELF Logo" className="w-14 h-14 object-contain" />
              <span className="font-logo text-4xl tracking-normal text-black dark:text-white">Lepraself</span>
            </Link>

            <span className="text-xs text-[var(--muted)] font-semibold flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              {category?.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleDarkMode}
              className="p-2 hover:bg-[var(--border)]/30 rounded-xl transition border border-[var(--border)] text-[var(--foreground)]"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link 
              href="/" 
              className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-transparent"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* --- TOPIC INTRO BANNER --- */}
        <div className="p-8 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] apple-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Workspace</span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{topic.name}</h1>
            <p className="text-xs text-[var(--muted)] mt-1.5 max-w-xl">
              Complete the resources and coding practice problems below to master this topic. Add your notes and revisit regularly to maximize retention.
            </p>
          </div>
        </div>

        {/* --- TWO-COLUMN WORKSPACE LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN: Resources and Problems Checklist (Span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Resources Checklist section */}
            <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] apple-shadow flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5 border-b border-[var(--border)] pb-3">
                <BookOpen className="w-4 h-4" />
                <span>Reading Resources &amp; Articles ({topic.resources.length})</span>
              </h4>

              <div className="flex flex-col gap-2">
                {topic.resources.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] py-4 text-center">No reference resources available for this topic.</p>
                ) : (
                  topic.resources.map((res) => {
                    const isCompleted = state.completedItems[res.id];
                    const isBookmarked = state.bookmarks[res.id];

                    return (
                      <div key={res.id} className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl flex justify-between items-center transition hover:border-[var(--muted-light)]">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleItemCompletion(res.id)}
                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                              isCompleted ? 'bg-emerald-500 border-transparent text-white' : 'border-[var(--border)]'
                            }`}
                          >
                            {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div>
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold hover:underline block truncate max-w-[260px] md:max-w-[380px]"
                            >
                              {res.name}
                            </a>
                            <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">{res.platform}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleBookmark(res.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[var(--border)]/30 rounded-xl transition border border-[var(--border)] text-[10px] font-bold ${
                              isBookmarked 
                                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30' 
                                : 'text-[var(--muted)]'
                            }`}
                            title={isBookmarked ? "Remove from Favorites" : "Add to Favorites"}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-red-600 dark:fill-red-400' : ''}`} />
                            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Problems Checklist section */}
            <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] apple-shadow flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5 border-b border-[var(--border)] pb-3">
                <Code2 className="w-4 h-4" />
                <span>Coding Problems &amp; Practice ({topic.problems.length})</span>
              </h4>

              <div className="flex flex-col gap-3">
                {topic.problems.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] py-4 text-center">No practice problems available for this topic.</p>
                ) : (
                  topic.problems.map((prob) => {
                    const isCompleted = state.completedItems[prob.id];
                    const isBookmarked = state.bookmarks[prob.id];
                    const currentStatus = state.problemStatuses[prob.id] || 'Not Started';
                    const currentDifficulty = state.problemDifficulties[prob.id] || prob.difficulty;

                    const difficultyColor = 
                      currentDifficulty === 'Easy' ? 'bg-[#4ADE80]/15 text-[#248A3D]' : 
                      currentDifficulty === 'Medium' ? 'bg-[#F59E0B]/15 text-[#B25E00]' : 
                      'bg-[#EF4444]/15 text-[#B91C1C]';

                    return (
                      <div key={prob.id} className="p-4 bg-[var(--background)] border border-[var(--border)] rounded-2xl flex flex-col gap-3 transition hover:border-[var(--muted-light)]">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleItemCompletion(prob.id)}
                              className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                                isCompleted ? 'bg-emerald-500 border-transparent text-white' : 'border-[var(--border)]'
                              }`}
                            >
                              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>
                            <div>
                              <a
                                href={prob.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold hover:underline block truncate max-w-[220px] md:max-w-[340px]"
                              >
                                {prob.name}
                              </a>
                              <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">{prob.platform}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${difficultyColor}`}>
                              {currentDifficulty}
                            </span>
                            <button
                              onClick={() => toggleBookmark(prob.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[var(--border)]/30 rounded-xl transition border border-[var(--border)] text-[10px] font-bold ${
                                isBookmarked 
                                  ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30' 
                                  : 'text-[var(--muted)]'
                              }`}
                              title={isBookmarked ? "Remove from Favorites" : "Add to Favorites"}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-red-600 dark:fill-red-400' : ''}`} />
                              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Status Overrides controls */}
                        <div className="flex justify-between items-center border-t border-[var(--border)] pt-2.5">
                          <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Status Override</span>
                          
                          <div className="flex gap-1">
                            {(['Not Started', 'In Progress', 'Solved', 'Revisit'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => updateProblemStatus(prob.id, status)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                                  currentStatus === status
                                    ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent'
                                    : 'bg-transparent text-[var(--muted)] border-[var(--border)] hover:border-[var(--muted)]'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Dedicated Markdown Notes & Progress Overview */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Notes Section Card */}
            <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] apple-shadow flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                  <Notebook className="w-4 h-4" />
                  <span>Topic Notes</span>
                </span>
                <span className="text-[10px] text-[var(--muted)] font-semibold">Autosaved</span>
              </div>
              
              <textarea
                value={state.notes[topic.id] || ''}
                onChange={(e) => saveNote(topic.id, e.target.value)}
                placeholder="Write markdown notes, code snippets, or key concepts for this topic here..."
                className="w-full h-80 p-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] font-mono text-xs outline-none focus:border-[var(--foreground)] resize-none"
              />
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                Your notes are persisted locally on your device. You can write rich markdown details or keep a diary of your progress.
              </p>
            </div>
            
          </div>

        </div>

      </main>

    </div>
  );
}
