# EventFlow — Product Requirements Document

**Version:** 1.0  
**Status:** Proposed baseline for implementation  
**Product owner:** Nived Shaji  
**Product type:** Multi-event guidance and interactive engagement platform  
**Existing foundation:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Motion, Lucide React  
**Proposed backend:** Supabase Auth, PostgreSQL, Row Level Security (RLS), Realtime

---

## Executive Summary

EventFlow evolves the existing **Workshop Agenda Web** into a reusable platform for workshops, hackathons, orientations, training sessions, and similar events.

Organizers create an event and build a guide from sections and steps. Participants enter an event code, authenticate with Google, confirm their display name, and follow a personalized guide with persistent progress.

The platform also includes a reusable quiz engine that supports both quizzes embedded in event guides and standalone live quizzes launched by an organizer. Organizers control timing, scoring, answer reveal, leaderboard visibility, themes, animations, and session flow. Admin dashboards show participant identity, completion, activity, quiz performance, and event analytics.

The existing 13-step Make.com + Telegram workshop becomes the first sample event. It should be migrated from hard-coded content into database-backed event content while preserving existing agenda navigation, search, progress display, and fullscreen presentation behavior.

## 1. Product Vision

**Build a platform where organizers create an event once and participants experience it through a personalized, interactive, progress-tracked guide.**

Each event can contain its own agenda, instructions, checklists, videos, resources, activities, quizzes, and challenges. Organizers can also launch independent live quizzes, monitor participation, and control the experience in real time.

### Core journeys

**Participant:**  
Discover → Enter event code → Sign in with Google → Confirm name → Open guide → Follow steps → Join quizzes → View results → Complete event.

**Organizer:**  
Create → Configure → Publish → Share access → Run event → Control live sessions → Analyze results.

## 2. Goals and Non-Goals

### Goals

- Support multiple independently configurable events.
- Require Google authentication for participant progress and quiz submissions.
- Let organizers build guides without editing code.
- Persist progress across devices and sessions.
- Support embedded quizzes and standalone live quizzes.
- Provide configurable leaderboards, scoring, timers, themes, and animations.
- Provide participant-level and aggregate analytics.
- Maintain a responsive, accessible experience on mobile, tablet, and desktop.

### Non-goals for the first release

- Native Android/iOS applications.
- Video conferencing or a complete LMS.
- AI-generated questions as a dependency for core quiz functionality.
- Payment processing, ticket sales, or complex registration.
- Treating Google login as proof of physical attendance.

## 3. Roles and Permissions

| Role | Capabilities | Restrictions |
|---|---|---|
| Platform administrator | Manage platform settings, assign organizer roles, moderate events where authorized | Client-side role checks must not be the only security boundary |
| Event owner / organizer | Create and edit owned events, publish guides, manage participants, configure quizzes, launch sessions, view analytics and export permitted data | Cannot access unrelated private events without explicit permission |
| Facilitator | Operate assigned live event controls, advance steps, run quizzes and view permitted live results | Cannot change ownership or platform-wide settings |
| Participant | Join authorized events, edit permitted display name, follow guide, complete tasks, submit quiz answers and view allowed results | Cannot view other participants' private data or modify scores |
| Public visitor | View public landing pages and enter an event code | Cannot access private guide content or submit tracked activity before authentication |

All authorization must be enforced through server-side checks and Supabase RLS. Hiding buttons in the UI is not authorization.

## 4. User Journeys

### 4.1 Participant journey

1. Open EventFlow using an event URL or enter an event code.
2. Validate the code and show permitted event information without exposing private content.
3. Sign in with Google OAuth through Supabase Auth.
4. Prefill the profile name from Google and ask the participant to confirm or edit it.
5. Create or resume membership for the authenticated user.
6. Open the event home with agenda, progress, next unfinished step, resources, and live session state.
7. Complete instructions, checklists, activities, quizzes, and challenges. Save progress automatically.
8. Join live quiz sessions using the authenticated account and session PIN/link when enabled.
9. View only the leaderboard and result information allowed by organizer settings.
10. Reach the completion screen, review permitted results, access resources, and optionally download a certificate if enabled.

### 4.2 Organizer journey

1. Sign in and open the organizer dashboard.
2. Create an event with title, description, date/time, timezone, branding, access code, and participation rules.
3. Build sections and reorder steps; configure content, resources, and completion criteria.
4. Add embedded quizzes or create a reusable quiz for standalone launch.
5. Preview participant and presentation views, then publish.
6. Share the event URL/code and optionally a separate live quiz join code.
7. During the event, set the current step, launch/pause/resume/end quiz sessions, and reveal answers/results.
8. Monitor participant progress, response counts, and quiz performance.
9. Export permitted participant and quiz results and archive the event when finished.

## 5. Functional Requirements

| ID | Requirement |
|---|---|
| FR-001 Event access | Join using a unique event code or URL. Codes must be collision-resistant, case-normalized, revocable, and rotatable. Access rules may require authentication, membership approval, or an allowlist. |
| FR-002 Google authentication | Use Supabase Auth Google OAuth. The stable identity is the Supabase user ID, not email or name. |
| FR-003 Participant profile | Prefill name from OAuth metadata, require confirmation before first participation, allow editing where enabled, and keep authentication identity separate from editable display name. |
| FR-004 Event membership | Create one membership per user per event. Returning participants resume progress. Enforce uniqueness for each user/event pair. |
| FR-005 Event builder | Create, edit, duplicate, preview, publish, unpublish, and archive events. Draft edits must not unexpectedly change a live published version. |
| FR-006 Agenda and sections | Create, rename, reorder, and delete sections and steps. Support estimated duration, scheduled times, optional/required status, and visibility. |
| FR-007 Step types | Support instruction, checklist, activity, video/embed, quiz, challenge, break, resource collection, and structured custom-content steps. Do not render arbitrary executable HTML. |
| FR-008 Step editor | Configure title, summary, objective, detailed instructions, ordered substeps, resources, media, warnings, completion rules, and duration. |
| FR-009 Resources | Support links and uploaded files with labels, descriptions, and access controls. Validate URL schemes and file types. |
| FR-010 Progress | Save step status, checklist items, quiz completion, and task activity. Compute progress from defined completion rules, not browser-only counters. |
| FR-011 Resume | Restore the participant's last open step and completion state across devices and sessions. |
| FR-012 Live event state | Organizers can set the current step and publish announcements. Participants receive real-time updates and recover the latest state after reconnecting. |
| FR-013 Quiz builder | Create reusable quizzes with title, description, questions, answer keys, explanations, points, time limits, media, and ordering. |
| FR-014 Question types | MVP: single-choice MCQ, multiple-select, and true/false. Support images through question media fields. Add other types later. |
| FR-015 Quiz placement | Attach quizzes to guide steps or launch independently from the organizer dashboard. |
| FR-016 Live session | Create a session, issue a join PIN/link, open/close joining, start, pause, resume, advance questions, extend deadlines, reveal answers, and end the session. |
| FR-017 Timers | Use server-authoritative deadlines. Client timers are display-only. Reject late submissions according to the session policy. |
| FR-018 Scoring | Support configurable question points, correctness scoring, optional speed bonus, and optional negative marking. Define rounding and tie-break rules. |
| FR-019 Leaderboard modes | Support full leaderboard after every question; top 3 plus the participant's own rank; own rank/score only; final-only leaderboard; or hidden leaderboard. |
| FR-020 Answer reveal | Configure correct-answer and explanation visibility after each question, at the end, or never. Authorized admins may override during a session. |
| FR-021 Quiz themes | Provide presets and custom colors, backgrounds, typography, logos, answer-card style, timer style, transitions, motion, sound, and presentation mode. |
| FR-022 Quiz animations | Support question transitions, answer feedback, score count-up, rank movement, and final podium/confetti. Respect reduced-motion settings and allow sound to be disabled. |
| FR-023 Anti-cheat basics | Default to one accepted answer per participant per question. Validate session membership, deadline, question state, and scoring on the server. |
| FR-024 Admin participants | Show name, email where authorized, join time, last activity, progress, completed steps, quiz results, and status. Include search, sorting, filters, details, and CSV export. |
| FR-025 Analytics | Show participant counts, started/completed counts, average progress, step drop-off, activity completion, quiz accuracy, response rates, and score distribution. |
| FR-026 Exports | Export permitted participant/progress and quiz results to CSV. Avoid exposing secrets or unnecessary personal data. |
| FR-027 Completion | Show completion summary and resources. Certificates are optional and depend on configured completion rules. |
| FR-028 Audit trail | Record important actions such as publishing, role changes, quiz start/end, score overrides, and exports where feasible. |
| FR-029 Accessibility | Support keyboard navigation, visible focus, contrast, semantic labels, screen-reader announcements, reduced motion, and touch-friendly controls. |
| FR-030 Responsive UI | Support mobile, tablet, laptop, and projector/fullscreen layouts. |

## 6. Quiz Specification

### 6.1 Quiz creation

- Quiz metadata: title, description, instructions, host, optional event association, theme, visibility, and status.
- Question fields: prompt, type, answer options, correct answer(s), explanation, media, points, time limit, randomization, and optional tags.
- Question order can be fixed or randomized. Answer options can be randomized when meaning is preserved.
- Validate required fields and answer keys before publishing.
- Never include answer keys in participant-facing data before reveal is allowed.

### 6.2 Session lifecycle

`Draft → Ready → Lobby → Live question → Reveal (optional) → Next question → Final results → Ended`

Pause, resume, and cancellation are explicit states. On reconnect, clients must recover the latest authoritative state.

### 6.3 Leaderboard modes

| Mode | Participant sees | Admin sees |
|---|---|---|
| Full after every question | Full ranked list, subject to privacy settings | Full scores, response counts, question analytics |
| Top 3 + my rank | Top three plus own rank/score, even when outside top three | Full ranking and score details |
| My rank only | Own rank and permitted score details | Full ranking and score details |
| Final only | No ranking between questions; results at configured end state | Live operational metrics and full results |
| Hidden | No leaderboard | Full results where authorized |

Use a deterministic tie-break policy, such as total points, then correct answers, then total response time. Speed scoring is optional and must be clear to participants.

## 7. Admin Dashboard

| Area | Screens and capabilities |
|---|---|
| Overview | Event cards, draft/live/archived status, participant totals, recent activity, quick actions |
| Event builder | Details, branding, access, agenda, step editor, resources, quiz attachment, preview |
| Participants | Search/filter, name, authorized email, join time, last activity, progress, status, quiz scores, details, CSV export |
| Guide live control | Current step, announce/start step, pause/close event, participant activity indicators, announcements |
| Quiz library | Create/edit/duplicate quizzes, question editor, theme presets, preview, publishing validation |
| Live quiz control room | Lobby, join code, connected/answered counts, current question, timer, pause/resume, next, reveal, leaderboard policy, end session |
| Analytics | Progress funnel, step completion, quiz accuracy, response distribution, score distribution, exports |
| Settings | Organizer roles, branding defaults, code rotation, retention, accessibility defaults, integrations |

## 8. Participant Interface

- **Landing:** concise product introduction, event-code entry, sign-in.
- **Event access:** event identity, access status, Google sign-in.
- **Profile confirmation:** prefilled display name and validation.
- **Event home:** title, date/time, progress, continue button, timeline, resources.
- **Guide reader:** objective, instructions, checklist/task controls, embedded quiz, previous/next.
- **Live quiz:** question, answer cards, synchronized timer, submission status, accessible feedback.
- **Leaderboard:** only the configured view; no leakage of hidden rankings or answer keys.
- **Completion:** summary, permitted results, resources, feedback, optional certificate.

## 9. Proposed Data Model

| Table | Purpose and key fields |
|---|---|
| `profiles` | `user_id` (auth user FK), `display_name`, `avatar_url`, timestamps |
| `organizer_memberships` | `user_id`, role, granted_by, created_at |
| `events` | `id`, `owner_id`, title, slug, description, start/end, timezone, status, access policy, theme JSON, published version |
| `event_memberships` | `id`, `event_id`, `user_id`, display-name snapshot, role, joined_at, last_active_at, status; unique event/user |
| `event_sections` | `id`, `event_id`, title, description, position, visibility |
| `event_steps` | `id`, `event_id`, `section_id`, type, title, content JSON, duration, position, required, completion rule, published version |
| `step_tasks` | `id`, `step_id`, title, description, position, required |
| `step_resources` | `id`, `step_id`, label, type, URL/storage path, access policy, position |
| `participant_step_progress` | `event_id`, `step_id`, `user_id`, status, completed_at, last_opened_at, completion data; unique user/step |
| `participant_task_progress` | `user_id`, `task_id`, completed_at; unique user/task |
| `quizzes` | `id`, `owner_id`, optional `event_id`, title, description, settings JSON, theme JSON, status |
| `quiz_questions` | `id`, `quiz_id`, type, prompt, media, options, answer key, explanation, points, time limit, position |
| `quiz_sessions` | `id`, `quiz_id`, optional `event_id`, `host_id`, join code, status, current question, start/deadline timestamps, settings snapshot |
| `quiz_session_members` | `session_id`, `user_id`, display-name snapshot, joined_at, participation state; unique session/user |
| `quiz_responses` | `id`, `session_id`, `question_id`, `user_id`, answer, submitted_at, awarded points, correctness, response time |
| `quiz_results` | `session_id`, `user_id`, total points, correct count, rank, finished_at |
| `event_announcements` | `id`, `event_id`, `author_id`, title, body, timestamp, audience |
| `audit_logs` | `actor_id`, `event_id`, action, target type/id, metadata, timestamp |

Keep stable authentication identity separate from the participant's editable display name. Use JSONB for flexible settings, not as a replacement for relational fields used in filtering and authorization. Add indexes for event IDs, user IDs, status, session IDs, question IDs, and dashboard timestamps.

## 10. Architecture

### Recommended stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide React.
- **Authentication:** Supabase Auth with Google OAuth.
- **Database:** Supabase PostgreSQL.
- **Authorization:** Row Level Security and trusted server-side role checks.
- **Realtime:** Supabase Realtime for session and guide updates.
- **Trusted operations:** server/API functions for code validation, answer acceptance, timers, scoring, result calculation, and privileged actions.
- **File storage:** Supabase Storage with access policies for private files.

### Logical flow

`Browser → Supabase Auth → Authenticated session → RLS-protected database`

`Organizer command / quiz answer → Trusted server-side validation → Database state transition → Realtime broadcast → Participant/admin clients`

### Key implementation rules

- Never trust client-calculated points, ranks, timers, or admin roles.
- Never expose answer keys before the configured reveal.
- Use server timestamps for deadlines.
- Never put service-role credentials in client-side environment variables.
- Persist important state before broadcasting realtime events.
- Refetch authoritative state after reconnecting.
- Snapshot quiz settings when a session starts so later edits do not alter an active session.

## 11. Security and Privacy

- Configure Google OAuth callback URLs and production origins correctly.
- RLS must limit participants to their own private progress and responses.
- Only authorized organizers can edit event content, view participant-level analytics, or export data.
- Only authorized hosts can control sessions; validate every command against the current session state.
- Participants cannot write awarded points, correctness, or final ranks directly.
- Rate-limit event-code attempts, joins, and answer submissions where possible.
- Use high-entropy event codes with rotation and revocation.
- Disclose what participant data organizers can see.
- Define retention/deletion policies and support account deletion requests.
- Handle OAuth failures, invalid codes, lost connections, closed sessions, and duplicate submissions explicitly.

## 12. Design System

The default UI should be minimal, deliberate, and high-quality. Avoid generic gradients, glows, ambient lighting, and decorative textures. Use solid surfaces, clear hierarchy, restrained borders, and purposeful motion. Event and quiz themes can override the default.

| Area | Guidance |
|---|---|
| Base palette | Near-black `#0A0A0A`, white primary text, muted gray secondary text; also support a neutral light theme |
| Typography | Readable sans-serif with a consistent type scale; allow theme overrides |
| Layout | Responsive grid, consistent spacing, compact organizer tables, comfortable participant reading width |
| Motion | Short purposeful transitions; respect reduced-motion preferences |
| Quiz themes | Presets plus custom colors, background, typography, logo, answer cards, timer, sound, and animation intensity |
| Accessibility | Contrast, keyboard operation, focus states, screen-reader labels, non-color-only status indicators, touch-friendly targets |

Do not hard-code one theme into content components. Use theme tokens/CSS variables so guide and quiz branding can be customized independently.

## 13. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Keep navigation responsive; lazy-load large media and admin modules; paginate large lists |
| Realtime | Apply updates quickly under normal connectivity and recover after reconnecting |
| Availability | Show offline/disconnected states; do not claim a save succeeded before confirmation |
| Accessibility | Target WCAG 2.2 AA practices where feasible |
| Browser support | Current Chrome, Edge, Firefox, Safari, and mobile browsers |
| Maintainability | Typed domain models, migrations, reusable components, centralized validation, automated tests |
| Observability | Log actionable failures without logging secrets |
| Data integrity | Use constraints/transactions for membership uniqueness, response acceptance, and session transitions |

## 14. Delivery Plan

| Phase | Deliverables | Exit criteria |
|---|---|---|
| 0. Audit and foundation | Inspect repository, routes, dependencies, deployment, environment, current UI; document retained functionality | Existing build passes; current 13-step workshop documented; migration/rollback approach agreed |
| 1. Auth and event foundation | Supabase, Google OAuth, profiles, roles, event CRUD, event codes, memberships, RLS | Users can sign in and join valid events; unauthorized access blocked |
| 2. Dynamic guide builder | Sections/steps, structured instructions, resources, reordering, preview, publishing/versioning | Organizer can publish a guide without code edits |
| 3. Participant guide and progress | Event home, timeline, step reader, checklist, autosave, resume, completion | Progress persists across refresh/devices and is visible to authorized admins |
| 4. Quiz builder | Question editor, validation, settings, themes, embedded quiz | Organizer can create, preview, and embed a quiz |
| 5. Live quiz engine | Lobby, PIN/link, lifecycle, timers, answer submission, scoring, reveal, leaderboard | Multiple clients participate with server-validated scoring |
| 6. Live controls and analytics | Start/pause/resume/end, question control, response counts, leaderboard control, analytics, CSV | Host can run a session and results match persisted responses |
| 7. Polish and release | Responsive UI, accessibility, error states, security review, tests, deployment docs | Acceptance suite passes and production configuration is verified |

Build in vertical slices. Complete and test one end-to-end workflow before expanding scope. Do not build a mock-only frontend and postpone database/security work until the end.

## 15. Testing and Acceptance Criteria

1. A participant enters a valid event code, signs in with Google, confirms a name, and joins.
2. Invalid or revoked codes cannot expose private content or create membership.
3. Progress survives refresh, re-login, and a second device.
4. A participant cannot access another participant's private records by changing request IDs.
5. An organizer can create, reorder, preview, and publish a multi-step guide.
6. Published content follows the versioning policy and does not break active sessions.
7. Quizzes work both embedded and standalone.
8. Server deadlines reject late answers according to policy.
9. Clients cannot forge points, correctness, or ranks.
10. Every leaderboard mode shows exactly the configured data, including own rank in top-three mode.
11. Answer keys remain hidden until reveal is permitted.
12. Only authorized hosts can control a session.
13. Reconnect restores current state without duplicate scoring.
14. Admin analytics and CSV exports match persisted records.
15. Mobile, keyboard-only, and reduced-motion checks pass.

## 16. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Scope grows too large | Deliver in phases; defer advanced question types, certificates, and AI authoring |
| Client-side cheating | Server-side scoring, deadlines, role checks, and answer-key protection |
| Realtime event loss | Persist state first, broadcast updates, refetch after reconnect |
| Edits break live events | Published versions and session settings snapshots |
| Event-code guessing | High-entropy codes, rate limits, revocation, optional allowlists |
| Large event load | Indexes, pagination, scoped realtime channels, aggregated queries |
| Privacy exposure | RLS tests, least privilege, export permissions, retention policy |
| Overdesigned UI | Minimal default design system, presets, motion/accessibility controls |

## 17. Recommended Repository Structure

```text
src/
  app/                  # App shell, routing, providers
  components/           # Shared UI primitives and forms
  features/
    auth/               # Google OAuth and profile confirmation
    events/             # Event list, code access, settings
    guide-builder/      # Section/step editor, ordering, preview
    participant-guide/  # Timeline, step reader, progress
    progress/           # Task and step completion state
    quizzes/             # Quiz builder, question types, themes
    live-quiz/           # Lobby, participant quiz, leaderboard
    organizer/           # Dashboard, controls, participants
    analytics/           # Metrics and exports
  lib/                  # Supabase client, validation, helpers
  types/                # Shared domain types
  styles/               # Tokens and theme variables

supabase/
  migrations/            # Version-controlled schema and RLS
  functions/             # Trusted server-side operations if needed

tests/                   # Unit, integration, end-to-end tests
```

## 18. AI Coding Agent Workflow

1. Inspect the repository and report routes, components, scripts, dependencies, and deployment assumptions. Do not rewrite blindly.
2. Create a checklist from this PRD and identify missing configuration without printing secrets.
3. Define typed models and migrations before building data-heavy screens.
4. Implement OAuth, profile confirmation, membership, and RLS; test access isolation.
5. Migrate the 13-step sample workshop to database-backed content while preserving current functionality.
6. Build event creation, guide builder, participant guide, and progress end-to-end.
7. Implement the quiz builder and embedded quiz using shared domain models.
8. Build the live-session state machine and server-side scoring before animation polish.
9. Connect live controls, analytics, and exports to real persisted data.
10. Run typecheck, lint, unit, integration, production-build, and security checks after each phase.
11. Document OAuth URLs, environment variable names, migrations, deployment, and rollback.

**Agent guardrails:** Never expose service-role credentials in client code. Never weaken RLS to make a screen work. Never present mock values as real analytics. Do not remove existing features without approval. Keep migrations reversible where practical.

## 19. MVP Release Definition

The MVP is ready when a real organizer can create and publish an event; participants can sign in with Google, confirm their names, complete a persistent guide, and appear in a secure admin dashboard; and the organizer can create a quiz, embed it or launch it live, control its leaderboard, and inspect saved results.

**Must-have**
- Google OAuth, event codes, event/guide builder, persistent progress, RLS.
- Embedded and standalone live quizzes.
- Server-side scoring and configurable leaderboard.
- Admin participant list, CSV export, responsive UI.

**Should-have**
- Live guide announcements, quiz themes, rank movement, reduced-motion controls, basic analytics and audit logs.

**Later**
- Certificates, richer question types, AI-assisted question authoring, advanced reporting, attendance QR and external integrations.

## 20. Decisions to Lock Before Implementation

| Decision | Recommended default |
|---|---|
| Participant access | Google sign-in required for tracked progress and quiz submissions |
| Display name | Prefill from Google; participant confirms/edits; event/session snapshots preserve history |
| Event code | Generated high-entropy code, rotatable/revocable; event URL supported |
| Quiz join policy | Authenticated users; membership/allowlist configurable per event |
| Answer changes | One accepted answer by default; optional edits before deadline |
| Leaderboard default | Top 3 plus participant's own rank; configurable per quiz/session |
| Scoring | Correctness-based; speed bonus and negative marking off by default |
| Data access | Participants see own detailed history; organizers see data for events they manage |
| Published edits | Versioned content; live sessions use a settings snapshot |
| Visual design | Minimal neutral default with customizable event and quiz themes |

## Appendix A. Existing Workshop Migration

Convert the existing Make.com + Telegram workshop's 13 steps into the new event builder as a sample event. Preserve its opening, no-code automation introduction, Telegram bot setup, Make account/scenario, auto-reply bot, break, weather bot, flow explanation, reminder bot, mini challenge, deployment, and closing. Verify the source data before migrating exact timings and content.

## Appendix B. Definition of Done

- UI state uses persisted data or is clearly labeled as a local preview.
- Loading, empty, success, validation, and error states exist.
- Authorization is tested for allowed and denied roles.
- Mobile layout and keyboard navigation are checked.
- Tests and type checks pass.
- No secrets, hidden answer keys, or unauthorized participant data leak to the client.
- Changes are documented and do not regress the existing sample workshop.
