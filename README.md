# Mike Sports MVP

Single-page personal sports hub for live scores, schedules, news, watch options, tickets, recommendations, and an optimized daily watch plan.

## Project status

MVP implementation is complete through core experience, recommendation engine, watch planner, and quality hardening.

## Launch scope

- Leagues: NFL, NBA, MLB, NHL, NCAA football, NCAA men's basketball, PGA, UFC
- Read-only experience with preference editing
- Local persistence for favorites and ZIP code
- Default ZIP code: 80222

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand (preferences store)
- Jest + React Testing Library

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create env file from template:

```bash
cp .env.example .env.local
```

3. Add API keys to `.env.local`:

- `NEXT_PUBLIC_NEWSAPI_KEY`
- `NEXT_PUBLIC_WATCHMODE_API_KEY`
- `NEXT_PUBLIC_THESPORTSDB_API_KEY` (optional, depending on provider tier)

4. Start dev server:

```bash
npm run dev
```

5. Open local app URL shown in terminal (for example `http://localhost:3000` or `http://localhost:3001`).

## Environment variables

Required/optional values are documented in [.env.example](.env.example):

- `NEXT_PUBLIC_THESPORTSDB_BASE_URL`
- `NEXT_PUBLIC_THESPORTSDB_API_KEY`
- `NEXT_PUBLIC_NEWSAPI_BASE_URL`
- `NEXT_PUBLIC_NEWSAPI_KEY`
- `NEXT_PUBLIC_WATCHMODE_BASE_URL`
- `NEXT_PUBLIC_WATCHMODE_API_KEY`

## Available scripts

- `npm run dev`: start development server
- `npm run build`: create production build
- `npm run start`: run production server
- `npm run lint`: run ESLint checks
- `npm run test`: run Jest test suite

## Architecture notes

- App entry point: [src/app/page.tsx](src/app/page.tsx)
- API routes:
  - [src/app/api/sports/route.ts](src/app/api/sports/route.ts)
  - [src/app/api/news/route.ts](src/app/api/news/route.ts)
  - [src/app/api/watch/route.ts](src/app/api/watch/route.ts)
- Provider clients:
  - [src/lib/api/sportsClient.ts](src/lib/api/sportsClient.ts)
  - [src/lib/api/newsClient.ts](src/lib/api/newsClient.ts)
  - [src/lib/api/watchClient.ts](src/lib/api/watchClient.ts)
- Normalization layer: [src/lib/api/normalize.ts](src/lib/api/normalize.ts)
- Request resilience and cache: [src/lib/api/http.ts](src/lib/api/http.ts)
- Recommendation engine: [src/lib/recommendations.ts](src/lib/recommendations.ts)
- Daily watch planner: [src/lib/watchPlan.ts](src/lib/watchPlan.ts)
- Preferences store: [src/store/preferencesStore.ts](src/store/preferencesStore.ts)

## Key user workflows

- Set favorites from predefined list
- Set and persist ZIP code
- Optionally use geolocation to infer ZIP
- Review scores/news/schedule/watch options/tickets
- Review recommended non-favorite games with reason labels
- Review ranked daily watch plan

## Quality gates

Current checks all pass:

- `npm run lint`
- `npm run test`
- `npm run build`

## Testing coverage highlights

- Provider smoke tests and cache behavior
- Normalization logic tests
- Preferences persistence tests
- Recommendation and watch-plan deterministic fixture tests
- UI tests for default ZIP, favorites interactions, and error/empty states

## Planning documents

- Product brief: [BRIEF.md](BRIEF.md)
- Implementation plan: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- Task tracker: [TASKS.md](TASKS.md)
- Launch checklist and limitations: [MVP_LAUNCH_CHECKLIST.md](MVP_LAUNCH_CHECKLIST.md)
