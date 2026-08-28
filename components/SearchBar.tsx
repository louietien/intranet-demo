'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { C } from '../tokens'

export function SearchBar() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    router.push(`/search?q=${encodeURIComponent(value.trim())}`)
    setValue('')
    inputRef.current?.blur()
  }

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', width: 240 }}>
      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.mute, pointerEvents: 'none' }} />
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search…"
        style={{
          width: '100%', boxSizing: 'border-box',
          border: `1px solid ${focused ? C.purple : C.line}`,
          borderRadius: 8, padding: '6px 12px 6px 30px',
          fontSize: 13, color: C.ink, background: C.card,
          outline: 'none', fontFamily: 'Geist, -apple-system, sans-serif',
          transition: 'border-color 150ms',
        }}
      />
    </form>
  )
}
