'use client'
import { useState } from 'react'
import type { CalendarEvent } from '../types'
import { C, CARD_STYLE } from '../tokens'
import { Avatar } from './Avatar'
import { Modal } from './Modal'

const KIND_COLOR: Record<CalendarEvent['kind'], string> = {
  team: C.purple,
  client: C.navy,
  company: C.amber,
  personal: C.green,
}

const KIND_LABEL: Record<CalendarEvent['kind'], string> = {
  team: 'Team',
  client: 'Client',
  company: 'Company',
  personal: 'Personal',
}

function EventItem({
  event,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
}) {
  const [confirming, setConfirming] = useState(false)
  const isReadOnly = event.source === 'graph'
  const date = new Date(event.date)
  const dayAbbr = date.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
  const dayNum = date.getDate()
  const accentColor = KIND_COLOR[event.kind]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '54px 1fr auto',
        gap: 18,
        alignItems: 'center',
        padding: '14px 4px',
        borderTop: `1px solid ${C.lineSoft}`,
      }}
    >
      <button
        onClick={() => !isReadOnly && onEdit(event)}
        title={isReadOnly ? undefined : 'Edit event'}
        style={{
          width: 54,
          height: 54,
          borderRadius: 14,
          background: C.bgWarm,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          border: 'none',
          cursor: isReadOnly ? 'default' : 'pointer',
          padding: 0,
        }}
      >
        <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accentColor }} />
        <span style={{ fontSize: 10, letterSpacing: '0.08em', fontWeight: 600, color: C.mute, textTransform: 'uppercase', lineHeight: 1 }}>
          {dayAbbr}
        </span>
        <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 2 }}>
          {dayNum}
        </span>
      </button>

      <div style={{ minWidth: 0 }}>
        <span
          onClick={() => !isReadOnly && onEdit(event)}
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: C.ink,
            letterSpacing: '-0.005em',
            marginBottom: 3,
            display: 'block',
            cursor: isReadOnly ? 'default' : 'pointer',
          }}
        >
          {event.title}
        </span>
        <div style={{ fontSize: 13, color: C.body, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {event.time && <span>{event.time}</span>}
          {event.time && event.where && <span style={{ width: 3, height: 3, borderRadius: '50%', background: C.mute, display: 'inline-block' }} />}
          {event.where && <span>{event.where}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {event.attendees.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {event.attendees.slice(0, 3).map((u, i) => (
              <div key={u.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                <Avatar name={u.name} size={26} avatarUrl={u.avatarUrl} />
              </div>
            ))}
            {event.attendees.length > 3 && (
              <span
                style={{
                  marginLeft: -8,
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: '#fff',
                  border: `1px solid ${C.line}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.body,
                }}
              >
                +{event.attendees.length - 3}
              </span>
            )}
          </div>
        )}

        {!isReadOnly && (confirming ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: C.mute }}>Delete?</span>
            <button
              onClick={() => onDelete(event.id)}
              style={{ padding: '4px 10px', borderRadius: 999, border: 'none', background: '#E53935', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Yes
            </button>
            <button
              onClick={() => setConfirming(false)}
              style={{ padding: '4px 10px', borderRadius: 999, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, fontSize: 12, cursor: 'pointer' }}
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            aria-label="Delete event"
            style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.mute, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

interface EventFormProps {
  initial?: CalendarEvent
  onSave: (event: CalendarEvent) => void
  onClose: () => void
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${C.line}`,
  borderRadius: 10,
  padding: '9px 13px',
  fontSize: 14,
  color: C.ink,
  background: C.inputBg,
  outline: 'none',
  boxSizing: 'border-box',
}

function parseTimeParts(time: string): [string, string] {
  const parts = time.split(/\s*[—–-]\s*/)
  return [parts[0]?.trim() ?? '', parts[1]?.trim() ?? '']
}

function AddEventForm({ initial, onSave, onClose }: EventFormProps) {
  const editing = !!initial
  const [startRaw, endRaw] = initial?.time ? parseTimeParts(initial.time) : ['', '']

  const [title, setTitle] = useState(initial?.title ?? '')
  const [date, setDate] = useState(initial?.date ?? '')
  const [timeStart, setTimeStart] = useState(startRaw)
  const [timeEnd, setTimeEnd] = useState(endRaw)
  const [where, setWhere] = useState(initial?.where ?? '')
  const [kind, setKind] = useState<CalendarEvent['kind']>(initial?.kind ?? 'team')

  function handleSubmit() {
    if (!title.trim() || !date) return
    const time = timeStart && timeEnd ? `${timeStart} — ${timeEnd}` : timeStart || ''
    onSave({
      id: initial?.id ?? `event-${Date.now()}`,
      title: title.trim(),
      date,
      time,
      where: where.trim(),
      kind,
      attendees: initial?.attendees ?? [],
    })
  }

  const canSubmit = title.trim().length > 0 && date.length > 0
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: C.body, marginBottom: 6, display: 'block' }
  const fieldStyle: React.CSSProperties = { marginBottom: 16 }

  return (
    <Modal title={editing ? 'Edit event' : 'Add event'} onClose={onClose} width={480}>
      <div style={fieldStyle}>
        <label style={labelStyle}>Title</label>
        <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Client call — Acme" style={INPUT_STYLE} onFocus={e => { e.target.style.borderColor = C.purple }} onBlur={e => { e.target.style.borderColor = C.line }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={INPUT_STYLE} onFocus={e => { e.target.style.borderColor = C.purple }} onBlur={e => { e.target.style.borderColor = C.line }} />
        </div>
        <div>
          <label style={labelStyle}>Kind</label>
          <select value={kind} onChange={e => setKind(e.target.value as CalendarEvent['kind'])} style={{ ...INPUT_STYLE, cursor: 'pointer' }}>
            {(Object.keys(KIND_LABEL) as CalendarEvent['kind'][]).map(k => (
              <option key={k} value={k}>{KIND_LABEL[k]}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Start time</label>
          <input type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} style={INPUT_STYLE} onFocus={e => { e.target.style.borderColor = C.purple }} onBlur={e => { e.target.style.borderColor = C.line }} />
        </div>
        <div>
          <label style={labelStyle}>End time</label>
          <input type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} style={INPUT_STYLE} onFocus={e => { e.target.style.borderColor = C.purple }} onBlur={e => { e.target.style.borderColor = C.line }} />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Location</label>
        <input value={where} onChange={e => setWhere(e.target.value)} placeholder="e.g. Office · Vesterbro, or Zoom" style={INPUT_STYLE} onFocus={e => { e.target.style.borderColor = C.purple }} onBlur={e => { e.target.style.borderColor = C.line }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 12, color: C.mute }}>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: KIND_COLOR[kind], display: 'inline-block' }} />
        {KIND_LABEL[kind]} events show with a {kind === 'team' ? 'purple' : kind === 'client' ? 'navy' : kind === 'company' ? 'amber' : 'green'} stripe
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 999, background: 'transparent', border: `1px solid ${C.line}`, color: C.mute, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleSubmit} disabled={!canSubmit} style={{ padding: '9px 22px', borderRadius: 999, background: canSubmit ? C.navy : C.lineSoft, border: 'none', color: canSubmit ? '#fff' : C.mute, fontSize: 13, fontWeight: 600, cursor: canSubmit ? 'pointer' : 'default', transition: 'all 150ms' }}>
          {editing ? 'Save changes' : 'Add event'}
        </button>
      </div>
    </Modal>
  )
}

interface Props {
  events: CalendarEvent[]
  onAddEvent: (event: CalendarEvent) => void
  onDeleteEvent: (id: string) => void
  onUpdateEvent: (event: CalendarEvent) => void
}

export function UpcomingEvents({ events, onAddEvent, onDeleteEvent, onUpdateEvent }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CalendarEvent | null>(null)

  return (
    <>
      <section style={{ ...CARD_STYLE, background: C.surface, padding: '28px 30px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.14em', fontWeight: 600, color: C.mute, textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.purple, display: 'inline-block' }} />
              Calendar
            </div>
            <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>
              Upcoming
            </h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: '6px 13px', borderRadius: 999, background: 'transparent', border: `1px solid ${C.line}`, color: C.body, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Add
          </button>
        </div>

        {events.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: C.mute, fontSize: 14 }}>Nothing on the calendar this week.</div>
        ) : (
          <div>{events.map(e => <EventItem key={e.id} event={e} onEdit={ev => setEditing(ev)} onDelete={onDeleteEvent} />)}</div>
        )}
      </section>

      {showForm && <AddEventForm onSave={event => { onAddEvent(event); setShowForm(false) }} onClose={() => setShowForm(false)} />}
      {editing && <AddEventForm initial={editing} onSave={event => { onUpdateEvent(event); setEditing(null) }} onClose={() => setEditing(null)} />}
    </>
  )
}
