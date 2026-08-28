'use client'
import { useState } from 'react'
import { useApp } from '../context/app-context'
import { C, CARD_STYLE } from '../tokens'

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const QUICK_JUMPS: { label: string; dayOffset: number; hour: number }[] = [
  { label: 'Next Wednesday', dayOffset: 0, hour: 10 },
  { label: 'Morning (9am)', dayOffset: 0, hour: 9 },
  { label: 'Afternoon (2pm)', dayOffset: 0, hour: 14 },
  { label: 'Evening (7pm)', dayOffset: 0, hour: 19 },
]

function nextWeekday(targetDay: number): Date {
  const d = new Date()
  const current = d.getDay()
  const diff = (targetDay - current + 7) % 7 || 7
  d.setDate(d.getDate() + diff)
  d.setHours(10, 0, 0, 0)
  return d
}

export function DebugPanel() {
  const { isMaintainer, now, debugNow, setDebugNow } = useApp()
  const [open, setOpen] = useState(false)
  const [inputVal, setInputVal] = useState(() => toLocalInputValue(new Date()))

  if (!isMaintainer) return null

  function applyTime() {
    const d = new Date(inputVal)
    if (!isNaN(d.getTime())) setDebugNow(d)
  }

  function reset() {
    setDebugNow(null)
    setInputVal(toLocalInputValue(new Date()))
  }

  function jumpTo(d: Date) {
    setDebugNow(d)
    setInputVal(toLocalInputValue(d))
  }

  const isOverriding = debugNow !== null

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        title="Debug panel"
        className="debug-btn"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9000,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: `1px solid ${isOverriding ? C.amber : C.line}`,
          background: isOverriding ? C.amber : C.card,
          color: isOverriding ? '#fff' : C.mute,
          fontSize: 16,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        🛠
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 68,
            right: 24,
            zIndex: 9000,
            width: 300,
            ...CARD_STYLE,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: C.mute, textTransform: 'uppercase' }}>
              Debug Panel
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mute, fontSize: 16, padding: 0, lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, color: C.mute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Effective time
            </label>
            <div style={{ fontSize: 12, color: isOverriding ? C.amber : C.body, fontWeight: isOverriding ? 700 : 400 }}>
              {now.toLocaleString('en-GB', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              {isOverriding && ' (overridden)'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, color: C.mute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Override date & time
            </label>
            <input
              type="datetime-local"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              style={{
                fontSize: 13,
                padding: '6px 10px',
                borderRadius: 8,
                border: `1px solid ${C.line}`,
                background: C.inputBg,
                color: C.ink,
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={applyTime}
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: C.purple,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
              {isOverriding && (
                <button
                  onClick={reset}
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: `1px solid ${C.line}`,
                    background: 'none',
                    color: C.mute,
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, color: C.mute, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Quick jumps
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button
                onClick={() => jumpTo(nextWeekday(3))}
                style={{
                  fontSize: 12,
                  padding: '5px 10px',
                  borderRadius: 7,
                  border: `1px solid ${C.line}`,
                  background: 'none',
                  color: C.body,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                🐸 Next Wednesday
              </button>
              {QUICK_JUMPS.slice(1).map(j => {
                const d = debugNow ? new Date(debugNow) : new Date()
                d.setHours(j.hour, 0, 0, 0)
                return (
                  <button
                    key={j.label}
                    onClick={() => jumpTo(d)}
                    style={{
                      fontSize: 12,
                      padding: '5px 10px',
                      borderRadius: 7,
                      border: `1px solid ${C.line}`,
                      background: 'none',
                      color: C.body,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {j.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
