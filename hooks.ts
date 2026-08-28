'use client'
import { useState, useEffect, useCallback } from 'react'
import type { CalendarEvent, Comment, DocumentRecord, KbArticle, KbSectionRecord, LeaveEntry, MaintenanceState, Note, PeopleExtra, Pin, QuickLink, User } from './types'
import { useApp } from './context/app-context'
import { loadOrSeed, persist, loadSetting, persistSetting, makeId, readFileAsDataUrl } from './lib/mockStore'
import { slugify } from './lib/slugs'
import {
  TEAM, DEMO_USER_EMAIL, QUICK_LINKS, DEFAULT_MAINTENANCE, MAINTENANCE_ADMINS,
  KB_SECTIONS, buildSeedPeopleExtras, buildSeedLeaveEntries, buildSeedEvents,
  buildSeedNewsPosts, buildSeedKbArticles, buildSeedDocuments,
} from './lib/mockData'

export { MAINTENANCE_ADMINS }
export { slugify, articleSlug, articleIdFromSlug } from './lib/slugs'

// ---------- Team (fixed demo roster) ----------
export function useTeam() {
  const [team, setTeam] = useState<User[]>([])
  const [me, setMe] = useState<User>(TEAM.find(u => u.email === DEMO_USER_EMAIL) ?? TEAM[0])
  const [leaveEntries, setLeaveEntries] = useState<LeaveEntry[]>([])
  const [teamLoading, setTeamLoading] = useState(true)

  useEffect(() => {
    const meUser = TEAM.find(u => u.email === DEMO_USER_EMAIL) ?? TEAM[0]
    setMe(meUser)
    setTeam(TEAM.filter(u => u.id !== meUser.id).sort((a, b) => a.name.localeCompare(b.name)))
    setLeaveEntries(loadOrSeed('demo_leave_entries', () => buildSeedLeaveEntries(new Date())))
    setTeamLoading(false)
  }, [])

  return { team, me, teamLoading, teamError: null as string | null, leaveEntries }
}

// ---------- News posts ----------
export function useNewsPosts() {
  const [posts, setPosts] = useState<Pin[]>([])
  const [postsLoading, setPostsLoading] = useState(true)

  useEffect(() => {
    const loaded = loadOrSeed('demo_news_posts', () => buildSeedNewsPosts(new Date()))
    setPosts([...loaded].sort((a, b) => b.postedAt.localeCompare(a.postedAt)))
    setPostsLoading(false)
  }, [])

  async function addPost(
    draft: { tag: string; title: string; body: string; cta: { label: string; href: string } },
    author: User,
  ) {
    const post: Pin = {
      id: makeId('post'),
      tag: draft.tag,
      title: draft.title,
      body: draft.body,
      cta: draft.cta,
      author,
      postedAt: new Date().toISOString(),
    }
    setPosts(prev => {
      const next = [post, ...prev]
      persist('demo_news_posts', next)
      return next
    })
  }

  async function updatePost(
    id: string,
    draft: { tag: string; title: string; body: string; cta: { label: string; href: string } },
  ) {
    setPosts(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...draft } : p)
      persist('demo_news_posts', next)
      return next
    })
  }

  async function deletePost(id: string) {
    setPosts(prev => {
      const next = prev.filter(p => p.id !== id)
      persist('demo_news_posts', next)
      return next
    })
  }

  return { posts, postsLoading, addPost, updatePost, deletePost }
}

// ---------- Announcement ----------
export function useAnnouncement(posts: Pin[]) {
  return posts[0] ?? null
}

// ---------- Quick links ----------
export function useQuickLinks() {
  const [links, setLinks] = useState<QuickLink[]>(QUICK_LINKS)

  useEffect(() => {
    setLinks(loadSetting('demo_quick_links', () => QUICK_LINKS))
  }, [])

  async function updateLinks(next: QuickLink[]) {
    setLinks(next)
    persistSetting('demo_quick_links', next)
  }

  return { links, updateLinks }
}

// ---------- Who's Out ----------
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function useWhoIsOut(now?: Date) {
  const { leaveEntries, teamLoading } = useApp()

  const today = now ?? new Date()
  const todayKey = dateKey(today)
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + 7)
  const weekEndKey = dateKey(weekEnd)

  const todayOut = leaveEntries.filter(e => e.from <= todayKey && e.to >= todayKey)
  const soonOut = leaveEntries.filter(e => e.from > todayKey && e.from <= weekEndKey)

  return { todayOut, soonOut, loading: teamLoading, error: null }
}

// ---------- Events ----------
export function useUpcomingEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)

  useEffect(() => {
    const loaded = loadOrSeed('demo_events', () => buildSeedEvents(new Date()))
    setEvents([...loaded].sort((a, b) => a.date.localeCompare(b.date)))
    setEventsLoading(false)
  }, [])

  async function addEvent(event: CalendarEvent) {
    const saved = { ...event, id: event.id || makeId('event') }
    setEvents(prev => {
      const next = [...prev, saved].sort((a, b) => a.date.localeCompare(b.date))
      persist('demo_events', next)
      return next
    })
  }

  async function deleteEvent(id: string) {
    setEvents(prev => {
      const next = prev.filter(e => e.id !== id)
      persist('demo_events', next)
      return next
    })
  }

  async function updateEvent(event: CalendarEvent) {
    setEvents(prev => {
      const next = prev.map(e => e.id === event.id ? event : e).sort((a, b) => a.date.localeCompare(b.date))
      persist('demo_events', next)
      return next
    })
  }

  return { events, eventsLoading, addEvent, deleteEvent, updateEvent }
}

// ---------- Documents ----------
export function useDocuments() {
  const [docs, setDocs] = useState<DocumentRecord[]>([])
  const [docsLoading, setDocsLoading] = useState(true)

  useEffect(() => {
    const loaded = loadOrSeed('demo_documents', () => buildSeedDocuments(new Date()))
    setDocs([...loaded].sort((a, b) => b.created.localeCompare(a.created)))
    setDocsLoading(false)
  }, [])

  async function uploadDocument(
    file: File,
    meta: { title: string; description: string; category: string },
    uploader: User,
  ) {
    const fileUrl = await readFileAsDataUrl(file).catch(() => undefined)
    const doc: DocumentRecord = {
      id: makeId('doc'),
      collectionId: 'documents',
      title: meta.title,
      description: meta.description,
      category: meta.category,
      fileName: file.name,
      fileUrl,
      uploadedByName: uploader.name,
      uploadedByEmail: uploader.email ?? '',
      created: new Date().toISOString(),
    }
    setDocs(prev => {
      const next = [doc, ...prev]
      persist('demo_documents', next)
      return next
    })
  }

  async function deleteDocument(id: string) {
    setDocs(prev => {
      const next = prev.filter(d => d.id !== id)
      persist('demo_documents', next)
      return next
    })
  }

  return { docs, docsLoading, uploadDocument, deleteDocument }
}

// ---------- KB sections ----------
export function useKbSections() {
  const [sections, setSections] = useState<KbSectionRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loaded = loadOrSeed('demo_kb_sections', () => KB_SECTIONS)
    setSections([...loaded].sort((a, b) => a.navOrder - b.navOrder))
    setLoading(false)
  }, [])

  async function createSection(title: string): Promise<KbSectionRecord> {
    const section: KbSectionRecord = { id: makeId('sec'), key: slugify(title), title, navOrder: sections.length + 1 }
    setSections(prev => {
      const next = [...prev, section]
      persist('demo_kb_sections', next)
      return next
    })
    return section
  }

  async function updateSection(id: string, title: string): Promise<KbSectionRecord> {
    let updated: KbSectionRecord | undefined
    setSections(prev => {
      const next = prev.map(s => {
        if (s.id !== id) return s
        updated = { ...s, title }
        return updated
      })
      persist('demo_kb_sections', next)
      return next
    })
    return updated!
  }

  async function deleteSection(id: string) {
    setSections(prev => {
      const next = prev.filter(s => s.id !== id)
      persist('demo_kb_sections', next)
      return next
    })
  }

  async function reorderSection(id: string, direction: 'up' | 'down') {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (idx === -1) return prev
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= prev.length) return prev
      const reordered = [...prev]
      ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
      const withNewOrder = reordered.map((s, i) => ({ ...s, navOrder: i + 1 }))
      persist('demo_kb_sections', withNewOrder)
      return withNewOrder
    })
  }

  return { sections, sectionsLoading: loading, createSection, updateSection, deleteSection, reorderSection }
}

// ---------- Knowledge base ----------
export function useKbase() {
  const [articles, setArticles] = useState<KbArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loaded = loadOrSeed('demo_kb_articles', () => buildSeedKbArticles(new Date()))
    setArticles([...loaded].sort((a, b) => a.section.localeCompare(b.section) || a.title.localeCompare(b.title)))
    setLoading(false)
  }, [])

  async function createArticle(data: Omit<KbArticle, 'id' | 'created' | 'updated'>): Promise<KbArticle> {
    const now = new Date().toISOString()
    const article: KbArticle = { ...data, id: makeId('kb'), created: now, updated: now }
    setArticles(prev => {
      const next = [...prev, article].sort((a, b) => a.section.localeCompare(b.section) || a.title.localeCompare(b.title))
      persist('demo_kb_articles', next)
      return next
    })
    return article
  }

  async function updateArticle(id: string, data: Partial<Omit<KbArticle, 'id' | 'created' | 'updated'>>): Promise<KbArticle> {
    let updated: KbArticle | undefined
    setArticles(prev => {
      const next = prev.map(a => {
        if (a.id !== id) return a
        updated = { ...a, ...data, updated: new Date().toISOString() }
        return updated
      })
      persist('demo_kb_articles', next)
      return next
    })
    return updated!
  }

  async function deleteArticle(id: string) {
    setArticles(prev => {
      const next = prev.filter(a => a.id !== id)
      persist('demo_kb_articles', next)
      return next
    })
  }

  return { articles, loading, createArticle, updateArticle, deleteArticle }
}

// ---------- User profile ----------
export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<User | null>(null)
  const [extras, setExtras] = useState<PeopleExtra | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    const user = TEAM.find(u => u.id === userId)
    if (!user) {
      setProfile(null)
      setExtras(null)
      setLoading(false)
      return
    }
    const directReports = TEAM.filter(u => u.manager?.email?.toLowerCase() === user.email?.toLowerCase())
    setProfile({ ...user, directReports })
    if (user.email) {
      const allExtras = loadOrSeed('demo_people_extras', () => buildSeedPeopleExtras(new Date()))
      const match = allExtras.find(e => e.email.toLowerCase() === user.email!.toLowerCase())
      setExtras(match ?? null)
    }
    setLoading(false)
  }, [userId])

  async function saveExtras(data: { bio: string; skills: string; birthday: string }, ownerEmail: string) {
    const allExtras = loadOrSeed('demo_people_extras', () => buildSeedPeopleExtras(new Date()))
    const idx = allExtras.findIndex(e => e.email.toLowerCase() === ownerEmail.toLowerCase())
    const payload: PeopleExtra = {
      id: idx >= 0 ? allExtras[idx].id : makeId('extra'),
      email: ownerEmail,
      bio: data.bio,
      skills: data.skills,
      birthday: data.birthday || null,
      hireDate: idx >= 0 ? allExtras[idx].hireDate : null,
    }
    const next = idx >= 0
      ? allExtras.map((e, i) => i === idx ? payload : e)
      : [...allExtras, payload]
    persist('demo_people_extras', next)
    setExtras(payload)
  }

  return { profile, extras, loading, saveExtras }
}

// ---------- Celebrations (birthdays & anniversaries) ----------
export function useCelebrations(team: User[], now?: Date) {
  const [extras, setExtras] = useState<PeopleExtra[]>([])

  useEffect(() => {
    setExtras(loadOrSeed('demo_people_extras', () => buildSeedPeopleExtras(new Date())))
  }, [])

  const today = now ?? new Date()
  const todayMonth = today.getMonth() + 1
  const todayDay = today.getDate()

  const birthdays = extras.flatMap(e => {
    if (!e.birthday) return []
    const [mm, dd] = e.birthday.split('-').map(Number)
    if (isNaN(mm) || isNaN(dd) || mm !== todayMonth) return []
    const user = team.find(u => u.email?.toLowerCase() === e.email.toLowerCase())
    if (!user) return []
    const daysUntil = dd - todayDay
    if (daysUntil < 0 || daysUntil > 14) return []
    return [{ user, day: dd, daysUntil, kind: 'birthday' as const }]
  })

  const anniversaries = extras.flatMap(e => {
    if (!e.hireDate) return []
    const hireDate = new Date(e.hireDate)
    if (isNaN(hireDate.getTime())) return []
    const hireMonth = hireDate.getMonth() + 1
    const hireDay = hireDate.getDate()
    if (hireMonth !== todayMonth) return []
    const user = team.find(u => u.email?.toLowerCase() === e.email.toLowerCase())
    if (!user) return []
    const daysUntil = hireDay - todayDay
    if (daysUntil < 0 || daysUntil > 14) return []
    const years = today.getFullYear() - hireDate.getFullYear()
    return [{ user, day: hireDay, daysUntil, kind: 'anniversary' as const, years }]
  })

  return { birthdays, anniversaries }
}

// ---------- Comments ----------
export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const all = loadOrSeed<Comment>('demo_comments', () => [])
    setComments(all.filter(c => c.postId === postId).sort((a, b) => a.created.localeCompare(b.created)))
    setLoading(false)
  }, [postId])

  async function addComment(body: string, author: User) {
    const comment: Comment = {
      id: makeId('comment'),
      postId,
      body,
      authorName: author.name,
      authorEmail: author.email ?? '',
      created: new Date().toISOString(),
    }
    const all = loadOrSeed<Comment>('demo_comments', () => [])
    const next = [...all, comment]
    persist('demo_comments', next)
    setComments(prev => [...prev, comment])
  }

  async function deleteComment(id: string) {
    const all = loadOrSeed<Comment>('demo_comments', () => [])
    persist('demo_comments', all.filter(c => c.id !== id))
    setComments(prev => prev.filter(c => c.id !== id))
  }

  return { comments, loading, addComment, deleteComment }
}

// ---------- Maintenance Mode ----------
export function useMaintenance(userEmail: string) {
  const [state, setState] = useState<MaintenanceState>(DEFAULT_MAINTENANCE)
  const [loading, setLoading] = useState(true)
  const isMaintainer = MAINTENANCE_ADMINS.includes(userEmail.toLowerCase())

  useEffect(() => {
    setState(loadSetting('demo_maintenance_mode', () => DEFAULT_MAINTENANCE))
    setLoading(false)
  }, [])

  async function setMaintenance(next: Partial<MaintenanceState>) {
    setState(prev => {
      const updated = { ...prev, ...next }
      persistSetting('demo_maintenance_mode', updated)
      return updated
    })
  }

  async function enable(message: string, byEmail: string) {
    await setMaintenance({ enabled: true, message, enabledBy: byEmail, enabledAt: new Date().toISOString() })
  }

  async function disable() {
    await setMaintenance({ enabled: false, enabledBy: '', enabledAt: '' })
  }

  return { state, loading, isMaintainer, enable, disable }
}

// ---------- Notes ----------
function sortNotes(a: Note, b: Note): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
  return a.sortOrder - b.sortOrder
}

export function useNotes(userEmail: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(true)

  useEffect(() => {
    if (!userEmail) { setNotesLoading(false); return }
    setNotesLoading(true)
    const all = loadOrSeed<Note>('demo_notes', () => [])
    setNotes(all.filter(n => n.authorEmail === userEmail).sort(sortNotes))
    setNotesLoading(false)
  }, [userEmail])

  const readAll = useCallback(() => loadOrSeed<Note>('demo_notes', () => []), [])

  async function addNote(data: Omit<Note, 'id' | 'created' | 'updated' | 'authorEmail'>) {
    const now = new Date().toISOString()
    const note: Note = { ...data, id: makeId('note'), authorEmail: userEmail, created: now, updated: now }
    const all = readAll()
    const next = [...all, note]
    persist('demo_notes', next)
    setNotes(prev => [...prev, note].sort(sortNotes))
  }

  async function updateNote(id: string, data: Partial<Omit<Note, 'id' | 'created' | 'updated' | 'authorEmail'>>) {
    const all = readAll()
    let updated: Note | undefined
    const next = all.map(n => {
      if (n.id !== id) return n
      updated = { ...n, ...data, updated: new Date().toISOString() }
      return updated
    })
    persist('demo_notes', next)
    if (updated) setNotes(prev => prev.map(n => n.id === id ? updated! : n).sort(sortNotes))
  }

  async function deleteNote(id: string) {
    const all = readAll()
    persist('demo_notes', all.filter(n => n.id !== id))
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  async function togglePin(id: string) {
    const note = notes.find(n => n.id === id)
    if (!note) return
    await updateNote(id, { pinned: !note.pinned })
  }

  async function reorderNotes(ids: string[]) {
    const idSet = new Set(ids)
    const orderMap = new Map(ids.map((id, i) => [id, i]))
    setNotes(prev => {
      const next = prev.map(n => idSet.has(n.id) ? { ...n, sortOrder: orderMap.get(n.id)! } : n).sort(sortNotes)
      const all = readAll()
      persist('demo_notes', all.map(n => idSet.has(n.id) ? { ...n, sortOrder: orderMap.get(n.id)! } : n))
      return next
    })
  }

  return { notes, notesLoading, addNote, updateNote, deleteNote, togglePin, reorderNotes }
}
