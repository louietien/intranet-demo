'use client'
import { useState } from 'react'
import { Wrench, X } from 'lucide-react'
import { C, CARD_STYLE } from '../tokens'
import type { MaintenanceState } from '../types'

interface Props {
  state: MaintenanceState
  userEmail: string
  onEnable: (message: string, byEmail: string) => Promise<void>
  onDisable: () => Promise<void>
}

export function MaintenanceToggle({ state, userEmail, onEnable, onDisable }: Props) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(state.message)
  const [saving, setSaving] = useState(false)

  async function handleEnable() {
    setSaving(true)
    await onEnable(message || state.message, userEmail)
    setSaving(false)
    setOpen(false)
  }

  async function handleDisable() {
    setSaving(true)
    await onDisable()
    setSaving(false)
    setOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(v => !v)}
        title={state.enabled ? 'Maintenance mode is ON' : 'Maintenance mode'}
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          border: `1px solid ${state.enabled ? C.amber : C.line}`,
          background: state.enabled ? C.amber + '22' : C.card,
          color: state.enabled ? C.amber : C.mute,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          padding: 0,
        }}
      >
        <Wrench size={15} strokeWidth={1.8} />
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
            }}
          />
          <div
            style={{
              ...CARD_STYLE,
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: 320,
              padding: 20,
              zIndex: 50,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.ink,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Wrench size={14} />
                Maintenance Mode
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: C.mute,
                  cursor: 'pointer',
                  padding: 2,
                  display: 'flex',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {state.enabled ? (
              <>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: C.amber + '18',
                    border: `1px solid ${C.amber}44`,
                    fontSize: 12,
                    color: C.body,
                    marginBottom: 12,
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: C.amber }}>Active</strong> — enabled by {state.enabledBy || 'unknown'}<br />
                  <span style={{ color: C.mute }}>"{state.message}"</span>
                </div>
                <button
                  onClick={handleDisable}
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '9px 0',
                    borderRadius: 10,
                    border: `1px solid ${C.line}`,
                    background: C.card,
                    color: C.ink,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: saving ? 'wait' : 'pointer',
                  }}
                >
                  {saving ? 'Disabling…' : 'Disable maintenance mode'}
                </button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: C.mute, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Message shown to users
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: `1px solid ${C.line}`,
                      background: C.inputBg,
                      color: C.ink,
                      fontSize: 13,
                      fontFamily: 'Geist, sans-serif',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <button
                  onClick={handleEnable}
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '9px 0',
                    borderRadius: 10,
                    border: 'none',
                    background: C.amber,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: saving ? 'wait' : 'pointer',
                  }}
                >
                  {saving ? 'Enabling…' : 'Enable maintenance mode'}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
