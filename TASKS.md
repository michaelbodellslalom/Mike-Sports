# Mike Sports MVP Task Tracker

## Status legend

- [ ] Not started
- [x] Completed
- [-] Deferred

## Current focus

- [x] Confirm API provider choice for sports, news, and watch metadata.
- [x] Start first implementation slice: T-006, T-009, T-013.
- [x] Start next slice: T-018, T-019, T-020, T-021.
- [x] Start next slice: T-022, T-023, T-024, T-025.
- [x] Start next slice: T-026, T-027, T-028, T-029.
- [x] Start next slice: T-030, T-031, T-032.
- [x] Start next slice: T-033, T-034, T-035.
- [x] Start next slice: T-036, T-037.
- [x] Start next slice: T-038, T-039.

## Phase 0: Foundation and architecture

- [x] T-001 Initialize app scaffold (Next.js + TypeScript + ESLint + Tailwind).
- [x] T-002 Create folder structure for API clients, domain models, store, components, and utilities.
- [x] T-003 Define environment variable contract for sports/news/watch providers.
- [x] T-004 Add shared error/loading/empty state components.
- [x] T-005 Define global type models for teams, games, news, watch options, tickets, recommendations, and plan entries.

## Phase 1: Data integration and normalization

- [x] T-006 Choose and configure primary sports API provider for scores and schedules.
- [x] T-007 Add news API provider integration for league/team headlines.
- [x] T-008 Add watch coverage source integration (network/stream metadata).
- [x] T-009 Implement response normalization layer into internal models.
- [x] T-010 Build API client with retries, timeout, and fallback handling.
- [x] T-011 Add request throttling and lightweight in-memory cache policy.
- [x] T-012 Build integration smoke tests for each provider client.

## Phase 2: Preferences and personalization

- [x] T-013 Create preferences store (favorites, ZIP, watch priorities).
- [x] T-014 Persist preferences in local storage with hydration-safe behavior.
- [x] T-015 Build favorites selection UI from predefined list.
- [x] T-016 Seed initial selectable list:
  - [x] Minnesota Vikings
  - [x] Minnesota Twins
  - [x] Minnesota Wild
  - [x] Minnesota Timberwolves
  - [x] University of Minnesota football
  - [x] University of Minnesota basketball
  - [x] PGA
  - [x] UFC
- [x] T-017 Set default ZIP to 80222 and editable ZIP input.
- [x] T-018 Add geolocation support as optional enhancement path (user-triggered).

## Phase 3: Core UI experience

- [x] T-019 Build top summary section with current/upcoming game highlights.
- [x] T-020 Implement Scores section (live + recent finals + upcoming).
- [x] T-021 Implement News section filtered by favorites/leagues.
- [x] T-022 Implement Schedule section with day/week/month controls.
- [x] T-023 Implement Where to Watch section per matchup.
- [x] T-024 Implement Tickets section using ZIP relevance and outbound links.
- [x] T-025 Add shared date/time formatting and timezone handling.
- [x] T-026 Add responsive behavior and mobile-first layout QA.

## Phase 4: Recommendation engine and watch planner

- [x] T-027 Implement recommendation scoring inputs.
- [x] T-028 Implement reason-label generator for each recommendation.
- [x] T-029 Build recommendations UI cards with reason labels.
- [x] T-030 Implement daily watch-plan algorithm with rule order (favorites first, then high-interest non-favorites, then overlap minimization).
- [x] T-031 Build daily plan timeline/list UI.
- [x] T-032 Add deterministic test fixtures for recommendation and planning output.

## Phase 5: Quality, performance, and launch readiness

- [x] T-033 Add unit tests for normalization, store persistence, and planner logic.
- [x] T-034 Add UI tests for favorites selection, ZIP defaults, and key sections.
- [x] T-035 Add error-path tests for API failure and empty data scenarios.
- [x] T-036 Run accessibility pass (keyboard, focus states, labels, contrast).
- [x] T-037 Run performance pass (bundle split, loading states, skeletons).
- [x] T-038 Finalize README with setup, env vars, scripts, and architecture notes.
- [x] T-039 Create MVP launch checklist and known limitations log.

## Milestones

- [x] M1 Foundation complete (T-001 to T-005).
- [x] M2 Live data integrated (T-006 to T-012).
- [x] M3 Personalization complete (T-013 to T-018).
- [x] M4 Core dashboard complete (T-019 to T-026).
- [x] M5 Recommendation and planner complete (T-027 to T-032).
- [x] M6 MVP launch-ready (T-033 to T-039).

## Notes

- Real public API data is required for live app behavior.
- MVP remains read-only except preferences (favorites, ZIP, watch priorities).
- Default ZIP is 80222.
