'use client'
import { Suspense, useMemo, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { BookOpen, Users, Newspaper, Search } from 'lucide-react'
import { useApp } from '../../context/app-context'
import { C, CARD_STYLE, EYEBROW_STYLE } from '../../tokens'
import { Avatar } from '../../components/Avatar'
import { articleSlug } from '../../hooks'
import { SEED_NEWS_POST_IDS, SEED_KB_ARTICLE_IDS } from '../../lib/mockData'

function SearchContent() {
  const { posts, team, articles } = useApp()
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get('q') ?? ''
  const [inputValue, setInputValue] = useState(q)

  useEffect(() => { setInputValue(q) }, [q])

  function handleSearch(value: string) {
    setInputValue(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('q', value.trim())
    } else {
      params.delete('q')
    }
    router.replace(`/search?${params.toString()}`)
  }

  const peopleFuse = useMemo(() => new Fuse(team, { keys: ['name', 'role', 'department'], threshold: 0.4 }), [team])
  const newsFuse = useMemo(() => new Fuse(posts, { keys: ['title', 'body', 'tag'], threshold: 0.4 }), [posts])
  const articlesFuse = useMemo(() => new Fuse(articles, { keys: ['title', 'summary', 'section', 'tags', 'content'], threshold: 0.4 }), [articles])

  const peopleResults = q ? peopleFuse.search(q).slice(0, 5).map(r => r.item) : []
  const newsResults = q ? newsFuse.search(q).slice(0, 5).map(r => r.item) : []
  const articleResults = q ? articlesFuse.search(q).slice(0, 5).map(r => r.item) : []

  const hasResults = peopleResults.length > 0 || newsResults.length > 0 || articleResults.length > 0

  return (
    <div className="news-page" style={{ maxWidth: 780, margin: '0 auto', padding: '40px 36px 80px' }}>
      <p style={EYEBROW_STYLE}>Search</p>
      <h1 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', margin: '6px 0 20px' }}>
        Search the intranet
      </h1>

      {/* Search input — always visible, primary entry point on mobile */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: C.mute, pointerEvents: 'none' }} />
        <input
          autoFocus
          value={inputValue}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search people, news, docs…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            padding: '11px 14px 11px 38px',
            fontSize: 14,
            color: C.ink,
            background: C.inputBg,
            outline: 'none',
            fontFamily: 'Geist, -apple-system, sans-serif',
          }}
          onFocus={e => { e.target.style.borderColor = C.purple }}
          onBlur={e => { e.target.style.borderColor = C.line }}
        />
      </div>

      {!q && (
        <p style={{ color: C.mute, fontSize: 14 }}>Search people, news posts, and knowledge base articles.</p>
      )}

      {q && !hasResults && (
        <div style={{ ...CARD_STYLE, padding: '48px', textAlign: 'center' }}>
          <p style={{ color: C.mute, fontSize: 14, margin: 0 }}>No results for "{q}".</p>
        </div>
      )}

      {/* People */}
      {peopleResults.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <Users size={13} color={C.purple} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.mute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>People</span>
          </div>
          <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
            {peopleResults.map((person, i) => (
              <Link
                key={person.id}
                href={`/people/${person.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textDecoration: 'none', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}` }}
              >
                <Avatar name={person.name} size={36} avatarUrl={person.avatarUrl} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{person.name}</div>
                  {person.role && <div style={{ fontSize: 12, color: C.mute }}>{person.role}</div>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* News */}
      {newsResults.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <Newspaper size={13} color={C.purple} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.mute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>News</span>
          </div>
          <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
            {newsResults.map((post, i) => (
              <Link
                key={post.id}
                href={SEED_NEWS_POST_IDS.has(post.id) ? `/news/${post.id}` : '/news'}
                style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '12px 16px', textDecoration: 'none', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}` }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: C.purple }}>{post.tag}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{post.title}</span>
                <span style={{ fontSize: 12, color: C.mute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.body.slice(0, 100)}…
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Kbase */}
      {articleResults.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <BookOpen size={13} color={C.purple} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.mute, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Kbase</span>
          </div>
          <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
            {articleResults.map((article, i) => (
              <Link
                key={article.id}
                href={SEED_KB_ARTICLE_IDS.has(article.id) ? `/docs/${articleSlug(article)}` : '/docs'}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', textDecoration: 'none', borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}` }}
              >
                <BookOpen size={18} color={C.mute} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{article.title}</div>
                  {article.summary && <div style={{ fontSize: 12, color: C.mute, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.summary}</div>}
                </div>
                <span style={{ fontSize: 11, color: C.purple, background: C.purpleSoft, padding: '2px 8px', borderRadius: 999, flexShrink: 0 }}>{article.section}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px 36px', textAlign: 'center', color: '#888' }}>Loading…</div>}>
      <SearchContent />
    </Suspense>
  )
}
