'use client'
import { useState, useMemo } from 'react'
import { LayoutGrid, Move } from 'lucide-react'
import { useApp } from '../../context/app-context'
import type { Note } from '../../types'
import { C, EYEBROW_STYLE } from '../../tokens'
import { NoteCard } from '../../components/NoteCard'
import { NoteEditor } from '../../components/NoteEditor'
import { NoteCanvas } from '../../components/NoteCanvas'

export default function NotesPage() {
  const { notes, notesLoading, addNote, updateNote, deleteNote, togglePin, reorderNotes, dark } = useApp()
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [composing, setComposing] = useState(false)
  const [newNotePos, setNewNotePos] = useState<{ x: number; y: number }>({ x: 40, y: 40 })
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'canvas'>('grid')

  const allTags = useMemo(() => {
    const set = new Set<string>()
    notes.forEach(n => n.tags.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [notes])

  const filtered = useMemo(() =>
    activeTag ? notes.filter(n => n.tags.includes(activeTag)) : notes,
    [notes, activeTag]
  )

  const pinned = filtered.filter(n => n.pinned)
  const others = filtered.filter(n => !n.pinned)

  function handleSave(data: Omit<Note, 'id' | 'created' | 'updated' | 'authorEmail'>) {
    if (composing) {
      return addNote({ ...data, x: newNotePos.x, y: newNotePos.y })
    }
    if (editingNote) {
      return updateNote(editingNote.id, data)
    }
    return Promise.resolve()
  }

  function openNew() {
    setEditingNote(null)
    setComposing(true)
  }

  function openEdit(note: Note) {
    setEditingNote(note)
    setComposing(false)
  }

  function closeEditor() {
    setEditingNote(null)
    setComposing(false)
  }

  function handleCanvasDoubleClick(x: number, y: number) {
    setNewNotePos({ x, y })
    openNew()
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 36px 60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={EYEBROW_STYLE}>Personal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <h1 style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontSize: 28,
              fontWeight: 800,
              color: C.ink,
              letterSpacing: '-0.02em',
              margin: 0,
            }}>
              My Notes<span style={{ color: C.purple }}>.</span>
            </h1>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: C.purple,
              background: C.purpleSoft,
              padding: '3px 7px',
              borderRadius: 6,
              alignSelf: 'center',
            }}>
              Beta
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View toggle */}
          <div style={{
            display: 'flex',
            border: `1px solid ${C.line}`,
            borderRadius: 10,
            overflow: 'hidden',
            background: C.card,
          }}>
            {(['grid', 'canvas'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                title={v === 'grid' ? 'Grid view' : 'Canvas view'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  border: 'none',
                  background: view === v ? C.purple : 'transparent',
                  color: view === v ? '#fff' : C.mute,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 150ms ease, color 150ms ease',
                }}
              >
                {v === 'grid' ? <LayoutGrid size={14} /> : <Move size={14} />}
                {v === 'grid' ? 'Grid' : 'Canvas'}
              </button>
            ))}
          </div>

          <button
            onClick={openNew}
            style={{
              padding: '9px 18px',
              borderRadius: 10,
              border: 'none',
              background: C.purple,
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + New note
          </button>
        </div>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          <button
            onClick={() => setActiveTag(null)}
            style={{
              padding: '4px 12px',
              borderRadius: 20,
              border: `1px solid ${activeTag === null ? C.purple : C.line}`,
              background: activeTag === null ? C.purpleSoft : 'transparent',
              color: activeTag === null ? C.purple : C.mute,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                border: `1px solid ${activeTag === tag ? C.purple : C.line}`,
                background: activeTag === tag ? C.purpleSoft : 'transparent',
                color: activeTag === tag ? C.purple : C.mute,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {notesLoading ? (
        <div style={{ color: C.mute, fontSize: 14, padding: '40px 0', textAlign: 'center' }}>Loading notes…</div>
      ) : view === 'canvas' ? (
        <NoteCanvas
          notes={filtered}
          dark={dark}
          onEdit={openEdit}
          onDelete={deleteNote}
          onTogglePin={togglePin}
          onUpdatePosition={(id, x, y) => updateNote(id, { x, y })}
          onDoubleClickCanvas={handleCanvasDoubleClick}
        />
      ) : (
        <>
          {filtered.length === 0 && (
            <div style={{
              padding: '60px 0',
              textAlign: 'center',
              color: C.mute,
              fontSize: 14,
            }}>
              No notes yet.{' '}
              <button
                onClick={openNew}
                style={{ background: 'none', border: 'none', color: C.purple, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
              >
                Create your first note →
              </button>
            </div>
          )}

          {pinned.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <div style={{ ...EYEBROW_STYLE, marginBottom: 12 }}>Pinned</div>
              <NotesGrid
                notes={pinned}
                dark={dark}
                onEdit={openEdit}
                onDelete={deleteNote}
                onTogglePin={togglePin}
                onReorder={reorderNotes}
              />
            </section>
          )}

          {others.length > 0 && (
            <section>
              {pinned.length > 0 && (
                <div style={{ ...EYEBROW_STYLE, marginBottom: 12 }}>Notes</div>
              )}
              <NotesGrid
                notes={others}
                dark={dark}
                onEdit={openEdit}
                onDelete={deleteNote}
                onTogglePin={togglePin}
                onReorder={reorderNotes}
              />
            </section>
          )}
        </>
      )}

      {(composing || editingNote !== null) && (
        <NoteEditor
          note={editingNote ?? undefined}
          onSave={handleSave}
          onClose={closeEditor}
        />
      )}
    </div>
  )
}

function NotesGrid({
  notes,
  dark,
  onEdit,
  onDelete,
  onTogglePin,
  onReorder,
}: {
  notes: Note[]
  dark: boolean
  onEdit: (n: Note) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
  onReorder: (ids: string[]) => Promise<void>
}) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) return
    const ids = notes.map(n => n.id)
    const from = ids.indexOf(dragId)
    const to = ids.indexOf(targetId)
    const reordered = [...ids]
    reordered.splice(from, 1)
    reordered.splice(to, 0, dragId)
    onReorder(reordered)
    setDragId(null)
    setOverId(null)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
      {notes.map(note => (
        <div
          key={note.id}
          draggable
          onDragStart={() => setDragId(note.id)}
          onDragOver={e => { e.preventDefault(); setOverId(note.id) }}
          onDrop={() => handleDrop(note.id)}
          onDragEnd={() => { setDragId(null); setOverId(null) }}
          style={{
            opacity: dragId === note.id ? 0.4 : 1,
            outline: overId === note.id && dragId !== note.id ? `2px solid ${C.purple}` : 'none',
            outlineOffset: 3,
            borderRadius: 16,
            transition: 'opacity 150ms ease',
            cursor: 'grab',
          }}
        >
          <NoteCard
            note={note}
            dark={dark}
            onEdit={onEdit}
            onDelete={onDelete}
            onTogglePin={onTogglePin}
          />
        </div>
      ))}
    </div>
  )
}
