// =============================================================================
// EventFlow Supabase Client & Data Access Layer
// Provides both cloud-connected Supabase queries and seamless offline fallback
// =============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  EventModel, 
  EventSection, 
  EventStep, 
  ParticipantStepProgress, 
  ParticipantTaskProgress, 
  QuizModel, 
  QuizSession, 
  QuizSessionMember,
  LeaderboardEntry,
  UserProfile,
  EventMembership
} from '../types';
import { 
  sampleEvent, 
  sampleSections, 
  sampleSteps, 
  sampleQuiz, 
  SAMPLE_EVENT_ID,
  linkedinEvent,
  allSeedEvents,
  allSeedSections,
  allSeedSteps,
  LINKEDIN_EVENT_ID
} from './seedData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

// -----------------------------------------------------------------------------
// Offline / Local State Cache (Guarantees zero-failure operation)
// -----------------------------------------------------------------------------
const LOCAL_STORAGE_KEYS = {
  PROFILE: 'eventflow_user_profile',
  EVENTS: 'eventflow_events',
  STEPS: 'eventflow_steps',
  SECTIONS: 'eventflow_sections',
  STEP_PROGRESS: 'eventflow_step_progress',
  TASK_PROGRESS: 'eventflow_task_progress',
  QUIZZES: 'eventflow_quizzes',
  QUIZ_SESSIONS: 'eventflow_quiz_sessions',
  SESSION_MEMBERS: 'eventflow_session_members',
  RESPONSES: 'eventflow_quiz_responses',
  MEMBERSHIPS: 'eventflow_memberships',
};

function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

// Initialize seed data into local storage cache
const storedEvents = getLocalItem<EventModel[]>(LOCAL_STORAGE_KEYS.EVENTS, []);
const hasLinkedin = storedEvents.some(e => e.id === linkedinEvent.id);
if (!hasLinkedin || storedEvents.length === 0) {
  setLocalItem(LOCAL_STORAGE_KEYS.EVENTS, allSeedEvents);
  setLocalItem(LOCAL_STORAGE_KEYS.SECTIONS, allSeedSections);
  setLocalItem(LOCAL_STORAGE_KEYS.STEPS, allSeedSteps);
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.QUIZZES)) {
    setLocalItem(LOCAL_STORAGE_KEYS.QUIZZES, [sampleQuiz]);
  }
}

// -----------------------------------------------------------------------------
// Authentication (Direct Profile & Session Management - No OAuth Required)
// -----------------------------------------------------------------------------

export async function signInUser(
  displayName: string,
  email?: string,
  role: 'participant' | 'organizer' | 'platform_admin' = 'participant'
): Promise<{ user: UserProfile | null; error: Error | null }> {
  try {
    let userId: string = crypto.randomUUID();

    if (supabase) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          userId = authData.user.id;
        } else {
          const { data: anonData } = await supabase.auth.signInAnonymously();
          if (anonData?.user) {
            userId = anonData.user.id;
          }
        }

        await supabase.from('profiles').upsert({
          id: userId,
          display_name: displayName,
          updated_at: new Date().toISOString()
        });

        if (role === 'organizer' || role === 'platform_admin') {
          await supabase.from('organizer_memberships').upsert({
            user_id: userId,
            role: role
          }, { onConflict: 'user_id,role' });
        }
      } catch (err) {
        console.warn('Supabase remote profile sync note (continuing locally):', err);
      }
    }

    const user: UserProfile = {
      id: userId,
      displayName,
      email: email || `${displayName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}@eventflow.dev`,
      role
    };

    setLocalItem(LOCAL_STORAGE_KEYS.PROFILE, user);
    window.dispatchEvent(new Event('eventflow_auth_change'));
    return { user, error: null };
  } catch (e: any) {
    return { user: null, error: e };
  }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const cached = getLocalItem<UserProfile | null>(LOCAL_STORAGE_KEYS.PROFILE, null);
  if (cached) return cached;

  if (supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile) {
          const loaded: UserProfile = {
            id: user.id,
            displayName: profile.display_name || 'Participant',
            avatarUrl: profile.avatar_url,
            email: user.email,
            role: 'participant'
          };
          setLocalItem(LOCAL_STORAGE_KEYS.PROFILE, loaded);
          return loaded;
        }
      }
    } catch (e) {
      // Ignore network errors and continue
    }
  }

  return null;
}

export async function updateUserProfile(userId: string, displayName: string): Promise<boolean> {
  if (supabase) {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, display_name: displayName, updated_at: new Date().toISOString() });
    return !error;
  } else {
    const current = await getCurrentUserProfile();
    if (current) {
      setLocalItem(LOCAL_STORAGE_KEYS.PROFILE, { ...current, displayName });
      window.dispatchEvent(new Event('eventflow_auth_change'));
    }
    return true;
  }
}

export async function signOutUser(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(LOCAL_STORAGE_KEYS.PROFILE);
  window.dispatchEvent(new Event('eventflow_auth_change'));
}

// -----------------------------------------------------------------------------
// Events & Membership API
// -----------------------------------------------------------------------------

export async function getEventByCode(accessCode: string): Promise<EventModel | null> {
  const normalized = accessCode.trim().toUpperCase();

  if (supabase) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .ilike('access_code', normalized)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      ownerId: data.owner_id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      startTime: data.start_time,
      endTime: data.end_time,
      timezone: data.timezone,
      status: data.status,
      accessCode: data.access_code,
      accessPolicy: data.access_policy,
      theme: data.theme,
      currentStepId: data.current_step_id,
      publishedVersion: data.published_version,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  const events = getLocalItem<EventModel[]>(LOCAL_STORAGE_KEYS.EVENTS, allSeedEvents);
  return events.find(e => e.accessCode.toUpperCase() === normalized) || null;
}

export async function getAllEvents(): Promise<EventModel[]> {
  if (supabase) {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) {
      return data.map(d => ({
        id: d.id,
        ownerId: d.owner_id,
        title: d.title,
        slug: d.slug,
        description: d.description,
        startTime: d.start_time,
        endTime: d.end_time,
        timezone: d.timezone,
        status: d.status,
        accessCode: d.access_code,
        accessPolicy: d.access_policy,
        theme: d.theme,
        currentStepId: d.current_step_id,
        publishedVersion: d.published_version,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }));
    }
  }
  return getLocalItem<EventModel[]>(LOCAL_STORAGE_KEYS.EVENTS, allSeedEvents);
}

export async function createOrUpdateEvent(event: Partial<EventModel> & { title: string }): Promise<EventModel> {
  const events = getLocalItem<EventModel[]>(LOCAL_STORAGE_KEYS.EVENTS, [sampleEvent]);
  const id = event.id || crypto.randomUUID();
  const existing = events.find(e => e.id === id);

  const fullEvent: EventModel = {
    id,
    title: event.title,
    slug: event.slug || event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30),
    description: event.description || '',
    timezone: event.timezone || 'UTC',
    status: event.status || 'draft',
    accessCode: event.accessCode || Math.random().toString(36).substring(2, 8).toUpperCase(),
    accessPolicy: event.accessPolicy || 'code',
    theme: event.theme || { palette: 'dark', accentColor: '#10b981' },
    publishedVersion: (existing?.publishedVersion || 0) + 1,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (supabase) {
    await supabase.from('events').upsert({
      id: fullEvent.id,
      title: fullEvent.title,
      slug: fullEvent.slug,
      description: fullEvent.description,
      timezone: fullEvent.timezone,
      status: fullEvent.status,
      access_code: fullEvent.accessCode,
      access_policy: fullEvent.accessPolicy,
      theme: fullEvent.theme,
      published_version: fullEvent.publishedVersion,
      updated_at: fullEvent.updatedAt
    });
  }

  const updatedEvents = existing ? events.map(e => e.id === id ? fullEvent : e) : [...events, fullEvent];
  setLocalItem(LOCAL_STORAGE_KEYS.EVENTS, updatedEvents);
  return fullEvent;
}

export async function joinEvent(eventId: string, userId: string, displayName: string): Promise<EventMembership> {
  const membership: EventMembership = {
    id: crypto.randomUUID(),
    eventId,
    userId,
    displayName,
    role: 'participant',
    status: 'active',
    joinedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };

  if (supabase) {
    await supabase.from('event_memberships').upsert({
      event_id: eventId,
      user_id: userId,
      display_name: displayName,
      role: 'participant',
      status: 'active',
      last_active_at: new Date().toISOString()
    }, { onConflict: 'event_id,user_id' });
  } else {
    const list = getLocalItem<EventMembership[]>(LOCAL_STORAGE_KEYS.MEMBERSHIPS, []);
    const existing = list.find(m => m.eventId === eventId && m.userId === userId);
    if (!existing) {
      setLocalItem(LOCAL_STORAGE_KEYS.MEMBERSHIPS, [...list, membership]);
    }
  }

  return membership;
}

// -----------------------------------------------------------------------------
// Guide Sections, Steps & Progress API
// -----------------------------------------------------------------------------

export async function getEventSections(eventId: string): Promise<EventSection[]> {
  if (supabase) {
    const { data } = await supabase
      .from('event_sections')
      .select('*')
      .eq('event_id', eventId)
      .order('position', { ascending: true });
    if (data && data.length > 0) {
      return data.map(d => ({
        id: d.id,
        eventId: d.event_id,
        title: d.title,
        description: d.description,
        position: d.position,
        visibility: d.visibility
      }));
    }
  }

  const sections = getLocalItem<EventSection[]>(LOCAL_STORAGE_KEYS.SECTIONS, allSeedSections);
  return sections.filter(s => s.eventId === eventId);
}

export async function getEventSteps(eventId: string): Promise<EventStep[]> {
  if (supabase) {
    const { data } = await supabase
      .from('event_steps')
      .select(`
        *,
        step_tasks (*),
        step_resources (*)
      `)
      .eq('event_id', eventId)
      .order('position', { ascending: true });

    if (data && data.length > 0) {
      return data.map(d => ({
        id: d.id,
        eventId: d.event_id,
        sectionId: d.section_id,
        type: d.type,
        title: d.title,
        timeRange: d.time_range,
        summary: d.summary,
        objective: d.objective,
        content: d.content,
        durationMinutes: d.duration_minutes,
        position: d.position,
        required: d.required,
        completionRule: d.completion_rule,
        attachedQuizId: d.attached_quiz_id,
        publishedVersion: d.published_version,
        tasks: d.step_tasks?.map((t: any) => ({
          id: t.id,
          stepId: t.step_id,
          title: t.title,
          description: t.description,
          position: t.position,
          required: t.required
        })),
        resources: d.step_resources?.map((r: any) => ({
          id: r.id,
          stepId: r.step_id,
          label: r.label,
          type: r.type,
          url: r.url,
          position: r.position
        }))
      }));
    }
  }

  const steps = getLocalItem<EventStep[]>(LOCAL_STORAGE_KEYS.STEPS, allSeedSteps);
  return steps.filter(s => s.eventId === eventId);
}

export async function saveEventStep(step: EventStep): Promise<void> {
  if (supabase) {
    await supabase.from('event_steps').upsert({
      id: step.id,
      event_id: step.eventId,
      section_id: step.sectionId || null,
      type: step.type,
      title: step.title,
      time_range: step.timeRange,
      summary: step.summary,
      objective: step.objective,
      content: step.content,
      duration_minutes: step.durationMinutes,
      position: step.position,
      required: step.required,
      completion_rule: step.completionRule,
      attached_quiz_id: step.attachedQuizId || null,
      published_version: step.publishedVersion
    });

    if (step.tasks) {
      for (const t of step.tasks) {
        await supabase.from('step_tasks').upsert({
          id: t.id,
          step_id: step.id,
          title: t.title,
          description: t.description || null,
          position: t.position,
          required: t.required
        });
      }
    }
  }

  const steps = getLocalItem<EventStep[]>(LOCAL_STORAGE_KEYS.STEPS, allSeedSteps);
  const filtered = steps.filter(s => s.id !== step.id);
  filtered.push(step);
  filtered.sort((a, b) => a.position - b.position);
  setLocalItem(LOCAL_STORAGE_KEYS.STEPS, filtered);
}

export async function saveAllEventSteps(eventId: string, newSteps: EventStep[]): Promise<void> {
  for (const step of newSteps) {
    await saveEventStep(step);
  }
}

export async function saveStepProgress(
  userId: string,
  eventId: string,
  stepId: string,
  status: 'completed' | 'in_progress',
  completionData?: Record<string, any>
): Promise<void> {
  const timestamp = new Date().toISOString();

  if (supabase) {
    const upsertObj: Record<string, any> = {
      user_id: userId,
      event_id: eventId,
      step_id: stepId,
      status,
      completed_at: status === 'completed' ? timestamp : null,
      last_opened_at: timestamp
    };
    if (completionData) {
      upsertObj.completion_data = completionData;
    }
    await supabase.from('participant_step_progress').upsert(upsertObj, { onConflict: 'step_id,user_id' });
  }

  const list = getLocalItem<ParticipantStepProgress[]>(LOCAL_STORAGE_KEYS.STEP_PROGRESS, []);
  const existing = list.find(p => p.userId === userId && p.stepId === stepId);
  const filtered = list.filter(p => !(p.userId === userId && p.stepId === stepId));
  filtered.push({
    id: existing?.id || crypto.randomUUID(),
    userId,
    eventId,
    stepId,
    status,
    completedAt: status === 'completed' ? timestamp : existing?.completedAt,
    lastOpenedAt: timestamp,
    completionData: completionData !== undefined ? completionData : existing?.completionData
  });
  setLocalItem(LOCAL_STORAGE_KEYS.STEP_PROGRESS, filtered);
}

export async function getStepProgress(userId: string, stepId: string): Promise<ParticipantStepProgress | null> {
  if (supabase) {
    const { data } = await supabase
      .from('participant_step_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('step_id', stepId)
      .maybeSingle();
    if (data) {
      return {
        id: data.id,
        userId: data.user_id,
        eventId: data.event_id,
        stepId: data.step_id,
        status: data.status,
        completedAt: data.completed_at,
        lastOpenedAt: data.last_opened_at,
        completionData: data.completion_data
      };
    }
  }

  const list = getLocalItem<ParticipantStepProgress[]>(LOCAL_STORAGE_KEYS.STEP_PROGRESS, []);
  return list.find(p => p.userId === userId && p.stepId === stepId) || null;
}

export async function getCompletedStepIds(userId: string, eventId: string): Promise<Set<string>> {
  if (supabase) {
    const { data } = await supabase
      .from('participant_step_progress')
      .select('step_id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .eq('status', 'completed');
    if (data) {
      return new Set(data.map(d => d.step_id));
    }
  }

  const list = getLocalItem<ParticipantStepProgress[]>(LOCAL_STORAGE_KEYS.STEP_PROGRESS, []);
  return new Set(
    list
      .filter(p => p.userId === userId && p.eventId === eventId && p.status === 'completed')
      .map(p => p.stepId)
  );
}

export async function saveTaskProgress(userId: string, taskId: string, completed: boolean): Promise<void> {
  if (supabase) {
    if (completed) {
      await supabase.from('participant_task_progress').upsert({
        user_id: userId,
        task_id: taskId,
        completed_at: new Date().toISOString()
      }, { onConflict: 'task_id,user_id' });
    } else {
      await supabase.from('participant_task_progress').delete().match({ user_id: userId, task_id: taskId });
    }
  }

  const list = getLocalItem<ParticipantTaskProgress[]>(LOCAL_STORAGE_KEYS.TASK_PROGRESS, []);
  const filtered = list.filter(p => !(p.userId === userId && p.taskId === taskId));
  if (completed) {
    filtered.push({ id: crypto.randomUUID(), userId, taskId, completedAt: new Date().toISOString() });
  }
  setLocalItem(LOCAL_STORAGE_KEYS.TASK_PROGRESS, filtered);
}

export async function getCompletedTaskIds(userId: string): Promise<Set<string>> {
  if (supabase) {
    const { data } = await supabase.from('participant_task_progress').select('task_id').eq('user_id', userId);
    if (data) return new Set(data.map(d => d.task_id));
  }

  const list = getLocalItem<ParticipantTaskProgress[]>(LOCAL_STORAGE_KEYS.TASK_PROGRESS, []);
  return new Set(list.filter(p => p.userId === userId).map(p => p.taskId));
}

// -----------------------------------------------------------------------------
// Quizzes & Live Engine API
// -----------------------------------------------------------------------------

export async function getQuizById(quizId: string): Promise<QuizModel | null> {
  if (supabase) {
    const { data } = await supabase
      .from('quizzes')
      .select('*, quiz_questions(*)')
      .eq('id', quizId)
      .single();

    if (data) {
      return {
        id: data.id,
        ownerId: data.owner_id,
        eventId: data.event_id,
        title: data.title,
        description: data.description,
        settings: data.settings,
        theme: data.theme,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        questions: data.quiz_questions?.map((q: any) => ({
          id: q.id,
          quizId: q.quiz_id,
          type: q.type,
          prompt: q.prompt,
          mediaUrl: q.media_url,
          options: q.options,
          correctAnswerKeys: q.correct_answer_keys,
          explanation: q.explanation,
          points: q.points,
          timeLimitSeconds: q.time_limit_seconds,
          position: q.position
        }))
      };
    }
  }

  const quizzes = getLocalItem<QuizModel[]>(LOCAL_STORAGE_KEYS.QUIZZES, [sampleQuiz]);
  return quizzes.find(q => q.id === quizId) || null;
}

export async function createLiveQuizSession(quizId: string, eventId?: string, hostId?: string): Promise<QuizSession> {
  const quiz = await getQuizById(quizId);
  const joinCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit PIN

  const session: QuizSession = {
    id: crypto.randomUUID(),
    quizId,
    eventId,
    hostId,
    joinCode,
    status: 'lobby',
    currentQuestionIndex: 0,
    settingsSnapshot: quiz?.settings || {
      timeLimitSeconds: 30,
      pointsPerQuestion: 100,
      speedBonus: false,
      negativeMarking: false,
      revealAnswerMode: 'after_each',
      leaderboardMode: 'top3_and_me'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    membersCount: 0,
    responsesCount: 0
  };

  if (supabase) {
    await supabase.from('quiz_sessions').insert({
      id: session.id,
      quiz_id: session.quizId,
      event_id: session.eventId,
      host_id: session.hostId,
      join_code: session.joinCode,
      status: session.status,
      current_question_index: 0,
      settings_snapshot: session.settingsSnapshot
    });
  }

  const list = getLocalItem<QuizSession[]>(LOCAL_STORAGE_KEYS.QUIZ_SESSIONS, []);
  setLocalItem(LOCAL_STORAGE_KEYS.QUIZ_SESSIONS, [...list, session]);
  return session;
}

export async function getQuizSessionByCode(joinCode: string): Promise<QuizSession | null> {
  const normalized = joinCode.replace(/\s+/g, '');

  if (supabase) {
    const { data } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('join_code', normalized)
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        quizId: data.quiz_id,
        eventId: data.event_id,
        hostId: data.host_id,
        joinCode: data.join_code,
        status: data.status,
        currentQuestionIndex: data.current_question_index,
        questionStartTime: data.question_start_time,
        questionDeadline: data.question_deadline,
        settingsSnapshot: data.settings_snapshot,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }
  }

  const list = getLocalItem<QuizSession[]>(LOCAL_STORAGE_KEYS.QUIZ_SESSIONS, []);
  return list.find(s => s.joinCode === normalized) || null;
}

export async function joinQuizSession(sessionId: string, userId: string, displayName: string): Promise<void> {
  if (supabase) {
    await supabase.from('quiz_session_members').upsert({
      session_id: sessionId,
      user_id: userId,
      display_name: displayName,
      joined_at: new Date().toISOString()
    }, { onConflict: 'session_id,user_id' });
  }

  const list = getLocalItem<QuizSessionMember[]>(LOCAL_STORAGE_KEYS.SESSION_MEMBERS, []);
  const existing = list.find(m => m.sessionId === sessionId && m.userId === userId);
  if (!existing) {
    list.push({
      id: crypto.randomUUID(),
      sessionId,
      userId,
      displayName,
      joinedAt: new Date().toISOString(),
      totalPoints: 0,
      correctCount: 0,
      totalResponseTimeMs: 0
    });
    setLocalItem(LOCAL_STORAGE_KEYS.SESSION_MEMBERS, list);
  }
}

export async function submitLiveAnswer(
  sessionId: string,
  questionId: string,
  userId: string,
  answer: string | string[],
  timeRemainingSeconds: number
): Promise<{ success: boolean; isCorrect: boolean; pointsAwarded: number }> {
  if (supabase) {
    const { data, error } = await supabase.rpc('submit_quiz_answer', {
      p_session_id: sessionId,
      p_question_id: questionId,
      p_answer: Array.isArray(answer) ? answer : [answer]
    });
    if (!error && data) {
      return { success: true, isCorrect: Boolean(data.is_correct), pointsAwarded: data.awarded_points || 0 };
    }
  }

  // Offline calculation & local storage
  const sessions = getLocalItem<QuizSession[]>(LOCAL_STORAGE_KEYS.QUIZ_SESSIONS, []);
  const session = sessions.find(s => s.id === sessionId);
  const quiz = sampleQuiz;
  const question = quiz.questions?.find(q => q.id === questionId);

  let isCorrect = false;
  let pointsAwarded = 0;

  if (question && question.correctAnswerKeys) {
    if (question.type === 'multiple_select') {
      const selected = Array.isArray(answer) ? answer.sort() : [answer];
      const correct = [...question.correctAnswerKeys].sort();
      isCorrect = JSON.stringify(selected) === JSON.stringify(correct);
    } else {
      const chosen = Array.isArray(answer) ? answer[0] : answer;
      isCorrect = question.correctAnswerKeys.includes(chosen);
    }

    if (isCorrect) {
      pointsAwarded = question.points;
      if (session?.settingsSnapshot?.speedBonus && timeRemainingSeconds > 0) {
        pointsAwarded += Math.round(question.points * 0.5 * (timeRemainingSeconds / question.timeLimitSeconds));
      }
    } else if (session?.settingsSnapshot?.negativeMarking) {
      pointsAwarded = -Math.round(question.points * 0.25);
    }
  }

  // Update member totals
  const members = getLocalItem<QuizSessionMember[]>(LOCAL_STORAGE_KEYS.SESSION_MEMBERS, []);
  const member = members.find(m => m.sessionId === sessionId && m.userId === userId);
  if (member) {
    member.totalPoints += pointsAwarded;
    if (isCorrect) member.correctCount += 1;
    setLocalItem(LOCAL_STORAGE_KEYS.SESSION_MEMBERS, members);
  }

  return { success: true, isCorrect, pointsAwarded };
}

export async function getSessionLeaderboard(
  sessionId: string,
  userId: string,
  mode: string = 'top3_and_me'
): Promise<LeaderboardEntry[]> {
  if (supabase) {
    const { data } = await supabase.rpc('get_session_leaderboard', {
      p_session_id: sessionId,
      p_requesting_user_id: userId
    });
    if (data && data.length > 0) {
      return data.map((d: any) => ({
        userId: d.user_id,
        displayName: d.display_name,
        totalPoints: d.total_points,
        correctCount: d.correct_count,
        rank: d.rank,
        isCurrentUser: d.is_current_user
      }));
    }
  }

  const members = getLocalItem<QuizSessionMember[]>(LOCAL_STORAGE_KEYS.SESSION_MEMBERS, []);
  const sessionMembers = members
    .filter(m => m.sessionId === sessionId)
    .sort((a, b) => b.totalPoints - a.totalPoints || b.correctCount - a.correctCount);

  const ranked: LeaderboardEntry[] = sessionMembers.map((m, index) => ({
    userId: m.userId,
    displayName: m.displayName,
    totalPoints: m.totalPoints,
    correctCount: m.correctCount,
    rank: index + 1,
    isCurrentUser: m.userId === userId
  }));

  if (mode === 'hidden') return [];
  if (mode === 'me_only') return ranked.filter(r => r.isCurrentUser);
  if (mode === 'top3_and_me') return ranked.filter(r => r.rank <= 3 || r.isCurrentUser);
  return ranked;
}

export async function updateSessionState(
  sessionId: string,
  status: QuizSession['status'],
  currentQuestionIndex?: number,
  deadlineSeconds?: number
): Promise<void> {
  const deadline = deadlineSeconds ? new Date(Date.now() + deadlineSeconds * 1000).toISOString() : null;

  if (supabase) {
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    };
    if (currentQuestionIndex !== undefined) {
      updates.current_question_index = currentQuestionIndex;
      updates.question_start_time = new Date().toISOString();
      updates.question_deadline = deadline;
    }
    await supabase.from('quiz_sessions').update(updates).eq('id', sessionId);
  }

  const list = getLocalItem<QuizSession[]>(LOCAL_STORAGE_KEYS.QUIZ_SESSIONS, []);
  const updated = list.map(s => {
    if (s.id === sessionId) {
      return {
        ...s,
        status,
        currentQuestionIndex: currentQuestionIndex !== undefined ? currentQuestionIndex : s.currentQuestionIndex,
        questionStartTime: currentQuestionIndex !== undefined ? new Date().toISOString() : s.questionStartTime,
        questionDeadline: deadline || s.questionDeadline,
        updatedAt: new Date().toISOString()
      };
    }
    return s;
  });
  setLocalItem(LOCAL_STORAGE_KEYS.QUIZ_SESSIONS, updated);
}
