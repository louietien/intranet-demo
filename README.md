# Intranet Demo

A public, non-branded demo of a company intranet built with Next.js 15 (App Router).
This is a portfolio piece — a fork of a real internal tool with every company-specific
integration and piece of branding stripped out and replaced with fictional data.

## What's here

- News feed with comments and markdown posts
- Knowledge base with a full markdown editor (image paste/drop, live preview)
- People directory and an org chart
- Shared files, personal sticky notes, and a team calendar
- Dark mode, a maintenance-mode toggle, and a ⌘K command palette

## What's different from the original

The original app authenticates via Azure Entra ID and talks to a self-hosted
PocketBase instance, Microsoft Graph, Monday.com, and Slack. None of that is
appropriate to ship in a public demo, so this fork:

- Has no login — you land straight in the app as a fixed demo user
- Replaces every backend call with a small localStorage-backed mock store
  (`lib/mockStore.ts`, seeded from `lib/mockData.ts`) — anything you create
  (a note, a post, a KB article) persists only in your own browser
- Ships as a static export (`next build` with `output: 'export'`) with no
  server and no secrets, deployable to Cloudflare Workers as static assets

One consequence of being a static export: brand-new items you create at
runtime (not part of the seed data) don't get their own pre-rendered URL —
they expand inline in the list instead of linking to a detail page.

## Local dev

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

Builds a static export to `out/` and deploys it to Cloudflare Workers via
`wrangler` (see `wrangler.toml`).
