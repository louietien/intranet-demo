# Changelog

## Fork note

This repo is a public, non-branded demo fork of a real internal company intranet. The
version number and history below carry over from that original app, anonymized of any
company-identifying detail. The fork itself — stripping Azure/MSAL login, PocketBase,
Microsoft Graph, Monday.com, and Slack, and replacing every backend call with a
localStorage-backed mock data layer so it can run as a static export with no backend at
all — isn't a versioned entry below; it's the reason this repo exists.

## v1.10.0 — 24 Aug 2026

### New Features
- Birthday notifications — scheduled job checks a people-data table for today's birthdays and posts a notification, resolving names via a directory API

### Fixes
- Home page Upcoming calendar — past events no longer linger in the sidebar list; only events on or after today are shown
- Traffic widget — driving directions now route to a separate destination from the transit route

## v1.9.4 — 28 Jul 2026

### Fixes
- Embedded widget — masked a broken link in a third-party embedded widget

## v1.9.3 — 26 Jun 2026

### Design
- Border-radius hierarchy, quick links 3-column grid, wider Service Status card, pinned card glow instead of a decorative wave, tighter sidebar rhythm, removed redundant eyebrow labels and the unused ⌘K badge, plain "Recent news" label

## v1.9.2 — 25 Jun 2026

### Design
- Brand rebrand — navy topbar (#1F2546), clean blue-white page background, blue accent (#2351CC), dark-mode-consistent topbar token

## v1.9.1 — 25 Jun 2026

### New Features
- Comment notifications — post authors get notified when someone comments on their news post

## v1.9.0 — 25 Jun 2026

### New Features
- Markdown news posts, markdown compose editor, edit-in-place for news posts

### Fixes
- Post previews now strip markdown syntax, table rows, and code fences

## v1.8.1 — 15 Jun 2026

### Fixes
- Comment avatars on the news post detail page; a TypeScript build error in CommentSection

## v1.8 — 9 Jun 2026

### New Features
- User impersonation for admins, with an exit banner

### Improvements
- Deletion guards — only the original author (or an admin) sees edit/delete controls

## v1.7 — 8 Jun 2026

### Improvements
- Traffic widget shows next transit departure time

## v1.6 — 4 Jun 2026

### Improvements
- KB editor and tables adapted for mobile, fully clickable news cards, consistent dark-mode input backgrounds, "Docs" renamed to "KBase"

### Fixes
- Org chart connector/alignment/scroll fixes

## v1.5 — 2 Jun 2026

### New Features
- Mobile layout with bottom tab bar navigation; full search input on the Search page

### Improvements
- Responsive layout adjustments across TopBar, quick links, docs sidebar, KB TOC, and people grid

## v1.4 — 28 May 2026

### Fixes
- Auth session/token renewal fixes (stuck loading states, concurrent login redirects, iframe timeout handling)

## v1.3 — 27 May 2026

### New Features
- Org chart view built from directory manager relationships

### Improvements
- Service Status widget tracks region-specific server health

## v1.2 — 26 May 2026

### Fixes
- Session expiry no longer opens multiple browser tabs

## v1.1 — 24 May 2026

### New Features
- Notes (Beta) with drag-to-reorder and markdown; KB editor fullscreen mode and sync-scroll

### Security
- Credentials moved server-side; auth-gated proxy routes; ownership enforcement on writes

### Fixes & Improvements
- Stale auth cache fix, centered search bar, better error messages, KB review-date default

## v1.0 — 22 May 2026

### Initial Release
- Home dashboard, News, People, Knowledge Base, Files, Search
- Single sign-on via a corporate identity provider, group calendar integration, employee photo sync, dark mode, maintenance mode
