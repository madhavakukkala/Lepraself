'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, Terminal, BookOpen, Layers } from 'lucide-react';
import roadmapData from '../data/roadmap.json';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTopic: (topicId: string) => void;
}

export function CommandPalette({ isOpen, onClose, onNavigateTopic }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search indexing
  useEffect(() => {
    if (!query) {
      // Return recent or featured topics
      const featured: any[] = [];
      roadmapData.slice(0, 3).forEach(cat => {
        cat.topics.slice(0, 2).forEach(topic => {
          featured.push({
            type: 'Topic',
            id: topic.id,
            category: cat.name,
            name: topic.name,
            count: topic.problems.length + topic.resources.length
          });
        });
      });
      setResults(featured);
      return;
    }

    const filtered: any[] = [];
    const lowerQuery = query.toLowerCase();

    roadmapData.forEach(cat => {
      // Match Category
      if (cat.name.toLowerCase().includes(lowerQuery)) {
        filtered.push({
          type: 'Category',
          id: cat.id,
          name: cat.name,
          category: 'Category Index'
        });
      }

      cat.topics.forEach(topic => {
        // Match Topic
        if (topic.name.toLowerCase().includes(lowerQuery)) {
          filtered.push({
            type: 'Topic',
            id: topic.id,
            category: cat.name,
            name: topic.name,
            count: topic.problems.length + topic.resources.length
          });
        }

        // Match Problems
        topic.problems.forEach(prob => {
          if (prob.name.toLowerCase().includes(lowerQuery)) {
            filtered.push({
              type: 'Problem',
              id: topic.id,
              category: `${cat.name} → ${topic.name}`,
              name: prob.name,
              url: prob.url,
              platform: prob.platform
            });
          }
        });

        // Match Resources
        topic.resources.forEach(res => {
          if (res.name.toLowerCase().includes(lowerQuery)) {
            filtered.push({
              type: 'Resource',
              id: topic.id,
              category: `${cat.name} → ${topic.name}`,
              name: res.name,
              url: res.url,
              platform: res.platform
            });
          }
        });
      });
    });

    setResults(filtered.slice(0, 8)); // limit results to 8
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(1, results.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelect = (item: any) => {
    if (item.url) {
      window.open(item.url, '_blank');
    } else {
      onNavigateTopic(item.id);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 dark:bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-xl bg-[var(--card)] rounded-[var(--radius)] border border-[var(--border)] apple-shadow overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 border-b border-[var(--border)]">
          <Search className="w-5 h-5 text-[var(--muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search topics, problems, or categories..."
            className="w-full py-4 bg-transparent border-0 outline-none text-base text-[var(--foreground)] placeholder-[var(--muted-light)]"
          />
          <kbd className="text-[10px] font-semibold text-[var(--muted)] bg-[var(--background)] px-2 py-1 border border-[var(--border)] rounded-md">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-0.5">
          {results.length === 0 ? (
            <div className="py-8 text-center text-sm text-[var(--muted)]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            results.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={index}
                  onClick={() => handleSelect(item)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[var(--foreground)] text-[var(--background)]' 
                      : 'hover:bg-[var(--border)]/30 text-[var(--foreground)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.type === 'Topic' && <Layers className="w-4 h-4" />}
                    {item.type === 'Category' && <BookOpen className="w-4 h-4" />}
                    {(item.type === 'Problem' || item.type === 'Resource') && <Terminal className="w-4 h-4" />}
                    
                    <div>
                      <div className="text-sm font-semibold tracking-tight">{item.name}</div>
                      <div className={`text-xs ${isSelected ? 'text-[var(--background)]/75' : 'text-[var(--muted)]'}`}>
                        {item.category} {item.platform && `• ${item.platform}`} {item.count && `• ${item.count} items`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      isSelected 
                        ? 'bg-[var(--background)]/20 text-[var(--background)]' 
                        : 'bg-[var(--border)] text-[var(--muted)]'
                    }`}>
                      {item.type}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--background)] border-t border-[var(--border)] text-xs text-[var(--muted)]">
          <div className="flex gap-4">
            <span>↑↓ Navigation</span>
            <span>↵ Select</span>
          </div>
          <span>DSA OS Search</span>
        </div>
      </div>
    </div>
  );
}
