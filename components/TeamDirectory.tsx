'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { User } from '../types'
import { C, CARD_STYLE, STATUS_LABEL, STATUS_COLOR } from '../tokens'
import { Avatar } from './Avatar'

function TeamMember({ m }: { m: User }) {
  const [hover, setHover] = useState(false)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr',
        gap: 12,
        alignItems: 'center',
        padding: '10px 12px',
        borderRadius: 12,
        background: hover ? C.bgWarm : 'transparent',
        transition: 'background 100ms',
      }}
    >
      <Avatar name={m.name} size={40} status={m.status} avatarUrl={m.avatarUrl} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, letterSpacing: '-0.005em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {m.name}
        </div>
        {m.role && (
          <div style={{ fontSize: 12, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {m.role}
          </div>
        )}
        <div style={{ fontSize: 11, color: STATUS_COLOR[m.status], fontWeight: 500, marginTop: 1 }}>
          {STATUS_LABEL[m.status]}
        </div>
      </div>
    </div>
  )
}

interface Props {
  team: User[]
  loading?: boolean
  error?: string | null
}

export function TeamDirectory({ team, loading, error }: Props) {
  return (
    <section style={{ ...CARD_STYLE, padding: '24px 18px' }}>
      <div style={{ padding: '0 12px', marginBottom: 14 }}>
        <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>
          The {team.length}
        </h2>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 12px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.lineSoft }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '60%', height: 12, borderRadius: 6, background: C.lineSoft, marginBottom: 6 }} />
                <div style={{ width: '40%', height: 10, borderRadius: 6, background: C.lineSoft }} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '8px 12px', fontSize: 12, color: C.mute, lineHeight: 1.5 }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...team.filter(m => m.name.toLowerCase().startsWith('kristian')), ...team.filter(m => !m.name.toLowerCase().startsWith('kristian'))].map(m => (
            <Link key={m.id} href={`/people/${m.id}`} style={{ textDecoration: 'none' }}>
              <TeamMember m={m} />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
