// =============================================================================
// EventFlow Shared Domain Types
// Compliant with EventFlow_PRD.md & EventFlow_Detailed_Implementation_Prompt.md
// =============================================================================

export type UserRole = 'platform_admin' | 'organizer' | 'facilitator' | 'participant' | 'visitor';

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  email?: string;
  role?: UserRole;
}

export type EventStatus = 'draft' | 'published' | 'live' | 'archived';
export type AccessPolicy = 'open' | 'code' | 'approval';

export interface EventTheme {
  palette: 'dark' | 'light' | 'custom';
  accentColor: string;
  badge?: string;
  logoUrl?: string;
}

export interface EventModel {
  id: string;
  ownerId?: string;
  title: string;
  slug: string;
  description: string;
  startTime?: string;
  endTime?: string;
  timezone: string;
  status: EventStatus;
  accessCode: string;
  accessPolicy: AccessPolicy;
  theme: EventTheme;
  currentStepId?: string;
  publishedVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventMembership {
  id: string;
  eventId: string;
  userId: string;
  displayName: string;
  role: 'participant' | 'facilitator' | 'co_host';
  status: 'active' | 'completed' | 'blocked';
  joinedAt: string;
  lastActiveAt: string;
}

export interface EventSection {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  position: number;
  visibility: 'visible' | 'hidden';
}

export type StepType = 
  | 'instruction' 
  | 'checklist' 
  | 'activity' 
  | 'video_embed' 
  | 'quiz' 
  | 'challenge' 
  | 'break' 
  | 'resource_collection' 
  | 'custom';

export type CompletionRule = 'manual' | 'checklist_all' | 'quiz_pass';

export interface StepContent {
  html?: string;
  markdown?: string;
  substeps?: string[];
  warnings?: string[];
  videoUrl?: string;
  embedUrl?: string;
  officialAccountMention?: string;
  officialAccountUrl?: string;
  requiredHashtags?: string[];
  samplePostText?: string;
  sampleHeadline?: string;
  sampleAboutText?: string;
  eventImages?: Array<{ url: string; caption?: string }>;
  submissionType?: 'url' | 'text';
  submissionLabel?: string;
  submissionPlaceholder?: string;
}

export interface StepTask {
  id: string;
  stepId: string;
  title: string;
  description?: string;
  position: number;
  required: boolean;
}

export interface StepResource {
  id: string;
  stepId: string;
  label: string;
  type: 'link' | 'file' | 'code' | 'doc';
  url: string;
  position: number;
}

export interface EventStep {
  id: string;
  eventId: string;
  sectionId?: string;
  type: StepType;
  title: string;
  timeRange?: string;
  summary?: string;
  objective?: string;
  content: StepContent;
  durationMinutes: number;
  position: number;
  required: boolean;
  completionRule: CompletionRule;
  attachedQuizId?: string;
  publishedVersion: number;
  tasks?: StepTask[];
  resources?: StepResource[];
}

export interface ParticipantStepProgress {
  id: string;
  eventId: string;
  stepId: string;
  userId: string;
  status: 'in_progress' | 'completed';
  completedAt?: string;
  lastOpenedAt: string;
  completionData?: Record<string, any>;
}

export interface ParticipantTaskProgress {
  id: string;
  userId: string;
  taskId: string;
  completedAt: string;
}

// -----------------------------------------------------------------------------
// Quizzes & Live Sessions
// -----------------------------------------------------------------------------
export type QuestionType = 'single_choice' | 'multiple_select' | 'true_false';
export type LeaderboardMode = 'full' | 'top3_and_me' | 'me_only' | 'final_only' | 'hidden';
export type RevealAnswerMode = 'after_each' | 'final_only' | 'never';

export interface QuizSettings {
  timeLimitSeconds: number;
  pointsPerQuestion: number;
  speedBonus: boolean;
  negativeMarking: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  revealAnswerMode: RevealAnswerMode;
  leaderboardMode: LeaderboardMode;
}

export interface QuizTheme {
  name: string;
  accent: string;
  soundEnabled?: boolean;
}

export interface QuizModel {
  id: string;
  ownerId?: string;
  eventId?: string;
  title: string;
  description?: string;
  settings: QuizSettings;
  theme: QuizTheme;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  prompt: string;
  mediaUrl?: string;
  options: string[];
  correctAnswerKeys?: string[]; // protected from participants before reveal
  explanation?: string;
  points: number;
  timeLimitSeconds: number;
  position: number;
}

export type QuizSessionStatus = 
  | 'draft' 
  | 'ready' 
  | 'lobby' 
  | 'live_question' 
  | 'reveal' 
  | 'next_question' 
  | 'final_results' 
  | 'ended' 
  | 'paused';

export interface QuizSession {
  id: string;
  quizId: string;
  eventId?: string;
  hostId?: string;
  joinCode: string;
  status: QuizSessionStatus;
  currentQuestionIndex: number;
  questionStartTime?: string;
  questionDeadline?: string;
  settingsSnapshot: QuizSettings;
  createdAt: string;
  updatedAt: string;
  membersCount?: number;
  responsesCount?: number;
}

export interface QuizSessionMember {
  id: string;
  sessionId: string;
  userId: string;
  displayName: string;
  joinedAt: string;
  totalPoints: number;
  correctCount: number;
  totalResponseTimeMs: number;
}

export interface QuizResponse {
  id: string;
  sessionId: string;
  questionId: string;
  userId: string;
  answer: string | string[];
  submittedAt: string;
  awardedPoints: number;
  isCorrect: boolean;
  responseTimeMs: number;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalPoints: number;
  correctCount: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface EventAnnouncement {
  id: string;
  eventId: string;
  authorId?: string;
  title: string;
  body: string;
  audience: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  eventId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
