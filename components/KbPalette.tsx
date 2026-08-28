'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import { Search, FileText } from 'lucide-react'
import type { KbArticle } from '../types'
import { C } from '../tokens'
import { articleSlug } from '../hooks'
import { SEED_KB_ARTICLE_IDS } from '../lib/mockData'

interface Props {
  articles: KbArticle[]
}

export function KbPalette({ articles }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const fuse = useMemo(() => new Fuse(articles, {
    keys: ['title', 'summary', 'tags', 'section', 'category'],
    threshold: 0.35,
    includeScore: true,
  }), [articles])

  const results = useMemo(() => {
    if (!query.trim()) return articles.slice(0, 8)
    return fuse.search(query).slice(0, 8).map(r => r.item)
  }, [query, fuse, articles])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setQuery('')
        setSelected(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30)
  }, [open])

  function go(article: KbArticle) {
    router.push(SEED_KB_ARTICLE_IDS.has(article.id) ? `/docs/${articleSlug(article)}` : '/docs')
    setOpen(false)
    setQuery('')
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter' && results[selected]) go(results[selected])
  }

  if (!open) return null

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }}
      />

      <div style={{
        position: 'fixed',
        top: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 580,
        maxWidth: 'calc(100vw - 32px)',
        background: C.card,
        borderRadius: 14,
        border: `1px solid ${C.line}`,
        boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
        zIndex: 1000,
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: `1px solid ${C.line}` }}>
          <Search size={16} color={C.mute} style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={onKeyDown}
            placeholder="Jump to article…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: C.ink,
              background: 'transparent',
              fontFamily: 'Geist, -apple-system, sans-serif',
            }}
          />
          <kbd style={{ fontSize: 11, color: C.mute, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 5, padding: '2px 6px', flexShrink: 0 }}>Esc</kbd>
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: C.mute }}>No articles found.</div>
          ) : (
            results.map((article, i) => (
              <button
                key={article.id}
                onClick={() => go(article)}
                onMouseEnter={() => setSelected(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '10px 16px',
                  border: 'none', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}`,
                  background: i === selected ? C.purpleSoft : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <FileText size={15} color={i === selected ? C.purple : C.mute} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: i === selected ? C.purple : C.ink }}>{article.title}</div>
                  {article.summary && (
                    <div style={{ fontSize: 12, color: C.mute, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{article.summary}</div>
                  )}
                </div>
                {article.section && (
                  <span style={{ fontSize: 11, color: C.mute, flexShrink: 0 }}>{article.section}</span>
                )}
              </button>
            ))
          )}
        </div>

        <div style={{ padding: '8px 16px', borderTop: `1px solid ${C.lineSoft}`, display: 'flex', gap: 12, fontSize: 11, color: C.mute }}>
          <span><kbd style={{ fontFamily: 'inherit', background: C.bg, border: `1px solid ${C.line}`, borderRadius: 4, padding: '1px 5px' }}>↑↓</kbd> navigate</span>
          <span><kbd style={{ fontFamily: 'inherit', background: C.bg, border: `1px solid ${C.line}`, borderRadius: 4, padding: '1px 5px' }}>↵</kbd> open</span>
          <span><kbd style={{ fontFamily: 'inherit', background: C.bg, border: `1px solid ${C.line}`, borderRadius: 4, padding: '1px 5px' }}>⌘K</kbd> toggle</span>
        </div>
      </div>
    </>
  )
}
