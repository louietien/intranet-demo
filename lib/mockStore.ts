'use client'

// A tiny client-side stand-in for the real backend (PocketBase/Graph/Monday/Slack in the
// original app). Every "collection" lives in localStorage, scoped to the visitor's own
// browser — there is no server, so nothing here is shared across visitors or devices.

function readLS<T>(key: string): T[] | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : null
  } catch {
    return null
  }
}

function writeLS<T>(key: string, items: T[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(items))
  } catch {
    // storage full or unavailable — edits just won't persist across reloads
  }
}

let counter = 0
export function makeId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}

// Loads a collection from localStorage, seeding it on first visit. `seed` is only
// invoked (and only needs to be correct) the first time this key is ever read.
export function loadOrSeed<T>(key: string, seed: () => T[]): T[] {
  const cached = readLS<T>(key)
  if (cached) return cached
  const seeded = seed()
  writeLS(key, seeded)
  return seeded
}

export function persist<T>(key: string, items: T[]) {
  writeLS(key, items)
}

// Single-value settings (quick_links, maintenance_mode) — mirrors PocketBase's
// app_settings key/value collection from the original app.
export function loadSetting<T>(key: string, seed: () => T): T {
  if (typeof window === 'undefined') return seed()
  try {
    const raw = window.localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {
    // fall through to seed
  }
  const seeded = seed()
  persistSetting(key, seeded)
  return seeded
}

export function persistSetting<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

// Images pasted/dropped into the markdown editor. Stored as data URLs — fine for a
// handful of small demo images, not meant to scale like a real object store would.
interface StoredImage { id: string; dataUrl: string }

const KB_IMAGES_KEY = 'demo_kb_images'

export function createKbImage(file: File): Promise<{ id: string; url: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const id = makeId('img')
      const dataUrl = reader.result as string
      const images = readLS<StoredImage>(KB_IMAGES_KEY) ?? []
      images.push({ id, dataUrl })
      writeLS(KB_IMAGES_KEY, images)
      resolve({ id, url: dataUrl })
    }
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function listKbImageIds(): string[] {
  return (readLS<StoredImage>(KB_IMAGES_KEY) ?? []).map(i => i.id)
}

export function deleteKbImages(ids: string[]) {
  const idSet = new Set(ids)
  const images = (readLS<StoredImage>(KB_IMAGES_KEY) ?? []).filter(i => !idSet.has(i.id))
  writeLS(KB_IMAGES_KEY, images)
}

// Reads a File into a data URL — used by the Files page for the "download" link,
// since there's no real file host to upload to.
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
