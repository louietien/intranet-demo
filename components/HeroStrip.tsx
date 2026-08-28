'use client'
import type { User } from '../types'
import { C } from '../tokens'
import { useApp } from '../context/app-context'

interface Props {
  user: User
}

export function HeroStrip({ user }: Props) {
  const { now } = useApp()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const date = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const isWednesday = now.getDay() === 3

  return (
    <div style={{ padding: 'var(--phero-pad)' }}>
      <div
        suppressHydrationWarning
        style={{
          fontSize: 11,
          letterSpacing: '0.16em',
          fontWeight: 600,
          color: C.mute,
          textTransform: 'uppercase',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.purple, display: 'inline-block' }} />
        {isWednesday && (
          <span role="img" aria-label="it is wednesday my dudes" style={{ fontSize: 16, lineHeight: 1 }}>🐸</span>
        )}
        {date}
      </div>
      <h1
        suppressHydrationWarning
        style={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontSize: 'var(--phero-h1)',
          fontWeight: 800,
          color: C.ink,
          letterSpacing: '-0.035em',
          lineHeight: 1.02,
        }}
      >
        {greeting}, {user.name.split(' ')[0]}
        <span style={{ color: C.purple }}>.</span>
      </h1>
    </div>
  )
}
