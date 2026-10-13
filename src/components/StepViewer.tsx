import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { EventStep, UserProfile } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Clock, 
  CheckSquare, 
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Send,
  AtSign,
  Hash,
  Image as ImageIcon,
  Sparkles,
  Link2,
  ArrowRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { EmbeddedQuiz } from '../features/quizzes/EmbeddedQuiz';
import { saveStepProgress, getStepProgress } from '../lib/supabase';

interface StepViewerProps {
  step: EventStep;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  isCompleted: boolean;
  onToggleComplete: () => void;
  searchQuery: string;
  completedTaskIds?: Set<string>;
  onToggleTask?: (taskId: string, current: boolean) => void;
  currentUser?: UserProfile | null;
}

export function StepViewer({ 
  step, 
  totalSteps,
  onNext, 
  onPrev, 
  isFirst, 
  isLast, 
  isCompleted, 
  onToggleComplete, 
  searchQuery,
  completedTaskIds = new Set(),
  onToggleTask,
  currentUser
}: StepViewerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  // Load existing submission for this step
  useEffect(() => {
    const userId = currentUser?.id || 'guest-user';
    getStepProgress(userId, step.id).then(progress => {
      if (progress?.completionData?.submissionUrl) {
        setSubmissionUrl(progress.completionData.submissionUrl);
        setSubmittedAt(progress.completionData.submittedAt || null);
      } else {
        setSubmissionUrl('');
        setSubmittedAt(null);
      }
      setSubmissionStatus('idle');
    });
  }, [step.id, currentUser?.id]);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2200);
  };

  const handleSaveSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim()) return;

    setSubmissionStatus('saving');
    const userId = currentUser?.id || 'guest-user';
    const timestamp = new Date().toISOString();
    
    await saveStepProgress(
      userId,
      step.eventId,
      step.id,
      isCompleted ? 'completed' : 'in_progress',
      { submissionUrl: submissionUrl.trim(), submittedAt: timestamp }
    );

    setSubmittedAt(timestamp);
    setSubmissionStatus('saved');
    setTimeout(() => setSubmissionStatus('idle'), 3000);
  };

  // Highlight search terms in content
  const highlightedContent = useMemo(() => {
    const raw = step.content?.html || '';
    if (!searchQuery.trim() || !raw) return raw;
    
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return raw.replace(regex, '<mark class="bg-[#C5A059]/20 text-[#C5A059] px-1 rounded-sm">$1</mark>');
  }, [step.content?.html, searchQuery]);

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0A0A]">
      {/* Editorial Content Area - Full width so scrollbar is at the right edge of the window */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-6 py-10 md:px-12 md:py-14 w-full">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Oversized Editorial Hero */}
          <header className="mb-10 pb-8 border-b border-[#242424] relative">


            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex-1">
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.08] font-normal">
                  {step.title.replace(/^Step\s*\d+\s*[—–-]\s*/i, '')}
                </h1>
                {step.summary && (
                  <p className="mt-3 text-base md:text-lg text-[#A1A1A1] font-normal leading-relaxed max-w-2xl font-sans">
                    {step.summary}
                  </p>
                )}
              </div>

              {/* Minimal Milestone Action */}
              <button
                onClick={onToggleComplete}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 rounded-md border text-xs font-mono tracking-wider uppercase transition-all duration-150 shrink-0",
                  isCompleted 
                    ? "bg-[#111111] border-[#14B8A6]/60 text-[#14B8A6] hover:bg-[#161616]" 
                    : "bg-[#111111] border-[#242424] text-[#A1A1A1] hover:border-[#404040] hover:text-white"
                )}
              >
                {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                <span>{isCompleted ? "Completed" : "Mark Complete"}</span>
              </button>
            </div>
          </header>

          {/* Objective Banner */}
          {step.objective && (
            <div className="mb-8 p-5 rounded-md bg-[#111111] border border-[#242424] flex items-start gap-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A059] border border-[#242424] px-2 py-0.5 rounded-[4px] shrink-0 mt-0.5">
                OBJECTIVE
              </span>
              <p className="text-sm md:text-base text-[#D4D4D4] leading-relaxed font-sans">
                {step.objective}
              </p>
            </div>
          )}

          {/* HTML Instructions Body */}
          {highlightedContent && (
            <article 
              className="prose prose-invert prose-base md:prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-h4:text-xl prose-p:text-[#A1A1A1] prose-strong:text-white prose-li:text-[#A1A1A1] prose-code:text-[#C5A059] prose-code:font-mono prose-code:bg-[#111111] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-[4px] prose-code:border prose-code:border-[#242424] mb-8"
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />
          )}

          {/* Sample Headline Helper (Step 3) */}
          {step.content?.sampleHeadline && (
            <div className="my-8 p-5 rounded-md bg-[#111111] border border-[#242424] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1B1B1B]">
                <span className="text-xs font-mono uppercase tracking-widest text-[#C5A059]">
                  Personalized Headline Template
                </span>
                <button
                  onClick={() => copyToClipboard(step.content.sampleHeadline!, 'headline')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161616] border border-[#242424] text-xs text-[#A1A1A1] hover:text-white hover:border-[#404040] transition-colors font-mono"
                >
                  {copiedField === 'headline' ? <Check size={13} className="text-[#14B8A6]" /> : <Copy size={13} />}
                  <span>{copiedField === 'headline' ? 'Copied' : 'Copy Template'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#0A0A0A] border border-[#1B1B1B] rounded-[4px] text-xs font-mono text-[#D4D4D4] leading-relaxed">
                {step.content.sampleHeadline}
              </div>
            </div>
          )}

          {/* Sample About Narrative Helper (Step 6) */}
          {step.content?.sampleAboutText && (
            <div className="my-8 p-5 rounded-md bg-[#111111] border border-[#242424] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1B1B1B]">
                <span className="text-xs font-mono uppercase tracking-widest text-[#C5A059]">
                  Sample About Narrative Structure
                </span>
                <button
                  onClick={() => copyToClipboard(step.content.sampleAboutText!, 'about')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#161616] border border-[#242424] text-xs text-[#A1A1A1] hover:text-white hover:border-[#404040] transition-colors font-mono"
                >
                  {copiedField === 'about' ? <Check size={13} className="text-[#14B8A6]" /> : <Copy size={13} />}
                  <span>{copiedField === 'about' ? 'Copied' : 'Copy Sample'}</span>
                </button>
              </div>
              <div className="p-4 bg-[#0A0A0A] border border-[#1B1B1B] rounded-[4px] text-xs font-mono text-[#A1A1A1] leading-relaxed whitespace-pre-line max-h-56 overflow-y-auto">
                {step.content.sampleAboutText}
              </div>
            </div>
          )}

          {/* Step 10: Official LinkedIn Workshop Posting Guidelines */}
          {(step.content?.officialAccountMention || step.content?.requiredHashtags || step.content?.samplePostText) && (
            <div className="my-8 p-6 rounded-md bg-[#111111] border border-[#242424] space-y-5">
              <div className="flex items-center justify-between border-b border-[#242424] pb-3">
                <div className="flex items-center gap-2">
                  <AtSign size={16} className="text-[#C5A059]" />
                  <h4 className="font-mono text-xs uppercase tracking-widest text-white">
                    Official Workshop Post Guidelines
                  </h4>
                </div>
                {step.content.officialAccountMention && (
                  <a
                    href={
                      step.content.officialAccountUrl && !step.content.officialAccountUrl.includes('company/the-one-percent-club')
                        ? step.content.officialAccountUrl
                        : 'https://www.linkedin.com/in/theonepercentclub/'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[#161616] border border-[#242424] text-[#A1A1A1] text-xs hover:border-white hover:text-white transition-colors font-mono"
                  >
                    <span>Tag: {step.content.officialAccountMention}</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>

              {/* Required Hashtags */}
              {step.content.requiredHashtags && step.content.requiredHashtags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#666666] flex items-center gap-1">
                      <Hash size={12} className="text-[#C5A059]" /> Required Hashtags:
                    </span>
                    <button
                      onClick={() => copyToClipboard(step.content.requiredHashtags!.join(' '), 'hashtags')}
                      className="flex items-center gap-1 text-[11px] font-mono text-[#A1A1A1] hover:text-white px-2 py-0.5 bg-[#161616] border border-[#242424] rounded-[4px]"
                    >
                      {copiedField === 'hashtags' ? <Check size={11} className="text-[#14B8A6]" /> : <Copy size={11} />}
                      <span>{copiedField === 'hashtags' ? 'Copied' : 'Copy All'}</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {step.content.requiredHashtags.map((h) => (
                      <span key={h} className="px-2 py-0.5 rounded-[4px] bg-[#0A0A0A] border border-[#242424] text-xs font-mono text-[#D4D4D4]">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Post Copy */}
              {step.content.samplePostText && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#666666]">Sample Event Post Template:</span>
                    <button
                      onClick={() => copyToClipboard(step.content.samplePostText!, 'post')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-[#0A0A0A] hover:bg-[#E8E8E8] text-xs font-medium transition-colors"
                    >
                      {copiedField === 'post' ? <Check size={12} className="text-[#14B8A6]" /> : <Copy size={12} />}
                      <span>{copiedField === 'post' ? 'Copied to Clipboard' : 'Copy Sample Post'}</span>
                    </button>
                  </div>
                  <div className="p-4 bg-[#0A0A0A] border border-[#1B1B1B] rounded-[4px] text-xs font-mono text-[#A1A1A1] leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                    {step.content.samplePostText}
                  </div>
                </div>
              )}

              {/* Workshop Approved Images */}
              {step.content.eventImages && step.content.eventImages.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#1B1B1B]">
                  <span className="text-xs font-mono text-[#666666] flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-[#C5A059]" /> Approved Event Photos:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {step.content.eventImages.map((img, idx) => (
                      <div key={idx} className="p-2.5 bg-[#0A0A0A] border border-[#242424] rounded-[4px] flex items-center justify-between">
                        <span className="text-xs text-[#A1A1A1] truncate font-mono">{img.caption || `Image ${idx + 1}`}</span>
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#C5A059] hover:underline flex items-center gap-1 shrink-0 ml-2"
                        >
                          <span>Open</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* URL Submission Box (Steps 2, 10, 11) */}
          {step.content?.submissionType === 'url' && (
            <div className="my-8 p-6 rounded-md bg-[#111111] border border-[#242424] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1B1B1B]">
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-white flex items-center gap-2">
                    <Link2 size={14} className="text-[#FF5722]" />
                    {step.content.submissionLabel || 'Submit Your URL'}
                  </h4>
                  <p className="text-xs text-[#666666] mt-0.5 font-sans">
                    Private verification link for mentors and organizers
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-[#A1A1A1] border border-[#242424] px-2 py-0.5 rounded-[4px]">
                  <ShieldCheck size={11} className="text-[#14B8A6]" />
                  <span>ORGANIZER ONLY</span>
                </div>
              </div>

              <form onSubmit={handleSaveSubmission} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    placeholder={step.content.submissionPlaceholder || 'https://www.linkedin.com/...'}
                    className="flex-1 px-4 py-2.5 bg-[#0A0A0A] border border-[#242424] rounded-md text-xs font-mono text-white placeholder-[#666666] focus:outline-none focus:border-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={submissionStatus === 'saving' || !submissionUrl.trim()}
                    className="px-5 py-2.5 rounded-md bg-[#FF5722] hover:bg-[#E64A19] text-white font-medium text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {submissionStatus === 'saved' ? (
                      <>
                        <Check size={14} />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>{submissionStatus === 'saving' ? 'Saving...' : 'Submit URL'}</span>
                      </>
                    )}
                  </button>
                </div>

                {submittedAt && (
                  <p className="text-[11px] font-mono text-[#666666]">
                    &bull; Saved on {new Date(submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </form>
            </div>
          )}

          {/* Action Checklist Tasks */}
          {step.tasks && step.tasks.length > 0 && (
            <div className="my-8 p-6 rounded-md bg-[#111111] border border-[#242424] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
                <div className="flex items-center gap-2">
                  <CheckSquare size={16} className="text-[#14B8A6]" />
                  <h4 className="font-mono text-xs uppercase tracking-widest text-white">Action Checklist</h4>
                </div>
                <span className="text-[11px] font-mono text-[#666666]">
                  {step.tasks.filter(t => completedTaskIds.has(t.id)).length} of {step.tasks.length} items
                </span>
              </div>
              <div className="space-y-2">
                {step.tasks.map((task) => {
                  const taskDone = completedTaskIds.has(task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => onToggleTask && onToggleTask(task.id, taskDone)}
                      className={clsx(
                        "w-full text-left p-3 rounded-md border text-xs font-sans transition-all flex items-center gap-3",
                        taskDone
                          ? "border-[#242424] bg-[#0A0A0A] text-[#666666]"
                          : "border-[#242424] bg-[#161616] hover:border-[#404040] text-[#D4D4D4]"
                      )}
                    >
                      {taskDone ? (
                        <CheckCircle2 size={16} className="text-[#14B8A6] shrink-0" />
                      ) : (
                        <Circle size={16} className="text-[#333333] shrink-0" />
                      )}
                      <span className={taskDone ? 'line-through' : ''}>
                        {task.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step Resources List */}
          {step.resources && step.resources.length > 0 && (
            <div className="my-6 p-4 rounded-md bg-[#111111] border border-[#242424]">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666] block mb-2">
                Official Step Resources:
              </span>
              <div className="flex flex-wrap gap-2">
                {step.resources.map(res => (
                  <a
                    key={res.id}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0A0A0A] border border-[#242424] text-xs font-mono text-[#A1A1A1] hover:border-white hover:text-white transition-colors"
                  >
                    <span>{res.label}</span>
                    <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Embedded Quiz */}
          {step.attachedQuizId && (
            <EmbeddedQuiz quizId={step.attachedQuizId} />
          )}
        </motion.div>
        </div>
      </div>

      {/* Navigation Footer */}
      <footer className="border-t border-[#242424] p-5 md:px-12 bg-[#0A0A0A] shrink-0">
        <div className="flex justify-between items-center max-w-4xl lg:max-w-5xl mx-auto">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A1A1A1] hover:text-white disabled:opacity-20 transition-colors px-3 py-2 rounded-md hover:bg-[#111111]"
          >
            <ChevronLeft size={15} />
            <span>Previous</span>
          </button>

          {/* Understated Stepped Progress Line */}
          <div className="hidden md:flex items-center gap-3 flex-1 mx-8 max-w-xs">
            <div className="h-[2px] flex-1 bg-[#1B1B1B] overflow-hidden rounded-full">
              <motion.div 
                className="h-full bg-[#FF5722]"
                initial={{ width: "0%" }}
                animate={{ width: `${(step.position / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-[10px] font-mono text-[#666666]">
              {step.position}/{totalSteps}
            </span>
          </div>

          <button
            onClick={onNext}
            disabled={isLast}
            className="flex items-center gap-2 text-xs font-medium bg-[#FF5722] hover:bg-[#E64A19] text-white disabled:opacity-30 disabled:hover:bg-[#FF5722] transition-colors px-5 py-2.5 rounded-md"
          >
            <span>{isLast ? "All Milestones Completed" : "Next Milestone"}</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </footer>
    </div>
  );
}
