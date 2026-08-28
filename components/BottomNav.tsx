'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Newspaper, Users, BookOpen, Search } from 'lucide-react'
import { C } from '../tokens'

const TABS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/news', icon: Newspaper, label: 'News' },
  { to: '/people', icon: Users, label: 'People' },
  { to: '/docs', icon: BookOpen, label: 'KBase' },
  { to: '/search', icon: Search, label: 'Search' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="desktop-hide"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: C.card,
        borderTop: `1px solid ${C.line}`,
        display: 'flex',
        alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -1px 0 rgba(0,0,0,0.04), 0 -4px 16px -8px rgba(0,0,0,0.12)',
      }}
    >
      {TABS.map(({ to, icon: Icon, label }) => {
        const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)
        return (
          <Link
            key={to}
            href={to}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '10px 0 8px',
              textDecoration: 'none',
              color: isActive ? C.purple : C.mute,
              transition: 'color 120ms ease',
              minHeight: 56,
            }}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.2 : 1.8}
              style={{ flexShrink: 0 }}
            />
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
