'use client'
import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, Sun, X, UserRoundCog } from 'lucide-react'
import type { User } from '../types'
import { C } from '../tokens'
import { Avatar } from './Avatar'
import { SearchBar } from './SearchBar'
import { MaintenanceToggle } from './MaintenanceToggle'
import type { MaintenanceState } from '../types'
import { APP_VERSION, CHANGELOG_MD } from '../lib/changelog'
import { renderMarkdown } from '../lib/markdownRenderer'

interface Props {
  user: User
  isDark: boolean
  onToggleDark: () => void
  maintenanceState?: MaintenanceState
  isMaintainer?: boolean
  onEnableMaintenance?: (message: string, byEmail: string) => Promise<void>
  onDisableMaintenance?: () => Promise<void>
  userEmail?: string
  isAdmin?: boolean
  impersonatedUser?: User | null
  team?: User[]
  onSetImpersonation?: (user: User | null) => void
}

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/news', label: 'News' },
  { to: '/people', label: 'People' },
  { to: '/docs', label: 'Kbase' },
  { to: '/files', label: 'Files' },
  { to: '/notes', label: 'Notes', beta: true },
]

export function TopBar({ user, isDark, onToggleDark, maintenanceState, isMaintainer, onEnableMaintenance, onDisableMaintenance, userEmail, isAdmin, impersonatedUser, team, onSetImpersonation }: Props) {
  const pathname = usePathname()
  const [showChangelog, setShowChangelog] = useState(false)
  const [showImpersonatePicker, setShowImpersonatePicker] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (!showChangelog) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowChangelog(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showChangelog])
  useEffect(() => {
    if (!showImpersonatePicker) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowImpersonatePicker(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showImpersonatePicker])
  const changelogHtml = useMemo(() => renderMarkdown(CHANGELOG_MD), [])

  return (
    <>
    <header
      className="topbar-header"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 20,
        padding: '12px 36px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: C.topbar,
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            Acme<span style={{ color: '#8A9CFF' }}>.</span>
          </span>
          <button
            className="mobile-hide"
            onClick={() => setShowChangelog(true)}
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: 10.5,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            Intranet
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>
              v{APP_VERSION}
            </span>
          </button>
        </div>

        <nav className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV_LINKS.map(({ to, label, beta }) => {
            const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)
            return (
              <Link
                key={to}
                href={to}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.58)',
                  background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                  border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                {label}
                {beta && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#ffffff',
                    background: 'rgba(255,255,255,0.18)',
                    padding: '1px 5px',
                    borderRadius: 4,
                  }}>
                    Beta
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mobile-hide" style={{ display: 'flex', justifyContent: 'center' }}>
        <SearchBar />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
        {isMaintainer && maintenanceState && onEnableMaintenance && onDisableMaintenance && userEmail && (
          <span className="mobile-hide">
            <MaintenanceToggle
              state={maintenanceState}
              userEmail={userEmail}
              onEnable={onEnableMaintenance}
              onDisable={onDisableMaintenance}
            />
          </span>
        )}
        {isAdmin && onSetImpersonation && team && (
          <button
            className="mobile-hide"
            onClick={() => setShowImpersonatePicker(true)}
            title={impersonatedUser ? `Impersonating ${impersonatedUser.name}` : 'Impersonate a user'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              borderRadius: 8,
              border: `1px solid ${impersonatedUser ? 'color-mix(in srgb, var(--c-amber) 60%, transparent)' : 'rgba(255,255,255,0.15)'}`,
              background: impersonatedUser ? 'color-mix(in srgb, var(--c-amber) 22%, transparent)' : 'rgba(255,255,255,0.08)',
              color: impersonatedUser ? '#ffffff' : 'rgba(255,255,255,0.6)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <UserRoundCog size={13} strokeWidth={1.8} />
            {impersonatedUser ? impersonatedUser.name.split(' ')[0] : 'Impersonate'}
          </button>
        )}
        <button
          onClick={onToggleDark}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.65)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: 0,
            transition: 'color 150ms ease, border-color 150ms ease',
          }}
        >
          {isDark ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
        </button>
        <Avatar name={user.name} size={34} avatarUrl={user.avatarUrl} />
        <div className="mobile-hide" style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>{user.name.split(' ')[0]}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{user.role}</div>
        </div>
      </div>
    </header>

    {mounted && showChangelog && createPortal(
      <div
        onClick={() => setShowChangelog(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: C.card,
            borderRadius: 16,
            border: `1px solid ${C.line}`,
            boxShadow: 'var(--c-cardShadow)',
            width: '100%',
            maxWidth: 480,
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: `1px solid ${C.line}`,
            flexShrink: 0,
          }}>
            <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 15, color: C.ink }}>
              Changelog
            </div>
            <button
              onClick={() => setShowChangelog(false)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: `1px solid ${C.line}`,
                background: 'transparent',
                color: C.mute,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>
          <div
            className="changelog-prose"
            style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}
            dangerouslySetInnerHTML={{ __html: changelogHtml }}
          />
        </div>
      </div>,
      document.body
    )}

    {mounted && showImpersonatePicker && team && onSetImpersonation && createPortal(
      <div
        onClick={() => setShowImpersonatePicker(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: C.card,
            borderRadius: 16,
            border: `1px solid ${C.line}`,
            boxShadow: 'var(--c-cardShadow)',
            width: '100%',
            maxWidth: 380,
            maxHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: `1px solid ${C.line}`,
            flexShrink: 0,
          }}>
            <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 700, fontSize: 15, color: C.ink }}>
              Impersonate user
            </div>
            <button
              onClick={() => setShowImpersonatePicker(false)}
              style={{
                width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`,
                background: 'transparent', color: C.mute, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
            {impersonatedUser && (
              <button
                onClick={() => { onSetImpersonation(null); setShowImpersonatePicker(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 20px',
                  background: 'color-mix(in srgb, var(--c-amber) 10%, transparent)',
                  border: 'none',
                  borderBottom: `1px solid ${C.line}`,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: C.ink,
                  textAlign: 'left',
                }}
              >
                <X size={14} strokeWidth={2} style={{ color: C.mute, flexShrink: 0 }} />
                <span style={{ color: C.mute }}>Exit impersonation</span>
              </button>
            )}
            {team.map(member => {
              const isActive = impersonatedUser?.email?.toLowerCase() === member.email?.toLowerCase()
              return (
                <button
                  key={member.id}
                  onClick={() => { onSetImpersonation(member); setShowImpersonatePicker(false) }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '10px 20px',
                    background: isActive ? 'color-mix(in srgb, var(--c-amber) 10%, transparent)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: C.ink,
                    textAlign: 'left',
                  }}
                >
                  <Avatar name={member.name} size={28} avatarUrl={member.avatarUrl} />
                  <div style={{ lineHeight: 1.3 }}>
                    <div style={{ fontWeight: isActive ? 600 : 400 }}>{member.name}</div>
                    {member.role && <div style={{ fontSize: 11, color: C.mute }}>{member.role}</div>}
                  </div>
                  {isActive && (
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: C.amber, background: 'color-mix(in srgb, var(--c-amber) 18%, transparent)',
                      padding: '2px 7px', borderRadius: 4,
                    }}>
                      Active
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  )
}
