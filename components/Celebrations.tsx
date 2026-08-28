'use client'
import type { User } from '../types'
import { C, CARD_STYLE, EYEBROW_STYLE } from '../tokens'
import { Avatar } from './Avatar'

interface CelebrationEntry {
  user: User
  day: number
  daysUntil: number
  kind: 'birthday' | 'anniversary'
  years?: number
}

interface Props {
  birthdays: CelebrationEntry[]
  anniversaries: CelebrationEntry[]
}

export function Celebrations({ birthdays, anniversaries }: Props) {
  const all = [...birthdays, ...anniversaries].sort((a, b) => a.daysUntil - b.daysUntil)
  if (all.length === 0) return null

  return (
    <section style={{ ...CARD_STYLE, background: C.surface, padding: '24px 20px' }}>
      <div style={{ ...EYEBROW_STYLE, marginBottom: 14 }}>
        <span style={{ fontSize: 13 }}>🎉</span>
        Celebrations
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {all.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={entry.user.name} size={34} avatarUrl={entry.user.avatarUrl} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {entry.user.name}
              </div>
              <div style={{ fontSize: 11, color: C.mute }}>
                {entry.kind === 'birthday'
                  ? entry.daysUntil === 0
                    ? '🎂 Birthday today!'
                    : `🎂 Birthday in ${entry.daysUntil}d`
                  : entry.daysUntil === 0
                    ? `🏆 ${entry.years}-year anniversary today!`
                    : `🏆 ${entry.years}-year anniversary in ${entry.daysUntil}d`
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
