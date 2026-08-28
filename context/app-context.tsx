'use client'
import { createContext, useContext } from 'react'
import type { User, Pin, QuickLink, CalendarEvent, KbArticle, KbSectionRecord, Note, LeaveEntry, MaintenanceState } from '../types'

export interface AppContextValue {
  me: User
  realMe: User
  isAdmin: boolean
  impersonatedUser: User | null
  setImpersonation: (user: User | null) => void
  team: User[]
  teamLoading: boolean
  teamError: string | null
  leaveEntries: LeaveEntry[]
  posts: Pin[]
  postsLoading: boolean
  addPost: (draft: { tag: string; title: string; body: string; cta: { label: string; href: string } }, author: User) => Promise<void>
  updatePost: (id: string, draft: { tag: string; title: string; body: string; cta: { label: string; href: string } }) => Promise<void>
  deletePost: (id: string) => Promise<void>
  links: QuickLink[]
  updateLinks: (next: QuickLink[]) => Promise<void>
  events: CalendarEvent[]
  eventsLoading: boolean
  addEvent: (event: CalendarEvent) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  updateEvent: (event: CalendarEvent) => Promise<void>
  articles: KbArticle[]
  kbLoading: boolean
  createArticle: (data: Omit<KbArticle, 'id' | 'created' | 'updated'>) => Promise<KbArticle>
  updateArticle: (id: string, data: Partial<Omit<KbArticle, 'id' | 'created' | 'updated'>>) => Promise<KbArticle>
  deleteArticle: (id: string) => Promise<void>
  sections: KbSectionRecord[]
  createSection: (title: string) => Promise<KbSectionRecord>
  updateSection: (id: string, title: string) => Promise<KbSectionRecord>
  deleteSection: (id: string) => Promise<void>
  reorderSection: (id: string, direction: 'up' | 'down') => Promise<void>
  notes: Note[]
  notesLoading: boolean
  addNote: (data: Omit<Note, 'id' | 'created' | 'updated' | 'authorEmail'>) => Promise<void>
  updateNote: (id: string, data: Partial<Omit<Note, 'id' | 'created' | 'updated' | 'authorEmail'>>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
  reorderNotes: (ids: string[]) => Promise<void>
  dark: boolean
  toggleDark: () => void
  maintenance: MaintenanceState
  isMaintainer: boolean
  enableMaintenance: (message: string, byEmail: string) => Promise<void>
  disableMaintenance: () => Promise<void>
  now: Date
  debugNow: Date | null
  setDebugNow: (d: Date | null) => void
}

export const AppContext = createContext<AppContextValue | null>(null)

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within ClientLayout')
  return ctx
}
