'use client'
import { useState } from 'react'
import { Pin, Trash2 } from 'lucide-react'
import type { Note, NoteColor } from '../types'
import { C } from '../tokens'
import { renderMarkdown } from '../lib/markdownRenderer'

export const NOTE_COLORS: Record<NoteColor, { light: string; dark: string; dot: string; label: string }> = {
  default: { light: 'var(--c-card)',       dark: 'var(--c-card)',       dot: '#94a3b8', label: 'Default' },
  amber:   { light: '#fff8e6',             dark: '#2d2210',             dot: '#f59e0b', label: 'Amber'   },
  green:   { light: '#e9f7ec',             dark: '#0f2518',             dot: '#22c55e', label: 'Green'   },
  purple:  { light: 'var(--c-purpleSoft)', dark: 'var(--c-purpleSoft)', dot: '#a855f7', label: 'Purple'  },
  navy:    { light: 'var(--c-navySoft)',   dark: 'var(--c-navySoft)',   dot: '#3b82f6', label: 'Navy'    },
  red:     { light: '#fde8ec',             dark: '#2d0f16',             dot: '#ef4444', label: 'Red'     },
}


interface Props {
  note: Note
  dark: boolean
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
  compact?: boolean
  style?: React.CSSProperties
}

export function NoteCard({ note, dark, onEdit, onDelete, onTogglePin, compact = false, style }: Props) {
  const [hovered, setHovered] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const bg = NOTE_COLORS[note.color][dark ? 'dark' : 'light']
  const bodyHtml = renderMarkdown(note.body)

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete(note.id)
    } else {
      setConfirmDelete(true)
    }
  }

  function handlePinClick(e: React.MouseEvent) {
    e.stopPropagation()
    setConfirmDelete(false)
    onTogglePin(note.id)
  }

  return (
    <div
      onClick={() => { setConfirmDelete(false); onEdit(note) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false) }}
      style={{
        background: bg,
        borderRadius: compact ? 12 : 16,
        border: `1px solid ${C.lineSoft}`,
        padding: compact ? '10px 12px' : '14px 16px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'box-shadow 150ms ease, transform 150ms ease',
        boxShadow: hovered ? '0 4px 16px -4px rgba(19,20,46,0.14)' : '0 1px 4px -1px rgba(19,20,46,0.06)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        ...style,
      }}
    >
      {/* Actions row */}
      <div style={{
        position: 'absolute',
        top: 8,
        right: 8,
        display: 'flex',
        gap: 4,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 150ms ease',
        pointerEvents: hovered ? 'auto' : 'none',
      }}>
        <button
          onClick={handlePinClick}
          title={note.pinned ? 'Unpin' : 'Pin'}
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: `1px solid ${C.line}`,
            background: C.card,
            color: note.pinned ? C.purple : C.mute,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          <Pin size={13} fill={note.pinned ? 'currentColor' : 'none'} />
        </button>

        {confirmDelete ? (
          <>
            <button
              onClick={handleDeleteClick}
              style={{
                height: 28,
                padding: '0 8px',
                borderRadius: 8,
                border: `1px solid ${C.red}`,
                background: C.red,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Delete
            </button>
            <button
              onClick={e => { e.stopPropagation(); setConfirmDelete(false) }}
              style={{
                height: 28,
                padding: '0 8px',
                borderRadius: 8,
                border: `1px solid ${C.line}`,
                background: C.card,
                color: C.mute,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleDeleteClick}
            title="Delete"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: `1px solid ${C.line}`,
              background: C.card,
              color: C.mute,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Pin indicator (visible when not hovered) */}
      {note.pinned && !hovered && (
        <div style={{ position: 'absolute', top: 8, right: 8, color: C.purple }}>
          <Pin size={12} fill="currentColor" />
        </div>
      )}

      {/* Title */}
      {note.title && (
        <div style={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontSize: compact ? 13 : 14,
          fontWeight: 700,
          color: C.ink,
          marginBottom: 4,
          paddingRight: hovered ? 72 : 16,
          lineHeight: 1.3,
        }}>
          {note.title}
        </div>
      )}

      {/* Body */}
      {note.body && (
        <div
          className="note-prose"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
          style={{
            fontSize: compact ? 12 : 13,
            color: C.body,
            lineHeight: 1.5,
            paddingRight: (!note.title && hovered) ? 72 : 0,
          }}
        />
      )}

      {/* Tags */}
      {note.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: compact ? 6 : 10 }}>
          {note.tags.map(tag => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: C.mute,
                background: C.bg,
                border: `1px solid ${C.lineSoft}`,
                borderRadius: 6,
                padding: '1px 6px',
                letterSpacing: '0.04em',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
