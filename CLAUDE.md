# Odat Marafoni

30 kunlik odat kuzatuvchi + 3 oylik maqsad rejalashtiruvchi — o'zbek tilidagi, offline-first PWA. No build step, no framework: everything is hand-written HTML/CSS/vanilla JS.

## Layout

This git repo is the `app/` half of a two-part project. The sibling `push-server/` folder (one level up, outside this repo) is a separate Cloudflare Worker deployed independently via `wrangler`, not via git.

```
odat-marafoni-deploy/
├── app/                  <- this repo (deployed to GitHub Pages)
│   ├── index.html        single-file app: markup + CSS + JS, all inline
│   ├── sw.js             service worker (offline cache + push handling)
│   ├── manifest.json     PWA manifest
│   └── icon-*.png
└── push-server/          <- NOT a git repo; deployed with `npx wrangler deploy`
    ├── worker.js         Cloudflare Worker: push-notification backend
    ├── wrangler.toml
    └── package.json
```

Deploys are independent and manual:
- `app/` → push to `origin main` → GitHub Pages picks it up.
- `push-server/` → `cd push-server && npx wrangler deploy` (only needed when `worker.js` changes).

There is no CI linking the two. See `../README-OZBEKCHA.txt` for the full end-user setup walkthrough (in Uzbek).

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

Stateless HTTP + cron backend. Subscribers (endpoint, keys, timezone, reminder time, `lastFiredDate`) are stored as one JSON blob in a KV namespace (`PUSH_KV`).

Endpoints: `GET /health`, `GET /vapid-public-key`, `POST /subscribe`, `POST /unsubscribe`, `GET /debug-status`, `POST /debug-run-now` (all mutating/debug routes gated by `x-push-key` == `SHARED_SECRET`). `scheduled()` runs every minute via the cron trigger in `wrangler.toml` and calls `checkAndSendReminders()`, which walks every subscriber, computes their local time via `Intl.DateTimeFormat`, and sends a push only to the ones actually due (and not already fired today).

### Why `@block65/webcrypto-web-push` instead of the standard `web-push` library

The obvious choice for sending Web Push from Node is the `web-push` npm package, but **it does not run on Cloudflare Workers**. It builds VAPID JWTs and encrypts payloads using Node's `crypto` module and other Node-only APIs (streams, `http`/`https` agents) that the Workers runtime doesn't provide — importing it throws/fails in that environment even with `nodejs_compat` on.

`@block65/webcrypto-web-push` implements the same Web Push protocol (VAPID JWT signing + RFC 8291 payload encryption) using only the standard **Web Crypto API** (`crypto.subtle`), which Workers *does* support natively. That's the entire reason `worker.js` calls `buildPushPayload(message, subscription, vapid)` and does a plain `fetch(endpoint, payload)` to the push service, instead of `webpush.sendNotification(...)` — there is no server-side push library that works unmodified on Workers other than a webcrypto-based one like this.

If this backend is ever ported off Cloudflare Workers to a Node runtime, the standard `web-push` library becomes a viable (arguably simpler) option again — but as long as it targets Workers, it must stay on a webcrypto-based implementation.

## Conventions

- No build tooling anywhere in `app/` — edit `index.html`/`sw.js` directly, no transpile/bundle step.
- Visual design ("The Zij Sky": lapis night, brass stars, sky chart) is documented in `DESIGN.md`; product context is in `PRODUCT.md`. Keep new UI inside that system: one rosette star shape, drawn SVG icons from the `<symbol>` sprite at the top of `<body>` (no emoji as UI icons), tokens from the `:root` custom properties.
- The hero renders a generated SVG sky (`skySvg()` in `index.html`) with two layouts (wide / phone) chosen by the container width.
- `sw.js`'s `CACHE_NAME` (`odat-marafoni-v4`) must be bumped whenever cached asset contents change, or returning visitors keep the stale cache.
- Keep `PUSH_SHARED_SECRET` in `index.html` and `SHARED_SECRET` (the Worker secret set via `wrangler secret put`) equal — they're compared directly, no hashing.
