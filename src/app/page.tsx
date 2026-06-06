'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Terminal, 
  Layers, 
  Search, 
  Clock, 
  BookOpen, 
  Trophy, 
  Award, 
  Flame, 
  CheckCircle2, 
  Settings, 
  User, 
  Sun, 
  Moon, 
  ArrowRight, 
  BarChart3, 
  Bookmark, 
  Code2, 
  Check, 
  Play, 
  BookMarked,
  Filter
} from 'lucide-react';
import { useAppState, Problem, Topic, Category } from './hooks/useAppState';
import { CircularProgressVisualizer } from './components/CircularProgressVisualizer';
import { StreaksHeatmap } from './components/StreaksHeatmap';
import { CommandPalette } from './components/CommandPalette';
import { RoadmapVisualizer } from './components/RoadmapVisualizer';
import { LearningCalendar } from './components/LearningCalendar';
import { NotesDrawer } from './components/NotesDrawer';
import { ProfileModal } from './components/ProfileModal';
import { SessionTracker } from './components/SessionTracker';
import roadmapJson from './data/roadmap.json';

const roadmapData = roadmapJson as Category[];

export default function Home() {
  const router = useRouter();
  const {
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
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'landing' | 'dashboard' | 'roadmap' | 'analytics' | 'bookmarks'>('landing');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  // Setup Command Palette Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter roadmap data based on current language selection
  const filteredRoadmap = useMemo(() => {
    if (state.languageFilter === 'All') return roadmapData;
    
    return roadmapData.map(cat => {
      const topics = cat.topics.map(topic => {
        const problems = topic.problems.filter(p => p.language === 'Agnostic' || p.language === state.languageFilter);
        const resources = topic.resources.filter(r => r.language === 'Agnostic' || r.language === state.languageFilter);
        return { ...topic, problems, resources };
      }).filter(t => t.problems.length > 0 || t.resources.length > 0);
      
      return { ...cat, topics };
    }).filter(c => c.topics.length > 0);
  }, [state.languageFilter]);

  // Compute metrics
  const stats = useMemo(() => {
    let totalProblems = 0;
    let solvedProblems = 0;
    let totalResources = 0;
    let completedResources = 0;
    
    let solvedEasy = 0;
    let solvedMedium = 0;
    let solvedHard = 0;

    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;

    filteredRoadmap.forEach(cat => {
      cat.topics.forEach(topic => {
        topic.problems.forEach(p => {
          totalProblems++;
          if (p.difficulty === 'Easy') totalEasy++;
          else if (p.difficulty === 'Medium') totalMedium++;
          else if (p.difficulty === 'Hard') totalHard++;

          if (state.completedItems[p.id]) {
            solvedProblems++;
            if (p.difficulty === 'Easy') solvedEasy++;
            else if (p.difficulty === 'Medium') solvedMedium++;
            else if (p.difficulty === 'Hard') solvedHard++;
          }
        });

        topic.resources.forEach(r => {
          totalResources++;
          if (state.completedItems[r.id]) {
            completedResources++;
          }
        });
      });
    });

    const totalTopics = filteredRoadmap.reduce((acc, c) => acc + c.topics.length, 0);
    const completedTopics = filteredRoadmap.reduce((acc, c) => {
      return acc + c.topics.filter(t => {
        const totalItems = t.problems.length + t.resources.length;
        if (totalItems === 0) return false;
        const completed = t.problems.filter(p => state.completedItems[p.id]).length + 
                          t.resources.filter(r => state.completedItems[r.id]).length;
        return completed === totalItems;
      }).length;
    }, 0);

    return {
      totalProblems,
      solvedProblems,
      totalResources,
      completedResources,
      totalTopics,
      completedTopics,
      solvedEasy,
      solvedMedium,
      solvedHard,
      totalEasy,
      totalMedium,
      totalHard,
    };
  }, [filteredRoadmap, state.completedItems]);

  const selectedTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    for (const cat of roadmapData) {
      const topic = cat.topics.find(t => t.id === selectedTopicId);
      if (topic) return topic;
    }
    return null;
  }, [selectedTopicId]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black text-[var(--foreground)]">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="LEPRASELF Logo" className="w-20 h-20 object-contain animate-pulse" />
          <span className="text-sm font-semibold tracking-tight text-[var(--muted)]">Initializing LEPRASELF...</span>
        </div>
      </div>
    );
  }

  // --- Landing View ---
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col justify-between">
        {/* Nav Header */}
        <header className="px-6 py-4 flex justify-between items-center border-b border-[var(--border)] bg-white/95 dark:bg-black/95 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="LEPRASELF Logo" className="w-14 h-14 object-contain" />
            <span className="font-logo text-4xl tracking-normal text-black dark:text-white">Lepraself</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2 hover:bg-[var(--border)]/30 rounded-full transition text-[var(--foreground)]">
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 px-4 py-2 rounded-full text-xs font-semibold transition"
            >
              Start Learning
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto gap-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
            <Flame className="w-4 h-4 text-emerald-500 fill-emerald-500" />
            <span>Interactive Roadmap with 1,500+ Curated Problems &amp; Articles</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-logo tracking-normal leading-tight text-black dark:text-white max-w-3xl">
            Master Programming From Zero To Advanced
          </h1>

          <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl leading-relaxed">
            A complete programming mastery platform covering DSA, problem solving, core computer science subjects, interview preparation, and multiple programming languages.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 px-8 py-4 rounded-full text-sm font-semibold transition shadow-lg"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className="flex items-center justify-center gap-2 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]/40 px-8 py-4 rounded-full text-sm font-semibold transition"
            >
              <span>Visual Roadmap</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className="flex items-center justify-center gap-2 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]/40 px-8 py-4 rounded-full text-sm font-semibold transition"
            >
              <span>View Analytics</span>
            </button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 w-full text-left">
            <div className="p-5 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)]">
              <Layers className="w-6 h-6 mb-3 opacity-75" />
              <h3 className="font-bold text-sm mb-1">Roadmap Engine</h3>
              <p className="text-xs text-[var(--muted)]">19 categories cleanly nested from fundamentals to recursion.</p>
            </div>
            <div className="p-5 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)]">
              <Code2 className="w-6 h-6 mb-3 opacity-75" />
              <h3 className="font-bold text-sm mb-1">Multi-Language</h3>
              <p className="text-xs text-[var(--muted)]">Filter problems dynamically for Java, C++, Python, or JavaScript.</p>
            </div>
            <div className="p-5 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)]">
              <Flame className="w-6 h-6 mb-3 opacity-75" />
              <h3 className="font-bold text-sm mb-1">Streaks &amp; Heatmap</h3>
              <p className="text-xs text-[var(--muted)]">LeetCode-style daily streak system and contribution activity matrix.</p>
            </div>
            <div className="p-5 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)]">
              <Clock className="w-6 h-6 mb-3 opacity-75" />
              <h3 className="font-bold text-sm mb-1">Focus Session Timer</h3>
              <p className="text-xs text-[var(--muted)]">Study session duration logs with automatic streak maintenance.</p>
            </div>
          </div>
        </main>

        <footer className="py-6 border-t border-[var(--border)] text-center text-xs text-[var(--muted)]">
          &copy; {new Date().getFullYear()} LEPRASELF. Built with premium educational standards.
        </footer>
      </div>
    );
  }

  // --- Main Layout ---
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col text-[var(--foreground)]">
      
      {/* Top Header Navbar */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-[var(--border)] bg-white/95 dark:bg-black/95 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <img src="/logo.png" alt="LEPRASELF Logo" className="w-14 h-14 object-contain" />
            <span className="font-logo text-4xl tracking-normal text-black dark:text-white">Lepraself</span>
          </div>

          <nav className="hidden md:flex gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                activeTab === 'dashboard' ? 'bg-[var(--border)] text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                activeTab === 'roadmap' ? 'bg-[var(--border)] text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Roadmap
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                activeTab === 'analytics' ? 'bg-[var(--border)] text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                activeTab === 'bookmarks' ? 'bg-[var(--border)] text-[var(--foreground)]' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Bookmarks
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search Shortcut */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[var(--card)] hover:bg-[var(--border)]/30 border border-[var(--border)] rounded-full text-xs text-[var(--muted)] transition"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="text-[10px] font-semibold bg-[var(--background)] px-1.5 py-0.2 border border-[var(--border)] rounded">
              Ctrl K
            </kbd>
          </button>

          <button onClick={toggleDarkMode} className="p-2 hover:bg-[var(--border)]/30 rounded-full transition text-[var(--foreground)]">
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
          
          <button 
            onClick={() => setIsProfileOpen(true)} 
            className="p-2 hover:bg-[var(--border)]/30 rounded-full transition text-[var(--foreground)] flex items-center gap-2"
          >
            <User className="w-4.5 h-4.5" />
            <span className="hidden sm:inline text-xs font-bold">{state.profile.name}</span>
          </button>
        </div>
      </header>

      {/* Main content body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* LANGUAGE FILTER BUTTONS (affects everything) */}
        {activeTab !== 'bookmarks' && (
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--card)] p-4 rounded-[var(--radius)] border border-[var(--border)]">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
              <Filter className="w-4.5 h-4.5" />
              <span>Multi-Language Filter</span>
            </div>

            <div className="flex gap-2">
              {(['All', 'Java', 'C++', 'Python', 'JavaScript'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguageFilter(lang)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    state.languageFilter === lang
                      ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                      : 'bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)] border-[var(--border)]'
                  }`}
                >
                  {lang === 'All' ? 'Show Everything' : `${lang} Only`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- ROUTED TABS --- */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left sidebar / Calendar, Streak stats & study session timer */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <SessionTracker onAddSession={addSession} />
              
              <StreaksHeatmap 
                activityHistory={state.activityHistory} 
                currentStreak={state.streak.currentStreak} 
                longestStreak={state.streak.longestStreak} 
              />
              
              <LearningCalendar completedHistory={state.activityHistory} sessions={state.sessions} />
            </div>

            {/* Right Main panel / Category lists & checklist items */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Checklist Roadmap Engine</h2>
                  <p className="text-xs text-[var(--muted)]">Expand category topics to mark progress</p>
                </div>
              </div>

              {filteredRoadmap.map((cat) => (
                <div key={cat.id} className="p-6 bg-[var(--card)] rounded-[var(--radius)] border border-[var(--border)] apple-shadow flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
                    <h3 className="font-bold tracking-tight text-base">{cat.name}</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded-full text-[var(--muted)]">
                      {cat.topics.length} Topics
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {cat.topics.map((topic) => {
                      const isCompleted = topic.problems.length + topic.resources.length > 0 && 
                        topic.problems.every(p => state.completedItems[p.id]) && 
                        topic.resources.every(r => state.completedItems[r.id]);

                      return (
                        <div 
                          key={topic.id}
                          onClick={() => router.push(`/topic/${topic.id}`)}
                          className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--border)]/30 transition-all cursor-pointer flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                              isCompleted ? 'bg-emerald-500 text-white' : 'border border-[var(--border)]'
                            }`}>
                              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className={`text-sm font-semibold tracking-tight ${isCompleted ? 'text-[var(--muted)] line-through' : ''}`}>
                              {topic.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-[var(--muted)]">
                              {topic.problems.length} Problems • {topic.resources.length} resources
                            </span>
                            {state.notes[topic.id] && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Has Personal Note" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Visual Roadmap.sh Tab --- */}
        {activeTab === 'roadmap' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Interactive Visual Roadmap</h2>
                <p className="text-xs text-[var(--muted)]">A canvas-style layout mapping core dependencies</p>
              </div>
            </div>
            
            <RoadmapVisualizer 
              categories={filteredRoadmap}
              completedItems={state.completedItems}
              onSelectTopic={(id) => {
                router.push(`/topic/${id}`);
              }}
              activeTopicId={null}
            />
          </div>
        )}

        {/* --- Bookmarks Tab --- */}
        {activeTab === 'bookmarks' && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Bookmark className="w-6 h-6 text-black dark:text-white" />
                <span>Favorites Dashboard</span>
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Quick access to bookmarked items</p>
            </div>

            {/* Explanation Banner */}
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex flex-col gap-1">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">What are bookmarks?</h4>
              <p className="text-xs text-emerald-700/90 dark:text-emerald-300/80 leading-relaxed">
                Bookmarks allow you to save specific coding problems or reading resources so you can easily access them in one place. Tap the <strong>Save</strong> button on any item inside a topic's details drawer to add it to this Favorites Dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(state.bookmarks).filter(k => state.bookmarks[k]).map((bookmarkId) => {
                // Find problem or resource detail in JSON
                let foundItem: Problem | null = null;
                for (const cat of roadmapData) {
                  for (const t of cat.topics) {
                    const prob = t.problems.find(p => p.id === bookmarkId);
                    if (prob) { foundItem = prob; break; }
                    const res = t.resources.find(r => r.id === bookmarkId);
                    if (res) { foundItem = res; break; }
                  }
                  if (foundItem) break;
                }

                if (!foundItem) return null;

                return (
                  <div key={bookmarkId} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">{foundItem.platform}</span>
                      <h4 className="text-sm font-semibold mt-0.5">{foundItem.name}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(foundItem!.url, '_blank')}
                        className="px-3 py-1.5 bg-[var(--background)] hover:bg-[var(--border)]/30 border border-[var(--border)] text-xs font-semibold rounded-xl"
                      >
                        Launch
                      </button>
                      <button
                        onClick={() => toggleBookmark(bookmarkId)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-red-500 border border-[var(--border)]"
                      >
                        <Bookmark className="w-4 h-4 fill-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {Object.keys(state.bookmarks).filter(k => state.bookmarks[k]).length === 0 && (
                <div className="col-span-2 text-center py-12 text-sm text-[var(--muted)] border border-dashed border-[var(--border)] rounded-[var(--radius)]">
                  No bookmarks added yet. Tap bookmark tags inside dashboard items.
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Analytics Tab --- */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Advanced Analytics Dashboard</h2>
                <p className="text-xs text-[var(--muted)]">Real time progress tracking matrix</p>
              </div>
            </div>

            <CircularProgressVisualizer 
              solvedEasy={stats.solvedEasy}
              totalEasy={stats.totalEasy}
              solvedMedium={stats.solvedMedium}
              totalMedium={stats.totalMedium}
              solvedHard={stats.solvedHard}
              totalHard={stats.totalHard}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] text-left">
                <CheckCircle2 className="w-5 h-5 mb-2 text-emerald-500" />
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Topics Completed</span>
                <p className="text-2xl font-bold mt-1">{stats.completedTopics} / {stats.totalTopics}</p>
              </div>

              <div className="p-5 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] text-left">
                <BookMarked className="w-5 h-5 mb-2 text-blue-500" />
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Resources Finished</span>
                <p className="text-2xl font-bold mt-1">{stats.completedResources} / {stats.totalResources}</p>
              </div>

              <div className="p-5 bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] text-left">
                <Trophy className="w-5 h-5 mb-2 text-yellow-500" />
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Total Progress</span>
                <p className="text-2xl font-bold mt-1">
                  {Math.round(((stats.solvedProblems + stats.completedResources) / (stats.totalProblems + stats.totalResources)) * 100) || 0}% Done
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Command Palette Modal --- */}
      <CommandPalette 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)}
        onNavigateTopic={(topicId) => {
          router.push(`/topic/${topicId}`);
        }}
      />

      {/* --- User Goals Profile Modal --- */}
      <ProfileModal 
        isOpen={isProfileOpen}
        profile={state.profile}
        onSaveProfile={saveProfile}
        onClose={() => setIsProfileOpen(false)}
      />

    </div>
  );
}
