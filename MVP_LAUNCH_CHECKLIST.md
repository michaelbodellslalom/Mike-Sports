# MVP Launch Checklist and Known Limitations

## Launch checklist

## Product readiness

- [x] Core dashboard sections implemented (snapshot, scores, news, schedule, watch, tickets)
- [x] Recommendations section implemented with reason labels
- [x] Daily watch plan implemented with favorites-first rule
- [x] Preferences editing implemented (favorites, ZIP)
- [x] Personalized team-logo background implemented from saved favorites
- [x] Live score metadata implemented (status, score, period/quarter, clock when available)
- [x] Curated local preview articles implemented as a readable news fallback
- [x] Default ZIP is 80222
- [x] Geolocation is optional and non-blocking

## Data and integration

- [x] Real provider integrations wired for sports, news, and watch metadata routes
- [x] API normalization layer in place
- [x] Retry, timeout, and cache handling in HTTP client
- [x] Graceful fallback/empty states for missing provider data

## Quality and engineering

- [x] Lint passes
- [x] Tests pass
- [x] Build passes
- [x] Accessibility baseline pass complete (focus states, skip link, semantic roles, aria states)
- [x] Performance baseline pass complete (abortable fetches, deferred section rendering, reduced-motion support)

## Documentation and handoff

- [x] README updated with setup, architecture, scripts, and env vars
- [x] Brief, implementation plan, and tasks tracker present
- [x] Launch checklist and known limitations documented

## Known limitations

1. Sports API coverage varies by league and endpoint availability at runtime.
2. Live news and watch metadata require provider credentials; news falls back to curated preview articles and watch options use demo network labels when live data is unavailable.
3. Period/quarter and clock fields appear only when the sports provider supplies them; fallback live games include representative demo values.
4. Ticket links use search-based outbound links rather than direct event IDs, and the current demo localizes recommendations to Colorado-area teams and venues.
5. Recommendations use heuristic scoring and are not model-backed.
6. Daily watch plan overlap logic is rule-based and may not account for broadcast delays.
7. No account system or cross-device sync in MVP.
8. No alerts/reminders in MVP.

## Post-launch follow-ups

1. Add observability for API route latency and error rates.
2. Add end-to-end tests for full user flows.
3. Improve watch source matching precision per game metadata.
4. Introduce optional user authentication and cloud preference sync.
5. Add reminders/alerts for selected games.
