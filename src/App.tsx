/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { StepViewer } from './components/StepViewer';
import { workshopSteps } from './data';
import { Menu, Maximize2, Minimize2, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function App() {
  const [currentStepId, setCurrentStepId] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter steps based on search query
  const filteredSteps = useMemo(() => {
    if (!searchQuery.trim()) return workshopSteps;
    const query = searchQuery.toLowerCase();
    return workshopSteps.filter(step => 
      step.title.toLowerCase().includes(query) || 
      step.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Ensure current step is valid after filtering
  const currentStep = workshopSteps.find(s => s.id === currentStepId) || workshopSteps[0];

  // Progress Calculation
  const progressPercentage = Math.round((completedSteps.size / workshopSteps.length) * 100);

  const handleNext = () => {
    if (currentStepId < workshopSteps.length) {
      setCurrentStepId(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepId > 1) {
      setCurrentStepId(prev => prev - 1);
    }
  };

  const handleSelectStep = (id: number) => {
    setCurrentStepId(id);
    setIsSidebarOpen(false);
  };

  const toggleStepCompletion = (id: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Listen for fullscreen change events (e.g. user pressing Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Mobile Header */}
      <div className={clsx(
        "lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur border-b border-zinc-900 z-30 flex items-center justify-between px-4 transition-transform duration-300",
        isFullscreen && "-translate-y-full"
      )}>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-zinc-400 hover:text-white"
        >
          <Menu size={24} />
        </button>
        <span className="font-bold tracking-widest text-sm">NIVET2006</span>
        <div className="w-8" /> {/* Spacer for balance */}
      </div>

      <Sidebar 
        steps={filteredSteps}
        allSteps={workshopSteps}
        currentStepId={currentStepId}
        onSelectStep={handleSelectStep}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        completedSteps={completedSteps}
        isHidden={isFullscreen}
      />

      <main className="flex-1 flex flex-col relative w-full pt-16 lg:pt-0 transition-all duration-300">
        {/* Desktop Badge & Controls */}
        <div className={clsx(
          "absolute top-6 right-8 z-20 flex items-center gap-4 transition-all duration-500",
          isFullscreen ? "opacity-0 pointer-events-none translate-y-[-20px]" : "opacity-100"
        )}>
           {/* Progress Indicator */}
           <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 backdrop-blur">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Progress</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{progressPercentage}%</span>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-zinc-700 flex items-center justify-center relative">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-800"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="text-emerald-500 transition-all duration-1000 ease-out"
                  strokeDasharray={`${progressPercentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                />
              </svg>
            </div>
          </div>

          <div className="font-bold tracking-[0.2em] text-sm text-zinc-500 hover:text-white transition-colors cursor-default border border-zinc-800 px-4 py-3 rounded-full bg-black/50 backdrop-blur">
            NIVET2006
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        {/* Floating Fullscreen Exit Button (Visible only when fullscreen) */}
        <div className={clsx(
          "absolute top-6 right-8 z-30 transition-all duration-500",
          isFullscreen ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-[-20px]"
        )}>
           <button
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-black/50 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors backdrop-blur"
            title="Exit Fullscreen"
          >
            <Minimize2 size={18} />
          </button>
        </div>

        <StepViewer 
          step={currentStep}
          onNext={handleNext}
          onPrev={handlePrev}
          isFirst={currentStepId === 1}
          isLast={currentStepId === workshopSteps.length}
          isCompleted={completedSteps.has(currentStep.id)}
          onToggleComplete={() => toggleStepCompletion(currentStep.id)}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
}
