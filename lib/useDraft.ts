'use client'
import { useState, useEffect, useRef } from 'react'

export function useDraft(key: string | null, value: string) {
  const storageKey = key ? `kb_draft_${key}` : null
  const [hasDraft, setHasDraft] = useState(false)
  const mounted = useRef(false)

  useEffect(() => {
    if (!storageKey) return
    const saved = localStorage.getItem(storageKey)
    if (saved !== null && saved !== value) setHasDraft(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!storageKey) return
    if (!mounted.current) { mounted.current = true; return }
    const timer = setTimeout(() => localStorage.setItem(storageKey, value), 1000)
    return () => clearTimeout(timer)
  }, [value, storageKey])

  function getDraft(): string | null {
    return storageKey ? localStorage.getItem(storageKey) : null
  }

  function clearDraft() {
    if (storageKey) localStorage.removeItem(storageKey)
    setHasDraft(false)
  }

  return { hasDraft, getDraft, clearDraft }
}
