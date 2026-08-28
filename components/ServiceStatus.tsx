'use client'
import { C, CARD_STYLE, EYEBROW_STYLE } from '../tokens'

// Static/simulated status — the real app polled two vendor status pages here.
// This demo has no real vendors to check, so the "history" below is just a
// pleasant-looking, deterministic pattern rather than live data.

type Indicator = 'none' | 'minor'

interface ServiceState {
  name: string
  indicator: Indicator
  days: Indicator[]
}

const INDICATOR_COLOR: Record<Indicator, string> = {
  none: C.green,
  minor: C.amber,
}

const INDICATOR_LABEL: Record<Indicator, string> = {
  none: 'Operational',
  minor: 'Degraded',
}

const HISTORY_DAYS = 90

function buildHistory(blipEvery: number): Indicator[] {
  return Array.from({ length: HISTORY_DAYS }, (_, i) => (i > 0 && i % blipEvery === 0 ? 'minor' : 'none'))
}

const SERVICES: ServiceState[] = [
  { name: 'Core Platform', indicator: 'none', days: buildHistory(41) },
  { name: 'Data Pipeline', indicator: 'none', days: buildHistory(63) },
]

function UptimeBars({ days }: { days: Indicator[] }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginTop: 8 }}>
      {days.map((d, i) => (
        <div
          key={i}
          title={INDICATOR_LABEL[d]}
          style={{
            flex: 1,
            height: 24,
            borderRadius: 3,
            background: INDICATOR_COLOR[d],
            opacity: d === 'none' ? 0.5 : 1,
          }}
        />
      ))}
    </div>
  )
}

export function ServiceStatus() {
  return (
    <div style={{ ...CARD_STYLE, padding: '16px 20px', flex: 1 }}>
      <div style={{ ...EYEBROW_STYLE, marginBottom: 12 }}>Service Status</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SERVICES.map(s => (
          <div key={s.name}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: INDICATOR_COLOR[s.indicator],
                  flexShrink: 0,
                  boxShadow: s.indicator === 'none' ? `0 0 0 3px ${C.green}22` : undefined,
                }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{s.name}</span>
              </div>
              <span style={{ fontSize: 12, color: INDICATOR_COLOR[s.indicator] }}>
                {INDICATOR_LABEL[s.indicator]}
              </span>
            </div>
            <UptimeBars days={s.days} />
          </div>
        ))}
      </div>
    </div>
  )
}
