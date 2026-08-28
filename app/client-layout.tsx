'use client'
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { C } from '../tokens'
import { useTheme } from '../useTheme'
import { useTeam, useNewsPosts, useAnnouncement, useQuickLinks, useUpcomingEvents, useKbase, useKbSections, useCelebrations, useWhoIsOut, useMaintenance, useNotes, MAINTENANCE_ADMINS } from '../hooks'
import { TopBar } from '../components/TopBar'
import { BottomNav } from '../components/BottomNav'
import { KbPalette } from '../components/KbPalette'
import { MaintenanceScreen } from '../components/MaintenanceScreen'
import { DebugPanel } from '../components/DebugPanel'
import { ImpersonationBanner } from '../components/ImpersonationBanner'
import { AppContext } from '../context/app-context'
import type { User } from '../types'

const SESSION_KEY = 'intra-impersonate'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { dark, toggle: toggleDark } = useTheme()
  const { posts, addPost, updatePost, deletePost } = useNewsPosts()
  const { links, updateLinks } = useQuickLinks()
  const { events, eventsLoading, addEvent, deleteEvent, updateEvent } = useUpcomingEvents()
  const { team, me, teamLoading, teamError, leaveEntries } = useTeam()

  // Impersonation state must be declared before any hook that takes an email param,
  // so we can pass effectiveEmail to those hooks instead of the real user's email.
  // The email string comes from sessionStorage; we don't need team resolved yet.
  const isAdmin = MAINTENANCE_ADMINS.includes((me?.email ?? '').toLowerCase())
  const [impersonatedEmail, setImpersonatedEmail] = useState<string | null>(null)
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) setImpersonatedEmail(stored)
  }, [])
  // effectiveEmail drives all per-user data fetching. useMaintenance intentionally
  // stays on the real email so admin powers are preserved while impersonating.
  const effectiveEmail = impersonatedEmail ?? me?.email ?? ''

  const { articles, loading: kbLoading, createArticle, updateArticle, deleteArticle } = useKbase()
  const { sections, sectionsLoading, createSection, updateSection, deleteSection, reorderSection } = useKbSections()
  const { state: maintenance, loading: maintenanceLoading, isMaintainer, enable: enableMaintenance, disable: disableMaintenance } = useMaintenance(me?.email ?? '')
  const { notes, notesLoading, addNote, updateNote, deleteNote, togglePin, reorderNotes } = useNotes(effectiveEmail)
  const [debugNow, setDebugNow] = useState<Date | null>(null)
  // Lazy initializer captures the time once — stable across the render that SSR sees
  // and the matching client hydration render. useEffect then keeps it ticking.
  const [stableNow, setStableNow] = useState<Date>(() => new Date())
  useEffect(() => {
    setStableNow(new Date())
    const id = setInterval(() => setStableNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  const now = debugNow ?? stableNow
  const impersonatedUser: User | null = impersonatedEmail
    ? (team.find(u => u.email?.toLowerCase() === impersonatedEmail) ?? null)
    : null
  const setImpersonation = useCallback((user: User | null) => {
    if (user?.email) {
      const key = user.email.toLowerCase()
      sessionStorage.setItem(SESSION_KEY, key)
      setImpersonatedEmail(key)
    } else {
      sessionStorage.removeItem(SESSION_KEY)
      setImpersonatedEmail(null)
    }
  }, [])
  const effectiveMe = impersonatedUser ?? me

  return (
      <AppContext.Provider value={{
        me: effectiveMe,
        realMe: me,
        isAdmin,
        impersonatedUser,
        setImpersonation,
        team,
        teamLoading,
        teamError,
        leaveEntries,
        posts,
        postsLoading: false,
        addPost,
        updatePost,
        deletePost,
        links,
        updateLinks,
        events,
        eventsLoading,
        addEvent,
        deleteEvent,
        updateEvent,
        articles,
        kbLoading,
        createArticle,
        updateArticle,
        deleteArticle,
        sections,
        createSection,
        updateSection,
        deleteSection,
        reorderSection,
        notes,
        notesLoading,
        addNote,
        updateNote,
        deleteNote,
        togglePin,
        reorderNotes,
        dark,
        toggleDark,
        maintenance,
        isMaintainer,
        enableMaintenance,
        disableMaintenance,
        now,
        debugNow,
        setDebugNow,
      }}>
        {!maintenanceLoading && maintenance.enabled && !isMaintainer ? (
          <MaintenanceScreen message={maintenance.message} />
        ) : (
          <div
            style={{
              minHeight: '100vh',
              background: C.bg,
              color: C.ink,
              fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            <TopBar
              user={effectiveMe}
              isDark={dark}
              onToggleDark={toggleDark}
              maintenanceState={maintenance}
              isMaintainer={isMaintainer}
              onEnableMaintenance={enableMaintenance}
              onDisableMaintenance={disableMaintenance}
              userEmail={me?.email ?? ''}
              isAdmin={isAdmin}
              impersonatedUser={impersonatedUser}
              team={team}
              onSetImpersonation={setImpersonation}
            />
            {impersonatedUser && (
              <ImpersonationBanner user={impersonatedUser} onExit={() => setImpersonation(null)} />
            )}
            <KbPalette articles={articles} />
            <DebugPanel />
            <main className="main-content" style={{ maxWidth: 1440, margin: '0 auto' }}>
              <div key={pathname} style={{ animation: 'fadeUp 220ms ease both' }}>
                {children}
              </div>
            </main>
            <BottomNav />
          </div>
        )}
      </AppContext.Provider>
  )
}
