# EventFlow — Master Implementation Prompt
## Build the product described in `EventFlow_PRD.md`

You are the senior full-stack engineer and product-minded implementation agent responsible for evolving the existing **Workshop Agenda Web** repository into **EventFlow**, a complete multi-event guidance and interactive engagement platform.

Your task is to **inspect the existing repository, plan the implementation, and make real code/database changes**. Do not stop at architecture suggestions, mockups, or a list of recommendations. Treat the repository and its existing behavior as the source of truth for what already exists, and treat `EventFlow_PRD.md` as the product requirements baseline.

> **Critical testing constraint:** Do not perform browser testing or browser automation. The user will test the application manually in a browser. Do not add or run Playwright, Cypress, Selenium, browser-agent, or other browser-driven test workflows. Do not claim that the UI has been browser-tested. You may run appropriate non-browser checks already supported by the repository, such as type-checking, linting, unit tests that do not launch a browser, migration validation, and production builds. Clearly distinguish those checks from manual browser testing, which remains the user's responsibility.

---

# 1. Product Objective

Build **EventFlow**, a reusable platform for workshops, hackathons, orientations, training sessions, and other events.

Organizers must be able to create and publish an event, build its guide without editing source code, share an event URL/code, manage participants, run embedded or standalone quizzes, control live sessions, and review participation analytics.

Participants must be able to enter an event, authenticate with Google through Supabase Auth, confirm their display name, follow the guide, complete tasks, join quizzes, and resume their progress across sessions and devices.

The existing 13-step Make.com + Telegram workshop must become the first database-backed sample event. Preserve its useful existing experience, including agenda navigation, search, progress presentation, and fullscreen/presentation behavior. Do not leave the platform dependent on the original hard-coded `src/data.ts` content.

## Definition of success

The result must be a working, coherent product—not a collection of disconnected screens. Every implemented control must perform its intended action. Data displayed in dashboards must come from the actual backend. Participant progress, quiz submissions, session state, and event content must persist appropriately. Authorization must be enforced on the backend/database, not merely by hiding frontend controls.

---

# 2. Mandatory Working Rules

## 2.1 Audit before changing code

Before editing:

1. Inspect the repository structure, package scripts, dependencies, current routes, app entry points, components, styles, data models, existing agenda behavior, and current responsive behavior.
2. Read `EventFlow_PRD.md` in full if it is available in the repository/workspace.
3. Inspect existing Supabase configuration, migrations, auth integration, database types, environment-variable handling, and any existing RLS policies.
4. Identify the existing 13-step workshop content and map it to the proposed event/section/step model.
5. Identify reusable components and existing design decisions before introducing replacements.
6. Produce a concise implementation plan with phases, dependencies, and risks. Then proceed with implementation; do not stop after presenting the plan.

Do not assume files or libraries exist. Verify the actual repository before using them.

## 2.2 Preserve the existing stack

Use the existing stack unless the repository inspection proves a necessary change:

- React 19
- TypeScript
- Vite 6
- Tailwind CSS v4
- Motion
- Lucide React
- Supabase Auth, PostgreSQL, RLS, Realtime, and Storage

Do not migrate to Next.js or replace Vite. Do not replace Supabase with another backend. Avoid adding dependencies when the current stack can solve the problem. If a new dependency is genuinely necessary, explain why and keep it narrowly scoped.

## 2.3 Implement real functionality

- Do not use hard-coded fake participant records, fake dashboard counts, fake quiz scores, or mock API responses as the final implementation.
- Seed data is acceptable for a clearly identified demo/sample event, but production screens must query real data.
- Do not create nonfunctional buttons, fake toggles, decorative forms that never submit, or navigation links that lead nowhere.
- Do not silently swallow errors. Show concise, safe user-facing feedback and log useful diagnostic context on trusted server-side paths.
- Include loading, empty, error, success, disabled, and permission-denied states where relevant.
- Use typed data models and validate untrusted input.
- Follow the existing project conventions where they are sound.

## 2.4 Work incrementally

Implement in coherent vertical slices. After each slice, run the relevant non-browser checks and fix issues before continuing. Do not attempt to write the entire product as one giant unreviewed code dump. Avoid replacing large files wholesale when a targeted change is safer.

## 2.5 Protect data and secrets

- Never expose Supabase service-role keys or other server secrets in client-side code or `VITE_*` variables.
- Do not reset, truncate, or recreate a production database to simplify development.
- Use additive, versioned migrations for schema changes.
- Do not weaken existing RLS policies to make the UI work.
- Do not grant every authenticated user organizer access.
- Do not trust client-supplied user IDs, roles, correctness flags, awarded points, ranks, timer values, or completion claims.
- Never return private answer keys to participant clients before the configured reveal state.
- Do not store unnecessary personal information.
- Avoid logging OAuth tokens, access tokens, answer keys, or sensitive participant information.

---

# 3. Product Roles and Authorization

Implement clear, enforceable roles:

1. **Platform administrator** — platform-level settings and role administration, with access limited to explicitly authorized platform operations.
2. **Event owner/organizer** — manages events they own or are explicitly assigned to manage.
3. **Facilitator** — operates assigned event/quiz controls and sees only the participant data permitted for that assignment.
4. **Participant** — joins authorized events, manages their permitted display name, completes guide tasks, submits quiz answers, and views only permitted results.
5. **Public visitor** — can see public landing/access information and enter an event code, but cannot access private guide content or submit tracked activity before authentication.

Requirements:

- Derive the authenticated identity from the Supabase session and trusted database records.
- Keep `auth.users.id` as the stable identity. An email or display name must never be used as the primary identity.
- Keep editable `display_name` separate from OAuth identity metadata.
- Enforce permissions in RLS and trusted server/API operations.
- Ensure organizers cannot view or modify unrelated events.
- Ensure participants cannot query other participants' private progress, responses, email addresses, or hidden leaderboard data.
- Validate every organizer command against the actor's current role and event/session assignment.
- Record high-impact actions in an audit log where appropriate.
- If the repository already has a role system, inspect and extend it safely instead of introducing conflicting role sources.

---

# 4. Participant Experience

Implement the following end-to-end journey.

## 4.1 Landing and event access

- Provide a clean EventFlow landing/access experience.
- Allow users to open a direct event URL or enter an event code.
- Normalize codes consistently and make them collision-resistant.
- Show only information that the visitor is authorized to see before joining.
- Handle invalid, expired, revoked, unpublished, full, or restricted event codes with clear messages.
- Rate-limit repeated code attempts where supported.
- Support access policies that the PRD requires, such as authentication, approval, or allowlist restrictions, without building payment/ticketing features.

## 4.2 Google authentication

- Integrate Google OAuth through Supabase Auth.
- Handle loading, cancellation, callback failures, expired sessions, and sign-out.
- Configure callback URLs through environment/project configuration rather than hard-coded production URLs.
- Never treat successful Google login as proof of physical attendance.
- After sign-in, recover the intended event destination and validate access again server-side.

## 4.3 Profile confirmation and event membership

- Prefill the participant's display name from available Google/Supabase metadata.
- Ask for confirmation or editing before first tracked participation.
- Validate the display name and persist it to the profile and/or event membership snapshot according to the data model.
- Create at most one membership per user per event.
- Make repeat joins idempotent and resume the existing membership/progress.
- Do not overwrite a participant's chosen display name every time OAuth metadata refreshes.
- Track join time, last activity, and membership status with server/database timestamps.

## 4.4 Participant event home

Show real, event-specific information:

- Event title, description, schedule, and timezone.
- Overall progress and completion state.
- Continue/resume action pointing to the last opened or next unfinished step.
- Guide sections and timeline.
- Required versus optional steps.
- Upcoming/current live step and organizer announcements when available.
- Event resources and permitted quiz sessions.
- Useful empty, not-yet-started, completed, and event-closed states.

## 4.5 Guide reader

Support these step types:

- Instruction
- Checklist
- Activity
- Video/embed
- Quiz
- Challenge
- Break
- Resource collection
- Structured custom-content step

Each step can have:

- Title and summary
- Objective
- Detailed instructions and ordered substeps
- Resources, links, uploaded files, and media
- Warnings or notes
- Estimated duration
- Required/optional status
- Visibility/scheduling settings
- Completion rules

Requirements:

- Preserve the existing guide navigation, search, progress display, and fullscreen/presentation behavior where present.
- Provide previous/next navigation and a useful section/step navigator.
- Keep participant reading width comfortable and controls usable on mobile.
- Validate and sanitize external links. Do not execute arbitrary HTML/JavaScript stored in event content.
- Show completion status consistently.
- Autosave progress with clear saving/saved/error feedback where appropriate.
- Prevent rapid repeated actions from creating duplicate records.
- Restore the last opened step on a subsequent visit/device.
- Keep published guide content stable for active participants; draft edits should not unexpectedly mutate an active published version.

## 4.6 Checklist and task progress

- Persist each checklist item/task completion separately.
- Enforce unique progress records for a participant/task.
- Calculate step completion from configured completion rules.
- Calculate event progress from the authoritative set of applicable steps and completion rules.
- Define how optional steps affect progress and apply the rule consistently.
- Never rely exclusively on browser local storage or a client-side counter.
- Handle retries, offline/connection interruptions, and duplicate requests safely. If optimistic UI is used, reconcile it with server state.

## 4.7 Event completion

When the participant satisfies the configured completion rules, show a completion view with:

- Completion summary
- Relevant event resources
- Permitted quiz results
- Feedback link/form if enabled
- Optional certificate if certificates are configured

Certificates are optional; do not invent a certificate service or imply one exists if it has not been implemented.

---

# 5. Organizer Dashboard and Event Builder

Build a real organizer area with authorization-protected routes and backend queries.

## 5.1 Dashboard overview

Show data-backed overview cards for events owned/assigned to the current organizer:

- Draft, published, live, and archived events
- Participant counts
- Completion counts and average progress
- Recent activity
- Quick actions to create/edit/manage an event

Every number must be computed from actual backend data. Include loading, empty, and error states.

## 5.2 Event lifecycle

Support:

- Create
- Edit
- Duplicate
- Preview
- Publish
- Unpublish
- Archive

Event fields should include title, description, slug/access URL as appropriate, date/time, timezone, theme/branding, access code and access policy, status, and owner.

Rules:

- Validate required fields before publishing.
- Draft edits must not silently alter the currently published version.
- Use a safe publication/versioning approach suitable for the existing repository.
- Use collision-resistant event codes and allow authorized rotation/revocation.
- Confirm destructive actions.
- Prevent unauthorized users from publishing, archiving, or editing events.

## 5.3 Guide builder

Create a practical content editor that allows organizers to:

- Add, edit, duplicate, reorder, and delete sections and steps.
- Reorder using accessible controls; drag-and-drop may be used only if a suitable existing library/pattern is present or a justified dependency is added. Always provide a non-drag alternative.
- Configure step type, title, summary, objective, duration, required status, content, instructions, resources, media, completion rules, and visibility.
- Add checklist tasks and reorder them.
- Attach an existing quiz or create a quiz for a quiz step.
- Preview participant and presentation views.
- Save drafts and publish changes deliberately.

Use structured fields for filtering, ordering, and access control. Use JSONB only for genuinely flexible step-type content/configuration, not as a substitute for relational relationships.

## 5.4 Resource management

- Support external links and uploaded resources.
- Use Supabase Storage for files where appropriate.
- Keep private files in private buckets and issue access through authorized policies/signed URLs as appropriate.
- Validate allowed file types and reasonable file sizes.
- Validate URL protocols and reject dangerous schemes.
- Store resource labels, descriptions, order, and access policy.
- Handle deleted/missing files gracefully.

## 5.5 Participant management

Provide a participant table with:

- Display name
- Email only where the organizer is authorized to see it
- Join time
- Last activity
- Membership/status
- Overall progress
- Completed and outstanding steps
- Quiz participation/results where authorized

Include:

- Search
- Sorting
- Filters for status/progress
- Participant detail view
- CSV export of permitted data

CSV exports must use real data, respect the current event/organizer authorization, avoid exposing unnecessary fields, and safely escape CSV values. Never export secrets, hidden answer keys, or unauthorized participant data.

## 5.6 Live event controls

Authorized organizers/facilitators should be able to:

- Set the current guide step
- Start/announce a step
- Publish an event announcement
- Pause or close an event experience when supported
- See meaningful live participation indicators

Persist the new authoritative state before broadcasting it through Supabase Realtime. On reconnect, clients must refetch the latest state from the backend.

---

# 6. Quiz Builder and Quiz Library

Quizzes are a core feature, not an optional visual mockup. Support quizzes embedded in guides and standalone quizzes launched independently from the organizer dashboard.

## 6.1 Quiz management

Support:

- Create, edit, duplicate, preview, publish, and archive quizzes
- Quiz title, description, instructions, optional event association, visibility, status, host, settings, and theme
- Question creation, editing, duplication, deletion, and ordering
- Draft/publish validation
- Attachment to an event guide step
- Standalone launch from the quiz library/control room

## 6.2 MVP question types

Implement:

1. Single-choice multiple-choice
2. Multiple-select
3. True/false

Support optional image/media fields on questions. Keep the data model extensible for future types, but do not add unrelated question types unless the existing product already supports them.

Question configuration:

- Prompt
- Question type
- Answer options
- Correct answer key(s)
- Explanation
- Optional image/media
- Points
- Time limit
- Position/order
- Optional tags
- Randomization configuration where enabled

Validate that each published question has a valid prompt, sufficient options, and a valid answer key. Do not leak correct answers or explanations before their configured reveal.

## 6.3 Configurable quiz settings

Organizers must be able to configure:

- Per-question time limit and/or overall quiz duration where supported
- Points for correctness
- Optional speed bonus
- Optional negative marking
- Question randomization
- Answer-option randomization
- Reveal correct answers/explanations after each question, at the end, or never
- Joining open/closed state
- Quiz mode: live, scheduled, or self-paced as supported by the implemented session model
- Leaderboard visibility mode
- Theme, animation, sound, and presentation settings

Validate incompatible settings and show clear explanations. Define point rounding and tie-break behavior explicitly. Do not let frontend calculations be authoritative.

---

# 7. Live Quiz Session Engine

The live quiz system must be based on a trusted server/database state machine, not a client-only timer.

## 7.1 Session lifecycle

Support a deliberate lifecycle equivalent to:

`Draft → Ready → Lobby → Live Question → Reveal (optional) → Next Question → Final Results → Ended`

Also handle pause, resume, and cancellation states explicitly.

## 7.2 Host controls

An authorized host can:

- Create/start a session
- Open and close joining
- Display/copy a session PIN or link
- View connected/joined and answered counts
- Start the quiz
- Pause and resume
- Advance to the next question
- Extend a deadline where allowed
- Reveal answers when allowed/authorized
- End the session
- Display the configured leaderboard/results view

Every action must be validated against current session state and actor authorization. Repeated or stale commands should not corrupt the session.

## 7.3 Participant joining and answering

- Validate the session PIN/link and joining status on the server.
- Require authenticated identity when the PRD says it is required.
- Permit at most one accepted answer per participant per question by default.
- Reject answers for unopened, ended, paused, wrong, or expired question states according to the configured policy.
- Store the authoritative submission timestamp.
- Show submitted/waiting/closed feedback without exposing answer keys prematurely.
- Prevent duplicate or replayed submissions from awarding duplicate points.

## 7.4 Server-authoritative timing and scoring

- Server/database timestamps define deadlines.
- Client timers are display-only.
- Answer acceptance must check the session state, question, membership, and deadline on a trusted path.
- Calculate correctness and points on the trusted backend. Never accept a client-provided score or correctness flag.
- Apply speed bonus and negative marking only when enabled, with documented deterministic formulas and safe lower/upper bounds.
- Calculate response time from trusted timestamps.
- Use a deterministic tie-break order, such as total points, correct-answer count, then total response time.
- Define behavior for unanswered questions, late submissions, ties, pause/resume, and deadline extensions.
- Snapshot quiz/session settings when a session starts so later quiz edits do not change a live session.

## 7.5 Leaderboard modes

Implement all PRD modes:

1. **Full leaderboard after every question** — show the full permitted ranking after each question.
2. **Top 3 + my rank** — show the top three plus the current participant's own rank and score even if outside the top three.
3. **My rank only** — show the participant's own permitted score/rank.
4. **Final only** — hide rankings during play and show them only at the configured final state.
5. **Hidden** — participants see no leaderboard; authorized organizers can still see operational results.

Ensure each mode is enforced in data returned to the participant, not merely by hiding rows in the UI.

## 7.6 Answer reveal

- Honor the configured reveal policy.
- Do not send answer keys/explanations to participant clients before reveal.
- Support authorized host override only through a validated backend command and record the override in the audit trail.
- Keep the displayed explanation and correct-answer feedback consistent with the authoritative session state.

## 7.7 Realtime and reconnects

- Use Supabase Realtime for appropriate session state and participant updates.
- Persist session transitions and answers before broadcasting.
- Treat Realtime messages as notifications, not the source of truth.
- On reconnect, refetch the authoritative session state, current question, remaining deadline, own answer state, and permitted results.
- Handle duplicate, out-of-order, and missed events safely.
- Avoid unnecessary high-frequency database writes for countdown display.

---

# 8. Quiz Presentation and Design Customization

Create a polished but restrained default experience. Do not use generic AI-looking gradients, glows, ambient lighting, glassmorphism by default, or decorative textures.

Default visual direction:

- Solid near-black background: `#0A0A0A`
- White primary text
- Muted gray secondary text
- Clear typography hierarchy
- Restrained borders and surfaces
- Consistent spacing and alignment
- Purposeful, short transitions
- Strong contrast and readable question/answer cards

The event/quiz owner may customize the quiz experience with presets and options for:

- Theme colors and background
- Typography
- Event/quiz logo
- Answer-card appearance
- Timer appearance
- Transition style
- Animation intensity
- Sound on/off
- Presentation/projector mode
- Optional celebratory final podium/confetti

Requirements:

- Include a small set of coherent theme presets and allow custom settings.
- Keep participant UI focused on the question and answer choices.
- Make timer, answer state, and navigation clear without relying on color alone.
- Respect reduced-motion preferences.
- Make sound optional and off when appropriate.
- Ensure full-screen/presentation mode works with the browser's supported fullscreen behavior; provide a graceful fallback if unavailable.
- Keep the default design minimal, accessible, and responsive.

---

# 9. Analytics, Results, and CSV Export

Build analytics from persisted data rather than invented sample values.

Required views/metrics:

- Participants joined
- Participants who started/completed
- Average guide progress
- Step completion rates and drop-off
- Activity/checklist completion
- Quiz participation and response rates
- Per-question accuracy and answer distribution
- Score distribution and final results
- Last activity and membership status where authorized

Rules:

- Define calculations consistently and handle empty datasets.
- Do not treat missing data as zero unless that is semantically correct.
- Scope every query to events the current user is authorized to manage.
- Avoid exposing private individual data in aggregate views unnecessarily.
- Export participant/progress and quiz results to CSV with proper permissions and safe escaping.
- Show clear empty states when an event has no participants or no quiz responses.

---

# 10. Supabase Data Model and Migrations

Inspect the actual schema first. Reuse compatible existing tables where appropriate, and make versioned migrations for required additions. The following is the target conceptual model from the PRD; adapt naming to the repository only when there is a clear reason, and document material deviations.

- `profiles`: user identity reference, display name, avatar URL, timestamps.
- `organizer_memberships`: user, role, granted by, creation timestamp.
- `events`: owner, title, slug, description, start/end, timezone, status, access policy/code, theme, published version.
- `event_memberships`: event, user, display-name snapshot, role, join/last-active timestamps, status; unique event/user.
- `event_sections`: event, title, description, position, visibility.
- `event_steps`: event/section references, type, title, content, duration, position, required flag, completion rule, published version.
- `step_tasks`: step, title, description, position, required flag.
- `step_resources`: step, label, type, URL/storage path, access policy, position.
- `participant_step_progress`: event, step, user, status, completion/open timestamps, completion data; unique user/step.
- `participant_task_progress`: user, task, completion timestamp; unique user/task.
- `quizzes`: owner, optional event, title, description, settings, theme, status.
- `quiz_questions`: quiz, type, prompt, media, options, answer key, explanation, points, time limit, position.
- `quiz_sessions`: quiz, optional event, host, join code, status, current question, start/deadline timestamps, settings snapshot.
- `quiz_session_members`: session, user, display-name snapshot, joined timestamp, participation state; unique session/user.
- `quiz_responses`: session, question, user, answer, submission timestamp, awarded points, correctness, response time; enforce the intended uniqueness/idempotency rules.
- `quiz_results`: session, user, total points, correct count, rank, completion timestamp.
- `event_announcements`: event, author, title/body, timestamp, audience.
- `audit_logs`: actor, event, action, target type/id, metadata, timestamp.

Database requirements:

1. Use foreign keys, constraints, uniqueness, defaults, and indexes appropriately.
2. Add indexes for frequent event/user/status/session/question/dashboard query patterns.
3. Use transactions or atomic database/server operations for race-sensitive state transitions, scoring, and duplicate prevention.
4. Keep flexible JSONB settings typed and validated; do not place all relational data in JSON.
5. Define deletion behavior and retention implications for event content, memberships, progress, quizzes, responses, and audit records.
6. Generate/update TypeScript database types if the repository has a type-generation workflow.
7. Make migrations repeatable in the intended Supabase migration workflow and provide exact commands or dashboard steps needed to apply them.
8. Do not claim a migration has been applied to the hosted database unless it actually has been applied.

---

# 11. RLS, Security, and Privacy Requirements

Create and review RLS policies for every table that contains event, membership, progress, quiz, response, result, or participant information.

At minimum:

- Participants can read public/published event information according to access rules.
- Participants can read and update only their own profile fields that are intended to be editable.
- Participants can read/update only their own progress and task completion.
- Participants can read only their own private quiz response/result data and leaderboard data explicitly allowed by the selected mode.
- Participants cannot directly insert or update authoritative correctness, points, rank, deadlines, host controls, or protected status fields.
- Organizers can manage only events they own or are assigned to manage.
- Facilitators can control only explicitly assigned events/sessions and only within their permission set.
- Platform admin capabilities must be explicit and not granted to all authenticated users.
- Quiz answer keys must be protected from participant access before reveal.
- Private storage files must be protected with storage policies.
- Every privileged operation must validate the caller and target event/session on a trusted path.
- Avoid circular or recursively unsafe RLS policy patterns.
- Avoid policies that accidentally grant public access to private participant data.
- Test critical policies with existing non-browser automated tests or database-level checks where the project supports them; do not use browser testing.

Add rate limiting or abuse controls for event-code guessing, joining, and answer submission where the current architecture supports it. Include safe error messages that do not reveal whether private users or hidden resources exist.

---

# 12. Realtime and Reliability

Use Realtime only where it adds real value: live guide state, announcements, session lifecycle, response counts, and permitted result updates.

- Persist authoritative state before emitting/broadcasting an update.
- Do not rely on the order or delivery of every Realtime event.
- On mount/reconnect, fetch the current state from the database.
- Make state transitions idempotent where practical.
- Handle expired sessions, duplicate actions, disconnects, stale clients, and deleted/unpublished content.
- Provide clear connection/reconnection states.
- Avoid polling or writing to the database more often than necessary.
- Use database/server timestamps for event times, joins, submissions, and deadlines.
- Respect the event's configured timezone for display while storing timestamps consistently.

---

# 13. Design System and UI Quality

Apply the design system consistently across participant, organizer, and quiz views.

## Visual rules

- Default dark background `#0A0A0A`, white primary text, muted gray secondary text.
- Use solid surfaces, restrained borders, clear hierarchy, and deliberate whitespace.
- No gratuitous gradients, glows, ambient lighting, decorative noise/textures, or generic AI-generated dashboard aesthetics.
- Keep tables information-dense but readable.
- Keep participant guide content comfortable to read.
- Make important actions visually distinct without overusing accent colors.
- Use consistent typography, spacing, radii, focus rings, and button/input states.
- Provide a coherent neutral light theme if supported by the existing app; dark mode remains the primary design direction.
- Theme overrides for an event or quiz must not break accessibility or layout.

## Interaction and accessibility

- All controls must have clear labels and meaningful outcomes.
- Use semantic HTML and correct form labels.
- Provide keyboard operation and visible focus.
- Respect reduced motion.
- Use adequate contrast and non-color-only status indicators.
- Make touch targets usable on mobile.
- Provide accessible validation/error messages.
- Keep modal/dialog focus behavior appropriate to the existing component system.
- Avoid unnecessary animation and avoid motion that makes timed quizzes harder to follow.
- Design for mobile, tablet, laptop, and projector/fullscreen contexts.

## Responsive behavior

- Participant guide: readable single-column flow on narrow screens; useful section navigation without covering content.
- Organizer: tables and editing workflows must remain usable at smaller widths, with sensible horizontal scrolling or responsive card alternatives.
- Live quiz: large readable questions, touch-friendly answers, clear timer, and a projector-friendly presentation view.
- Avoid overflow, clipped actions, and layouts that require hover to discover essential controls.

---

# 14. Suggested Code Organization

Follow the repository's established structure where practical. If it is currently small or flat, evolve it toward feature-based organization without a disruptive rewrite.

Suggested organization:

```text
src/
  app/
  components/
  features/
    auth/
    events/
    guide-builder/
    participant-guide/
    progress/
    quizzes/
    live-quiz/
    organizer/
    analytics/
  lib/
  types/
  styles/
supabase/
  migrations/
  functions/
tests/
```

Suggested responsibilities:

- `auth`: Google OAuth, session recovery, profile confirmation, route guards.
- `events`: event access, event CRUD, membership, publication/versioning.
- `guide-builder`: sections, steps, tasks, resources, preview, publishing.
- `participant-guide`: event home, step reader, checklist, resume, completion.
- `progress`: progress calculation, persistence, reconciliation.
- `quizzes`: quiz library, editor, question validation, settings, themes.
- `live-quiz`: lobby, session state machine, host controls, answering, scoring, leaderboards.
- `organizer`: dashboard, participant management, announcements.
- `analytics`: aggregate metrics, question analysis, CSV exports.
- `lib`: Supabase client, server/trusted operation helpers, validators, shared utilities.
- `types`: domain types and generated database types.

Do not create empty folders or excessive abstraction solely to match this tree. Organize code around actual responsibilities.

---

# 15. Migration of the Existing 13-Step Workshop

The current Make.com + Telegram workshop is the first sample event and must continue to be usable after the transformation.

1. Find and inspect `src/data.ts` and the existing 13-step content.
2. Preserve the exact meaningful content, sequence, links, instructions, and resources unless a data issue must be corrected.
3. Map the content to an event, sections, steps, task records, and resources.
4. Add a seed/import path that is safe to rerun without creating duplicate events or duplicate steps.
5. Provide a documented way to seed the sample event into a development Supabase project.
6. Make the UI load the sample event through the new data-backed architecture.
7. Preserve existing search, navigation, progress UI, and fullscreen/presentation behavior.
8. Avoid hard-coded assumptions that the platform has exactly 13 steps or only one event.
9. Make sample event ownership/access explicit and do not accidentally expose private production content.
10. If backend environment/configuration is missing, implement the integration and document the exact setup required. Do not silently replace production behavior with fake local data.

---

# 16. Implementation Phases

Work through these phases in order. Dependencies may be adjusted after the initial audit, but do not skip the security/data foundation.

## Phase 0 — Repository audit and implementation plan

- Inspect existing application, components, routes, styling, data, package scripts, and dependencies.
- Inspect Supabase setup, auth flow, migrations, RLS, and environment configuration.
- Map existing behavior to the PRD.
- Identify risks and migration steps.
- Provide a concise plan, then begin implementation.

## Phase 1 — Foundation, data model, and authentication

- Establish typed domain models and Supabase integration.
- Add versioned migrations for the required schema and indexes.
- Implement Google OAuth/session handling and profile confirmation.
- Implement roles, event membership, RLS, and protected organizer routes.
- Add event code validation and safe access behavior.
- Run available non-browser checks and fix failures.

## Phase 2 — Event builder and publication

- Implement event create/edit/duplicate/archive/publish flows.
- Implement sections, steps, task/resource editing and ordering.
- Add draft/published behavior and preview.
- Add validation and safe event-code management.
- Verify data access and authorization through non-browser checks.

## Phase 3 — Participant guide and persistent progress

- Implement event home, step reader, checklist/activity completion, resources, resume, announcements, and completion state.
- Migrate the 13-step workshop to the database-backed event model.
- Preserve existing navigation/search/progress/fullscreen capabilities.
- Implement reliable progress calculations and idempotent persistence.
- Run available non-browser checks and fix failures.

## Phase 4 — Quiz library and builder

- Implement reusable quiz CRUD and question editor.
- Support MVP question types, answer keys, explanations, media, points, timers, ordering, settings, and themes.
- Support attaching a quiz to a guide step and standalone quizzes.
- Ensure answer keys are protected before reveal.
- Run available non-browser checks and fix failures.

## Phase 5 — Trusted live quiz engine

- Implement the session state machine and host authorization.
- Implement join PIN/link and lobby.
- Implement server-authoritative timers, submissions, scoring, reveal policy, tie-breaks, and leaderboard modes.
- Implement realtime updates and reconnect recovery.
- Ensure all privileged transitions and scoring are server/database-authoritative.
- Run available non-browser checks and fix failures.

## Phase 6 — Organizer operations and analytics

- Implement participant table, participant details, filters, sorting, progress, activity, and permitted quiz results.
- Implement event live controls and announcements.
- Implement analytics and CSV export.
- Implement audit trail for critical operations.
- Run available non-browser checks and fix failures.

## Phase 7 — Security hardening, polish, and handoff

- Review RLS for all relevant tables and storage buckets.
- Review answer-key and score leakage, route authorization, event ownership, and privileged operations.
- Check validation, error handling, empty/loading states, accessibility semantics, responsive styling, and performance using code inspection and non-browser tools only.
- Run repository-supported type checks, lint, unit tests that do not use a browser, and production build.
- Fix all relevant failures that can be fixed safely.
- Document setup, migrations, environment variables, seed process, deployment, and limitations.
- Hand over the application for the user to perform manual browser testing.

---

# 17. Non-Browser Verification Only

**Browser testing is explicitly out of scope for the coding agent. The user will perform browser testing manually.**

Do not:

- Launch a browser to inspect the app.
- Use Playwright, Cypress, Selenium, browser automation, or a browser agent.
- Add browser-test dependencies/configuration or create browser-driven tests.
- Claim visual/browser behavior has been verified.
- Block delivery waiting for manual browser tests.

You may:

- Inspect code and configuration.
- Run existing TypeScript checks.
- Run existing lint commands.
- Run existing unit tests that do not require a browser.
- Run relevant database/schema validation tools already available.
- Run the production build.
- Add focused non-browser unit tests for pure logic such as validation, progress calculations, scoring, ranking, and state transitions if a test framework already exists or a minimal justified setup is needed.
- Review RLS policies and SQL logic statically or through available database-level checks without browser automation.

Do not introduce a test framework merely to create an elaborate test suite. Follow the repository's current testing conventions.

In the final report, list only checks actually run and their actual outcomes. State explicitly: **“Browser testing was not performed; manual browser testing is left to the user.”**

---

# 18. Non-Browser Testable Logic and Acceptance Criteria

Where appropriate to the repository's test setup, create unit tests for pure or backend logic. These tests must not launch a browser.

Test or verify:

- Progress calculation for required/optional steps and completion rules.
- Event-code normalization and invalid/revoked code handling.
- Duplicate event membership prevention.
- Step/task progress idempotency.
- Question validation for each supported question type.
- Score calculation with correctness, speed bonus, negative marking, rounding, and bounds.
- Tie-break ordering and deterministic ranks.
- Rejection of late or duplicate answer submissions.
- Session transition validity and authorization.
- Leaderboard response shaping for every mode.
- Answer-key filtering before reveal.
- CSV escaping and export field allowlists.
- Permission boundaries for organizer, facilitator, participant, and public visitor.
- Data isolation across events.
- Safe handling of stale/reconnected clients in state reconciliation logic where testable without a browser.

Product acceptance criteria:

1. A participant can enter a valid event code/URL, sign in with Google, confirm a name, and join the event.
2. An invalid, revoked, unpublished, or unauthorized event code cannot expose protected guide data.
3. Returning participants resume the correct event membership and persisted progress.
4. The existing 13-step workshop is represented as data-backed content, not the only hard-coded event.
5. An authorized organizer can create, edit, preview, publish, unpublish, duplicate, and archive an event.
6. An organizer can create/reorder sections and supported step types without editing source code.
7. Participants can complete tasks/checklists and their progress is persisted and computed consistently.
8. Event changes are scoped to the correct owner/authorized organizers.
9. Organizers can create quizzes, add valid questions, configure settings, and attach quizzes to guides.
10. Organizers can also launch a standalone quiz.
11. Live quiz state transitions and host controls are validated on the trusted backend.
12. Server-side deadlines and scoring reject invalid/late/duplicate submissions according to policy.
13. All five leaderboard modes behave as specified, and hidden data is not sent to participants.
14. Correct answers/explanations remain hidden until the configured reveal state.
15. Realtime reconnects recover from authoritative database state.
16. Organizer participant tables, analytics, and CSV exports reflect actual persisted data and enforce access controls.
17. RLS prevents cross-event and cross-participant data access.
18. The app builds successfully and supported non-browser checks pass, or any pre-existing/unresolved failures are explicitly documented.
19. The application is handed over for manual browser testing by the user; the coding agent does not perform browser testing.

---

# 19. Environment Configuration and Setup Documentation

Inspect existing environment variables before changing them. Keep `.env` files and secrets out of version control.

Document the actual variables required by the implementation, such as the existing Supabase project URL, public/anon key, Google OAuth configuration, and any server-only secrets/functions that the repository genuinely uses. Do not invent variable names that are not implemented.

Requirements:

- Update `.env.example` with placeholder values only.
- Explain Supabase Google OAuth provider setup and allowed redirect URLs.
- Document how to apply migrations using the repository's existing Supabase workflow.
- Document how to seed the sample workshop.
- Document any required Supabase Storage bucket/policies.
- Explain which operations require a trusted server/Edge Function and how to deploy them.
- Never place service-role keys or privileged secrets in frontend variables.
- Do not report setup as complete when external dashboard configuration still needs user action.

---

# 20. Final Deliverables and Reporting

At completion, provide a concise but useful implementation report containing:

1. **Implemented features** — grouped by participant, organizer, guide builder, quizzes, live sessions, analytics, and security.
2. **Architecture decisions** — important choices and any justified deviations from the PRD.
3. **Files changed** — major modified/new files and their purpose.
4. **Database changes** — migration names, schema changes, RLS policies, indexes, and how the user can apply them.
5. **Environment/configuration** — new or changed variables and required external dashboard setup.
6. **Sample event migration** — how the original 13-step workshop was mapped and seeded.
7. **Commands/checks actually run** — type-check, lint, non-browser unit tests, migration checks, and build, with accurate outcomes.
8. **Manual browser testing notice** — state clearly that browser testing was not performed and must be done by the user.
9. **Known limitations** — incomplete features, external setup still required, or issues that could not be resolved.
10. **Next steps** — only concrete actions the user must perform, such as applying migrations, configuring OAuth redirects, deploying trusted functions, or manually testing.

Never claim completion of a feature that is only a mockup or partially wired. Never claim a test passed unless it was actually run and passed.

---

# 21. Final Instruction

Start with the repository audit and `EventFlow_PRD.md`. Preserve the existing working product while evolving it into EventFlow. Implement the product in the phases above, prioritize secure data modeling and authorization, and make the application genuinely data-driven. Do not stop after writing a plan or documentation.

**Do not perform browser testing. The user will perform all browser testing manually.** Continue with code-level inspection, appropriate non-browser tests, and production build checks, then deliver the implementation report and exact setup instructions.
