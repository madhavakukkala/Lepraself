'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Save, FileText, Code, Check } from 'lucide-react';

interface NotesDrawerProps {
  topicId: string;
  topicName: string;
  initialNote: string;
  onSaveNote: (topicId: string, text: string) => void;
  onClose: () => void;
}

export function NotesDrawer({
  topicId,
  topicName,
  initialNote,
  onSaveNote,
  onClose,
}: NotesDrawerProps) {
  const [noteText, setNoteText] = useState(initialNote);
  const [isSaved, setIsSaved] = useState(false);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sync state when topic changes
  useEffect(() => {
    setNoteText(initialNote);
    setIsSaved(false);
  }, [topicId, initialNote]);

  // Autosave notes on typing (500ms debounce)
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNoteText(text);
    setIsSaved(false);

    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);

    autoSaveTimeout.current = setTimeout(() => {
      onSaveNote(topicId, text);
      setIsSaved(true);
    }, 800);
  };

  const handleManualSave = () => {
    onSaveNote(topicId, noteText);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById('notes-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selected = text.substring(start, end);

    let insertion = '';
    if (syntax === 'code') {
      insertion = `\`\`\`cpp\n${selected || '// Insert your code here'}\n\`\`\``;
    } else if (syntax === 'bold') {
      insertion = `**${selected || 'bold text'}**`;
    } else if (syntax === 'header') {
      insertion = `### ${selected || 'Header'}`;
    } else if (syntax === 'list') {
      insertion = `\n- ${selected || 'list item'}`;
    }

    const newText = before + insertion + after;
    setNoteText(newText);
    onSaveNote(topicId, newText);
    setIsSaved(true);
    
    // Focus back
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 50);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-[var(--card)] border-l border-[var(--border)] apple-shadow flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div>
          <span className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Notebook</span>
          <h3 className="text-sm font-bold tracking-tight truncate max-w-[280px]">{topicName}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isSaved ? (
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Autosaved</span>
            </span>
          ) : (
            <span className="text-[10px] text-[var(--muted)]">Saving...</span>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--border)] rounded-full transition text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>

      {/* Editor Helper Actions */}
      <div className="flex gap-1 p-2 bg-[var(--background)] border-b border-[var(--border)]">
        <button
          onClick={() => insertMarkdown('header')}
          className="p-1.5 hover:bg-[var(--border)] rounded text-xs font-bold"
          title="Heading"
        >
          H3
        </button>
        <button
          onClick={() => insertMarkdown('bold')}
          className="p-1.5 hover:bg-[var(--border)] rounded text-xs font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() => insertMarkdown('code')}
          className="p-1.5 hover:bg-[var(--border)] rounded flex items-center gap-1 text-xs"
          title="Code Block"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Code</span>
        </button>
        <button
          onClick={() => insertMarkdown('list')}
          className="p-1.5 hover:bg-[var(--border)] rounded text-xs"
          title="Bullet List"
        >
          &bull; List
        </button>
      </div>

      {/* Text Area */}
      <div className="flex-1 p-4 bg-[var(--background)]">
        <textarea
          id="notes-textarea"
          value={noteText}
          onChange={handleTextChange}
          placeholder="Take notes, draft code snippets, or document key concepts about this topic. Supports markdown format."
          className="w-full h-full bg-transparent border-0 outline-none resize-none font-mono text-sm leading-relaxed text-[var(--foreground)] placeholder-[var(--muted-light)]"
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)] flex justify-between items-center bg-[var(--card)]">
        <span className="text-xs text-[var(--muted)]">Notes auto-save when you type.</span>
        <button
          onClick={handleManualSave}
          className="flex items-center gap-1.5 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 px-4 py-2 rounded-xl text-xs font-semibold transition"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save now</span>
        </button>
      </div>
    </div>
  );
}
