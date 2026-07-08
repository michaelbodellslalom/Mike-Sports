# Implementation Plan: Mike Sports MVP

## Plan overview

This plan translates the brief into an execution sequence for a read-only, mobile-friendly web app using real public sports APIs, local favorites, default ZIP 80222, and recommendation plus daily watch-plan features.

## Delivery goals

- Build a single-page sports command center for scores, schedule, news, watch options, tickets, and recommendations.
- Support launch leagues: NFL, NBA, MLB, NHL, NCAA football, NCAA men's basketball, PGA, UFC.
- Persist favorites and user settings locally.
- Deliver clear recommendation reason labels and a daily viewing plan.

## Constraints and non-goals

- No account system or cloud sync in MVP.
- No push alerts/reminders in MVP.
- No betting, fantasy, or social features.
- Read-only data display, except preferences (favorites, ZIP, watch priorities).

## Implementation phases

## Phase 0: Foundation and architecture

### Objectives

- Establish project skeleton and development standards.
- Set up environment config for API integration.
- Define baseline app shell and routing for a single-page layout.

### Tasks

- T-001 Initialize app scaffold (Next.js + TypeScript + ESLint + Tailwind).
- T-002 Create folder structure for api clients, domain models, store, components, and utilities.
- T-003 Define environment variable contract for sports/news/watch providers.
- T-004 Add shared error/loading/empty state components.
- T-005 Define global type models for teams, games, news, watch options, tickets, recommendations, and plan entries.

### Acceptance criteria

- App runs locally with strict type-check and lint.
- Domain model file exists and is used by at least one component.
- Environment variables are documented and validated at app startup.

## Phase 1: Data integration and normalization

### Objectives

- Connect to real public API sources.
- Normalize heterogeneous responses into one internal schema.
- Add caching and fetch resilience.

### Tasks

- T-006 Choose and configure primary sports API provider for scores and schedules.
- T-007 Add news API provider integration for league/team headlines.
- T-008 Add watch coverage source integration (network/stream metadata).
- T-009 Implement response normalization layer into internal models.
- T-010 Build API client with retries, timeout, and fallback handling.
- T-011 Add request throttling and lightweight in-memory cache policy.
- T-012 Build integration smoke tests for each provider client.

### Acceptance criteria

- Scores and schedules load from live API data for all launch leagues.
- News loads for at least one favorite team and one favorite sport.
- Fetch failures produce friendly UI errors without crashing.

## Phase 2: Preferences and personalization

### Objectives

- Implement local user preferences and initial favorites list.
- Wire all data modules to favorites and ZIP filtering.

### Tasks

- T-013 Create preferences store (favorites, ZIP, watch priorities).
- T-014 Persist preferences in local storage with hydration-safe behavior.
- T-015 Build favorites selection UI from predefined list.
- T-016 Seed initial selectable list:
  - Minnesota Vikings
  - Minnesota Twins
  - Minnesota Wild
  - Minnesota Timberwolves
  - University of Minnesota football
  - University of Minnesota basketball
  - PGA
  - UFC
- T-017 Set default ZIP to 80222 and editable ZIP input.
- T-018 Add geolocation support as optional enhancement path (user-triggered).

### Acceptance criteria

- User can select/deselect favorites from list and selections persist after refresh.
- ZIP defaults to 80222 on first load and can be changed.
- Geolocation is optional and never blocks primary ZIP-based flow.

## Phase 3: Core UI experience

### Objectives

- Deliver all core sections from the brief in one coherent dashboard.
- Prioritize scanability on desktop and mobile.

### Tasks

- T-019 Build top summary section with current/upcoming game highlights.
- T-020 Implement Scores section (live + recent finals + upcoming).
- T-021 Implement News section filtered by favorites/leagues.
- T-022 Implement Schedule section with day/week/month controls.
- T-023 Implement Where to Watch section per matchup.
- T-024 Implement Tickets section using ZIP relevance and outbound links.
- T-025 Add shared date/time formatting and timezone handling.
- T-026 Add responsive behavior and mobile-first layout QA.

### Acceptance criteria

- All six core sections render with real data or clear empty states.
- Layout works at common mobile and desktop breakpoints.
- User can answer "what is happening now" and "what is on later" quickly.

## Phase 4: Recommendation engine and watch planner

### Objectives

- Generate recommendations beyond favorites.
- Build daily viewing plan with explicit priority rules.

### Tasks

- T-027 Implement recommendation scoring inputs:
  - favorite-team presence
  - marquee/rivalry signal
  - standings/importance proxy
  - temporal fit and overlap
- T-028 Implement reason-label generator for each recommendation.
- T-029 Build recommendations UI cards with reason labels.
- T-030 Implement daily watch-plan algorithm with rule order:
  - favorites first
  - then high-interest non-favorites
  - then overlap/channel-switch minimization
- T-031 Build daily plan timeline/list UI.
- T-032 Add deterministic test fixtures for recommendation and planning output.

### Acceptance criteria

- Recommendations appear outside favorites with visible reason text.
- Daily plan output follows rule priority consistently.
- Algorithm outputs are stable for fixed input fixtures.

## Phase 5: Quality, performance, and launch readiness

### Objectives

- Harden reliability and UX quality.
- Confirm MVP readiness against brief goals.

### Tasks

- T-033 Add unit tests for normalization, store persistence, and planner logic.
- T-034 Add UI tests for favorites selection, ZIP defaults, and key sections.
- T-035 Add error-path tests for API failure and empty data scenarios.
- T-036 Run accessibility pass (keyboard, focus states, labels, contrast).
- T-037 Run performance pass (bundle split, loading states, skeletons).
- T-038 Finalize README with setup, env vars, scripts, and architecture notes.
- T-039 Create MVP launch checklist and known limitations log.

### Acceptance criteria

- Lint, tests, and production build are green.
- Core workflows function on desktop and mobile.
- Known limitations are documented and non-blocking.

## API selection criteria

Use these criteria to finalize provider choices before T-006:

- Coverage across all launch leagues (including PGA and UFC).
- Reliable score/schedule freshness for live states.
- Accessible quota/pricing for development and MVP usage.
- Terms of use compatible with personal project display.
- Availability of watch/broadcast metadata, or a practical fallback source.

## Milestones

- M1: Foundation complete (T-001 to T-005)
- M2: Live data integrated (T-006 to T-012)
- M3: Personalization complete (T-013 to T-018)
- M4: Core dashboard complete (T-019 to T-026)
- M5: Recommendation and planner complete (T-027 to T-032)
- M6: MVP launch-ready (T-033 to T-039)

## Suggested execution order for this week

1. Complete T-006, T-009, and T-013 first so data and preferences can evolve together.
2. Build T-015 to T-017 immediately after to lock favorites and ZIP behavior early.
3. Implement T-020 and T-022 next to establish score and schedule backbone.
4. Add T-027 to T-031 once baseline data flows are stable.

## Risks and mitigations

- Risk: Missing watch metadata for some events.
  Mitigation: Add graceful fallback label such as "Coverage not available yet".

- Risk: API quota exhaustion during development.
  Mitigation: Use cache TTL and local mock fixture fallback in development mode.

- Risk: Cross-league schema differences cause UI edge cases.
  Mitigation: Normalize aggressively and test each league with fixtures.

- Risk: Recommendation trust drops if reasons are vague.
  Mitigation: Enforce reason templates and reject empty/weak explanation strings.

## Definition of done (MVP)

- All in-scope sections from the brief are implemented.
- Real public API data is used in running app flows.
- Favorites list and ZIP preferences persist locally.
- Recommendation cards include clear reason labels.
- Daily watch plan follows defined priority rules.
- App is stable, responsive, and documented for handoff.
