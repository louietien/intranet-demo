'use client'
import { useEffect, useState } from 'react'
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind, Droplets } from 'lucide-react'
import { C, CARD_STYLE, EYEBROW_STYLE } from '../tokens'

// Fictional office location for this demo
const LAT = 40.7484
const LON = -73.9857

interface WeatherData {
  temperature: number
  weathercode: number
  windspeed: number
  humidity: number
}

function wmoDescription(code: number): string {
  if (code === 0) return 'Clear sky'
  if (code <= 3) return 'Partly cloudy'
  if (code <= 48) return 'Foggy'
  if (code <= 55) return 'Drizzle'
  if (code <= 65) return 'Rain'
  if (code <= 75) return 'Snow'
  if (code <= 82) return 'Showers'
  if (code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

function WeatherIcon({ code, size = 28 }: { code: number; size?: number }) {
  const props = { size, strokeWidth: 1.5 }
  if (code === 0) return <Sun {...props} color={C.amber} />
  if (code <= 3) return <Cloud {...props} color={C.mute} />
  if (code <= 48) return <Wind {...props} color={C.mute} />
  if (code <= 55) return <CloudDrizzle {...props} color={C.mute} />
  if (code <= 65) return <CloudRain {...props} color={C.mute} />
  if (code <= 75) return <CloudSnow {...props} color={C.mute} />
  if (code <= 82) return <CloudRain {...props} color={C.mute} />
  return <CloudLightning {...props} color={C.amber} />
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m` +
      `&wind_speed_unit=ms&temperature_unit=celsius&timezone=America%2FNew_York`
    )
      .then(r => r.json())
      .then(data => {
        const c = data.current
        setWeather({
          temperature: Math.round(c.temperature_2m),
          weathercode: c.weathercode,
          windspeed: Math.round(c.windspeed_10m),
          humidity: c.relativehumidity_2m,
        })
      })
      .catch(() => setError(true))
  }, [])

  return (
    <div style={{ ...CARD_STYLE, padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ ...EYEBROW_STYLE, marginBottom: 12 }}>
        Weather · HQ
      </div>

      {error && (
        <div style={{ fontSize: 13, color: C.mute }}>Unable to load weather</div>
      )}

      {!weather && !error && (
        <div style={{ fontSize: 13, color: C.mute }}>Loading…</div>
      )}

      {weather && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <WeatherIcon code={weather.weathercode} size={36} />
            <div>
              <div style={{ fontSize: 28, fontWeight: 600, fontFamily: '"Bricolage Grotesque", sans-serif', lineHeight: 1, color: C.ink }}>
                {weather.temperature}°C
              </div>
              <div style={{ fontSize: 13, color: C.mute, marginTop: 3 }}>
                {wmoDescription(weather.weathercode)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.mute }}>
              <Wind size={13} strokeWidth={1.5} />
              {weather.windspeed} m/s
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.mute }}>
              <Droplets size={13} strokeWidth={1.5} />
              {weather.humidity}%
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
