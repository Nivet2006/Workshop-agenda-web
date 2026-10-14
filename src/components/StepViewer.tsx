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
  ArrowRight,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { EmbeddedQuiz } from '../features/quizzes/EmbeddedQuiz';
import { saveStepProgress, getStepProgress, saveDedicatedSubmission, getUserSubmissions, getPersistentGuestId } from '../lib/supabase';
import { saveDbSubmission, fetchDbSubmissions } from '../lib/dbService';
import { SpeakerNetworking } from './SpeakerNetworking';

// -----------------------------------------------------------------------------
// Real-Time Local Browser Validation & Diagnostics for LinkedIn URLs
// Runs 100% locally in the browser with instant user feedback
// -----------------------------------------------------------------------------
export interface UrlAnalysisResult {
  isValidUrl: boolean;
  status: 'success' | 'warning' | 'error';
  message: string;
  handle: string;
  hasNumericTail: boolean;
  testUrl: string;
}

export function analyzeLinkedInUrl(
  url: string, 
  submissionKey?: string, 
  stepNumber?: number
): UrlAnalysisResult | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    return {
      isValidUrl: false,
      status: 'error',
      message: 'Please enter a valid URL (e.g. linkedin.com/in/your-name)',
      handle: '',
      hasNumericTail: false,
      testUrl: ''
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLinkedIn = hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com');

  if (!isLinkedIn) {
    return {
      isValidUrl: false,
      status: 'error',
      message: 'URL must belong to the linkedin.com domain.',
      handle: '',
      hasNumericTail: false,
      testUrl: normalizedUrl
    };
  }

  const pathname = parsed.pathname;

  // Step 10: Event Post Verification
  if (submissionKey === 'published_post_url' || stepNumber === 10) {
    const isPost = pathname.includes('/posts/') || pathname.includes('/feed/update/') || pathname.includes('/pulse/');
    if (!isPost) {
      return {
        isValidUrl: false,
        status: 'warning',
        message: 'Expected a published post link (e.g. linkedin.com/posts/...).',
        handle: '',
        hasNumericTail: false,
        testUrl: normalizedUrl
      };
    }
    return {
      isValidUrl: true,
      status: 'success',
      message: 'Valid LinkedIn published post link verified.',
      handle: '',
      hasNumericTail: false,
      testUrl: normalizedUrl
    };
  }

  // Profile URL Verification (Step 2 and Step 11)
  const inMatch = pathname.match(/^\/in\/([^\/\?#]+)/i);
  if (!inMatch) {
    return {
      isValidUrl: false,
      status: 'warning',
      message: 'Profile URLs should follow the /in/your-handle format (e.g. linkedin.com/in/firstnamelastname).',
      handle: '',
      hasNumericTail: false,
      testUrl: normalizedUrl
    };
  }

  const handle = decodeURIComponent(inMatch[1]);
  const hasNumericTail = /-[0-9a-f]{5,}$/i.test(handle) || /-[0-9]{4,}$/.test(handle);
  const hasInvalidChars = /[^a-zA-Z0-9\-]/.test(handle);
  const isTooShort = handle.length < 3;

  if (hasInvalidChars) {
    return {
      isValidUrl: true,
      status: 'warning',
      message: `Handle "${handle}" contains symbols. LinkedIn vanity URLs should only have letters, numbers, and hyphens.`,
      handle,
      hasNumericTail,
      testUrl: normalizedUrl
    };
  }

  if (hasNumericTail) {
    return {
      isValidUrl: true,
      status: 'warning',
      message: `Auto-generated numeric suffix detected on "${handle}". Edit it on LinkedIn to remove random numbers for a cleaner vanity link!`,
      handle,
      hasNumericTail: true,
      testUrl: normalizedUrl
    };
  }

  if (isTooShort) {
    return {
      isValidUrl: true,
      status: 'warning',
      message: `Handle "${handle}" is very short. Standard vanity handles are between 3 and 30 characters.`,
      handle,
      hasNumericTail: false,
      testUrl: normalizedUrl
    };
  }

  return {
    isValidUrl: true,
    status: 'success',
    message: `Clean custom vanity URL verified: in/${handle}`,
    handle,
    hasNumericTail: false,
    testUrl: normalizedUrl
  };
}

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
  fontScale?: number;
}

const DEFAULT_ABOUT_PROMPT = `1. Who you are: Introduce yourself and your current degree or role.
2. Current focus: Mention your primary technical or domain interests.
3. Projects & highlights: Briefly describe 1–2 practical projects, hackathons, or learning milestones.
4. Non-technical strengths: Teamwork, problem-solving, community involvement.
5. Career vision: What kind of engineering or professional challenges excite you.
6. Call to action: Invite connections, mentorship, and collaboration.
ask me these questions and build me a linkedin about section`;

const DEFAULT_BANNER_PROMPT = `# Prompt: Premium Minimalist LinkedIn Profile Banner for a Software Engineer

## Objective
Design a premium, modern, highly professional LinkedIn profile banner that communicates my identity as a computer science engineering student, aspiring AI/ML engineer, and software developer. The banner should feel authentic, technically sophisticated, and carefully art-directed—not like a generic AI-generated template.

## 1. Canvas and Technical Specifications
- **Dimensions:** 1584 × 396 pixels.
- **Aspect ratio:** 4:1 widescreen.
- **Output:** High-resolution, crisp, professional banner optimized for LinkedIn.
- Keep all essential content inside a central safe area, accounting for different desktop and mobile crops.
- Maintain generous negative space and excellent readability at smaller display sizes.

## 2. Visual Direction
Create an understated, premium technology aesthetic inspired by Linear, Apple, Swiss editorial design, and contemporary developer portfolios.

The design should communicate:
- Technical competence
- Curiosity and continuous learning
- Software engineering and AI innovation
- A builder's mindset
- Professional ambition without exaggeration

Avoid the stereotypical futuristic AI aesthetic. Do not use excessive gradients, neon effects, glowing particles, holograms, stock imagery, or crowded technology illustrations.

## 3. Color Palette
Use a restrained, cohesive palette:
- Background: Near-black \`#0A0A0A\` or deep charcoal \`#111111\`.
- Primary text: White \`#FFFFFF\`.
- Secondary text: Muted gray \`#A1A1AA\`.
- Accent: Restrained electric blue \`#60A5FA\`, used sparingly.
- Optional dividers and technical details: \`#27272A\`.

Prefer solid colors and subtle tonal variation. Do not use strong gradients, ambient glows, glassmorphism, or decorative textures.

## 4. Layout and Composition

### Left section — Clear negative space
Keep the leftmost portion visually quiet because LinkedIn's circular profile photograph overlaps this region.

- No headline, important text, logo, or essential visual element in the bottom-left area.
- Avoid important details near the left edge.
- Allow the background to continue naturally behind the profile-picture overlap.
- Keep this region clean on both desktop and mobile layouts.

### Center-right section — Main identity
Place the main content toward the center-right, using a precise alignment grid.

Main headline:
**BUILDING TECHNOLOGY THAT MATTERS.**

Supporting line:
**AI / ML · Software Engineering · Web Development**

Typography should be modern, clean, and confident. Use a contemporary sans-serif typeface similar to Inter, Geist, or SF Pro.

- Headline: Medium to bold weight, with controlled letter spacing.
- Supporting line: Smaller, muted gray typography.
- Maintain a clear hierarchy without oversized, aggressive lettering.

### Right section — Technical visual language
Introduce a small, sophisticated technical motif that reinforces the engineering theme.

Possible elements:
- Fine geometric lines and modular grid structures.
- Minimal node-and-connection diagrams.
- Abstract representations of data flow or system architecture.
- Tiny, understated terminal-inspired details.
- A few precisely aligned dots or thin technical dividers.

Keep these elements subtle and secondary to the text. They should feel intentionally designed rather than randomly generated.

## 5. Personalized Content
Use the following identity and professional direction as the basis for the design:

- **Name:** Nived Shaji
- **Role:** Computer Science Engineering Student
- **Professional direction:** Aspiring AI/ML Engineer and Software Developer
- **Interests:** Artificial Intelligence, Machine Learning, Web Engineering, Backend Development, and Building Useful Technology.

If the name is included, display it discreetly. The banner should complement the LinkedIn profile rather than repeat an entire résumé.

Optional portfolio reference:
\`nivet2006.in\`

Include the portfolio URL only if it can be rendered accurately and legibly. Do not invent additional credentials, job titles, company affiliations, achievements, or certification claims.

## 6. Typography and Text Rendering
Use a maximum of two font styles and a strict typographic hierarchy.

- Keep text sharp, aligned, and professionally spaced.
- Avoid decorative, futuristic, handwritten, or excessively condensed fonts.
- Render all text exactly as supplied.
- Preserve punctuation and capitalization.
- Do not introduce random letters, fake code, misspelled words, or illegible microtext.
- Do not add unnecessary slogans or multiple competing headlines.

## 7. Overall Design Quality
The finished banner should look like a custom-designed personal brand asset created by a skilled graphic designer.

It should be:
- Minimal yet distinctive.
- Technical without looking cluttered.
- Modern without relying on visual effects.
- Professional without feeling corporate or generic.
- Consistent with a clean developer portfolio and professional headshot.

Use spacing, alignment, typography, and contrast—not decorative effects—to create visual impact.

## 8. Strict Negative Instructions
Do not include:
- The circular profile photograph or any additional human portraits.
- Large logos or unofficial brand marks.
- Random programming symbols, code screenshots, or meaningless terminal text.
- Multiple technology icons scattered across the banner.
- Stock photographs, office scenes, robots, circuit-board backgrounds, or AI brains.
- Neon lighting, strong gradients, glow effects, lens flares, or 3D elements.
- Excessive colors, decorative borders, visual clutter, or unnecessary labels.
- Claims of professional experience, expertise, or achievements that have not been supplied.

## Final Quality Standard
Produce one finished LinkedIn banner at exactly 1584 × 396 pixels, with a clean near-black background, restrained white typography, subtle engineering-inspired details, and carefully balanced negative space.

The final result should establish a recognizable personal brand for Nived Shaji: a computer science student focused on AI/ML and software engineering who enjoys building meaningful technology. It must feel intentional, understated, technically credible, and visually consistent with a premium developer portfolio.`;

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
  currentUser,
  fontScale = 1.0
}: StepViewerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  // Real-time local browser verification analysis
  const urlAnalysis = useMemo(() => {
    return analyzeLinkedInUrl(submissionUrl, step.content?.submissionKey, step.position);
  }, [submissionUrl, step.content?.submissionKey, step.position]);

  // User requirement: "hide all Test & Verify every section what ever present"
  const isUrlSubmissionStep = false;

  const isBannerStep = Boolean(
    step.content?.bannerPrompt ||
    step.id === 'li-step-05' ||
    step.position === 5 ||
    step.title.toLowerCase().includes('banner')
  );

  const isAboutStep = Boolean(
    step.content?.aboutPrompt || 
    step.id === 'li-step-06' || 
    step.position === 6 || 
    step.title.toLowerCase().includes('about')
  );

  const isNetworkingStep = Boolean(
    step.id === 'li-step-12' || step.title.toLowerCase().includes('networking')
  );

  // Load existing submission for this step separately
  useEffect(() => {
    let isMounted = true;
    const effectiveUserId = currentUser?.id || getPersistentGuestId();
    const stepKey = step.content?.submissionKey || (
      step.position === 2 ? 'custom_profile_url' :
      step.position === 10 ? 'published_post_url' :
      step.position === 11 ? 'final_profile_url' : null
    );

    async function loadData() {
      const progress = await getStepProgress(effectiveUserId, step.id);
      const submissions = getUserSubmissions(effectiveUserId, step.eventId);

      const dedicatedSaved = stepKey === 'custom_profile_url' ? submissions?.customProfileUrl :
                             stepKey === 'published_post_url' ? submissions?.publishedPostUrl :
                             stepKey === 'final_profile_url' ? submissions?.finalProfileUrl : null;

      let loadedUrl = progress?.completionData?.submissionUrl || 
                      (stepKey ? progress?.completionData?.[stepKey] : null) || 
                      dedicatedSaved?.url || '';

      let loadedTimestamp = progress?.completionData?.submittedAt || dedicatedSaved?.submittedAt || null;

      // If still not found, check db/submissions.json directly
      if (!loadedUrl && (stepKey || isUrlSubmissionStep)) {
        try {
          const dbSubs = await fetchDbSubmissions();
          const match = dbSubs.find(s => 
            s.eventId === step.eventId && 
            (s.key === stepKey || s.stepNumber === step.position) &&
            (s.userId === effectiveUserId || s.userId === 'guest-user')
          ) || dbSubs.find(s => 
            s.eventId === step.eventId && 
            (s.key === stepKey || s.stepNumber === step.position)
          );

          if (match && match.url) {
            loadedUrl = match.url;
            loadedTimestamp = match.submittedAt || null;
          }
        } catch (e) {
          console.warn('Error loading from db submissions:', e);
        }
      }

      if (isMounted) {
        setSubmissionUrl(loadedUrl);
        setSubmittedAt(loadedTimestamp);
        setSubmissionStatus('idle');
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [step.id, step.position, step.eventId, currentUser?.id, isUrlSubmissionStep]);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2200);
  };

  const handleSaveSubmission = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = submissionUrl.trim();
    if (!raw) return;

    // Normalize URL with https protocol for reliable saving & clickable link
    const cleanUrl = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    setSubmissionUrl(cleanUrl);

    setSubmissionStatus('saving');
    const effectiveUserId = currentUser?.id || getPersistentGuestId();
    const timestamp = new Date().toISOString();
    
    // Determine submission key and dedicated field based on step
    const submissionKey = step.content?.submissionKey || (
      step.position === 2 ? 'custom_profile_url' :
      step.position === 10 ? 'published_post_url' :
      step.position === 11 ? 'final_profile_url' : 'generic_submission_url'
    );

    const submissionCategory = (
      step.position === 2 ? 'custom_profile_url' :
      step.position === 10 ? 'published_post_url' :
      step.position === 11 ? 'final_profile_review_url' : 'generic_url'
    );

    const submissionLabel = step.content?.submissionLabel || (
      step.position === 2 ? 'Paste your custom profile URL below' :
      step.position === 10 ? 'Submit Your Published LinkedIn Post URL' :
      step.position === 11 ? 'Submit Your Final Profile URL for Review' : 'Submit URL'
    );

    const completionPayload: Record<string, any> = {
      submissionUrl: cleanUrl,
      submissionKey,
      submissionCategory,
      submissionLabel,
      stepNumber: step.position,
      stepTitle: step.title,
      stepId: step.id,
      submittedAt: timestamp
    };

    if (submissionKey === 'custom_profile_url') {
      completionPayload.customProfileUrl = cleanUrl;
    } else if (submissionKey === 'published_post_url') {
      completionPayload.publishedPostUrl = cleanUrl;
    } else if (submissionKey === 'final_profile_url') {
      completionPayload.finalProfileUrl = cleanUrl;
    }

    try {
      // 1. Direct and instant persistence to Supabase submissions database table
      await saveDbSubmission({
        userId: effectiveUserId,
        userName: currentUser?.displayName || 'Workshop Participant',
        userEmail: currentUser?.email || '',
        eventId: step.eventId,
        eventTitle: 'LinkedIn Profile Building',
        key: submissionKey,
        label: submissionLabel,
        stepNumber: step.position,
        stepTitle: step.title,
        url: cleanUrl,
        handle: urlAnalysis?.handle || ''
      });

      // 2. Save dedicated separate submission record to local cache
      try {
        await saveDedicatedSubmission(
          effectiveUserId,
          step.eventId,
          submissionKey,
          cleanUrl,
          step.id,
          step.position,
          submissionLabel
        );
      } catch (cacheErr) {
        console.warn('Dedicated submission cache note:', cacheErr);
      }

      // 3. Update participant progress
      try {
        await saveStepProgress(
          effectiveUserId,
          step.eventId,
          step.id,
          isCompleted ? 'completed' : 'in_progress',
          completionPayload
        );
      } catch (progressErr) {
        console.warn('Step progress note:', progressErr);
      }

      setSubmittedAt(timestamp);
      setSubmissionStatus('saved');
      setTimeout(() => setSubmissionStatus('idle'), 3000);

      // If user explicitly clicked submit in the form and milestone isn't marked completed, auto-mark complete
      if (e && !isCompleted) {
        onToggleComplete();
      }
    } catch (err) {
      console.error('Failed to save submission:', err);
      setSubmissionStatus('idle');
    }
  };

  const handleToggleComplete = async () => {
    if (isUrlSubmissionStep && submissionUrl.trim()) {
      await handleSaveSubmission();
    }
    onToggleComplete();
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
        <div 
          className="max-w-4xl lg:max-w-5xl mx-auto px-6 py-10 md:px-12 md:py-14 w-full"
          style={{ zoom: fontScale }}
        >
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
                {isNetworkingStep ? (
                  <p className="mt-3 text-sm md:text-base text-[#A1A1A1] font-normal leading-relaxed max-w-2xl font-sans">
                    Click on any QR code or scan it with your phone to redirect directly to the LinkedIn profile.
                  </p>
                ) : step.summary && (
                  <p className="mt-3 text-base md:text-lg text-[#A1A1A1] font-normal leading-relaxed max-w-2xl font-sans">
                    {step.summary}
                  </p>
                )}
              </div>
            </div>
          </header>

          {/* Objective Banner */}
          {step.objective && !isNetworkingStep && (
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
          {highlightedContent && !isNetworkingStep && (
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

          {/* AI Banner Prompt Helper (Step 5: Custom Banner Design and Upload) - Prompt text NOT displayed on screen per user requirement */}
          {isBannerStep && (
            <div className="my-8 p-5 sm:p-6 rounded-md bg-[#111111] border border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-[#161616] border border-[#242424] flex items-center justify-center text-[#FF5722] shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-white">
                    Custom Banner AI Prompt
                  </h4>
                  <p className="text-xs text-[#888888] font-sans mt-0.5">
                    Click to copy the 1584×396 minimalist software engineer banner prompt for ChatGPT, Midjourney, or Claude.
                  </p>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(step.content?.bannerPrompt || DEFAULT_BANNER_PROMPT, 'banner-prompt')}
                className={clsx(
                  "flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-medium text-xs font-mono transition-all duration-200 shrink-0",
                  copiedField === 'banner-prompt'
                    ? "bg-[#14B8A6] text-black"
                    : "bg-[#FF5722] hover:bg-[#E64A19] text-white shadow-sm"
                )}
                title="Click to copy the AI Banner Prompt to clipboard"
              >
                {copiedField === 'banner-prompt' ? (
                  <>
                    <Check size={14} className="stroke-[2.5]" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy AI prompt</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* AI About Section Builder Prompt (Copy Prompt Button - Prompt text NOT displayed on screen per user requirement) */}
          {isAboutStep && (
            <div className="my-8 p-5 sm:p-6 rounded-md bg-[#111111] border border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[4px] bg-[#161616] border border-[#242424] flex items-center justify-center text-[#FF5722] shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-white">
                    About Section Prompt
                  </h4>
                  <p className="text-xs text-[#888888] font-sans mt-0.5">
                    Click to copy the 6-question prompt. Paste into ChatGPT or Claude to build your LinkedIn About section.
                  </p>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(step.content?.aboutPrompt || DEFAULT_ABOUT_PROMPT, 'about-prompt')}
                className={clsx(
                  "flex items-center justify-center gap-2 px-5 py-2.5 rounded-md font-medium text-xs font-mono transition-all duration-200 shrink-0",
                  copiedField === 'about-prompt'
                    ? "bg-[#14B8A6] text-black"
                    : "bg-[#FF5722] hover:bg-[#E64A19] text-white shadow-sm"
                )}
                title="Click to copy the About Section prompt to clipboard"
              >
                {copiedField === 'about-prompt' ? (
                  <>
                    <Check size={14} className="stroke-[2.5]" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
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

          {/* AI Prompt Copy Helper (Step 4: Profile Picture Generation and Upload) */}
          {step.content?.aiPrompt && (
            <div className="my-8 p-6 rounded-md bg-[#111111] border border-[#242424] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1B1B1B]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[4px] bg-[#161616] border border-[#242424] flex items-center justify-center text-[#C5A059]">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-widest text-white">
                      {step.content.aiPromptTitle || 'AI Headshot Generation Prompt'}
                    </h4>
                    <p className="text-xs text-[#666666] font-sans">
                      Ready-to-use prompt for ChatGPT, Midjourney, Claude, Gemini, or Stable Diffusion
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(step.content.aiPrompt!, 'ai-prompt')}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-md font-medium text-xs font-mono transition-all duration-200 shrink-0",
                    copiedField === 'ai-prompt'
                      ? "bg-[#14B8A6] text-black"
                      : "bg-[#FF5722] hover:bg-[#E64A19] text-white shadow-sm"
                  )}
                  title="Click to copy full AI prompt to clipboard"
                >
                  {copiedField === 'ai-prompt' ? (
                    <>
                      <Check size={14} className="stroke-[2.5]" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy AI Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <div className="p-4 bg-[#0A0A0A] border border-[#1B1B1B] rounded-[4px] text-xs font-mono text-[#A1A1A1] leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto custom-scrollbar select-text">
                  {step.content.aiPrompt}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#666666]">
                  <span>💡 Tip: Attach your casual photo and paste this prompt into an AI image tool.</span>
                  <button
                    onClick={() => copyToClipboard(step.content.aiPrompt!, 'ai-prompt')}
                    className="text-[#C5A059] hover:underline"
                  >
                    Quick Copy ↗
                  </button>
                </div>
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
          {isUrlSubmissionStep && (
            <div className="my-8 p-6 rounded-md bg-[#111111] border border-[#242424] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1B1B1B]">
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-widest text-white flex items-center gap-2">
                    <Link2 size={14} className="text-[#FF5722]" />
                    {step.content?.submissionLabel || 'Submit Your URL'}
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={submissionUrl}
                      onChange={(e) => setSubmissionUrl(e.target.value)}
                      placeholder={step.content?.submissionPlaceholder || 'https://www.linkedin.com/...'}
                      className={clsx(
                        "w-full px-4 py-2.5 bg-[#0A0A0A] border rounded-md text-xs font-mono text-white placeholder-[#666666] focus:outline-none transition-colors",
                        urlAnalysis?.status === 'success' ? "border-[#14B8A6] focus:border-[#14B8A6]" :
                        urlAnalysis?.status === 'warning' ? "border-[#C5A059] focus:border-[#C5A059]" :
                        urlAnalysis?.status === 'error' ? "border-[#FF5722] focus:border-[#FF5722]" :
                        "border-[#242424] focus:border-white"
                      )}
                    />
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {/* Live In-Browser Test Link Button */}
                    {urlAnalysis?.testUrl && (
                      <a
                        href={urlAnalysis.testUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 rounded-md bg-[#161616] hover:bg-[#222222] border border-[#242424] text-xs font-mono text-[#D4D4D4] hover:text-white flex items-center gap-1.5 transition-colors"
                        title="Open and test this link in a new tab"
                      >
                        <ExternalLink size={13} className="text-[#14B8A6]" />
                        <span>Test Link</span>
                      </a>
                    )}

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
                </div>

                {/* Real-Time Local Browser Verification Panel */}
                {urlAnalysis && (
                  <div className={clsx(
                    "p-3 rounded-md border text-xs font-mono flex items-start gap-2.5 transition-all",
                    urlAnalysis.status === 'success' && "bg-[#14B8A6]/10 border-[#14B8A6]/30 text-[#14B8A6]",
                    urlAnalysis.status === 'warning' && "bg-[#C5A059]/10 border-[#C5A059]/30 text-[#C5A059]",
                    urlAnalysis.status === 'error' && "bg-[#FF5722]/10 border-[#FF5722]/30 text-[#FF5722]"
                  )}>
                    {urlAnalysis.status === 'success' && <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-[#14B8A6]" />}
                    {urlAnalysis.status === 'warning' && <AlertTriangle size={15} className="shrink-0 mt-0.5 text-[#C5A059]" />}
                    {urlAnalysis.status === 'error' && <AlertCircle size={15} className="shrink-0 mt-0.5 text-[#FF5722]" />}
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold uppercase tracking-wider text-[10px]">
                          {urlAnalysis.status === 'success' ? 'Verification Passed' : 
                           urlAnalysis.status === 'warning' ? 'Optimization Tip' : 'Invalid Format'}
                        </span>
                        {urlAnalysis.handle && (
                          <span className="text-[10px] opacity-80 font-sans">
                            Handle: <span className="font-mono font-bold">in/{urlAnalysis.handle}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#D4D4D4] font-sans">
                        {urlAnalysis.message}
                      </p>
                    </div>
                  </div>
                )}

                {submittedAt && (
                  <p className="text-[11px] font-mono text-[#666666]">
                    &bull; Saved on {new Date(submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </form>
            </div>
          )}

          {/* Speaker Networking with QR Codes (Step 12 / Networking) */}
          {(step.id === 'li-step-12' || step.title.toLowerCase().includes('networking')) && (
            <SpeakerNetworking />
          )}

          {/* Action Checklist Tasks */}
          {step.tasks && step.tasks.length > 0 && !isNetworkingStep && (
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
          {step.resources && step.resources.length > 0 && !isNetworkingStep && (
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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Minimal Milestone Action */}
            <button
              onClick={handleToggleComplete}
              className={clsx(
                "flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-md border text-xs font-mono tracking-wider uppercase transition-all duration-150 shrink-0",
                isCompleted 
                  ? "bg-[#111111] border-[#14B8A6]/60 text-[#14B8A6] hover:bg-[#161616]" 
                  : "bg-[#111111] border-[#242424] text-[#A1A1A1] hover:border-[#404040] hover:text-white"
              )}
            >
              {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}
              <span>{isCompleted ? "Completed" : "Mark Complete"}</span>
            </button>

            <button
              onClick={onNext}
              disabled={isLast && isCompleted}
              className="flex items-center gap-2 text-xs font-medium bg-[#FF5722] hover:bg-[#E64A19] text-white disabled:opacity-30 disabled:hover:bg-[#FF5722] transition-colors px-4 sm:px-5 py-2 sm:py-2.5 rounded-md shrink-0"
            >
              <span>{isLast ? (isCompleted ? "All Milestones Completed" : "Complete Milestone") : "Next Milestone"}</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
