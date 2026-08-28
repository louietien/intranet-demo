'use client'
import { useState } from 'react'
import type { Note, NoteColor } from '../types'
import { C } from '../tokens'
import { Modal } from './Modal'
import { NOTE_COLORS } from './NoteCard'

const LABEL: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: C.body,
  letterSpacing: '0.04em',
  marginBottom: 6,
  display: 'block',
}

const FIELD: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 10,
  border: `1px solid ${C.line}`,
  background: C.bg,
  color: C.ink,
  fontSize: 14,
  fontFamily: 'Geist, -apple-system, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

interface Props {
  note?: Note
  onSave: (data: Omit<Note, 'id' | 'created' | 'updated' | 'authorEmail'>) => Promise<void>
  onClose: () => void
}

export function NoteEditor({ note, onSave, onClose }: Props) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [body, setBody] = useState(note?.body ?? '')
  const [color, setColor] = useState<NoteColor>(note?.color ?? 'default')
  const [tagsRaw, setTagsRaw] = useState(note?.tags.join(', ') ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      await onSave({
        title: title.trim(),
        body: body.trim(),
        color,
        tags,
        pinned: note?.pinned ?? false,
        sortOrder: note?.sortOrder ?? 0,
        x: note?.x ?? 40,
        y: note?.y ?? 40,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={note ? 'Edit note' : 'New note'} onClose={onClose} width={600}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={LABEL}>Title <span style={{ color: C.mute, fontWeight: 400 }}>(optional)</span></label>
          <input
            style={FIELD}
            placeholder="Note title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus={!note}
          />
        </div>

        <div>
          <label style={LABEL}>Content</label>
          <textarea
            style={{ ...FIELD, minHeight: 200, resize: 'vertical', lineHeight: 1.6 }}
            placeholder="Write your note… (Markdown supported)"
            value={body}
            onChange={e => setBody(e.target.value)}
            autoFocus={!!note}
          />
        </div>

        <div>
          <label style={LABEL}>Tags <span style={{ color: C.mute, fontWeight: 400 }}>(comma-separated)</span></label>
          <input
            style={FIELD}
            placeholder="design, todo, reference"
            value={tagsRaw}
            onChange={e => setTagsRaw(e.target.value)}
          />
        </div>

        <div>
          <label style={LABEL}>Color</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(Object.keys(NOTE_COLORS) as NoteColor[]).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setColor(key)}
                title={NOTE_COLORS[key].label}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: color === key ? `3px solid ${C.purple}` : `2px solid ${C.line}`,
                  background: NOTE_COLORS[key].dot,
                  cursor: 'pointer',
                  padding: 0,
                  outline: 'none',
                  transition: 'transform 100ms ease, border-color 100ms ease',
                  transform: color === key ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              border: `1px solid ${C.line}`,
              background: 'transparent',
              color: C.mute,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !body.trim()}
            style={{
              padding: '9px 22px',
              borderRadius: 10,
              border: 'none',
              background: C.purple,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: saving || !body.trim() ? 'not-allowed' : 'pointer',
              opacity: saving || !body.trim() ? 0.55 : 1,
            }}
          >
            {saving ? 'Saving…' : note ? 'Save' : 'Create note'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
