import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Eye, 
  X, 
  Layers, 
  FileText, 
  CheckSquare, 
  Sparkles,
  HelpCircle,
  Coffee,
  Check,
  AtSign,
  Hash,
  Link2,
  Edit3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { EventModel, EventSection, EventStep, StepType, CompletionRule } from '../../types';
import { 
  getEventSections, 
  getEventSteps, 
  createOrUpdateEvent, 
  saveEventStep, 
  saveAllEventSteps 
} from '../../lib/supabase';

interface GuideBuilderProps {
  event: EventModel;
  onClose: () => void;
  onPreview: () => void;
  onStepsChange?: (steps: EventStep[]) => void;
  onEventChange?: (event: EventModel) => void;
}

export const STEP_TYPE_OPTIONS: { type: StepType; label: string; icon: any }[] = [
  { type: 'instruction', label: 'Instruction', icon: FileText },
  { type: 'checklist', label: 'Checklist', icon: CheckSquare },
  { type: 'activity', label: 'Hands-on Activity', icon: Sparkles },
  { type: 'quiz', label: 'Quiz Assessment', icon: HelpCircle },
  { type: 'challenge', label: 'Mini Challenge', icon: Layers },
  { type: 'break', label: 'Break Interval', icon: Coffee }
];

export function GuideBuilder({ 
  event, 
  onClose, 
  onPreview,
  onStepsChange,
  onEventChange 
}: GuideBuilderProps) {
  const [sections, setSections] = useState<EventSection[]>([]);
  const [steps, setSteps] = useState<EventStep[]>([]);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showEventMetadata, setShowEventMetadata] = useState(false);

  // Event Metadata state
  const [eventTitle, setEventTitle] = useState(event.title);
  const [eventDescription, setEventDescription] = useState(event.description || '');

  // Form states for active step editor
  const [stepTitle, setStepTitle] = useState('');
  const [stepType, setStepType] = useState<StepType>('instruction');
  const [stepTimeRange, setStepTimeRange] = useState('');
  const [stepDuration, setStepDuration] = useState(10);
  const [stepSummary, setStepSummary] = useState('');
  const [stepObjective, setStepObjective] = useState('');
  const [stepRequired, setStepRequired] = useState(true);
  const [stepCompletionRule, setStepCompletionRule] = useState<CompletionRule>('manual');
  const [stepHtml, setStepHtml] = useState('');

  // Specialized content fields
  const [sampleHeadline, setSampleHeadline] = useState('');
  const [sampleAboutText, setSampleAboutText] = useState('');
  const [officialAccountMention, setOfficialAccountMention] = useState('');
  const [officialAccountUrl, setOfficialAccountUrl] = useState('');
  const [requiredHashtagsStr, setRequiredHashtagsStr] = useState('');
  const [samplePostText, setSamplePostText] = useState('');
  const [submissionType, setSubmissionType] = useState<'none' | 'url' | 'text'>('none');
  const [submissionLabel, setSubmissionLabel] = useState('');
  const [submissionPlaceholder, setSubmissionPlaceholder] = useState('');

  // Checklist tasks state
  const [stepTasks, setStepTasks] = useState<Array<{ id: string; title: string }>>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    getEventSections(event.id).then(setSections);
    getEventSteps(event.id).then((loadedSteps) => {
      setSteps(loadedSteps);
      if (loadedSteps.length > 0 && !selectedStepId) {
        selectStep(loadedSteps[0]);
      }
    });
  }, [event.id]);

  const selectStep = (step: EventStep) => {
    setSelectedStepId(step.id);
    setStepTitle(step.title);
    setStepType(step.type);
    setStepTimeRange(step.timeRange || '');
    setStepDuration(step.durationMinutes || 10);
    setStepSummary(step.summary || '');
    setStepObjective(step.objective || '');
    setStepRequired(step.required !== undefined ? step.required : true);
    setStepCompletionRule(step.completionRule || 'manual');
    setStepHtml(step.content?.html || '');

    // Specialized fields
    setSampleHeadline(step.content?.sampleHeadline || '');
    setSampleAboutText(step.content?.sampleAboutText || '');
    setOfficialAccountMention(step.content?.officialAccountMention || '');
    setOfficialAccountUrl(step.content?.officialAccountUrl || '');
    setRequiredHashtagsStr(step.content?.requiredHashtags ? step.content.requiredHashtags.join(', ') : '');
    setSamplePostText(step.content?.samplePostText || '');
    setSubmissionType((step.content?.submissionType as any) || 'none');
    setSubmissionLabel(step.content?.submissionLabel || '');
    setSubmissionPlaceholder(step.content?.submissionPlaceholder || '');

    setStepTasks(step.tasks?.map(t => ({ id: t.id, title: t.title })) || []);
  };

  const handleSaveEventMetadata = async () => {
    const updated = await createOrUpdateEvent({
      ...event,
      title: eventTitle.trim(),
      description: eventDescription.trim()
    });
    if (onEventChange) onEventChange(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSaveActiveStep = async () => {
    if (!selectedStepId) return;

    const hashtagsList = requiredHashtagsStr
      .split(',')
      .map(h => h.trim())
      .filter(Boolean);

    const updatedStep: EventStep = {
      ...steps.find(s => s.id === selectedStepId)!,
      id: selectedStepId,
      eventId: event.id,
      title: stepTitle,
      type: stepType,
      timeRange: stepTimeRange,
      durationMinutes: stepDuration,
      summary: stepSummary,
      objective: stepObjective,
      required: stepRequired,
      completionRule: stepCompletionRule,
      content: {
        ...(steps.find(s => s.id === selectedStepId)?.content || {}),
        html: stepHtml,
        sampleHeadline: sampleHeadline || undefined,
        sampleAboutText: sampleAboutText || undefined,
        officialAccountMention: officialAccountMention || undefined,
        officialAccountUrl: officialAccountUrl || undefined,
        requiredHashtags: hashtagsList.length > 0 ? hashtagsList : undefined,
        samplePostText: samplePostText || undefined,
        submissionType: submissionType !== 'none' ? submissionType : undefined,
        submissionLabel: submissionLabel || undefined,
        submissionPlaceholder: submissionPlaceholder || undefined,
      },
      tasks: stepTasks.map((t, idx) => ({
        id: t.id,
        stepId: selectedStepId,
        title: t.title,
        position: idx + 1,
        required: true
      }))
    };

    const newSteps = steps.map(s => s.id === selectedStepId ? updatedStep : s);
    setSteps(newSteps);

    // Persist to database & localStorage
    await saveEventStep(updatedStep);
    if (onStepsChange) onStepsChange(newSteps);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddNewStep = async () => {
    const newId = crypto.randomUUID();
    const newPosition = steps.length + 1;
    const newStep: EventStep = {
      id: newId,
      eventId: event.id,
      type: 'instruction',
      title: `New Milestone ${newPosition}`,
      timeRange: '0:00 – 0:15',
      durationMinutes: 15,
      position: newPosition,
      required: true,
      completionRule: 'manual',
      publishedVersion: 1,
      content: { html: '<p>Enter step instructions here...</p>' }
    };

    const updated = [...steps, newStep];
    setSteps(updated);
    await saveEventStep(newStep);
    if (onStepsChange) onStepsChange(updated);
    selectStep(newStep);
  };

  const handleMoveStep = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const copy = [...steps];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Re-assign positions
    copy.forEach((s, idx) => { s.position = idx + 1; });
    setSteps(copy);
    await saveAllEventSteps(event.id, copy);
    if (onStepsChange) onStepsChange(copy);
  };

  const handleDeleteStep = async (id: string) => {
    if (steps.length <= 1) return;
    const filtered = steps.filter(s => s.id !== id);
    filtered.forEach((s, idx) => { s.position = idx + 1; });
    setSteps(filtered);
    await saveAllEventSteps(event.id, filtered);
    if (onStepsChange) onStepsChange(filtered);
    if (selectedStepId === id) {
      selectStep(filtered[0]);
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    setStepTasks(prev => [...prev, { id: crypto.randomUUID(), title: newTaskTitle.trim() }]);
    setNewTaskTitle('');
  };

  const handleRemoveTask = (taskId: string) => {
    setStepTasks(prev => prev.filter(t => t.id !== taskId));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0A] text-white overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-[#242424] px-6 flex items-center justify-between bg-[#0A0A0A] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-[#161616] text-[#C5A059] border border-[#242424]">
            <Layers size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base text-white tracking-tight">{event.title}</h2>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[3px] bg-[#111111] border border-[#242424] text-[#C5A059]">
                {event.accessCode}
              </span>
            </div>
            <p className="text-[11px] text-[#666666] font-mono">
              Guide Builder &bull; Real-time Content Customization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEventMetadata(!showEventMetadata)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111111] border border-[#242424] hover:border-[#404040] text-[#A1A1A1] hover:text-white text-xs font-mono transition-colors"
          >
            <Edit3 size={12} />
            <span>Settings</span>
            {showEventMetadata ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          <button
            onClick={handleSaveActiveStep}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-medium text-xs transition-colors ${
              savedSuccess 
                ? 'bg-[#14B8A6] text-white' 
                : 'bg-[#FF5722] hover:bg-[#E64A19] text-white'
            }`}
          >
            {savedSuccess ? <Check size={13} /> : <Save size={13} />}
            <span>{savedSuccess ? 'Saved' : 'Save Step'}</span>
          </button>

          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111111] border border-[#242424] hover:border-[#404040] text-[#A1A1A1] hover:text-white text-xs font-mono transition-colors"
          >
            <Eye size={12} />
            <span>Preview</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-[#666666] hover:text-white rounded-md hover:bg-[#111111] transition-colors"
            aria-label="Close Guide Builder"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Optional Event Metadata Drawer */}
      {showEventMetadata && (
        <div className="p-5 bg-[#111111] border-b border-[#242424] flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-1 w-full">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Event Title</label>
            <input
              type="text"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-mono"
            />
          </div>
          <div className="flex-1 space-y-1 w-full">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Event Description</label>
            <input
              type="text"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-mono"
            />
          </div>
          <button
            onClick={handleSaveEventMetadata}
            className="px-4 py-2 bg-white text-[#0A0A0A] hover:bg-[#E8E8E8] font-medium text-xs rounded-md transition-colors shrink-0"
          >
            Update Event Info
          </button>
        </div>
      )}

      {/* Main Dual-Column Builder */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Step Navigator & Reordering */}
        <div className="w-80 border-r border-[#242424] bg-[#0A0A0A] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#242424] flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">
              Milestones ({steps.length})
            </span>
            <button
              onClick={handleAddNewStep}
              className="flex items-center gap-1 text-xs font-mono px-2 py-1 bg-[#111111] hover:bg-[#161616] border border-[#242424] text-white rounded-md transition-colors"
            >
              <Plus size={13} />
              <span>Add Step</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1 custom-scrollbar">
            {steps.map((step, idx) => {
              const isSelected = step.id === selectedStepId;
              return (
                <div
                  key={step.id}
                  onClick={() => selectStep(step)}
                  className={`p-2.5 rounded-md border text-left transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'border-white bg-[#111111] text-white'
                      : 'border-transparent bg-transparent hover:bg-[#111111]/60 text-[#A1A1A1] hover:text-white'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-mono text-[#666666]">
                        #{step.position < 10 ? `0${step.position}` : step.position}
                      </span>
                      <span className="text-[9px] font-mono uppercase text-[#A1A1A1] truncate">
                        {step.timeRange || `${step.durationMinutes}m`}
                      </span>
                    </div>
                    <div className="text-xs font-medium truncate leading-tight">
                      {step.title.replace(/^Step\s*\d+\s*[—–-]\s*/i, '')}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#666666]">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveStep(idx, 'up'); }}
                      disabled={idx === 0}
                      className="p-1 hover:text-white disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveStep(idx, 'down'); }}
                      disabled={idx === steps.length - 1}
                      className="p-1 hover:text-white disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Step Editor */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0A0A0A]">
          <div className="p-6 md:p-10 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#242424]">
            <div>
              <h3 className="font-serif text-2xl text-white tracking-tight">Step Editor</h3>
              <p className="text-xs text-[#A1A1A1] font-sans">Configure content, templates, hashtags, and verification requirements</p>
            </div>
            {selectedStepId && (
              <button
                onClick={() => handleDeleteStep(selectedStepId)}
                className="flex items-center gap-1.5 text-xs font-mono text-[#FF5722] hover:text-red-400 px-3 py-1.5 rounded-md border border-[#242424] hover:bg-[#161616] transition-colors"
              >
                <Trash2 size={13} />
                <span>Delete Step</span>
              </button>
            )}
          </div>

          {/* Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Step Title</label>
              <input
                type="text"
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Step Type</label>
              <select
                value={stepType}
                onChange={(e) => setStepType(e.target.value as StepType)}
                className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-mono"
              >
                {STEP_TYPE_OPTIONS.map(opt => (
                  <option key={opt.type} value={opt.type}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Time, Duration, Required */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Time Range</label>
              <input
                type="text"
                value={stepTimeRange}
                onChange={(e) => setStepTimeRange(e.target.value)}
                placeholder="e.g. 0:30 – 0:45"
                className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#242424] rounded-md text-xs text-white font-mono focus:outline-none focus:border-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Duration (Minutes)</label>
              <input
                type="number"
                value={stepDuration}
                onChange={(e) => setStepDuration(Number(e.target.value))}
                min={1}
                max={180}
                className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#242424] rounded-md text-xs text-white font-mono focus:outline-none focus:border-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Requirement Setting</label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#D4D4D4] font-mono">
                  <input
                    type="checkbox"
                    checked={stepRequired}
                    onChange={(e) => setStepRequired(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#FF5722]"
                  />
                  <span>Required Step</span>
                </label>
              </div>
            </div>
          </div>

          {/* Objective & Summary */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Step Objective</label>
              <input
                type="text"
                value={stepObjective}
                onChange={(e) => setStepObjective(e.target.value)}
                placeholder="Clear milestone goal displayed at top of step..."
                className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Brief Summary</label>
              <input
                type="text"
                value={stepSummary}
                onChange={(e) => setStepSummary(e.target.value)}
                placeholder="Short headline for quick scanning..."
                className="w-full px-3.5 py-2.5 bg-[#111111] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-sans"
              />
            </div>
          </div>

          {/* Detailed Instructions HTML */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">
              Guide Content & Detailed Instructions (Semantic HTML)
            </label>
            <textarea
              value={stepHtml}
              onChange={(e) => setStepHtml(e.target.value)}
              rows={8}
              placeholder="<p>Detailed step instructions...</p>"
              className="w-full p-4 bg-[#111111] border border-[#242424] rounded-md text-xs font-mono text-[#D4D4D4] focus:outline-none focus:border-white leading-relaxed custom-scrollbar"
            />
          </div>

          {/* Profile Templates Section */}
          <div className="p-5 rounded-md bg-[#111111] border border-[#242424] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1B1B1B]">
              <Sparkles size={15} className="text-[#C5A059]" />
              <h4 className="text-xs font-mono uppercase tracking-widest text-white">Profile Content Templates</h4>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">
                Sample Headline Template
              </label>
              <input
                type="text"
                value={sampleHeadline}
                onChange={(e) => setSampleHeadline(e.target.value)}
                placeholder="e.g. Computer Science Engineering Student at GCEM, Bengaluru | Aspiring Software Developer"
                className="w-full px-3.5 py-2 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">
                Sample About Narrative Structure (Step 6)
              </label>
              <textarea
                value={sampleAboutText}
                onChange={(e) => setSampleAboutText(e.target.value)}
                rows={4}
                placeholder="Sample About section structure that participants can personalize..."
                className="w-full p-3 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs font-mono text-[#D4D4D4] focus:outline-none focus:border-white leading-relaxed"
              />
            </div>
          </div>

          {/* Social Posting & One Percent Club Guidelines */}
          <div className="p-5 rounded-md bg-[#111111] border border-[#242424] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1B1B1B]">
              <AtSign size={15} className="text-[#C5A059]" />
              <h4 className="text-xs font-mono uppercase tracking-widest text-white">LinkedIn Event Post Guidelines</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Official Account Mention</label>
                <input
                  type="text"
                  value={officialAccountMention}
                  onChange={(e) => setOfficialAccountMention(e.target.value)}
                  placeholder="@One Percent Club"
                  className="w-full px-3.5 py-2 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Official Account URL</label>
                <input
                  type="url"
                  value={officialAccountUrl}
                  onChange={(e) => setOfficialAccountUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/theonepercentclub/"
                  className="w-full px-3.5 py-2 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Required Hashtags (Comma-separated)</label>
              <input
                type="text"
                value={requiredHashtagsStr}
                onChange={(e) => setRequiredHashtagsStr(e.target.value)}
                placeholder="#LinkedInWorkshop, #OnePercentClub, #ProfessionalBranding"
                className="w-full px-3.5 py-2 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Sample Event Post Copy</label>
              <textarea
                value={samplePostText}
                onChange={(e) => setSamplePostText(e.target.value)}
                rows={4}
                placeholder="Editable sample post provided to attendees..."
                className="w-full p-3 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs font-mono text-[#D4D4D4] focus:outline-none focus:border-white leading-relaxed"
              />
            </div>
          </div>

          {/* Submission Configuration */}
          <div className="p-5 rounded-md bg-[#111111] border border-[#242424] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1B1B1B]">
              <Link2 size={15} className="text-[#FF5722]" />
              <h4 className="text-xs font-mono uppercase tracking-widest text-white">Participant Submission Settings</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Submission Type</label>
                <select
                  value={submissionType}
                  onChange={(e) => setSubmissionType(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-mono"
                >
                  <option value="none">None (Standard reading)</option>
                  <option value="url">URL Link (e.g. Profile or Post link)</option>
                  <option value="text">Text Response</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Field Label</label>
                <input
                  type="text"
                  value={submissionLabel}
                  onChange={(e) => setSubmissionLabel(e.target.value)}
                  placeholder="e.g. Submit Your Published Post URL"
                  className="w-full px-3.5 py-2 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-sans"
                />
              </div>
            </div>

            {submissionType !== 'none' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Field Placeholder</label>
                <input
                  type="text"
                  value={submissionPlaceholder}
                  onChange={(e) => setSubmissionPlaceholder(e.target.value)}
                  placeholder="https://www.linkedin.com/posts/..."
                  className="w-full px-3.5 py-2 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white font-mono"
                />
              </div>
            )}
          </div>

          {/* Action Checklist Tasks */}
          <div className="p-5 rounded-md bg-[#111111] border border-[#242424] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1B1B1B]">
              <div className="flex items-center gap-2">
                <CheckSquare size={15} className="text-[#14B8A6]" />
                <h4 className="text-xs font-mono uppercase tracking-widest text-white">Checklist Tasks</h4>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTask(); } }}
                placeholder="Add checklist item..."
                className="flex-1 px-3.5 py-2 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs text-white focus:outline-none focus:border-white"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-4 py-2 bg-white text-[#0A0A0A] hover:bg-[#E8E8E8] rounded-md text-xs font-medium"
              >
                Add
              </button>
            </div>

            <div className="space-y-1.5">
              {stepTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 bg-[#0A0A0A] border border-[#242424] rounded-md flex items-center justify-between text-xs"
                >
                  <span className="text-[#D4D4D4] font-sans">{t.title}</span>
                  <button
                    onClick={() => handleRemoveTask(t.id)}
                    className="text-[#666666] hover:text-[#FF5722] p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
