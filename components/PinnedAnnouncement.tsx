'use client'
import Link from 'next/link'
import type { Pin } from '../types'
import { C, CARD_STYLE } from '../tokens'
import { Avatar } from './Avatar'
import { relativeTime } from '../utils'
import { SEED_NEWS_POST_IDS } from '../lib/mockData'

function getPreview(body: string, maxLen = 180): string {
  const stripped = body
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^```[\s\S]*?```/gm, '')
  const lines = stripped.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.match(/^[-*]{3,}$/) && !l.match(/^\|[-|\s:]+\|$/) && !l.startsWith('|'))
  const joined = lines.join(' · ')
  return joined.length > maxLen ? joined.slice(0, maxLen).trimEnd() + '…' : joined
}

interface Props {
  pin: Pin | null
}

export function PinnedAnnouncement({ pin }: Props) {
  if (!pin) return null

  const postedAgo = relativeTime(pin.postedAt)

  return (
    <article
      style={{
        ...CARD_STYLE,
        borderRadius: 24,
        padding: 0,
        background: C.topbar,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #1F2147',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(35,81,204,0.32) 0%, transparent 68%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          padding: '28px 32px',
          display: 'flex',
          gap: 24,
          alignItems: 'flex-start',
          position: 'relative',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              fontWeight: 600,
              color: '#8A7FCC',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            {pin.tag}
          </div>

          <h3
            style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1.08,
              margin: '0 0 14px',
              letterSpacing: '-0.025em',
              maxWidth: 640,
            }}
          >
            {pin.title}
            <span style={{ color: C.purple }}>.</span>
          </h3>

          <p style={{ fontSize: 15, lineHeight: 1.55, color: '#C9C8E0', maxWidth: 580, margin: '0 0 22px' }}>
            {getPreview(pin.body)}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {SEED_NEWS_POST_IDS.has(pin.id) ? (
              <Link
                href={`/news/${pin.id}`}
                style={{
                  background: '#fff',
                  color: C.navy,
                  border: 'none',
                  padding: '11px 22px',
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                {pin.cta.label}
              </Link>
            ) : (
              <Link
                href="/news"
                style={{
                  background: '#fff',
                  color: C.navy,
                  border: 'none',
                  padding: '11px 22px',
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                View in feed
              </Link>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={pin.author.name} size={28} avatarUrl={pin.author.avatarUrl} />
              <span style={{ fontSize: 13, color: '#9C9CB8' }}>
                <span style={{ color: '#E4E3F3', fontWeight: 500 }}>{pin.author.name}</span> · {postedAgo}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
