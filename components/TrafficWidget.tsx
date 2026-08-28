'use client'
import { Car, Train } from 'lucide-react'
import { C, CARD_STYLE, EYEBROW_STYLE } from '../tokens'

// Static mock — the real app called the Google Maps Routes API here, which needs a
// billed API key. Not worth requiring that just for a portfolio demo, so this is a
// fixed, illustrative commute instead of a live one.

export function TrafficWidget() {
  return (
    <div style={{ ...CARD_STYLE, padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ ...EYEBROW_STYLE, marginBottom: 12 }}>
        Commute · To HQ
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Car size={20} strokeWidth={1.5} color={C.green} />
          <span style={{ fontSize: 20, fontWeight: 600, fontFamily: '"Bricolage Grotesque", sans-serif', color: C.ink }}>
            22 min
          </span>
          <span style={{ fontSize: 12, color: C.mute }}>14 km</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Train size={20} strokeWidth={1.5} color={C.mute} />
          <span style={{ fontSize: 20, fontWeight: 600, fontFamily: '"Bricolage Grotesque", sans-serif', color: C.ink }}>
            31 min
          </span>
          <span style={{ fontSize: 12, color: C.mute }}>Downtown line</span>
        </div>
      </div>
    </div>
  )
}
