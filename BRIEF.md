# Project brief: Mike Sports personal sports hub

| | |
|---|---|
| **Engagement** | Personal build |
| **Workstream** | Mike Sports MVP |
| **Prepared** | July 8, 2026 |
| **Status** | Discovery brief — planning prototype |
| **Owner** | Mike |

## Objective

Build a single-page, web-based sports hub that lets Mike track live and past scores, read the latest sports news, follow favorite teams, and see what games are on today, this week, or this month. The experience should also recommend games to watch outside the user’s favorite teams or sports and help create an optimized daily viewing schedule.

## Background

Sports fans often have to jump between scores pages, schedules, news feeds, streaming guides, and ticket sites to answer simple questions like what is happening now, what should I watch tonight, and where can I see a game. This project brings those pieces together into one lightweight personal dashboard focused on convenience and decision-making.

The first version should prioritize clarity, speed, and easy filtering over deep account or social features. It should work well on both desktop and mobile as a web app.

## Persona

**Mike**, a personal sports fan who wants one place to keep up with the teams and sports he cares about.

Mike wants quick answers, not a complicated platform. He needs live updates, schedule visibility, and helpful recommendations without having to search across multiple apps.

## Scope

**In scope:**

- Single-page web app optimized for desktop and mobile
- Live and past scores for selected teams and sports
- News feed with latest updates
- Favorite teams and sports selection
- Calendar views for day, week, and month schedules
- Where-to-watch information for games, including streaming and TV network details
- Ticket links for nearby events when favorite teams play in the user’s area
- AI recommendations for games outside favorite teams and sports
- AI-generated daily viewing schedule with suggested watch order
- Clean, simple UI focused on fast scanning and decision-making

**Out of scope:**

- Social features like chat, comments, or sharing feeds
- Full account system unless later needed for saving preferences
- Betting features or gambling integrations
- Fantasy league management
- Live play-by-play commentary as a primary experience
- Native mobile apps
- Marketplace-style ticket purchasing flow beyond outbound links
- Full editorial news production or original journalism

## Core experience

### Section 1 — Scores

Show live scores and recent final scores for the teams and sports the user follows. The view should make it obvious what is currently in progress, what just ended, and what is coming next.

### Section 2 — News

Provide a compact news feed with the latest updates relevant to the user’s selected teams and sports. Stories should be easy to scan and should surface important items first.

### Section 3 — Favorites

Let the user select preferred teams and sports so the rest of the experience can filter around their interests. These preferences should drive scores, news, schedules, and recommendations.

### Section 4 — Schedule Calendar

Display upcoming games in day, week, and month views. The user should be able to understand what is on today at a glance and expand out when planning ahead.

### Section 5 — Where to Watch

For each game, show viewing options such as streaming services, TV networks, and other broadcast details when available.

### Section 6 — Tickets

When favorite teams are playing in the user’s area, surface links to tickets so the user can act quickly without manually searching.

### Section 7 — AI Recommendations

Suggest additional games the user might like to watch outside their favorite teams or sports, based on schedule, relevance, and broad interest.

### Section 8 — Daily Viewing Plan

Generate an optimized watch list for the day that tells the user what to watch and in what order, helping them make sense of overlapping games.

## Mock data model

The first version can be driven by mock data or a public sports API, depending on build constraints. The data model should likely include:

- **Teams** — name, sport, league, logo, favorite flag
- **Games** — home team, away team, start time, status, score, venue, broadcast info
- **Scores** — live state, period, quarter, inning, half, final result
- **News items** — headline, source, timestamp, related team or sport
- **Calendar entries** — date, time, matchup, importance, watchability
- **Watch options** — streaming provider, TV network, region availability
- **Tickets** — event link, venue, city, distance or local relevance
- **Recommendations** — suggested game, reason, confidence or relevance label
- **Daily plan** — watch order, time windows, priority tags

The exact schema should be refined once the data source and recommendation approach are chosen.

## Tech approach

A web-first implementation should keep the app fast and easy to maintain. A modern React-based frontend is a good fit, with responsive layouts and clear state management for favorites, filters, and schedule views. Mock data can support an MVP, while API integrations can be added later for live scores, schedules, news, and watch information.

If AI recommendations are included early, they should be framed as suggestions rather than guarantees and should be explainable in plain language.

## Framing for the user

Open the product with this setup so expectations stay realistic:

- This is a personal sports hub, not a full sports network replacement
- Scores, news, and schedules should feel fast and reliable
- Favorite-team filtering is the main personalization layer
- AI recommendations should assist discovery, not override user control
- Ticket and watch links should be clearly labeled as outbound destinations

## MVP decisions (answers to open questions)

1. **Launch sports and leagues**
	Focus initial MVP on major U.S. leagues and competitions with broad coverage and predictable schedules:
	- NFL
	- NBA
	- MLB
	- NHL
	- NCAA football and men's basketball
	- PGA
	- UFC

2. **Data strategy at launch**
	Use a **real public sports API** as the primary data source for live scores, schedules, and league metadata.
	Mock data may still be used internally for placeholder states during development, but the product should be grounded in real API data from the start.

3. **How favorites are saved**
	Save favorites **locally first** (browser local storage) for MVP.
	Account-based sync is deferred to a later phase.
	The favorites picker should present a selectable list so the user can choose from predefined teams and sports rather than typing everything manually.

	**Initial favorites list:**
	- Minnesota Vikings
	- Minnesota Twins
	- Minnesota Wild
	- Minnesota Timberwolves
	- University of Minnesota football
	- University of Minnesota basketball
	- PGA
	- UFC

4. **Daily viewing schedule optimization rule**
	Prioritize in this order:
	- Favorite-team games first
	- Then highest-interest non-favorite games (ranked by rivalry, standings impact, and marquee signals)
	- Then minimize overlap and channel-switch friction

5. **How AI recommendations are explained**
	Every recommendation must include a short plain-language reason label, for example:
	- "Because you follow NBA and this impacts playoff seeding"
	- "Because your team plays this opponent next week"
	- "Because this is a nationally featured rivalry game"

6. **Location approach for ticket suggestions**
	Use ZIP code **80222** as the default location for MVP with optional browser geolocation as a secondary enhancement.
	Manual location remains the primary control so the user can change the ZIP code when needed.

7. **Read-only vs reminders**
	MVP is **read-only plus preference editing** (favorites, ZIP code, watch priorities).
	Push alerts/reminders are out of scope for first release and planned for phase 2.

## Assumptions to validate after MVP usage

1. API coverage is sufficient for where-to-watch data across all target leagues.
2. Reason-label explanations are enough to build trust without full transparent scoring math.
3. Manual location entry is acceptable as the default for ticket relevance.
4. Favorite-first scheduling meets user expectations better than pure "best game" ranking.
