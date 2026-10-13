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
  EventMembership,
  DedicatedSubmission,
  UserSubmissionsRecord
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

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (process.env as any || {});
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

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
  SUBMISSIONS: 'eventflow_user_submissions',
  GUEST_USER_ID: 'eventflow_guest_user_id',
};

export const STEP_UUID_MAP: Record<string, string> = {
  'li-step-01': 'e3000000-0000-0000-0000-000000000001',
  'li-step-02': 'e3000000-0000-0000-0000-000000000002',
  'li-step-03': 'e3000000-0000-0000-0000-000000000003',
  'li-step-04': 'e3000000-0000-0000-0000-000000000004',
  'li-step-05': 'e3000000-0000-0000-0000-000000000005',
  'li-step-06': 'e3000000-0000-0000-0000-000000000006',
  'li-step-07': 'e3000000-0000-0000-0000-000000000007',
  'li-step-08': 'e3000000-0000-0000-0000-000000000008',
  'li-step-09': 'e3000000-0000-0000-0000-000000000009',
  'li-step-10': 'e3000000-0000-0000-0000-000000000010',
  'li-step-11': 'e3000000-0000-0000-0000-000000000011',
};

export function getPersistentGuestId(): string {
  let guestId = getLocalItem<string>(LOCAL_STORAGE_KEYS.GUEST_USER_ID, '');
  if (!guestId) {
    guestId = crypto.randomUUID();
    setLocalItem(LOCAL_STORAGE_KEYS.GUEST_USER_ID, guestId);
  }
  return guestId;
}

function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof localStorage === 'undefined') return defaultValue;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

// Initialize seed data into local storage cache
if (typeof localStorage !== 'undefined') {
  const storedEvents = getLocalItem<EventModel[]>(LOCAL_STORAGE_KEYS.EVENTS, []);
  const hasLinkedin = storedEvents.some(e => e.id === linkedinEvent.id);
  if (!hasLinkedin || storedEvents.length === 0) {
    setLocalItem(LOCAL_STORAGE_KEYS.EVENTS, allSeedEvents);
    setLocalItem(LOCAL_STORAGE_KEYS.SECTIONS, allSeedSections);
    setLocalItem(LOCAL_STORAGE_KEYS.STEPS, allSeedSteps);
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.QUIZZES)) {
      setLocalItem(LOCAL_STORAGE_KEYS.QUIZZES, [sampleQuiz]);
    }
  } else {
  // Sync stored steps if cached with outdated quote marks
  const storedSteps = getLocalItem<EventStep[]>(LOCAL_STORAGE_KEYS.STEPS, []);
  const step01 = storedSteps.find(s => s.id === 'li-step-01');
  if (step01 && (step01.content?.html?.includes('"Welcome') || step01.content?.html?.includes('asset."'))) {
    const freshStep = allSeedSteps.find(s => s.id === 'li-step-01');
    if (freshStep) {
      const updatedSteps = storedSteps.map(s => s.id === 'li-step-01' ? freshStep : s);
      setLocalItem(LOCAL_STORAGE_KEYS.STEPS, updatedSteps);
    }
  }

  const step04 = storedSteps.find(s => s.id === 'li-step-04');
  if (step04 && !step04.content?.aiPrompt) {
    const freshStep04 = allSeedSteps.find(s => s.id === 'li-step-04');
    if (freshStep04) {
      const current = getLocalItem<EventStep[]>(LOCAL_STORAGE_KEYS.STEPS, []);
      const updatedSteps = current.map(s => s.id === 'li-step-04' ? freshStep04 : s);
      setLocalItem(LOCAL_STORAGE_KEYS.STEPS, updatedSteps);
    }
  }
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
  const filtered = sections.filter(s => s.eventId === eventId);
  const seedForEvent = allSeedSections.filter(s => s.eventId === eventId);
  if (filtered.length < seedForEvent.length || !filtered.some(s => s.id === 'sec-li-5')) {
    const missing = seedForEvent.filter(s => !filtered.some(f => f.id === s.id));
    const merged = [...filtered, ...missing].sort((a, b) => a.position - b.position);
    setLocalItem(LOCAL_STORAGE_KEYS.SECTIONS, [...sections.filter(s => s.eventId !== eventId), ...merged]);
    return merged;
  }
  return filtered;
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
  const filtered = steps.filter(s => s.eventId === eventId);
  const seedStepsForEvent = allSeedSteps.filter(s => s.eventId === eventId);
  if (filtered.length < seedStepsForEvent.length || !filtered.some(s => s.id === 'li-step-12')) {
    const missing = seedStepsForEvent.filter(s => !filtered.some(f => f.id === s.id));
    const merged = [...filtered, ...missing].sort((a, b) => a.position - b.position);
    setLocalItem(LOCAL_STORAGE_KEYS.STEPS, [...steps.filter(s => s.eventId !== eventId), ...merged]);
    return merged;
  }
  return filtered;
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
  const effectiveUserId = (!userId || userId === 'guest-user') ? getPersistentGuestId() : userId;
  const dbStepId = STEP_UUID_MAP[stepId] || (stepId.includes('-') && stepId.length === 36 ? stepId : stepId);

  // Only sync to Supabase if there is an explicit URL milestone submission
  // General attendee step reading progress is kept strictly local
  if (supabase && completionData && (completionData.submissionUrl || completionData.submissionKey)) {
    try {
      const upsertObj: Record<string, any> = {
        user_id: effectiveUserId,
        event_id: eventId,
        step_id: dbStepId,
        status,
        completed_at: status === 'completed' ? timestamp : null,
        last_opened_at: timestamp,
        completion_data: completionData
      };
      await supabase.from('participant_step_progress').upsert(upsertObj, { onConflict: 'step_id,user_id' });
    } catch (err) {
      console.warn('Supabase remote submission sync note (stored locally):', err);
    }
  }

  const list = getLocalItem<ParticipantStepProgress[]>(LOCAL_STORAGE_KEYS.STEP_PROGRESS, []);
  const existing = list.find(p => (p.userId === userId || p.userId === effectiveUserId) && (p.stepId === stepId || p.stepId === dbStepId));
  const filtered = list.filter(p => !((p.userId === userId || p.userId === effectiveUserId) && (p.stepId === stepId || p.stepId === dbStepId)));
  filtered.push({
    id: existing?.id || crypto.randomUUID(),
    userId: effectiveUserId,
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
  const effectiveUserId = (!userId || userId === 'guest-user') ? getPersistentGuestId() : userId;
  const dbStepId = STEP_UUID_MAP[stepId] || (stepId.includes('-') && stepId.length === 36 ? stepId : stepId);

  if (supabase) {
    try {
      const { data } = await supabase
        .from('participant_step_progress')
        .select('*')
        .eq('user_id', effectiveUserId)
        .eq('step_id', dbStepId)
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
    } catch (err) {
      console.warn('Supabase get progress error (reading locally):', err);
    }
  }

  const list = getLocalItem<ParticipantStepProgress[]>(LOCAL_STORAGE_KEYS.STEP_PROGRESS, []);
  return list.find(p => (p.userId === userId || p.userId === effectiveUserId) && (p.stepId === stepId || p.stepId === dbStepId)) || null;
}

// -----------------------------------------------------------------------------
// Dedicated Separate Submissions Registry
// Saves Step 2 (vanity URL), Step 10 (post URL), Step 11 (profile URL) separately
// -----------------------------------------------------------------------------

export async function saveDedicatedSubmission(
  userId: string,
  eventId: string,
  key: string,
  url: string,
  stepId: string,
  stepNumber: number,
  label: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  const effectiveUserId = (!userId || userId === 'guest-user') ? getPersistentGuestId() : userId;

  const records = getLocalItem<Record<string, UserSubmissionsRecord>>(LOCAL_STORAGE_KEYS.SUBMISSIONS, {});
  const userKey = `${effectiveUserId}_${eventId}`;
  const existingRecord: UserSubmissionsRecord = records[userKey] || {
    userId: effectiveUserId,
    eventId,
    updatedAt: timestamp
  };

  const item: DedicatedSubmission = {
    key,
    label,
    url,
    stepId,
    stepNumber,
    submittedAt: timestamp
  };

  if (key === 'custom_profile_url') {
    existingRecord.customProfileUrl = item;
  } else if (key === 'published_post_url') {
    existingRecord.publishedPostUrl = item;
  } else if (key === 'final_profile_url') {
    existingRecord.finalProfileUrl = item;
  }

  existingRecord.updatedAt = timestamp;
  records[userKey] = existingRecord;
  setLocalItem(LOCAL_STORAGE_KEYS.SUBMISSIONS, records);

  // Dispatch live update event for participants and organizers
  window.dispatchEvent(new CustomEvent('eventflow_submission_saved', { 
    detail: { record: existingRecord, key, url, userId: effectiveUserId, eventId } 
  }));
}

export function getUserSubmissions(userId: string, eventId: string): UserSubmissionsRecord | null {
  const effectiveUserId = (!userId || userId === 'guest-user') ? getPersistentGuestId() : userId;
  const records = getLocalItem<Record<string, UserSubmissionsRecord>>(LOCAL_STORAGE_KEYS.SUBMISSIONS, {});
  const userKey = `${effectiveUserId}_${eventId}`;
  return records[userKey] || null;
}

export function getAllEventSubmissions(eventId: string): Record<string, UserSubmissionsRecord> {
  const records = getLocalItem<Record<string, UserSubmissionsRecord>>(LOCAL_STORAGE_KEYS.SUBMISSIONS, {});
  const filtered: Record<string, UserSubmissionsRecord> = {};
  for (const [key, val] of Object.entries(records)) {
    if (val.eventId === eventId) {
      filtered[key] = val;
    }
  }
  return filtered;
}

export async function getCompletedStepIds(userId: string, eventId: string): Promise<Set<string>> {
  // General participant step progress is managed strictly locally in client cache
  const list = getLocalItem<ParticipantStepProgress[]>(LOCAL_STORAGE_KEYS.STEP_PROGRESS, []);
  const effectiveUserId = (!userId || userId === 'guest-user') ? getPersistentGuestId() : userId;
  return new Set(
    list
      .filter(p => (p.userId === userId || p.userId === effectiveUserId) && p.eventId === eventId && p.status === 'completed')
      .map(p => p.stepId)
  );
}

export async function saveTaskProgress(userId: string, taskId: string, completed: boolean): Promise<void> {
  // General attendee task checkbox clicks are kept strictly local
  const effectiveUserId = (!userId || userId === 'guest-user') ? getPersistentGuestId() : userId;
  const list = getLocalItem<ParticipantTaskProgress[]>(LOCAL_STORAGE_KEYS.TASK_PROGRESS, []);
  const filtered = list.filter(p => !(p.userId === effectiveUserId && p.taskId === taskId));
  if (completed) {
    filtered.push({ id: crypto.randomUUID(), userId: effectiveUserId, taskId, completedAt: new Date().toISOString() });
  }
  setLocalItem(LOCAL_STORAGE_KEYS.TASK_PROGRESS, filtered);
}

export async function getCompletedTaskIds(userId: string): Promise<Set<string>> {
  // General attendee checklist progress is read strictly locally
  const effectiveUserId = (!userId || userId === 'guest-user') ? getPersistentGuestId() : userId;
  const list = getLocalItem<ParticipantTaskProgress[]>(LOCAL_STORAGE_KEYS.TASK_PROGRESS, []);
  return new Set(list.filter(p => (p.userId === userId || p.userId === effectiveUserId)).map(p => p.taskId));
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
