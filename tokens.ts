import type { CSSProperties } from 'react'
import type { Status } from './types'

export const C = {
  bg: 'var(--c-bg)',
  bgWarm: 'var(--c-bgWarm)',
  card: 'var(--c-card)',
  topbar: 'var(--c-topbar)',
  navy: 'var(--c-navy)',
  navySoft: 'var(--c-navySoft)',
  ink: 'var(--c-ink)',
  body: 'var(--c-body)',
  mute: 'var(--c-mute)',
  line: 'var(--c-line)',
  lineSoft: 'var(--c-lineSoft)',
  purple: 'var(--c-purple)',
  purpleSoft: 'var(--c-purpleSoft)',
  amber: 'var(--c-amber)',
  green: 'var(--c-green)',
  red: 'var(--c-red)',
  surface: 'var(--c-surface)',
  inputBg: 'var(--c-inputBg)',
} as const

export const STATUS_LABEL: Record<Status, string> = {
  online: 'Available',
  meeting: 'In a meeting',
  off: 'Offline',
  oof: 'Out of office',
  focus: 'Focusing',
  away: 'Away',
}

export const STATUS_COLOR: Record<Status, string> = {
  online: C.green,
  meeting: C.red,
  off: C.mute,
  oof: C.mute,
  focus: C.purple,
  away: C.amber,
}

export const CARD_STYLE: CSSProperties = {
  background: C.card,
  borderRadius: 16,
  border: `1px solid ${C.lineSoft}`,
  boxShadow: 'var(--c-cardShadow)',
}

export const EYEBROW_STYLE: CSSProperties = {
  fontSize: 11,
  letterSpacing: '0.14em',
  fontWeight: 600,
  color: C.mute,
  textTransform: 'uppercase',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

export function avatarColor(name: string): string {
  const hues = [22, 268, 14, 198, 142, 38, 320]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % hues.length
  return `oklch(0.78 0.08 ${hues[h]})`
}

export function initials(name: string): string {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('')
}
