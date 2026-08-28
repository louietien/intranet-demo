import type {
  User, Pin, QuickLink, LeaveEntry, CalendarEvent, KbArticle, KbSectionRecord,
  PeopleExtra, DocumentRecord, MaintenanceState,
} from '../types'

// Fictional company + team used to seed the demo. None of this reflects any real
// organization or person — it exists purely so every page has something to show.

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function isoDateTime(d: Date): string {
  return d.toISOString()
}

function monthDay(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// A historical year with the month/day of `d` — used to fabricate a hire date that
// lands an anniversary on a specific day relative to "today".
function pastDateWithMonthDay(d: Date, yearsAgo: number): string {
  return isoDate(new Date(d.getFullYear() - yearsAgo, d.getMonth(), d.getDate()))
}

export const DEMO_USER_EMAIL = 'alex.morgan@acme.demo'

export const TEAM: User[] = [
  {
    id: 'demo-alex-morgan', name: 'Alex Morgan', email: 'alex.morgan@acme.demo',
    role: 'Product Lead', department: 'Product', status: 'online',
    officeLocation: 'Remote — Austin, TX', phone: '+1 555 0142',
  },
  {
    id: 'demo-jordan-lee', name: 'Jordan Lee', email: 'jordan.lee@acme.demo',
    role: 'Founder & CEO', department: 'Leadership', status: 'online',
    officeLocation: 'HQ — Downtown Office',
  },
  {
    id: 'demo-sam-osei', name: 'Sam Osei', email: 'sam.osei@acme.demo',
    role: 'Head of Engineering', department: 'Engineering', status: 'focus',
    manager: { name: 'Jordan Lee', email: 'jordan.lee@acme.demo', role: 'Founder & CEO' },
    officeLocation: 'HQ — Downtown Office',
  },
  {
    id: 'demo-priya-nair', name: 'Priya Nair', email: 'priya.nair@acme.demo',
    role: 'Senior Engineer', department: 'Engineering', status: 'meeting',
    manager: { name: 'Sam Osei', email: 'sam.osei@acme.demo', role: 'Head of Engineering' },
    officeLocation: 'Remote — Toronto, ON',
  },
  {
    id: 'demo-marco-silva', name: 'Marco Silva', email: 'marco.silva@acme.demo',
    role: 'Product Designer', department: 'Design', status: 'away',
    manager: { name: 'Alex Morgan', email: 'alex.morgan@acme.demo', role: 'Product Lead' },
    officeLocation: 'Remote — Lisbon',
  },
  {
    id: 'demo-hana-kimura', name: 'Hana Kimura', email: 'hana.kimura@acme.demo',
    role: 'Head of Marketing', department: 'Marketing', status: 'online',
    manager: { name: 'Jordan Lee', email: 'jordan.lee@acme.demo', role: 'Founder & CEO' },
    officeLocation: 'HQ — Downtown Office',
  },
  {
    id: 'demo-liam-oconnor', name: "Liam O'Connor", email: 'liam.oconnor@acme.demo',
    role: 'Client Consultant', department: 'Consulting', status: 'oof',
    manager: { name: 'Jordan Lee', email: 'jordan.lee@acme.demo', role: 'Founder & CEO' },
    officeLocation: 'Remote — Dublin',
  },
  {
    id: 'demo-nadia-haddad', name: 'Nadia Haddad', email: 'nadia.haddad@acme.demo',
    role: 'Operations Manager', department: 'Operations', status: 'online',
    manager: { name: 'Jordan Lee', email: 'jordan.lee@acme.demo', role: 'Founder & CEO' },
    officeLocation: 'HQ — Downtown Office',
  },
]

export function buildSeedPeopleExtras(now: Date): PeopleExtra[] {
  return [
    {
      id: 'extra-priya', email: 'priya.nair@acme.demo',
      birthday: monthDay(addDays(now, 4)),
      hireDate: pastDateWithMonthDay(addDays(now, 25), 3),
      bio: 'Full-stack engineer who cares a lot about developer experience and slightly too much about keyboard shortcuts.',
      skills: 'TypeScript, React, System Design, Mentoring',
    },
    {
      id: 'extra-marco', email: 'marco.silva@acme.demo',
      birthday: monthDay(addDays(now, 40)),
      hireDate: pastDateWithMonthDay(addDays(now, 8), 1),
      bio: 'Product designer, coffee enthusiast, occasional conference speaker.',
      skills: 'Figma, Design Systems, User Research',
    },
    {
      id: 'extra-hana', email: 'hana.kimura@acme.demo',
      birthday: monthDay(addDays(now, 120)),
      hireDate: pastDateWithMonthDay(addDays(now, -3), 5),
      bio: 'Runs marketing and moonlights as the office DJ for launch parties.',
      skills: 'Brand, Content Strategy, Community',
    },
    {
      id: 'extra-sam', email: 'sam.osei@acme.demo',
      birthday: monthDay(addDays(now, -60)),
      hireDate: pastDateWithMonthDay(addDays(now, 200), 4),
      bio: 'Leads engineering. Firm believer that the best code is the code you delete.',
      skills: 'Architecture, Go, Team Leadership',
    },
    {
      id: 'extra-liam', email: 'liam.oconnor@acme.demo',
      birthday: monthDay(addDays(now, 200)),
      hireDate: pastDateWithMonthDay(addDays(now, -150), 2),
      bio: 'Client-facing consultant, usually mid-flight between engagements.',
      skills: 'Delivery, Stakeholder Management',
    },
  ]
}

export function buildSeedLeaveEntries(now: Date): LeaveEntry[] {
  return [
    {
      id: 'leave-liam', name: "Liam O'Connor", email: 'liam.oconnor@acme.demo',
      from: isoDate(addDays(now, -1)), to: isoDate(addDays(now, 2)),
      type: 'Vacation (full-day)', status: 'approved', manual: false,
    },
    {
      id: 'leave-hana', name: 'Hana Kimura', email: 'hana.kimura@acme.demo',
      from: isoDate(addDays(now, 6)), to: isoDate(addDays(now, 9)),
      type: 'Vacation (full-day)', status: 'approved', manual: false,
    },
  ]
}

export function buildSeedEvents(now: Date): CalendarEvent[] {
  const events: Array<Omit<CalendarEvent, 'attendees'> & { attendeeIds: string[] }> = [
    {
      id: 'event-standup', title: 'Weekly product sync', date: isoDate(addDays(now, 1)),
      time: '10:00 — 10:30', where: 'Video call', kind: 'team',
      attendeeIds: ['demo-alex-morgan', 'demo-sam-osei', 'demo-marco-silva'],
    },
    {
      id: 'event-client', title: 'Client kickoff — Northwind rollout', date: isoDate(addDays(now, 3)),
      time: '13:00 — 14:00', where: 'Downtown Office, Room 2', kind: 'client',
      attendeeIds: ['demo-liam-oconnor', 'demo-jordan-lee'],
    },
    {
      id: 'event-allhands', title: 'Company all-hands', date: isoDate(addDays(now, 5)),
      time: '16:00 — 17:00', where: 'Main hall + video call', kind: 'company',
      attendeeIds: TEAM.map(t => t.id),
    },
    {
      id: 'event-design-review', title: 'Design system review', date: isoDate(addDays(now, 8)),
      time: '11:00 — 12:00', where: 'Video call', kind: 'team',
      attendeeIds: ['demo-marco-silva', 'demo-alex-morgan'],
    },
    {
      id: 'event-onboarding', title: 'New hire onboarding', date: isoDate(addDays(now, -2)),
      time: '09:00 — 12:00', where: 'Downtown Office', kind: 'company',
      attendeeIds: ['demo-nadia-haddad'],
    },
  ]
  const byId = new Map(TEAM.map(u => [u.id, u]))
  return events.map(({ attendeeIds, ...e }) => ({
    ...e,
    attendees: attendeeIds.map(id => byId.get(id)).filter((u): u is User => Boolean(u)),
  }))
}

export function buildSeedNewsPosts(now: Date): Pin[] {
  const author = TEAM.find(u => u.email === 'hana.kimura@acme.demo')!
  const author2 = TEAM.find(u => u.id === 'demo-jordan-lee')!
  return [
    {
      id: 'post-seed-1',
      tag: 'Company win',
      title: 'Northwind just signed for the full platform rollout',
      body: 'After a six-week discovery process, the team closed our largest engagement of the year. Kickoff happens next Tuesday — Liam will own delivery, with Sam\'s team handling the technical build.\n\nGreat work from everyone who pitched in on the proposal.',
      cta: { label: 'Read the brief', href: '#' },
      author: author2,
      postedAt: isoDateTime(addDays(now, -1)),
    },
    {
      id: 'post-seed-2',
      tag: 'Product',
      title: 'New KB search is live',
      body: 'Fuzzy search now covers people, news, and knowledge base articles from one search bar. Try it with `⌘K` or the Search tab.',
      cta: { label: 'Try it out', href: '#' },
      author: TEAM.find(u => u.id === 'demo-alex-morgan')!,
      postedAt: isoDateTime(addDays(now, -3)),
    },
    {
      id: 'post-seed-3',
      tag: 'Team',
      title: 'Welcome Nadia to Operations',
      body: 'Please give a warm welcome to Nadia, joining as our new Operations Manager. She\'ll be helping streamline how we run internal processes.',
      cta: { label: 'Say hi', href: '#' },
      author,
      postedAt: isoDateTime(addDays(now, -6)),
    },
  ]
}

export const SEED_NEWS_POST_IDS = new Set(['post-seed-1', 'post-seed-2', 'post-seed-3'])

export const QUICK_LINKS: QuickLink[] = [
  { id: 'tracker', icon: 'monday', label: 'Project Tracker', href: '#' },
  { id: 'crm', icon: 'sugar', label: 'CRM', href: '#' },
  { id: 'roadmap', icon: 'journey', label: 'Roadmap', href: '#' },
  { id: 'automation', icon: 'make', label: 'Automation Hub', href: '#' },
  { id: 'drive', icon: 'drive', label: 'Drive', href: '#' },
  { id: 'hr', icon: 'hr', label: 'HR & Leave', href: '#' },
  { id: 'time', icon: 'time', label: 'Time tracking', href: '#' },
  { id: 'handbook', icon: 'handbook', label: 'Handbook', href: '#' },
  { id: 'helpdesk', icon: 'helpdesk', label: 'Helpdesk', href: '#' },
]

export const DEFAULT_MAINTENANCE: MaintenanceState = {
  enabled: false,
  message: 'The intranet is currently undergoing maintenance. Please check back shortly.',
  enabledBy: '',
  enabledAt: '',
}

export const MAINTENANCE_ADMINS: string[] = [DEMO_USER_EMAIL]

export const KB_SECTIONS: KbSectionRecord[] = [
  { id: 'sec-getting-started', key: 'getting-started', title: 'Getting Started', navOrder: 1 },
  { id: 'sec-engineering', key: 'engineering', title: 'Engineering', navOrder: 2 },
  { id: 'sec-people', key: 'people-culture', title: 'People & Culture', navOrder: 3 },
  { id: 'sec-tools', key: 'tools-access', title: 'Tools & Access', navOrder: 4 },
]

export function buildSeedKbArticles(now: Date): KbArticle[] {
  const created = isoDateTime(addDays(now, -40))
  const reviewed = isoDate(addDays(now, -10))
  const articles: Array<Omit<KbArticle, 'created' | 'updated' | 'lastReviewed'>> = [
    {
      id: 'kb-seed-welcome',
      title: 'Welcome to the team',
      content: '## Welcome!\n\nThis is your first stop for everything you need to get set up.\n\n- Set up your laptop with IT\n- Join the #general and #random channels\n- Book time with your manager for a 1:1\n\nMore detail in the sections on the left.',
      summary: 'Start here — accounts, tools, and your first week.',
      section: 'getting-started', category: 'onboarding', status: 'active',
      tags: ['onboarding', 'new-hire'], owners: ['demo-nadia-haddad'], authorEmail: 'nadia.haddad@acme.demo',
    },
    {
      id: 'kb-seed-git',
      title: 'Git workflow & branching',
      content: '## Branching model\n\nWe use trunk-based development with short-lived feature branches.\n\n```\ngit checkout -b feature/my-change\ngit push -u origin feature/my-change\n```\n\nOpen a PR against `main` when ready for review.',
      summary: 'How we branch, review, and ship code.',
      section: 'engineering', category: 'workflow', status: 'active',
      tags: ['git', 'workflow'], owners: ['demo-sam-osei'], authorEmail: 'sam.osei@acme.demo',
    },
    {
      id: 'kb-seed-oncall',
      title: 'On-call rotation',
      content: '## Rotation\n\nEngineering runs a weekly on-call rotation. Check the roster in the team calendar.\n\n### Escalation\n\n1. Page the on-call engineer\n2. If no response in 15 minutes, escalate to the team lead',
      summary: 'How the on-call rotation and escalation works.',
      section: 'engineering', category: 'operations', status: 'active',
      tags: ['on-call', 'incidents'], owners: ['demo-sam-osei'], authorEmail: 'sam.osei@acme.demo',
    },
    {
      id: 'kb-seed-timeoff',
      title: 'Requesting time off',
      content: '## How it works\n\nSubmit time-off requests through the HR & Leave tool at least a week in advance where possible. Your manager will approve or follow up.',
      summary: 'How to request vacation and track your balance.',
      section: 'people-culture', category: 'benefits', status: 'active',
      tags: ['time-off', 'hr'], owners: ['demo-nadia-haddad'], authorEmail: 'nadia.haddad@acme.demo',
    },
    {
      id: 'kb-seed-tools',
      title: 'Requesting software access',
      content: '## Access requests\n\nFile a request through the Helpdesk quick link. Most tools are provisioned within one business day.',
      summary: 'How to get access to internal tools and software.',
      section: 'tools-access', category: 'it', status: 'draft',
      tags: ['it', 'access'], owners: ['demo-nadia-haddad'], authorEmail: 'nadia.haddad@acme.demo',
    },
  ]
  return articles.map(a => ({ ...a, created, updated: created, lastReviewed: reviewed }))
}

export const SEED_KB_ARTICLE_IDS = new Set([
  'kb-seed-welcome', 'kb-seed-git', 'kb-seed-oncall', 'kb-seed-timeoff', 'kb-seed-tools',
])

export function buildSeedDocuments(now: Date): DocumentRecord[] {
  const created = isoDateTime(addDays(now, -20))
  return [
    {
      id: 'doc-seed-handbook', collectionId: 'documents', title: 'Employee Handbook 2026',
      description: 'Policies, benefits, and expectations for everyone at the company.',
      category: 'HR', fileName: 'employee-handbook-2026.pdf',
      uploadedByName: 'Nadia Haddad', uploadedByEmail: 'nadia.haddad@acme.demo', created,
    },
    {
      id: 'doc-seed-brand', collectionId: 'documents', title: 'Brand Guidelines',
      description: 'Logo usage, color palette, and voice & tone guide.',
      category: 'Marketing', fileName: 'brand-guidelines.pdf',
      uploadedByName: 'Hana Kimura', uploadedByEmail: 'hana.kimura@acme.demo', created,
    },
    {
      id: 'doc-seed-eng', collectionId: 'documents', title: 'Engineering Onboarding Checklist',
      description: 'Step-by-step setup guide for new engineers.',
      category: 'Engineering', fileName: 'eng-onboarding-checklist.pdf',
      uploadedByName: 'Sam Osei', uploadedByEmail: 'sam.osei@acme.demo', created,
    },
  ]
}
