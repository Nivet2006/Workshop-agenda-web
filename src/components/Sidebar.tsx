import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Clock, Search, X } from 'lucide-react';
import { Step } from '../data';
import { clsx } from 'clsx';

interface SidebarProps {
  steps: Step[];
  allSteps: Step[]; // Needed to maintain index/context if filtered
  currentStepId: number;
  onSelectStep: (id: number) => void;
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  completedSteps: Set<number>;
  isHidden: boolean;
}

export function Sidebar({ 
  steps, 
  allSteps,
  currentStepId, 
  onSelectStep, 
  isOpen, 
  onClose,
  searchQuery,
  setSearchQuery,
  completedSteps,
  isHidden
}: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        className={clsx(
          "fixed top-0 left-0 bottom-0 w-80 bg-black border-r border-zinc-900 z-50 flex flex-col transition-all duration-300",
          "lg:static lg:block lg:!transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isHidden && "lg:!w-0 lg:!border-r-0 lg:overflow-hidden"
        )}
        initial={false}
        animate={{ x: isOpen ? "0%" : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className={clsx("flex flex-col h-full", isHidden && "lg:opacity-0")}>
          {/* Header */}
          <div className="p-6 border-b border-zinc-900">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">Workshop<span className="font-accent text-zinc-400 ml-2">Agenda</span></h1>
                <p className="text-xs text-zinc-500 font-mono mt-1">NO-CODE AUTOMATION</p>
              </div>
              <button onClick={onClose} className="lg:hidden text-zinc-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search steps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {steps.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No steps found matching "{searchQuery}"
              </div>
            ) : (
              steps.map((step) => {
                const isActive = step.id === currentStepId;
                const isCompleted = completedSteps.has(step.id);

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      onSelectStep(step.id);
                      onClose();
                    }}
                    className={clsx(
                      "w-full text-left p-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                      isActive ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                    )}
                  >
                    {/* Active Indicator Line */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-white"
                      />
                    )}

                    <div className="flex items-start gap-3 pl-2">
                      <div className="mt-1 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-500/10" />
                        ) : isActive ? (
                          <Circle size={16} className="text-white fill-white" />
                        ) : (
                          <Circle size={16} className="text-zinc-700" />
                        )}
                      </div>
                      <div>
                        <div className="font-mono text-[10px] tracking-wider uppercase opacity-70 mb-0.5 flex items-center gap-1">
                          <Clock size={10} />
                          {step.timeRange}
                        </div>
                        <div className={clsx("text-sm font-medium leading-tight", isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200")}>
                          {step.title}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-900 text-zinc-600 text-xs font-mono">
            <p>MAKE.COM + TELEGRAM</p>
            <p className="mt-1">WORKSHOP GUIDE</p>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
