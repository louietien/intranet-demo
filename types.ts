export type Status = 'online' | 'focus' | 'meeting' | 'away' | 'off' | 'oof'

export type User = {
  id: string
  name: string
  role: string
  status: Status
  statusNote?: string
  avatarUrl?: string
  email?: string
  department?: string
  phone?: string
  officeLocation?: string
  birthday?: string
  manager?: { name: string; email: string; role: string }
  directReports?: User[]
}

export type Pin = {
  id: string
  tag: string
  title: string
  body: string
  cta: { label: string; href: string }
  author: User
  postedAt: string
}

export type QuickLink = {
  id: string
  icon: string
  label: string
  href: string
  badge?: number
  description?: string
}

export type Reaction = { emoji: string; count: number; mine: boolean }

export type Attachment = {
  name: string
  meta: string
  href: string
}

export type Post = {
  id: string
  author: User
  postedAt: string
  body: string
  attachment?: Attachment
  reactions: Reaction[]
  comments: number
  tags: Array<'team' | 'wins' | 'updates'>
}

export type LeaveEntry = {
  id: string
  name: string
  from: string
  to: string
  type: 'Vacation (full-day)' | 'Vacation (half-day)'
  status: string
  email: string
  manual: boolean
}

export type DocumentRecord = {
  id: string
  collectionId: string
  title: string
  description: string
  category: string
  fileName: string
  fileUrl?: string
  uploadedByName: string
  uploadedByEmail: string
  created: string
}

export type Comment = {
  id: string
  postId: string
  body: string
  authorName: string
  authorEmail: string
  created: string
}

export type PeopleExtra = {
  id: string
  email: string
  birthday: string | null
  hireDate: string | null
  bio: string
  skills: string
}

export type EventKind = 'team' | 'client' | 'company' | 'personal'

export type CalendarEvent = {
  id: string
  title: string
  date: string
  time: string
  where: string
  kind: EventKind
  attendees: User[]
  source?: 'pb' | 'graph'
}

export type KbStatus = 'draft' | 'active' | 'deprecated'
export type KbSection = string

export type KbSectionRecord = {
  id: string
  key: string
  title: string
  navOrder: number
}

export type KbArticle = {
  id: string
  title: string
  content: string
  summary: string
  section: KbSection
  category: string
  status: KbStatus
  tags: string[]
  owners: string[]
  authorEmail: string
  lastReviewed: string
  created: string
  updated: string
}

export interface MaintenanceState {
  enabled: boolean
  message: string
  enabledBy: string
  enabledAt: string
}

export type NoteColor = 'default' | 'amber' | 'green' | 'purple' | 'navy' | 'red'

export type Note = {
  id: string
  title: string
  body: string
  color: NoteColor
  tags: string[]
  pinned: boolean
  sortOrder: number
  authorEmail: string
  x: number
  y: number
  created: string
  updated: string
}
