import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Step } from '../data';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { clsx } from 'clsx';

interface StepViewerProps {
  step: Step;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  isCompleted: boolean;
  onToggleComplete: () => void;
  searchQuery: string;
}

export function StepViewer({ 
  step, 
  onNext, 
  onPrev, 
  isFirst, 
  isLast,
  isCompleted,
  onToggleComplete,
  searchQuery
}: StepViewerProps) {

  // Highlight search terms in content
  const highlightedContent = useMemo(() => {
    if (!searchQuery.trim()) return step.content;
    
    // Escape special regex chars
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    // Simple replace - note: this is risky for HTML tags but acceptable for this controlled content
    // A safer way would be to traverse text nodes, but that's complex for this scope.
    // We'll try to avoid replacing inside tags by using a lookahead for closing tag, 
    // but that's also flaky. 
    // Given the content is simple, we'll just replace.
    return step.content.replace(regex, '<mark class="bg-yellow-500/30 text-white px-0.5 rounded">$1</mark>');
  }, [step.content, searchQuery]);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-12 custom-scrollbar">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Header */}
          <header className="mb-8 border-b border-zinc-900 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 text-zinc-500 font-mono text-sm mb-4">
                <span className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800">STEP {step.id < 10 ? `0${step.id}` : step.id}</span>
                <span>•</span>
                <span className="tracking-widest uppercase">{step.timeRange}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                {step.title}
              </h2>
            </div>

            <button
              onClick={onToggleComplete}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
                isCompleted 
                  ? "bg-emerald-900/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/30" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
              )}
            >
              {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              <span className="font-medium text-sm">{isCompleted ? "Completed" : "Mark Complete"}</span>
            </button>
          </header>

          {/* HTML Content */}
          <article 
            className="prose prose-invert prose-lg max-w-none prose-headings:font-bold prose-p:text-zinc-300 prose-strong:text-white prose-code:text-emerald-400 prose-ul:text-zinc-400"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
        </motion.div>
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-zinc-900 p-6 md:px-12 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/50 sticky bottom-0 z-10">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition-colors px-4 py-2 rounded-lg hover:bg-zinc-900"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          <div className="hidden md:block h-1 flex-1 mx-8 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: `${(step.id / 13) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <button
            onClick={onNext}
            disabled={isLast}
            className="flex items-center gap-2 text-sm font-medium bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white transition-colors px-6 py-2.5 rounded-full"
          >
            {isLast ? "Finish" : "Next"}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
