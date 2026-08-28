'use client'
import { X } from 'lucide-react'
import { C } from '../tokens'
import { Avatar } from './Avatar'
import type { User } from '../types'

interface Props {
  user: User
  onExit: () => void
}

export function ImpersonationBanner({ user, onExit }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '8px 20px',
        background: 'color-mix(in srgb, var(--c-amber) 15%, transparent)',
        borderBottom: `1px solid color-mix(in srgb, var(--c-amber) 40%, transparent)`,
        fontSize: 13,
        color: C.ink,
        position: 'sticky',
        top: 57,
        zIndex: 29,
      }}
    >
      <Avatar name={user.name} size={20} avatarUrl={user.avatarUrl} />
      <span>
        Viewing as <strong>{user.name}</strong>
        {user.role && <span style={{ color: C.mute }}> · {user.role}</span>}
      </span>
      <button
        onClick={onExit}
        title="Exit impersonation"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          marginLeft: 4,
          padding: '3px 10px',
          borderRadius: 6,
          border: `1px solid color-mix(in srgb, var(--c-amber) 50%, transparent)`,
          background: 'transparent',
          color: C.ink,
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <X size={11} strokeWidth={2.5} />
        Exit
      </button>
    </div>
  )
}
