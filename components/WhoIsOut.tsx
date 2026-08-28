'use client'
import type { LeaveEntry } from '../types'
import { C, CARD_STYLE } from '../tokens'

const VACATION_URL = process.env.NEXT_PUBLIC_VACATION_URL ?? ''

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatShort(str: string): string {
  const d = parseDate(str)
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
}

function firstName(name: string): string {
  return name.split(' ')[0]
}

function PersonChip({ entry }: { entry: LeaveEntry }) {
  const isHalf = entry.type === 'Vacation (half-day)'
  const isApproved = entry.status === 'Approved' || entry.status === 'Registered'

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 10, background: C.bgWarm, gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: isApproved ? C.green : C.amber, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {firstName(entry.name)}
        </span>
        {isHalf && <span style={{ fontSize: 10, color: C.mute, fontWeight: 500 }}>½</span>}
      </div>
      <span style={{ fontSize: 11, color: C.mute, whiteSpace: 'nowrap', flexShrink: 0 }}>
        {entry.from === entry.to ? formatShort(entry.from) : `${formatShort(entry.from)} – ${formatShort(entry.to)}`}
      </span>
    </div>
  )
}

interface Props {
  todayOut: LeaveEntry[]
  soonOut: LeaveEntry[]
  loading?: boolean
  error?: string | null
}

export function WhoIsOut({ todayOut, soonOut, loading, error }: Props) {
  const anyActivity = todayOut.length > 0 || soonOut.length > 0

  return (
    <section style={{ ...CARD_STYLE, background: C.surface, padding: '22px 22px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>
            {loading ? "Who's Out" : todayOut.length > 0 ? `${todayOut.length} out today` : 'All hands on deck'}
          </h2>
        </div>
        {VACATION_URL && (
          <a href={VACATION_URL} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.purple, fontWeight: 500, textDecoration: 'none' }}>
            Full calendar →
          </a>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[70, 55, 80].map((w, i) => (
            <div key={i} style={{ height: 32, borderRadius: 10, background: C.lineSoft, width: `${w}%` }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ fontSize: 12, color: C.mute, padding: '4px 2px' }}>Could not load leave data.</div>
      ) : !anyActivity ? (
        <div style={{ fontSize: 13, color: C.mute, padding: '4px 2px' }}>No leave in the next 7 days.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {todayOut.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {todayOut.map(e => <PersonChip key={e.id} entry={e} />)}
            </div>
          )}
          {soonOut.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.mute, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Coming up</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {soonOut.map(e => <PersonChip key={e.id} entry={e} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
