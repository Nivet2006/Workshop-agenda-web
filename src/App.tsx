/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { StepViewer } from './components/StepViewer';
import { AuthModal } from './features/auth/AuthModal';
import { ProfileConfirmationModal } from './features/auth/ProfileConfirmationModal';
import { EventAccessModal } from './features/events/EventAccessModal';
import { LiveQuizRoom } from './features/live-quiz/LiveQuizRoom';
import { OrganizerDashboard } from './features/organizer/OrganizerDashboard';
import { GuideBuilder } from './features/guide-builder/GuideBuilder';
import { 
  EventModel, 
  EventSection, 
  EventStep, 
  UserProfile 
} from './types';
import { 
  getEventByCode, 
  getEventSections, 
  getEventSteps, 
  saveStepProgress, 
  getCompletedStepIds, 
  saveTaskProgress, 
  getCompletedTaskIds, 
  getCurrentUserProfile, 
  signOutUser 
} from './lib/supabase';
import { 
  sampleEvent, 
  sampleSections, 
  sampleSteps,
  linkedinEvent,
  linkedinSections,
  linkedinSteps
} from './lib/seedData';
import { 
  Menu, 
  Maximize2, 
  Minimize2, 
  LogIn, 
  User, 
  Layers, 
  BarChart3, 
  Play, 
  KeyRound, 
  Compass, 
  LogOut,
  ChevronDown,
  PanelLeft,
  Plus,
  Minus
} from 'lucide-react';
import { clsx } from 'clsx';

type AppViewMode = 'guide' | 'live-quiz' | 'organizer' | 'builder';

export const FONT_SCALES = [
  { scale: 0.85, label: '85%' },
  { scale: 0.92, label: '92%' },
  { scale: 1.0, label: '100%' },
  { scale: 1.12, label: '112%' },
  { scale: 1.25, label: '125%' },
  { scale: 1.4, label: '140%' }
];

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>('guide');
  const [currentEvent, setCurrentEvent] = useState<EventModel>(linkedinEvent);
  const [sections, setSections] = useState<EventSection[]>(linkedinSections);
  const [steps, setSteps] = useState<EventStep[]>(linkedinSteps);
  const [currentStepId, setCurrentStepId] = useState<string>(linkedinSteps[0].id);

  // Font Size Resizer State
  const [fontScaleIndex, setFontScaleIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('workshop_agenda_font_scale_idx');
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed < FONT_SCALES.length) {
            return parsed;
          }
        }
      } catch {
        // Ignore localStorage error
      }
    }
    return 2; // Default 100%
  });

  const handleDecreaseFont = () => {
    setFontScaleIndex(prev => {
      const next = Math.max(0, prev - 1);
      try {
        localStorage.setItem('workshop_agenda_font_scale_idx', String(next));
      } catch {}
      return next;
    });
  };

  const handleIncreaseFont = () => {
    setFontScaleIndex(prev => {
      const next = Math.min(FONT_SCALES.length - 1, prev + 1);
      try {
        localStorage.setItem('workshop_agenda_font_scale_idx', String(next));
      } catch {}
      return next;
    });
  };

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // User Profile & Auth
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEventAccessModalOpen, setIsEventAccessModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Progress tracking
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  // Load User Profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getCurrentUserProfile();
      setCurrentUser(profile);
      const userId = profile ? profile.id : 'guest-user';
      const stepIds = await getCompletedStepIds(userId, currentEvent.id);
      const taskIds = await getCompletedTaskIds(userId);
      setCompletedSteps(stepIds);
      setCompletedTaskIds(taskIds);
    };

    loadProfile();
    const handleAuthChange = () => loadProfile();
    window.addEventListener('eventflow_auth_change', handleAuthChange);
    return () => window.removeEventListener('eventflow_auth_change', handleAuthChange);
  }, [currentEvent.id]);

  // Load Event Data when event changes
  useEffect(() => {
    const loadEventData = async () => {
      const [loadedSections, loadedSteps] = await Promise.all([
        getEventSections(currentEvent.id),
        getEventSteps(currentEvent.id)
      ]);

      if (loadedSections.length > 0) setSections(loadedSections);
      if (loadedSteps.length > 0) {
        setSteps(loadedSteps);
        setCurrentStepId(loadedSteps[0].id);
      }
    };

    loadEventData();
  }, [currentEvent.id]);

  // Filter steps based on search query
  const filteredSteps = useMemo(() => {
    if (!searchQuery.trim()) return steps;
    const query = searchQuery.toLowerCase();
    return steps.filter(step => 
      step.title.toLowerCase().includes(query) || 
      (step.content?.html && step.content.html.toLowerCase().includes(query)) ||
      (step.summary && step.summary.toLowerCase().includes(query))
    );
  }, [searchQuery, steps]);

  const currentStep = useMemo(() => {
    return steps.find(s => s.id === currentStepId) || steps[0] || sampleSteps[0];
  }, [steps, currentStepId]);

  const currentStepIndex = useMemo(() => {
    return steps.findIndex(s => s.id === currentStep.id);
  }, [steps, currentStep.id]);

  // Progress Calculation
  const progressPercentage = useMemo(() => {
    if (steps.length === 0) return 0;
    return Math.round((completedSteps.size / steps.length) * 100);
  }, [completedSteps.size, steps.length]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepId(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepId(steps[currentStepIndex - 1].id);
    }
  };

  const handleSelectStep = (id: string) => {
    setCurrentStepId(id);
    setIsSidebarOpen(false);
  };

  const toggleStepCompletion = async (id: string) => {
    const isCurrentlyDone = completedSteps.has(id);
    const newStatus = isCurrentlyDone ? 'in_progress' : 'completed';

    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyDone) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });

    const userId = currentUser ? currentUser.id : 'guest-user';
    await saveStepProgress(userId, currentEvent.id, id, newStatus);
  };

  const toggleTask = async (taskId: string, isDone: boolean) => {
    setCompletedTaskIds(prev => {
      const newSet = new Set(prev);
      if (isDone) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });

    const userId = currentUser ? currentUser.id : 'guest-user';
    await saveTaskProgress(userId, taskId, !isDone);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Fullscreen request failed: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden font-sans selection:bg-[#FF5722] selection:text-white">
      {/* Mobile Top Header */}
      <div className={clsx(
        "lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0A0A0A] border-b border-[#242424] z-30 flex items-center justify-between px-4 transition-transform duration-300",
        isFullscreen && "-translate-y-full"
      )}>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-[#A1A1A1] hover:text-white"
        >
          <Menu size={20} />
        </button>
        <img 
          src="/logotext.png" 
          alt="The One Percent Club" 
          className="h-5 max-w-[180px] w-auto object-contain shrink-0" 
        />
        <button
          onClick={() => setIsEventAccessModalOpen(true)}
          className="text-xs font-mono text-[#A1A1A1] hover:text-white"
        >
          <KeyRound size={16} />
        </button>
      </div>

      {/* Main Left Navigation Sidebar (Participant Guide) */}
      {viewMode === 'guide' && (
        <Sidebar 
          steps={filteredSteps}
          allSteps={steps}
          sections={sections}
          currentStepId={currentStepId}
          onSelectStep={handleSelectStep}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          completedSteps={completedSteps}
          isHidden={isFullscreen}
          eventTitle={currentEvent.title}
          accessCode={currentEvent.accessCode}
        />
      )}

      {/* Central View Switcher & Screen Canvas */}
      <main className="flex-1 flex flex-col relative w-full pt-14 lg:pt-0 transition-all duration-300 overflow-hidden bg-[#0A0A0A]">
        {/* Top Desktop Controls & Navigation Bar */}
        <div className={clsx(
          "h-14 border-b border-[#242424] px-6 flex items-center justify-between bg-[#0A0A0A] z-20 shrink-0",
          isFullscreen ? "hidden" : "flex"
        )}>
          {/* Left: View Switcher Nav */}
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            {viewMode === 'guide' && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:flex items-center justify-center p-2 rounded-md text-[#A1A1A1] hover:text-white hover:bg-[#161616] border border-[#242424] transition-colors"
                title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <PanelLeft size={14} />
              </button>
            )}

            <div className="flex items-center pr-3 lg:pr-4 border-r border-[#242424]">
              <img 
                src="/logotext.png" 
                alt="The One Percent Club" 
                className="h-5 sm:h-6 max-h-6 w-auto max-w-[200px] lg:max-w-[240px] object-contain shrink-0" 
              />
            </div>

            <button
              onClick={() => setViewMode('guide')}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-colors",
                viewMode === 'guide' ? "bg-[#161616] border border-[#242424] text-white" : "text-[#A1A1A1] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Compass size={13} />
              <span>Guide</span>
            </button>

            {/* Hidden for now: Arena, Organizer, Builder */}
            {false && (
              <>
                <button
                  onClick={() => setViewMode('live-quiz')}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-colors",
                    viewMode === 'live-quiz' ? "bg-[#161616] border border-[#242424] text-[#C5A059]" : "text-[#A1A1A1] hover:text-white hover:bg-[#111111]"
                  )}
                >
                  <Play size={13} />
                  <span>Arena</span>
                </button>

                <button
                  onClick={() => setViewMode('organizer')}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-colors",
                    viewMode === 'organizer' ? "bg-[#161616] border border-[#242424] text-[#14B8A6]" : "text-[#A1A1A1] hover:text-white hover:bg-[#111111]"
                  )}
                >
                  <BarChart3 size={13} />
                  <span>Organizer</span>
                </button>

                <button
                  onClick={() => setViewMode('builder')}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-colors",
                    viewMode === 'builder' ? "bg-[#161616] border border-[#242424] text-white" : "text-[#A1A1A1] hover:text-white hover:bg-[#111111]"
                  )}
                >
                  <Layers size={13} />
                  <span>Builder</span>
                </button>
              </>
            )}
          </div>

          {/* Right: Progress, Font Controls, Event Code Switcher, Profile & Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Minimal Progress Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#111111] border border-[#242424]">
              <span className="text-[9px] font-mono text-[#666666] uppercase tracking-wider">PROGRESS</span>
              <span className="text-xs font-mono text-[#14B8A6] font-medium">{progressPercentage}%</span>
            </div>

            {/* Font Size Adjuster Controls (- and +) beside PROGRESS */}
            <div 
              className="flex items-center rounded-md bg-[#111111] border border-[#242424] p-0.5"
              title="Adjust reading font size"
            >
              <button
                type="button"
                onClick={handleDecreaseFont}
                disabled={fontScaleIndex <= 0}
                className="w-6 h-6 flex items-center justify-center rounded text-[#A1A1A1] hover:text-white hover:bg-[#1A1A1A] disabled:opacity-25 disabled:hover:text-[#A1A1A1] disabled:hover:bg-transparent transition-colors"
                aria-label="Decrease font size"
                title="Decrease font size (-)"
              >
                <Minus size={13} strokeWidth={2.2} />
              </button>
              <span className="px-1 text-[10px] font-mono text-[#737373] select-none min-w-[34px] text-center font-medium">
                {FONT_SCALES[fontScaleIndex].label}
              </span>
              <button
                type="button"
                onClick={handleIncreaseFont}
                disabled={fontScaleIndex >= FONT_SCALES.length - 1}
                className="w-6 h-6 flex items-center justify-center rounded text-[#A1A1A1] hover:text-white hover:bg-[#1A1A1A] disabled:opacity-25 disabled:hover:text-[#A1A1A1] disabled:hover:bg-transparent transition-colors"
                aria-label="Increase font size"
                title="Increase font size (+)"
              >
                <Plus size={13} strokeWidth={2.2} />
              </button>
            </div>

            {/* Hidden for now: Event Access Code Badge (LINKEDIN) */}
            {false && (
              <button
                onClick={() => setIsEventAccessModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111111] border border-[#242424] text-[#D4D4D4] hover:text-white hover:border-[#404040] transition-colors text-xs font-mono"
                title="Click to switch or enter event code"
              >
                <KeyRound size={12} className="text-[#C5A059]" />
                <span>{currentEvent.accessCode}</span>
              </button>
            )}

            {/* Hidden for now: User Profile / Auth Button (Sign In) */}
            {false && (
              currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#111111] border border-[#242424] text-xs font-sans text-white hover:border-[#404040] transition-colors"
                  >
                    <span className="w-4 h-4 rounded-[2px] bg-[#242424] text-[#A1A1A1] flex items-center justify-center text-[10px] font-mono font-bold">
                      {currentUser.displayName.charAt(0)}
                    </span>
                    <span className="truncate max-w-[90px]">{currentUser.displayName}</span>
                    <ChevronDown size={12} className="text-[#666666]" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#111111] border border-[#242424] rounded-md py-1 z-50 text-xs">
                      <button
                        onClick={() => { setIsProfileModalOpen(true); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-[#161616] text-[#A1A1A1] hover:text-white"
                      >
                        Edit Display Name
                      </button>
                      <button
                        onClick={async () => {
                          await signOutUser();
                          setCurrentUser(null);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#161616] text-[#FF5722] flex items-center gap-2"
                      >
                        <LogOut size={12} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white text-xs font-medium transition-colors"
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </button>
              )
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-md bg-[#111111] border border-[#242424] text-[#A1A1A1] hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>

        {/* Floating Fullscreen Exit Button */}
        {isFullscreen && (
          <div className="absolute top-4 right-6 z-30">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-md bg-[#111111] border border-[#242424] text-[#A1A1A1] hover:text-white transition-colors"
              title="Exit Fullscreen"
            >
              <Minimize2 size={16} />
            </button>
          </div>
        )}

        {/* Dynamic View Canvas */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === 'guide' && (
            <StepViewer 
              step={currentStep}
              totalSteps={steps.length}
              onNext={handleNext}
              onPrev={handlePrev}
              isFirst={currentStepIndex === 0}
              isLast={currentStepIndex === steps.length - 1}
              isCompleted={completedSteps.has(currentStep.id)}
              onToggleComplete={() => toggleStepCompletion(currentStep.id)}
              searchQuery={searchQuery}
              completedTaskIds={completedTaskIds}
              onToggleTask={toggleTask}
              currentUser={currentUser}
              fontScale={FONT_SCALES[fontScaleIndex].scale}
            />
          )}

          {viewMode === 'live-quiz' && (
            <LiveQuizRoom
              currentUser={currentUser || { id: 'guest-1', displayName: 'Workshop Guest' }}
              onExit={() => setViewMode('guide')}
            />
          )}

          {viewMode === 'organizer' && (
            <OrganizerDashboard
              currentEvent={currentEvent}
              onSelectEvent={(evt) => setCurrentEvent(evt)}
              onOpenBuilder={() => setViewMode('builder')}
              onLaunchLiveQuiz={() => setViewMode('live-quiz')}
              onClose={() => setViewMode('guide')}
            />
          )}

          {viewMode === 'builder' && (
            <GuideBuilder
              event={currentEvent}
              onClose={() => setViewMode('guide')}
              onPreview={() => setViewMode('guide')}
              onStepsChange={(newSteps) => setSteps(newSteps)}
              onEventChange={(newEvent) => setCurrentEvent(newEvent)}
            />
          )}
        </div>
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={async () => {
          const profile = await getCurrentUserProfile();
          setCurrentUser(profile);
        }}
      />

      <ProfileConfirmationModal
        isOpen={isProfileModalOpen}
        profile={currentUser}
        onConfirmed={(updatedName) => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, displayName: updatedName });
          }
          setIsProfileModalOpen(false);
        }}
      />

      <EventAccessModal
        isOpen={isEventAccessModalOpen}
        onClose={() => setIsEventAccessModalOpen(false)}
        onEventSelected={async (selected) => {
          setCurrentEvent(selected);
          const [sec, stp] = await Promise.all([
            getEventSections(selected.id),
            getEventSteps(selected.id)
          ]);
          if (sec.length > 0) setSections(sec);
          if (stp.length > 0) {
            setSteps(stp);
            setCurrentStepId(stp[0].id);
          }
        }}
      />
    </div>
  );
}
