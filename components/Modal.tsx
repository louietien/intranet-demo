'use client'
import { useEffect } from 'react'
import { C } from '../tokens'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: number
}

export function Modal({ title, onClose, children, width = 520 }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(19,20,46,0.38)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '70px 16px 24px',
        zIndex: 100,
        backdropFilter: 'blur(2px)',
        animation: 'fadeIn 150ms ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.card,
          borderRadius: 20,
          boxShadow: '0 24px 60px -12px rgba(19,20,46,0.28)',
          border: `1px solid ${C.lineSoft}`,
          padding: '26px 28px 24px',
          width,
          maxWidth: '92vw',
          maxHeight: 'calc(100vh - 94px)',
          overflowY: 'auto',
          animation: 'scaleIn 220ms cubic-bezier(0.34, 1.4, 0.64, 1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2
            style={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontSize: 22,
              fontWeight: 800,
              color: C.ink,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              border: `1px solid ${C.line}`,
              background: 'transparent',
              color: C.mute,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
