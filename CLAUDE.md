# Odat Marafoni

30 kunlik odat kuzatuvchi + 3 oylik maqsad rejalashtiruvchi — o'zbek tilidagi, offline-first PWA. No build step, no framework: everything is hand-written HTML/CSS/vanilla JS.

## Layout

This git repo (`odat-marafoni`) is the `app/` half of a two-part project. The sibling `push-server/` folder (one level up) is a **separate git repo** (`odat-marafoni-push-server`) holding a Cloudflare Worker that is deployed independently via `wrangler`, not via git. The parent `odat-marafoni-deploy/` folder is not a repo — it only groups the two and holds a setup guide.

```
odat-marafoni-deploy/                  <- plain folder, not a git repo
├── README-OZBEKCHA.txt                end-user setup walkthrough (Uzbek); contains real secret values -- keep it out of git
├── app/                               <- this repo (deployed to GitHub Pages)
│   ├── index.html                     single-file app: markup + CSS + JS, all inline
│   ├── sw.js                          service worker (offline cache + push handling)
│   ├── manifest.json                  PWA manifest
│   └── icon-*.png
└── push-server/                       <- its own repo; deployed with `npx wrangler deploy`
    ├── CLAUDE.md                      detailed push-server docs (read this before touching the Worker)
    ├── worker.js                      Cloudflare Worker: push-notification backend
    ├── wrangler.toml
    └── package.json
```

Deploys are independent and manual:
- `app/` → push to `origin main` → GitHub Pages picks it up.
- `push-server/` → `cd push-server && npx wrangler deploy` (only needed when `worker.js` / `wrangler.toml` change). Pushing that repo to GitHub only stores the source; it does not deploy.

There is no CI linking the two.

## app/index.html

Single IIFE, no modules, no dependencies. Structure:
- **State**: one JS object persisted to `localStorage['odat-marafoni-state']` (habits, 30-day `logs`, `journal`, `goals`, `archive`, `reminder`, `push`). `normalizeState()` re-derives it defensively on every load so old/malformed saved shapes never crash rendering.
- **Derived stats**: `computeAll()` recalculates streaks, completion rates, XP/level, and weekly aggregates from `state` on every render — nothing derived is stored.
- **Sections rendered into the page**: hero stat cards, pomodoro/focus timer, 3-month goals (optionally linked to a habit's completion count), the 30-day habit grid, weekly bar chart, leaderboard, achievements, journal, settings (including push notification subscribe/unsubscribe).
- **Reminders, two independent mechanisms**:
  1. In-page/periodic-sync best-effort reminder — only fires if the browser decides to wake the service worker while the tab/app was recently open. Settings mirrored into IndexedDB (`idbSetReminder`) because a service worker cannot read `localStorage`.
  2. Real Web Push (`pushSubscribe()` / `pushUnsubscribe()`) — subscribes via the Push API against the `push-server` Worker so notifications arrive even with the app, browser, and screen fully closed. This is the mechanism `push-server/` exists to support.
- `PUSH_SHARED_SECRET` in this file is a public, client-visible string. It only deters casual bots from spamming the Worker's `/subscribe` endpoint — it is not real auth, since anyone can read it out of the page source.

## app/sw.js

Stale-while-revalidate cache for offline use, plus:
- `periodicsync` handler: best-effort fallback reminder check (see above).
- `push` handler: shows the notification whenever the Worker actually pushes one — this is the path that works with the app fully closed.

## push-server/worker.js — Cloudflare Worker

Full details live in `../push-server/CLAUDE.md`; the short version:

- Stateless HTTP + cron backend. Subscribers (endpoint, keys, timezone, reminder time, `lastFiredDate`) are stored as one JSON blob in a KV namespace (`PUSH_KV`).
- Endpoints: `GET /health`, `GET /vapid-public-key`, `POST /subscribe`, `POST /unsubscribe`, `GET /debug-status`, `POST /debug-run-now` (subscribe/unsubscribe/debug routes gated by `x-push-key` == `SHARED_SECRET`).
- `scheduled()` runs every minute (cron in `wrangler.toml`), computes each subscriber's local time via `Intl.DateTimeFormat`, and pushes only to those who are due and haven't fired today. Dead subscriptions (HTTP 404/410) are removed.
- This file's side of the contract: `pushSubscribe()` fetches `/vapid-public-key`, subscribes via the Push API, then POSTs `{subscription, timezone, time}` to `/subscribe`; changing the reminder time re-POSTs it. Keep route names, the `x-push-key` header and body shapes in sync with the Worker.

### Why `@block65/webcrypto-web-push` instead of the standard `web-push` library

The usual way to send Web Push is the `web-push` npm package, but it is built for Node (Node `crypto`/`https`) and **did not work on Cloudflare Workers**, so the Worker was migrated to `@block65/webcrypto-web-push`. That library does the same job (VAPID JWT signing + RFC 8291 payload encryption) with only the standard Web Crypto API (`crypto.subtle`), which Workers provides natively. It only *builds* the request: `worker.js` calls `buildPushPayload(message, subscription, vapid)` and sends the result with a plain `fetch(endpoint, payload)` instead of `webpush.sendNotification(...)`.

Don't reintroduce `web-push` while the backend targets Workers. (It would become viable again on a Node runtime.)

## Conventions

- No build tooling anywhere in `app/` — edit `index.html`/`sw.js` directly, no transpile/bundle step.
- Visual design ("The Zij Sky": lapis night, brass stars, sky chart) is documented in `DESIGN.md`; product context is in `PRODUCT.md`. Keep new UI inside that system: one rosette star shape, drawn SVG icons from the `<symbol>` sprite at the top of `<body>` (no emoji as UI icons), tokens from the `:root` custom properties.
- The hero renders a generated SVG sky (`skySvg()` in `index.html`) with two layouts (wide / phone) chosen by the container width.
- `sw.js`'s `CACHE_NAME` (`odat-marafoni-v4`) must be bumped whenever cached asset contents change, or returning visitors keep the stale cache.
- Keep `PUSH_SHARED_SECRET` in `index.html` and `SHARED_SECRET` (the Worker secret set via `wrangler secret put`) equal — they're compared directly, no hashing.
- This repo is public. The only secret-ish value that belongs here is `PUSH_SHARED_SECRET` (public by design). Never add the VAPID **private** key or any other credential to this repo or its docs.
