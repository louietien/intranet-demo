'use client'
import type { Status } from '../types'
import { avatarColor, initials, C, STATUS_COLOR } from '../tokens'

interface Props {
  name: string
  size?: number
  status?: Status
  avatarUrl?: string
}

export function Avatar({ name, size = 36, status, avatarUrl }: Props) {
  const dotSize = Math.max(8, size * 0.28)
  return (
    <span style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
          }}
        />
      ) : (
        <span
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: avatarColor(name),
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.navy,
            fontWeight: 700,
            fontSize: Math.round(size * 0.38),
            fontFamily: '"Bricolage Grotesque", sans-serif',
            letterSpacing: '-0.02em',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
          }}
        >
          {initials(name)}
        </span>
      )}
      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: STATUS_COLOR[status],
            boxShadow: '0 0 0 2px #fff',
          }}
        />
      )}
    </span>
  )
}
