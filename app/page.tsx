'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/app-context'
import { useWhoIsOut, useCelebrations } from '../hooks'
import type { CalendarEvent, Note } from '../types'
import { HeroStrip } from '../components/HeroStrip'
import { PinnedAnnouncement } from '../components/PinnedAnnouncement'
import { QuickLinks } from '../components/QuickLinks'
import { RecentPosts } from '../components/RecentPosts'
import { UpcomingEvents } from '../components/UpcomingEvents'
import { TeamDirectory } from '../components/TeamDirectory'
import { WhoIsOut } from '../components/WhoIsOut'
import { Celebrations } from '../components/Celebrations'
import { WeatherWidget } from '../components/WeatherWidget'
import { TrafficWidget } from '../components/TrafficWidget'
import { ServiceStatus } from '../components/ServiceStatus'
import { NoteCard } from '../components/NoteCard'
import { NoteEditor } from '../components/NoteEditor'
import { C, CARD_STYLE, EYEBROW_STYLE } from '../tokens'

function isUpcoming(event: CalendarEvent, now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const eventDate = new Date(event.date)
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
  return eventDay >= today
}

export default function HomePage() {
  const { me, posts, links, updateLinks, events, addEvent, deleteEvent, updateEvent, team, teamLoading, teamError, now, notes, notesLoading, addNote, updateNote, deleteNote, togglePin, reorderNotes, dark } = useApp()
  const pin = posts[0] ?? null
  const { todayOut, soonOut, loading: leaveLoading, error: leaveError } = useWhoIsOut(now)
  const { birthdays, anniversaries } = useCelebrations(team, now)

  const [panelWidth, setPanelWidth] = useState(0)
  useEffect(() => {
    function update() { setPanelWidth(Math.max(0, (window.innerWidth - 1440) / 2 - 12)) }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const [panelOpen, setPanelOpen] = useState(true)
  useEffect(() => {
    const saved = localStorage.getItem('notes-panel-open')
    if (saved !== null) setPanelOpen(saved !== 'false')
  }, [])
  function togglePanel() {
    setPanelOpen(v => {
      const next = !v
      localStorage.setItem('notes-panel-open', String(next))
      return next
    })
  }

  const [composingNote, setComposingNote] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  function handlePanelDrop(targetId: string) {
    if (!dragId || dragId === targetId) return
    const ids = allNotes.map(n => n.id)
    const from = ids.indexOf(dragId)
    const to = ids.indexOf(targetId)
    const reordered = [...ids]
    reordered.splice(from, 1)
    reordered.splice(to, 0, dragId)
    reorderNotes(reordered)
    setDragId(null)
    setOverId(null)
  }

  const allNotes = [...notes.filter(n => n.pinned), ...notes.filter(n => !n.pinned)]

  function handleNoteSave(data: Omit<Note, 'id' | 'created' | 'updated' | 'authorEmail'>) {
    if (editingNote) return updateNote(editingNote.id, data)
    return addNote({ ...data, x: 40, y: 40 })
  }

  const sidebar = (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'var(--psb-pos)' as React.CSSProperties['position'], top: 92 }}>
      <TeamDirectory team={team} loading={teamLoading} error={teamError} />
      {(leaveLoading || leaveError || todayOut.length > 0 || soonOut.length > 0) && (
        <WhoIsOut todayOut={todayOut} soonOut={soonOut} loading={leaveLoading} error={leaveError} />
      )}
      <Celebrations birthdays={birthdays} anniversaries={anniversaries} />
      <UpcomingEvents events={events.filter(e => isUpcoming(e, now))} onAddEvent={addEvent} onDeleteEvent={deleteEvent} onUpdateEvent={updateEvent} />
    </aside>
  )

  return (
    <>
      {/* Notes panel — portalled to body so position:fixed is relative to viewport, not the fadeUp transform wrapper */}
      {panelWidth >= 120 && createPortal(
        <div style={{
          position: 'fixed',
          left: 0,
          top: 57,
          bottom: 0,
          width: panelWidth,
          overflow: 'hidden',
          padding: '16px 0 20px 12px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 20,
        }}>
          {panelOpen ? (
            <div style={{ ...CARD_STYLE, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderBottom: `1px solid ${C.lineSoft}`,
                flexShrink: 0,
              }}>
                <span style={EYEBROW_STYLE}>
                  Notes
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: C.purple,
                    background: C.purpleSoft,
                    padding: '1px 5px',
                    borderRadius: 4,
                  }}>Beta</span>
                </span>
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <button
                    onClick={() => { setEditingNote(null); setComposingNote(true) }}
                    style={{
                      width: 22, height: 22, borderRadius: 6,
                      border: 'none', background: C.purple, color: '#fff',
                      fontSize: 15, lineHeight: 1, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={togglePanel}
                    title="Hide notes panel"
                    style={{
                      width: 22, height: 22, borderRadius: 6,
                      border: `1px solid ${C.line}`, background: 'transparent', color: C.mute,
                      fontSize: 14, lineHeight: 1, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Body */}
              {notesLoading ? (
                <div style={{ padding: 12, color: C.mute, fontSize: 12 }}>Loading…</div>
              ) : allNotes.length === 0 ? (
                <button
                  onClick={() => { setEditingNote(null); setComposingNote(true) }}
                  style={{
                    margin: 10, background: 'none',
                    border: `1px dashed ${C.line}`, borderRadius: 10,
                    color: C.mute, fontSize: 12, cursor: 'pointer',
                    padding: '14px 0', textAlign: 'center',
                  }}
                >
                  + Capture a thought…
                </button>
              ) : (
                <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {allNotes.map(note => (
                    <div
                      key={note.id}
                      draggable
                      onDragStart={() => setDragId(note.id)}
                      onDragOver={e => { e.preventDefault(); setOverId(note.id) }}
                      onDrop={() => handlePanelDrop(note.id)}
                      onDragEnd={() => { setDragId(null); setOverId(null) }}
                      style={{
                        opacity: dragId === note.id ? 0.4 : 1,
                        outline: overId === note.id && dragId !== note.id ? `2px solid ${C.purple}` : 'none',
                        outlineOffset: 3,
                        borderRadius: 12,
                        transition: 'opacity 150ms ease',
                      }}
                    >
                      <NoteCard
                        note={note}
                        dark={dark}
                        compact
                        onEdit={n => { setEditingNote(n); setComposingNote(true) }}
                        onDelete={deleteNote}
                        onTogglePin={togglePin}
                      />
                    </div>
                  ))}
                  <Link
                    href="/notes"
                    style={{ fontSize: 11, color: C.mute, textDecoration: 'none', textAlign: 'center', padding: '4px 0', display: 'block' }}
                  >
                    Open in full →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={togglePanel}
              title="Show notes panel"
              style={{
                alignSelf: 'flex-end',
                padding: '5px 10px',
                borderRadius: 8,
                border: `1px solid ${C.line}`,
                background: C.card,
                color: C.mute,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: 'var(--c-cardShadow)',
              }}
            >
              Notes
            </button>
          )}
        </div>,
        document.body
      )}

      {/* Main page */}
      <HeroStrip user={me} />
      <div style={{
        display: 'flex',
        gap: 'var(--pwr-gap)',
        padding: 'var(--pwr-pad)',
        flexWrap: 'var(--pwr-wrap)' as React.CSSProperties['flexWrap'],
      }}>
        <div style={{ flex: 'var(--pw-flex)', display: 'flex' }}><WeatherWidget /></div>
        <div style={{ flex: 'var(--pw-flex)', display: 'flex' }}><TrafficWidget /></div>
        <div style={{ flex: 'var(--pw-flex-last)', display: 'flex' }}><ServiceStatus /></div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'var(--pmg-cols)',
        gap: 'var(--pmg-gap)',
        padding: 'var(--pmg-pad)',
        alignItems: 'flex-start',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          <QuickLinks links={links} onUpdateLinks={updateLinks} />
          <PinnedAnnouncement pin={pin} />
          <RecentPosts posts={posts} />
        </div>
        {sidebar}
      </div>

      {(composingNote || editingNote) && (
        <NoteEditor
          note={editingNote ?? undefined}
          onSave={handleNoteSave}
          onClose={() => { setComposingNote(false); setEditingNote(null) }}
        />
      )}
    </>
  )
}
