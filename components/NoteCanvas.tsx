'use client'
import { useRef, useState, useCallback } from 'react'
import { Minimize2 } from 'lucide-react'
import type { Note } from '../types'
import { C } from '../tokens'
import { NoteCard } from './NoteCard'

interface Props {
  notes: Note[]
  dark: boolean
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string) => void
  onUpdatePosition: (id: string, x: number, y: number) => void
  onDoubleClickCanvas: (x: number, y: number) => void
  height?: string
}

export function NoteCanvas({ notes, dark, onEdit, onDelete, onTogglePin, onUpdatePosition, onDoubleClickCanvas, height = 'calc(100vh - 180px)' }: Props) {
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const panStart = useRef<{ mouseX: number; mouseY: number; panX: number; panY: number } | null>(null)
  const isPanning = useRef(false)

  // Per-note drag state
  const dragState = useRef<{ id: string; startMouseX: number; startMouseY: number; startNoteX: number; startNoteY: number; moved: boolean } | null>(null)
  const justDragged = useRef(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [localPos, setLocalPos] = useState<Record<string, { x: number; y: number }>>({})

  const containerRef = useRef<HTMLDivElement>(null)

  // Pan: mousedown on canvas background
  function onCanvasMouseDown(e: React.MouseEvent) {
    if (e.target !== e.currentTarget) return
    isPanning.current = true
    panStart.current = { mouseX: e.clientX, mouseY: e.clientY, panX, panY }
    e.preventDefault()
  }

  function onCanvasMouseMove(e: React.MouseEvent) {
    if (dragState.current) {
      const dx = e.clientX - dragState.current.startMouseX
      const dy = e.clientY - dragState.current.startMouseY
      if (!dragState.current.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
        dragState.current.moved = true
      }
      if (dragState.current.moved) {
        const { id, startNoteX, startNoteY } = dragState.current
        setLocalPos(prev => ({
          ...prev,
          [id]: { x: startNoteX + dx, y: startNoteY + dy },
        }))
      }
      return
    }
    if (isPanning.current && panStart.current) {
      const dx = e.clientX - panStart.current.mouseX
      const dy = e.clientY - panStart.current.mouseY
      setPanX(panStart.current.panX + dx)
      setPanY(panStart.current.panY + dy)
    }
  }

  function onCanvasMouseUp(e: React.MouseEvent) {
    if (dragState.current) {
      const { id, moved, startNoteX, startNoteY, startMouseX, startMouseY } = dragState.current
      if (moved) {
        const dx = e.clientX - startMouseX
        const dy = e.clientY - startMouseY
        const newX = startNoteX + dx
        const newY = startNoteY + dy
        onUpdatePosition(id, Math.max(0, newX), Math.max(0, newY))
      }
      justDragged.current = moved
      dragState.current = null
      setDraggingId(null)
    }
    isPanning.current = false
    panStart.current = null
  }

  function onCanvasDoubleClick(e: React.MouseEvent) {
    if (e.target !== e.currentTarget) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left - panX
    const y = e.clientY - rect.top - panY
    onDoubleClickCanvas(x, y)
  }

  const onNoteMouseDown = useCallback((note: Note, e: React.MouseEvent) => {
    e.stopPropagation()
    const pos = localPos[note.id] ?? { x: note.x, y: note.y }
    dragState.current = {
      id: note.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNoteX: pos.x,
      startNoteY: pos.y,
      moved: false,
    }
    setDraggingId(note.id)
  }, [localPos])

  const onNoteClick = useCallback((note: Note) => {
    if (justDragged.current) { justDragged.current = false; return }
    onEdit(note)
  }, [onEdit])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Reset view button */}
      <button
        onClick={() => { setPanX(0); setPanY(0) }}
        title="Reset view"
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 10,
          border: `1px solid ${C.line}`,
          background: C.card,
          color: C.mute,
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        <Minimize2 size={13} />
        Reset view
      </button>

      <div
        ref={containerRef}
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onCanvasMouseMove}
        onMouseUp={onCanvasMouseUp}
        onMouseLeave={onCanvasMouseUp}
        onDoubleClick={onCanvasDoubleClick}
        style={{
          width: '100%',
          height,
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 16,
          border: `1px solid ${C.lineSoft}`,
          background: dark ? 'var(--c-bgWarm)' : '#f8f8fc',
          cursor: isPanning.current ? 'grabbing' : 'grab',
          userSelect: 'none',
          backgroundImage: `radial-gradient(circle, ${C.lineSoft} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          backgroundPosition: `${panX % 28}px ${panY % 28}px`,
        }}
      >
        <div style={{ position: 'absolute', left: panX, top: panY }}>
          {notes.map(note => {
            const pos = localPos[note.id] ?? { x: note.x, y: note.y }
            return (
              <div
                key={note.id}
                onMouseDown={e => onNoteMouseDown(note, e)}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: 220,
                  cursor: draggingId === note.id ? 'grabbing' : 'grab',
                  zIndex: draggingId === note.id ? 20 : 1,
                  transition: draggingId === note.id ? 'none' : 'box-shadow 150ms ease',
                }}
              >
                <NoteCard
                  note={note}
                  dark={dark}
                  onEdit={onNoteClick}
                  onDelete={onDelete}
                  onTogglePin={onTogglePin}
                  style={{ cursor: draggingId === note.id ? 'grabbing' : 'default' }}
                />
              </div>
            )
          })}
        </div>

        {notes.length === 0 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 8,
            pointerEvents: 'none',
          }}>
            <div style={{ fontSize: 14, color: C.mute }}>Double-click anywhere to create a note</div>
          </div>
        )}
      </div>
    </div>
  )
}
