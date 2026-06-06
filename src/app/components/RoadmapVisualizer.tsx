'use client';

import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Milestone, Check } from 'lucide-react';
import { Category, Topic } from '../hooks/useAppState';

interface RoadmapVisualizerProps {
  categories: Category[];
  completedItems: Record<string, boolean>;
  onSelectTopic: (topicId: string) => void;
  activeTopicId: string | null;
}

export function RoadmapVisualizer({
  categories,
  completedItems,
  onSelectTopic,
  activeTopicId,
}: RoadmapVisualizerProps) {
  const [scale, setScale] = useState(1.1); // Start slightly larger
  const [offset, setOffset] = useState({ x: 100, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(categories[0]?.id || null);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse handlers for dragging/panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (factor: number) => {
    setScale(prev => Math.max(0.6, Math.min(2.2, prev * factor)));
  };

  const handleReset = () => {
    setScale(1.1);
    setOffset({ x: 100, y: 40 });
  };

  const getCategoryProgress = (cat: Category) => {
    let total = 0;
    let completed = 0;
    cat.topics.forEach(t => {
      t.problems.forEach(p => {
        total++;
        if (completedItems[p.id]) completed++;
      });
      t.resources.forEach(r => {
        total++;
        if (completedItems[r.id]) completed++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getTopicProgress = (topic: Topic) => {
    let total = 0;
    let completed = 0;
    topic.problems.forEach(p => {
      total++;
      if (completedItems[p.id]) completed++;
    });
    topic.resources.forEach(r => {
      total++;
      if (completedItems[r.id]) completed++;
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="relative w-full h-[650px] bg-[#FCFCFC] dark:bg-[#080808] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden apple-shadow">
      
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 glass p-1.5 rounded-full border border-[var(--border)] apple-shadow">
        <button
          onClick={() => handleZoom(1.15)}
          className="p-2.5 hover:bg-[var(--border)]/40 rounded-full transition-all text-[var(--foreground)]"
          title="Zoom In"
        >
          <ZoomIn className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={() => handleZoom(0.85)}
          className="p-2.5 hover:bg-[var(--border)]/40 rounded-full transition-all text-[var(--foreground)]"
          title="Zoom Out"
        >
          <ZoomOut className="w-4.5 h-4.5" />
        </button>
        <button
          onClick={handleReset}
          className="p-2.5 hover:bg-[var(--border)]/40 rounded-full transition-all text-[var(--foreground)]"
          title="Reset View"
        >
          <RotateCcw className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 text-xs font-semibold text-[var(--muted)] glass px-3.5 py-2 rounded-full border border-[var(--border)]">
        <Eye className="w-4 h-4" />
        <span>Pan &amp; Zoom Active. Click milestones to explore branches.</span>
      </div>

      {/* Visual Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      >
        <div
          className="origin-top-left transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          {/* Timeline Path Flow */}
          <div className="flex gap-24 items-start p-16 relative min-w-[1500px]">
            
            {/* SVG Connecting Paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
              {/* Central horizontal line connecting categories */}
              <line 
                x1={100} 
                y1={200} 
                x2={categories.length * 480} 
                y2={200} 
                className="stroke-[#EAEAEA] dark:stroke-[#1F1F1F]" 
                strokeWidth={4} 
              />
            </svg>

            {/* Render Horizontal Timeline Node List */}
            {categories.map((cat, index) => {
              const progress = getCategoryProgress(cat);
              const isSelected = expandedCategory === cat.id;

              return (
                <div key={cat.id} className="flex flex-col items-center relative z-10 w-[380px]">
                  
                  {/* SVG Vertical branch from category center line to expanded list below */}
                  {isSelected && (
                    <svg className="absolute top-[210px] left-1/2 transform -translate-x-1/2 w-1 h-[60px] pointer-events-none z-0">
                      <line 
                        x1="0" 
                        y1="0" 
                        x2="0" 
                        y2="60" 
                        className="stroke-emerald-500" 
                        strokeWidth={2.5} 
                        strokeDasharray="4 4"
                      />
                    </svg>
                  )}

                  {/* Main Category Node Card (Large & Bold) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCategory(isSelected ? null : cat.id);
                    }}
                    className={`p-6 rounded-[22px] border-2 transition-all cursor-pointer w-full text-left flex flex-col gap-3.5 apple-shadow ${
                      isSelected
                        ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)] scale-105 shadow-xl'
                        : 'bg-[var(--card)] hover:bg-[var(--border)]/40 border-[var(--border)] text-[var(--foreground)]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2.5">
                        <Milestone className={`w-5.5 h-5.5 ${isSelected ? 'text-[var(--background)]' : 'text-[var(--muted)]'}`} />
                        <h4 className="font-extrabold tracking-tight text-base">{cat.name}</h4>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isSelected 
                          ? 'bg-[var(--background)]/20 text-[var(--background)] border border-[var(--background)]/35' 
                          : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                      }`}>
                        {progress}%
                      </span>
                    </div>

                    {/* Progress slider track */}
                    <div className={`w-full h-2 rounded-full ${isSelected ? 'bg-[var(--background)]/20' : 'bg-[#EAEAEA] dark:bg-[#222222]'} overflow-hidden`}>
                      <div
                        className={`h-full transition-all ${isSelected ? 'bg-[var(--background)]' : 'bg-emerald-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className={`text-xs flex justify-between font-semibold ${isSelected ? 'text-[var(--background)]/85' : 'text-[var(--muted)]'}`}>
                      <span>Step {index + 1} • {cat.topics.length} Modules</span>
                      <span>{isSelected ? 'Click to hide details' : 'Click to expand details'}</span>
                    </div>
                  </div>

                  {/* Topics List (Branches down underneath category node) */}
                  {isSelected && (
                    <div className="mt-14 w-full flex flex-col gap-3.5 bg-[var(--card)] p-5 border border-[var(--border)] rounded-[var(--radius)] shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] border-b border-[var(--border)] pb-2 mb-1">
                        Topic Modules ({cat.topics.length})
                      </div>
                      
                      {cat.topics.map((topic) => {
                        const tProgress = getTopicProgress(topic);
                        const isActive = activeTopicId === topic.id;
                        const totalItems = topic.problems.length + topic.resources.length;

                        return (
                          <div
                            key={topic.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTopic(topic.id);
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                              isActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-[var(--foreground)] shadow-sm'
                                : 'bg-[var(--background)] hover:bg-[var(--border)]/30 border-[var(--border)] text-[var(--foreground)]'
                            }`}
                          >
                            <div className="flex flex-col gap-1.5 max-w-[240px]">
                              <h5 className="font-bold tracking-tight text-xs">{topic.name}</h5>
                              <span className="text-[10px] text-[var(--muted)]">
                                {totalItems} Checklist tasks • {topic.problems.length} problems
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {tProgress === 100 ? (
                                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                                  {tProgress}%
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        </div>
      </div>
    </div>
  );
}
