import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Clock, Search, X, Layers, Sparkles, CheckSquare, Coffee, HelpCircle, ChevronRight } from 'lucide-react';
import { EventStep, EventSection, StepType } from '../types';
import { clsx } from 'clsx';

interface SidebarProps {
  steps: EventStep[];
  allSteps: EventStep[];
  sections?: EventSection[];
  currentStepId: string;
  onSelectStep: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  completedSteps: Set<string>;
  isHidden: boolean;
  eventTitle?: string;
  accessCode?: string;
  onLogoClick?: (e: React.MouseEvent) => void;
}

const STEP_ICON_MAP: Record<StepType, any> = {
  instruction: Clock,
  checklist: CheckSquare,
  activity: Sparkles,
  video_embed: Clock,
  quiz: HelpCircle,
  challenge: Layers,
  break: Coffee,
  resource_collection: Layers,
  custom: Clock
};

export function Sidebar({ 
  steps, 
  allSteps,
  sections = [],
  currentStepId, 
  onSelectStep, 
  isOpen, 
  onClose, 
  searchQuery, 
  setSearchQuery, 
  completedSteps, 
  isHidden,
  eventTitle = 'Workshop Agenda',
  accessCode = 'LINKEDIN',
  onLogoClick
}: SidebarProps) {

  const getSectionTitle = (sectionId?: string) => {
    const sec = sections.find(s => s.id === sectionId);
    return sec ? sec.title : null;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={clsx(
          "fixed top-0 left-0 bottom-0 w-80 bg-[#0A0A0A] border-r border-[#242424] z-50 flex flex-col transition-all duration-300 shrink-0",
          "lg:static lg:z-auto",
          isOpen 
            ? "translate-x-0 lg:w-80 lg:opacity-100" 
            : "-translate-x-full lg:!w-0 lg:!border-r-0 lg:overflow-hidden lg:opacity-0",
          isHidden && "lg:!w-0 lg:!border-r-0 lg:overflow-hidden lg:opacity-0"
        )}
      >
        <div className={clsx("flex flex-col h-full w-80 shrink-0", isHidden && "lg:opacity-0")}>
          {/* Header */}
          <div className="p-6 border-b border-[#242424]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center">
                  <img 
                    src="/logotext.png" 
                    alt="The One Percent Club" 
                    className="h-5 max-w-[210px] w-auto object-contain cursor-pointer select-none" 
                    onClick={onLogoClick}
                    title="The One Percent Club"
                  />
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="lg:hidden text-[#666666] hover:text-white p-1 transition-colors"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stepped line graphic accent */}
            <div className="h-[1px] w-full bg-[#1B1B1B] mb-4 relative">
              <div className="absolute left-0 -top-[2px] w-3 h-[5px] bg-[#242424]" />
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" size={14} />
              <input
                type="text"
                placeholder="Search agenda steps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111111] border border-[#242424] rounded-md py-2 pl-9 pr-3 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Steps List */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
            {steps.length === 0 ? (
              <div className="text-center py-12 text-[#666666] text-xs font-mono">
                No steps found matching "{searchQuery}"
              </div>
            ) : (
              steps.map((step, index) => {
                const isActive = step.id === currentStepId;
                const isCompleted = completedSteps.has(step.id);
                const IconComponent = STEP_ICON_MAP[step.type] || Clock;

                const prevStep = index > 0 ? steps[index - 1] : null;
                const isNewSection = step.sectionId && (!prevStep || prevStep.sectionId !== step.sectionId);
                const sectionName = isNewSection ? getSectionTitle(step.sectionId) : null;

                return (
                  <React.Fragment key={step.id}>
                    {sectionName && (
                      <div className="pt-4 pb-1.5 px-3 text-[10px] font-mono uppercase tracking-widest text-[#666666] font-medium flex items-center gap-2">
                        <span className="truncate">{sectionName}</span>
                        <span className="flex-1 h-[1px] bg-[#1B1B1B]" />
                      </div>
                    )}
                    <button
                      onClick={() => {
                        onSelectStep(step.id);
                        onClose();
                      }}
                      className={clsx(
                        "w-full text-left p-2.5 rounded-md transition-all duration-150 group relative border",
                        isActive 
                          ? "bg-[#111111] border-[#242424] text-white" 
                          : "border-transparent text-[#A1A1A1] hover:text-white hover:bg-[#111111]/60"
                      )}
                    >
                      {/* Active Left Indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-[#FF5722]" />
                      )}

                      <div className="flex items-center gap-2.5 pl-1.5 py-0.5">
                        <div className="shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 size={15} className="text-[#14B8A6]" />
                          ) : isActive ? (
                            <Circle size={15} className="text-white fill-white" />
                          ) : (
                            <Circle size={15} className="text-[#333333]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={clsx(
                            "text-xs leading-snug truncate",
                            isActive ? "font-medium text-white" : "text-[#A1A1A1] group-hover:text-white"
                          )}>
                            {step.title.replace(/^Step\s*\d+\s*[—–-]\s*/i, '')}
                          </div>
                        </div>
                      </div>
                    </button>
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#242424] bg-[#0A0A0A] text-[#A1A1A1] text-xs font-mono flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-wider text-[#666666]">ACCESS CODE</p>
              <p className="text-white font-bold tracking-widest">{accessCode}</p>
            </div>
            <div className="text-[11px] text-[#A1A1A1]">
              <span className="text-[#14B8A6]">{completedSteps.size}</span> / {allSteps.length} complete
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
