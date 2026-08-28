'use client'
import { C } from '../tokens'

interface Props {
  message: string
}

export function MaintenanceScreen({ message }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, sans-serif',
        padding: 24,
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 18,
            background: C.purpleSoft,
            marginBottom: 24,
            fontSize: 30,
          }}
        >
          🔧
        </div>
        <div
          style={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontSize: 28,
            fontWeight: 800,
            color: C.ink,
            letterSpacing: '-0.025em',
            marginBottom: 12,
          }}
        >
          Under Maintenance
        </div>
        <p style={{ fontSize: 15, color: C.body, lineHeight: 1.6, marginBottom: 20 }}>
          {message}
        </p>
      </div>
    </div>
  )
}
