export const APP_VERSION = '1.10.0'

export const CHANGELOG_MD = `
### About this build
This is a public, non-branded demo fork of a real internal company intranet — the version
number and history below carry over from that original app. A few things described in
older entries (Slack, SSO, live cron jobs) were part of the real app but don't exist in
this fork; everything here now runs on mock data stored in your own browser. See the
README for what's real vs. simulated.

---

## v1.10.0 — 24 Aug 2026

### New Features
- **Birthday notifications** — New scheduled job checks a people-data table for today's birthdays and posts a notification, resolving names via a directory API

### Fixes
- **Home page Upcoming calendar** — Past events no longer linger in the sidebar list; only events on or after today are shown
- **Traffic widget** — Driving directions now route to a separate destination from the transit route

---

## v1.9.4 — 28 Jul 2026

### Fixes
- **Embedded widget** — Masked a broken link in a third-party embedded widget (fixed bottom-right corner, linked to a dead URL)

---

## v1.9.3 — 26 Jun 2026

### Design
- **Border-radius hierarchy** — Cards use 16px, hero/pinned card uses 24px, quick link tiles use 10px; no more one-size-fits-all 20px
- **Quick links 3-column grid** — 2×3 grid replaces 5+1 orphan layout
- **Service Status card wider** — flex ratio 1.6× vs Weather/Commute to fit uptime bars
- **Pinned card wave removed** — decorative SVG wave replaced with brand-purple radial glow
- **Sidebar rhythm** — Gap increased 20→28px; Leave/Celebrations/Events cards use surface background to differentiate from Team card
- **Eyebrow overload removed** — Eliminated redundant dot+ALL-CAPS eyebrow labels from Quick Links, Team, Leave, and Pinned sections
- **⌘K badge removed** — Shortcut still works silently; badge implied a command palette that didn't exist
- **Recent news label** — Replaced all-caps eyebrow treatment with plain weighted label

---

## v1.9.2 — 25 Jun 2026

### Design
- **Brand rebrand** — Replaced warm beige + purple palette with a navy topbar (#1F2546), clean blue-white page background, and blue accent (#2351CC)
- **Dark navy topbar** — TopBar always uses the brand navy; white logo, white nav links, active pill
- **Dark mode consistency** — Dedicated \`--c-topbar\` token keeps topbar and pinned post card dark navy in both light and dark mode

---

## v1.9.1 — 25 Jun 2026

### New Features
- **Comment notifications** — Post authors receive a DM when someone comments on their news post (skips self-comments; silently skips if author has no account on the notification platform)

---

## v1.9.0 — 25 Jun 2026

### New Features
- **Markdown news posts** — Post body now renders with full formatting: bold, headings, lists, tables, code blocks
- **Markdown compose editor** — News post compose modal now uses the markdown editor with toolbar and live preview
- **Edit news posts** — Pencil button on feed cards and detail page lets authors (and admins) edit any post after publishing

### Fixes
- Post previews (feed cards, pinned announcement) now strip markdown syntax, table rows, and code fences

---

## v1.8.1 — 15 Jun 2026

### Fixes
- Fixed comment avatars not displaying correctly on news post detail page
- Fixed TypeScript build error: author email possibly undefined in CommentSection

---

## v1.8 — 9 Jun 2026

### New Features
- **User impersonation** — Admins can impersonate any team member via the TopBar. Notes, post authorship, and all identity-dependent views reflect the impersonated user. An amber banner indicates active impersonation with a one-click exit. Resets when the tab closes.

### Improvements
- **Deletion guards** — News posts and KB articles now only show edit/delete controls to the original author. Admins can delete anything regardless of authorship.

---

## v1.7 — 8 Jun 2026

### Improvements
- **Traffic widget** — Next departure time now shown below the transit row

---

## v1.6 — 4 Jun 2026

### Improvements
- **KB editor on mobile** — Editor now opens in stacked (single-column) layout on mobile; metadata fields collapse to single column; shortcuts panel hidden; page padding tightened
- **KB tables on mobile** — Tables in KB articles now scroll horizontally instead of overflowing
- **News cards** — Entire post card is now clickable, not just the title
- **Dark mode inputs** — All text fields now consistently use the same dark-mode background token; previously some were hardcoded white or near-black
- **Bottom nav** — "Docs" tab renamed to "KBase"

### Fixes
- Fixed org chart connector lines not aligning correctly for non-leaf nodes
- Fixed org chart cards using inconsistent heights and too little horizontal spacing
- Fixed org chart horizontal scroll appearing on wide trees
- Fixed org chart connector rendering using clipPath to bridge gaps between subtrees

---

## v1.5 — 2 Jun 2026

### New Features
- **Mobile layout** — Bottom tab bar navigation (Home, News, People, Docs, Search), responsive layouts across all pages
- **Search page** — Full search input on the Search page; no longer requires ⌘K

### Improvements
- TopBar collapses to logo + avatar on mobile; nav and search bar hidden
- Quick links grid switches to 3 columns on mobile for better readability
- Docs sidebar hidden on mobile; article list fills full width
- KB article "On this page" TOC hidden on mobile
- People grid adapts to 2-column layout on small screens

---

## v1.4 — 28 May 2026

### Fixes
- Fixed people page loading indefinitely after long idle sessions — silent token renewal failures now trigger a clean re-login instead of leaving the app stuck
- Fixed "We couldn't sign you in" error caused by multiple concurrent login redirects overwriting each other's auth state
- Fixed session expiry handling for auth iframe timeout errors

---

## v1.3 — 27 May 2026

### New Features
- **Org Chart** — People page now includes an interactive org chart view built from directory manager relationships

### Improvements
- Service Status widget now tracks region-specific server health instead of the global platform status

---

## v1.2 — 26 May 2026

### Fixes
- Fixed session expiry opening multiple browser tabs — auth failures in background data hooks now trigger a single clean page reload, handing off to the normal sign-in flow instead of calling a login redirect directly from a polling interval

---

## v1.1 — 24 May 2026

### New Features
- **Notes (Beta)** — Personal sticky notes with drag-to-reorder and full markdown rendering
- **KB Editor** — Fullscreen mode, scrollable split preview, and sync-scroll toggle

### Security
- Credentials moved server-side: database auth, third-party API keys, webhook URLs
- New auth-gated proxy routes for the database, photo sync, and leave data
- Ownership enforcement on all database write operations

### Fixes & Improvements
- Fixed stale auth cache causing people and profile page load failures
- Search bar now centered relative to the full navbar width
- Improved error messages and empty date field handling
- KB article creation now sets last reviewed date to today

---

## v1.0 — 22 May 2026

### Initial Release
- Home dashboard with news feed, calendar, who's out, and celebrations
- News, People, Knowledge Base, Files, and Search
- Single sign-on via a corporate identity provider
- Group calendar integration
- Employee photo sync
- Dark mode toggle
- Maintenance mode for designated admins
`.trim()
