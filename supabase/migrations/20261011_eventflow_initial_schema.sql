-- =============================================================================
-- EventFlow Database Schema & Migration
-- Version: 1.0.0
-- Compliant with: EventFlow_PRD.md & EventFlow_Detailed_Implementation_Prompt.md
-- =============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Profiles Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Trigger to create profile upon new auth.user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. Platform & Organizer Roles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizer_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'organizer' CHECK (role IN ('platform_admin', 'organizer', 'facilitator')),
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, role)
);

ALTER TABLE public.organizer_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers viewable by authenticated users"
    ON public.organizer_memberships FOR SELECT
    TO authenticated
    USING (true);

-- Helper function to check if current user is an organizer
CREATE OR REPLACE FUNCTION public.is_organizer(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organizer_memberships
        WHERE user_id = user_uuid AND role IN ('platform_admin', 'organizer')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- -----------------------------------------------------------------------------
-- 3. Events Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'live', 'archived')),
    access_code TEXT UNIQUE NOT NULL,
    access_policy TEXT NOT NULL DEFAULT 'code' CHECK (access_policy IN ('open', 'code', 'approval')),
    theme JSONB NOT NULL DEFAULT '{"palette": "dark", "accentColor": "#10b981"}'::jsonb,
    current_step_id UUID,
    published_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_events_access_code ON public.events(access_code);
CREATE INDEX IF NOT EXISTS idx_events_owner ON public.events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published or live events are viewable by all authenticated users"
    ON public.events FOR SELECT
    TO authenticated
    USING (status IN ('published', 'live') OR owner_id = auth.uid() OR public.is_organizer(auth.uid()));

CREATE POLICY "Public visitor can view basic event info by access code"
    ON public.events FOR SELECT
    TO anon
    USING (status IN ('published', 'live'));

CREATE POLICY "Organizers can create events"
    ON public.events FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Event owners can update their events"
    ON public.events FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid() OR public.is_organizer(auth.uid()))
    WITH CHECK (owner_id = auth.uid() OR public.is_organizer(auth.uid()));

-- -----------------------------------------------------------------------------
-- 4. Event Memberships (Participants & Facilitators)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'facilitator', 'co_host')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'blocked')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_memberships_event_user ON public.event_memberships(event_id, user_id);
ALTER TABLE public.event_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own membership or event organizers can view event members"
    ON public.event_memberships FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.events WHERE id = event_memberships.event_id AND owner_id = auth.uid())
        OR public.is_organizer(auth.uid())
    );

CREATE POLICY "Authenticated users can join an event"
    ON public.event_memberships FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership or organizer can update"
    ON public.event_memberships FOR UPDATE
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.events WHERE id = event_memberships.event_id AND owner_id = auth.uid())
    );

-- -----------------------------------------------------------------------------
-- 5. Event Sections & Steps (Guide Content)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position INT NOT NULL DEFAULT 0,
    visibility TEXT NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sections_event ON public.event_sections(event_id);
ALTER TABLE public.event_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sections viewable by event participants and organizers"
    ON public.event_sections FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.events WHERE id = event_sections.event_id AND (status IN ('published', 'live') OR owner_id = auth.uid()))
    );

CREATE POLICY "Organizers can manage sections"
    ON public.event_sections FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.events WHERE id = event_sections.event_id AND owner_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.event_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    section_id UUID REFERENCES public.event_sections(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'instruction' CHECK (type IN ('instruction', 'checklist', 'activity', 'video_embed', 'quiz', 'challenge', 'break', 'resource_collection', 'custom')),
    title TEXT NOT NULL,
    summary TEXT,
    objective TEXT,
    content JSONB NOT NULL DEFAULT '{"html": "", "substeps": [], "warnings": []}'::jsonb,
    duration_minutes INT NOT NULL DEFAULT 10,
    time_range TEXT,
    position INT NOT NULL DEFAULT 0,
    required BOOLEAN NOT NULL DEFAULT true,
    completion_rule TEXT NOT NULL DEFAULT 'manual' CHECK (completion_rule IN ('manual', 'checklist_all', 'quiz_pass')),
    attached_quiz_id UUID,
    published_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_steps_event ON public.event_steps(event_id);
CREATE INDEX IF NOT EXISTS idx_steps_section ON public.event_steps(section_id);
ALTER TABLE public.event_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Steps viewable by event participants and organizers"
    ON public.event_steps FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.events WHERE id = event_steps.event_id AND (status IN ('published', 'live') OR owner_id = auth.uid()))
    );

CREATE POLICY "Organizers can manage steps"
    ON public.event_steps FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.events WHERE id = event_steps.event_id AND owner_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- 6. Step Tasks & Step Resources
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.step_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL REFERENCES public.event_steps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position INT NOT NULL DEFAULT 0,
    required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_step_tasks_step ON public.step_tasks(step_id);
ALTER TABLE public.step_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks viewable by authenticated users"
    ON public.step_tasks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Organizers manage tasks"
    ON public.step_tasks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.event_steps s
            JOIN public.events e ON e.id = s.event_id
            WHERE s.id = step_tasks.step_id AND e.owner_id = auth.uid()
        )
    );

CREATE TABLE IF NOT EXISTS public.step_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL REFERENCES public.event_steps(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'link' CHECK (type IN ('link', 'file', 'code', 'doc')),
    url TEXT NOT NULL,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_step_resources_step ON public.step_resources(step_id);
ALTER TABLE public.step_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resources viewable by authenticated users"
    ON public.step_resources FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Organizers manage resources"
    ON public.step_resources FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.event_steps s
            JOIN public.events e ON e.id = s.event_id
            WHERE s.id = step_resources.step_id AND e.owner_id = auth.uid()
        )
    );

-- -----------------------------------------------------------------------------
-- 7. Participant Progress Tracking
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.participant_step_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES public.event_steps(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
    completed_at TIMESTAMPTZ,
    last_opened_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completion_data JSONB DEFAULT '{}'::jsonb,
    UNIQUE(step_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_step_progress_user ON public.participant_step_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_step_progress_event ON public.participant_step_progress(event_id);
ALTER TABLE public.participant_step_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants see own step progress, organizers see event step progress"
    ON public.participant_step_progress FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.events WHERE id = participant_step_progress.event_id AND owner_id = auth.uid())
    );

CREATE POLICY "Participants insert/update own step progress"
    ON public.participant_step_progress FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.participant_task_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES public.step_tasks(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_task_progress_user ON public.participant_task_progress(user_id);
ALTER TABLE public.participant_task_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants manage own task progress"
    ON public.participant_task_progress FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 8. Quizzes, Questions, and Sessions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    settings JSONB NOT NULL DEFAULT '{
        "timeLimitSeconds": 30,
        "pointsPerQuestion": 100,
        "speedBonus": false,
        "negativeMarking": false,
        "shuffleQuestions": false,
        "shuffleOptions": false,
        "revealAnswerMode": "after_each",
        "leaderboardMode": "top3_and_me"
    }'::jsonb,
    theme JSONB NOT NULL DEFAULT '{"name": "dark", "accent": "#10b981"}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quizzes viewable by owner or event participants"
    ON public.quizzes FOR SELECT
    TO authenticated
    USING (
        owner_id = auth.uid()
        OR status = 'published'
    );

CREATE POLICY "Organizers manage quizzes"
    ON public.quizzes FOR ALL
    TO authenticated
    USING (owner_id = auth.uid() OR public.is_organizer(auth.uid()))
    WITH CHECK (owner_id = auth.uid() OR public.is_organizer(auth.uid()));

CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'single_choice' CHECK (type IN ('single_choice', 'multiple_select', 'true_false')),
    prompt TEXT NOT NULL,
    media_url TEXT,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
    explanation TEXT,
    points INT NOT NULL DEFAULT 100,
    time_limit_seconds INT NOT NULL DEFAULT 30,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Questions can be viewed by participants, but secure RPC will hide correct_answer_keys until allowed!
CREATE POLICY "Questions viewable by owner or quiz players"
    ON public.quiz_questions FOR SELECT
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_questions.quiz_id AND (owner_id = auth.uid() OR status = 'published'))
    );

CREATE POLICY "Organizers manage questions"
    ON public.quiz_questions FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_questions.quiz_id AND owner_id = auth.uid()));

-- Live Quiz Sessions
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    join_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('draft', 'ready', 'lobby', 'live_question', 'reveal', 'next_question', 'final_results', 'ended', 'paused')),
    current_question_index INT NOT NULL DEFAULT 0,
    question_start_time TIMESTAMPTZ,
    question_deadline TIMESTAMPTZ,
    settings_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_code ON public.quiz_sessions(join_code);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON public.quiz_sessions(status);
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions viewable by authenticated users"
    ON public.quiz_sessions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Hosts manage sessions"
    ON public.quiz_sessions FOR ALL
    TO authenticated
    USING (host_id = auth.uid() OR public.is_organizer(auth.uid()))
    WITH CHECK (host_id = auth.uid() OR public.is_organizer(auth.uid()));

-- Quiz Session Members
CREATE TABLE IF NOT EXISTS public.quiz_session_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    total_points INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    total_response_time_ms BIGINT NOT NULL DEFAULT 0,
    UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_session_members_session ON public.quiz_session_members(session_id);
ALTER TABLE public.quiz_session_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session members viewable by authenticated users"
    ON public.quiz_session_members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can join sessions"
    ON public.quiz_session_members FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users or hosts update session members"
    ON public.quiz_session_members FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.quiz_sessions WHERE id = quiz_session_members.session_id AND host_id = auth.uid()));

-- Quiz Responses
CREATE TABLE IF NOT EXISTS public.quiz_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    answer JSONB NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    awarded_points INT NOT NULL DEFAULT 0,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    response_time_ms INT NOT NULL DEFAULT 0,
    UNIQUE(session_id, question_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_responses_session ON public.quiz_responses(session_id);
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own responses or hosts view session responses"
    ON public.quiz_responses FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.quiz_sessions WHERE id = quiz_responses.session_id AND host_id = auth.uid())
    );

CREATE POLICY "Users can insert own responses"
    ON public.quiz_responses FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Quiz Results
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.quiz_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    rank INT NOT NULL DEFAULT 1,
    finished_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_session ON public.quiz_results(session_id);
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Results viewable by session members"
    ON public.quiz_results FOR SELECT
    TO authenticated
    USING (true);

-- -----------------------------------------------------------------------------
-- 9. Announcements & Audit Logs
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    audience TEXT NOT NULL DEFAULT 'all',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.event_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements viewable by authenticated users"
    ON public.event_announcements FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Organizers manage announcements"
    ON public.event_announcements FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.events WHERE id = event_announcements.event_id AND owner_id = auth.uid()));

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs viewable only by authorized organizers"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_organizer(auth.uid()) OR EXISTS (SELECT 1 FROM public.events WHERE id = audit_logs.event_id AND owner_id = auth.uid()));

CREATE POLICY "Authenticated users can insert audit logs"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = actor_id);

-- -----------------------------------------------------------------------------
-- 10. Server-Side Stored Procedures / RPCs for Integrity
-- -----------------------------------------------------------------------------

-- Server-Authoritative Quiz Answer Submission
CREATE OR REPLACE FUNCTION public.submit_quiz_answer(
    p_session_id UUID,
    p_question_id UUID,
    p_answer JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_session RECORD;
    v_question RECORD;
    v_existing_response RECORD;
    v_is_correct BOOLEAN := false;
    v_points INT := 0;
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_response_time_ms INT;
    v_speed_bonus BOOLEAN := false;
    v_max_time_ms INT;
BEGIN
    -- 1. Validate Session State
    SELECT * INTO v_session FROM public.quiz_sessions WHERE id = p_session_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Session not found';
    END IF;

    IF v_session.status != 'live_question' THEN
        RAISE EXCEPTION 'Question is not currently accepting answers';
    END IF;

    -- 2. Validate Deadline (server-authoritative)
    IF v_session.question_deadline IS NOT NULL AND v_now > v_session.question_deadline THEN
        RAISE EXCEPTION 'Submission deadline has passed';
    END IF;

    -- 3. Check for existing response
    SELECT * INTO v_existing_response
    FROM public.quiz_responses
    WHERE session_id = p_session_id AND question_id = p_question_id AND user_id = auth.uid();

    IF FOUND THEN
        RAISE EXCEPTION 'Answer already submitted for this question';
    END IF;

    -- 4. Fetch Question Details & Answer Key
    SELECT * INTO v_question FROM public.quiz_questions WHERE id = p_question_id AND quiz_id = v_session.quiz_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Question not found';
    END IF;

    -- Compute response time
    IF v_session.question_start_time IS NOT NULL THEN
        v_response_time_ms := EXTRACT(MILLISECONDS FROM (v_now - v_session.question_start_time))::INT;
    ELSE
        v_response_time_ms := 0;
    END IF;
    IF v_response_time_ms < 0 THEN v_response_time_ms := 0; END IF;

    -- 5. Calculate Correctness on Backend (Anti-Cheat)
    -- Normalize and compare
    IF v_question.type = 'single_choice' OR v_question.type = 'true_false' THEN
        v_is_correct := (p_answer::text = (v_question.correct_answer_keys->0)::text);
    ELSIF v_question.type = 'multiple_select' THEN
        -- Check set equality
        v_is_correct := (p_answer::jsonb = v_question.correct_answer_keys::jsonb);
    END IF;

    -- 6. Calculate Points
    IF v_is_correct THEN
        v_points := v_question.points;
        -- Speed bonus calculation if enabled
        v_speed_bonus := COALESCE((v_session.settings_snapshot->>'speedBonus')::boolean, false);
        IF v_speed_bonus AND v_question.time_limit_seconds > 0 THEN
            v_max_time_ms := v_question.time_limit_seconds * 1000;
            IF v_response_time_ms < v_max_time_ms THEN
                -- Add up to 50% extra points proportional to speed
                v_points := v_points + ROUND((v_question.points * 0.5) * (1 - (v_response_time_ms::numeric / v_max_time_ms::numeric)))::INT;
            END IF;
        END IF;
    ELSE
        IF COALESCE((v_session.settings_snapshot->>'negativeMarking')::boolean, false) THEN
            v_points := -ROUND(v_question.points * 0.25)::INT;
        ELSE
            v_points := 0;
        END IF;
    END IF;

    -- 7. Insert Response Record
    INSERT INTO public.quiz_responses (
        session_id, question_id, user_id, answer, submitted_at, awarded_points, is_correct, response_time_ms
    ) VALUES (
        p_session_id, p_question_id, auth.uid(), p_answer, v_now, v_points, v_is_correct, v_response_time_ms
    );

    -- 8. Atomically update session member totals
    UPDATE public.quiz_session_members
    SET total_points = total_points + v_points,
        correct_count = correct_count + (CASE WHEN v_is_correct THEN 1 ELSE 0 END),
        total_response_time_ms = total_response_time_ms + v_response_time_ms
    WHERE session_id = p_session_id AND user_id = auth.uid();

    -- Return safe feedback (do not leak correct answer keys before reveal)
    RETURN jsonb_build_object(
        'success', true,
        'submitted_at', v_now,
        'response_time_ms', v_response_time_ms
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Server-Authoritative Leaderboard / Results Calculation
CREATE OR REPLACE FUNCTION public.calculate_session_results(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.quiz_results WHERE session_id = p_session_id;

    INSERT INTO public.quiz_results (session_id, user_id, total_points, correct_count, rank, finished_at)
    SELECT
        p_session_id,
        user_id,
        total_points,
        correct_count,
        DENSE_RANK() OVER (ORDER BY total_points DESC, correct_count DESC, total_response_time_ms ASC),
        timezone('utc'::text, now())
    FROM public.quiz_session_members
    WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe Leaderboard Retrieval (Enforces Modes without leaking hidden entries)
CREATE OR REPLACE FUNCTION public.get_session_leaderboard(
    p_session_id UUID,
    p_requesting_user_id UUID
)
RETURNS TABLE (
    user_id UUID,
    display_name TEXT,
    total_points INT,
    correct_count INT,
    rank INT,
    is_current_user BOOLEAN
) AS $$
DECLARE
    v_session RECORD;
    v_mode TEXT;
BEGIN
    SELECT * INTO v_session FROM public.quiz_sessions WHERE id = p_session_id;
    IF NOT FOUND THEN RETURN; END IF;

    v_mode := COALESCE(v_session.settings_snapshot->>'leaderboardMode', 'top3_and_me');

    -- Ensure results are calculated
    PERFORM public.calculate_session_results(p_session_id);

    IF v_mode = 'hidden' THEN
        -- Return empty for participants unless host
        IF v_session.host_id = p_requesting_user_id THEN
            RETURN QUERY
            SELECT r.user_id, m.display_name, r.total_points, r.correct_count, r.rank, (r.user_id = p_requesting_user_id)
            FROM public.quiz_results r
            JOIN public.quiz_session_members m ON m.session_id = r.session_id AND m.user_id = r.user_id
            WHERE r.session_id = p_session_id
            ORDER BY r.rank ASC;
        ELSE
            RETURN;
        END IF;
    ELSIF v_mode = 'me_only' THEN
        RETURN QUERY
        SELECT r.user_id, m.display_name, r.total_points, r.correct_count, r.rank, true
        FROM public.quiz_results r
        JOIN public.quiz_session_members m ON m.session_id = r.session_id AND m.user_id = r.user_id
        WHERE r.session_id = p_session_id AND r.user_id = p_requesting_user_id;
    ELSIF v_mode = 'top3_and_me' THEN
        RETURN QUERY
        SELECT r.user_id, m.display_name, r.total_points, r.correct_count, r.rank, (r.user_id = p_requesting_user_id)
        FROM public.quiz_results r
        JOIN public.quiz_session_members m ON m.session_id = r.session_id AND m.user_id = r.user_id
        WHERE r.session_id = p_session_id AND (r.rank <= 3 OR r.user_id = p_requesting_user_id)
        ORDER BY r.rank ASC;
    ELSE -- 'full' or default
        RETURN QUERY
        SELECT r.user_id, m.display_name, r.total_points, r.correct_count, r.rank, (r.user_id = p_requesting_user_id)
        FROM public.quiz_results r
        JOIN public.quiz_session_members m ON m.session_id = r.session_id AND m.user_id = r.user_id
        WHERE r.session_id = p_session_id
        ORDER BY r.rank ASC;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
