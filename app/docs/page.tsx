'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { BookOpen, Search, Plus, X, Pencil, Trash2, Check, FolderOpen, ChevronUp, ChevronDown } from 'lucide-react'
import type { KbArticle, KbStatus } from '../../types'
import { C, CARD_STYLE, EYEBROW_STYLE } from '../../tokens'
import { articleSlug } from '../../hooks'
import { useApp } from '../../context/app-context'
import { renderMarkdown } from '../../lib/markdownRenderer'
import { listKbImageIds, deleteKbImages } from '../../lib/mockStore'
import { SEED_KB_ARTICLE_IDS } from '../../lib/mockData'

type OrphanState =
  | { phase: 'idle' }
  | { phase: 'scanning' }
  | { phase: 'found'; ids: string[]; count: number }
  | { phase: 'deleting' }
  | { phase: 'done'; deleted: number }

function findOrphanedImages(articles: KbArticle[]): string[] {
  const allContent = articles.map(a => a.content).join('\n')
  return listKbImageIds().filter(id => !allContent.includes(id))
}

const STATUS_COLORS: Record<KbStatus, string> = {
  active: C.green,
  draft: C.amber,
  deprecated: C.mute,
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: `1px solid ${C.line}`,
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 13,
  color: C.ink,
  background: C.inputBg,
  outline: 'none',
  fontFamily: 'Geist, -apple-system, sans-serif',
}

const STALE_MS = 90 * 24 * 60 * 60 * 1000

function isArticleStale(lastReviewed: string): boolean {
  if (!lastReviewed) return true
  return Date.now() - new Date(lastReviewed).getTime() > STALE_MS
}

function ArticleRow({ article, i }: { article: KbArticle; i: number }) {
  const stale = isArticleStale(article.lastReviewed)
  const [expanded, setExpanded] = useState(false)
  // Articles created in this browser session (not part of the seed set) have no
  // pre-rendered static page in this static-export deploy — expand inline instead.
  const hasStaticPage = SEED_KB_ARTICLE_IDS.has(article.id)

  const header = (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
        borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}`,
        transition: 'background 100ms', cursor: 'pointer',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = C.purpleSoft)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      onClick={hasStaticPage ? undefined : () => setExpanded(v => !v)}
    >
      <BookOpen size={18} color={C.mute} strokeWidth={1.5} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{article.title}</div>
        {article.summary && <div style={{ fontSize: 12, color: C.mute, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{article.summary}</div>}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
        {!hasStaticPage && (
          <span title="Created in your browser session" style={{ fontSize: 10, fontWeight: 700, color: C.purple, background: C.purpleSoft, padding: '2px 7px', borderRadius: 999, letterSpacing: '0.04em' }}>SESSION</span>
        )}
        {stale && (
          <span title="Not reviewed in 90+ days" style={{ fontSize: 10, fontWeight: 700, color: C.amber, background: C.amber + '22', padding: '2px 7px', borderRadius: 999, letterSpacing: '0.04em' }}>STALE</span>
        )}
        {article.tags.slice(0, 2).map(tag => (
          <span key={tag} style={{ fontSize: 11, color: C.purple, background: C.purpleSoft, padding: '2px 8px', borderRadius: 999 }}>#{tag}</span>
        ))}
        <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLORS[article.status] }}>{article.status}</span>
      </div>
    </div>
  )

  if (hasStaticPage) {
    return (
      <Link href={`/docs/${articleSlug(article)}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        {header}
      </Link>
    )
  }

  return (
    <div>
      {header}
      {expanded && (
        <div style={{ padding: '4px 20px 20px', borderTop: `1px solid ${C.lineSoft}` }}>
          <div
            className="kb-prose"
            style={{ fontSize: 13, lineHeight: 1.7, color: C.body }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
          />
        </div>
      )}
    </div>
  )
}

export default function DocsPage() {
  const { articles, kbLoading, sections, createSection, updateSection, deleteSection, reorderSection } = useApp()

  // Section nav state
  const [activeSection, setActiveSection] = useState<string>('all')
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editSectionTitle, setEditSectionTitle] = useState('')
  const [deletingSection, setDeletingSection] = useState<string | null>(null)
  const [showNewSection, setShowNewSection] = useState(false)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [savingSection, setSavingSection] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [orphan, setOrphan] = useState<OrphanState>({ phase: 'idle' })

  function handleScanOrphans() {
    setOrphan({ phase: 'scanning' })
    try {
      const ids = findOrphanedImages(articles)
      setOrphan({ phase: 'found', ids, count: ids.length })
    } catch {
      setOrphan({ phase: 'idle' })
      alert('Scan failed — check console.')
    }
  }

  function handleDeleteOrphans(ids: string[]) {
    setOrphan({ phase: 'deleting' })
    deleteKbImages(ids)
    setOrphan({ phase: 'done', deleted: ids.length })
  }

  const filtered = articles.filter(a => {
    const matchSection = activeSection === 'all' || a.section === activeSection
    const q = searchQuery.toLowerCase()
    const matchSearch = !q
      || a.title.toLowerCase().includes(q)
      || a.summary.toLowerCase().includes(q)
      || a.section.toLowerCase().includes(q)
      || a.tags.some(t => t.toLowerCase().includes(q))
      || a.category.toLowerCase().includes(q)
    return matchSection && matchSearch
  })

  const groupedBySection = useMemo(() => {
    const out: Record<string, KbArticle[]> = {}
    for (const s of sections) {
      const items = filtered.filter(a => a.section === s.key)
      if (items.length) out[s.key] = items
    }
    const knownKeys = new Set(sections.map(s => s.key))
    const orphans = filtered.filter(a => !knownKeys.has(a.section))
    if (orphans.length) out['__other__'] = orphans
    return out
  }, [filtered, sections])

  const groupedByCategory = useMemo(() => {
    const out: Record<string, KbArticle[]> = {}
    for (const a of filtered) {
      const key = a.category || '__uncategorized__'
      if (!out[key]) out[key] = []
      out[key].push(a)
    }
    return out
  }, [filtered])

  async function handleCreateSection() {
    if (!newSectionTitle.trim()) return
    setSavingSection(true)
    try {
      await createSection(newSectionTitle.trim())
      setNewSectionTitle('')
      setShowNewSection(false)
    } finally {
      setSavingSection(false)
    }
  }

  async function handleSaveSection(id: string) {
    if (!editSectionTitle.trim()) return
    setSavingSection(true)
    try {
      await updateSection(id, editSectionTitle.trim())
      setEditingSection(null)
    } finally {
      setSavingSection(false)
    }
  }

  async function handleDeleteSection(id: string) {
    await deleteSection(id)
    setDeletingSection(null)
    if (activeSection === sections.find(s => s.id === id)?.key) setActiveSection('all')
  }

  const activeSectionRecord = sections.find(s => s.key === activeSection)

  return (
    <div className="docs-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 36px 80px', display: 'flex', gap: 28, alignItems: 'flex-start' }}>
      {/* Sidebar */}
      <aside className="docs-sidebar" style={{ width: 210, flexShrink: 0, position: 'sticky', top: 92 }}>
        <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
          <p style={{ ...EYEBROW_STYLE, padding: '14px 14px 8px' }}>Sections</p>

          {/* All */}
          <button
            onClick={() => setActiveSection('all')}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 14px', border: 'none',
              background: activeSection === 'all' ? C.purpleSoft : 'transparent',
              color: activeSection === 'all' ? C.purple : C.body,
              fontSize: 13, fontWeight: activeSection === 'all' ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            All articles
          </button>

          {sections.length > 0 && <div style={{ height: 1, background: C.lineSoft, margin: '6px 0' }} />}

          {/* Dynamic sections */}
          {sections.map(s => (
            <div
              key={s.id}
              onMouseEnter={() => setHoveredSection(s.id)}
              onMouseLeave={() => { setHoveredSection(null) }}
              style={{ position: 'relative' }}
            >
              {editingSection === s.id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px' }}>
                  <input
                    autoFocus
                    value={editSectionTitle}
                    onChange={e => setEditSectionTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveSection(s.id); if (e.key === 'Escape') setEditingSection(null) }}
                    style={{ ...INPUT_STYLE, padding: '4px 8px', fontSize: 13, flex: 1 }}
                  />
                  <button onClick={() => handleSaveSection(s.id)} disabled={savingSection} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.green, padding: 2, display: 'flex' }}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingSection(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mute, padding: 2, display: 'flex' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : deletingSection === s.id ? (
                <div style={{ padding: '6px 10px' }}>
                  <p style={{ fontSize: 11, color: C.body, margin: '0 0 6px' }}>Delete "{s.title}"?</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleDeleteSection(s.id)} style={{ padding: '3px 10px', borderRadius: 6, border: 'none', background: C.red, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                    <button onClick={() => setDeletingSection(null)} style={{ padding: '3px 10px', borderRadius: 6, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={() => setActiveSection(s.key)}
                    style={{
                      flex: 1, textAlign: 'left',
                      padding: '8px 14px', border: 'none',
                      background: activeSection === s.key ? C.purpleSoft : 'transparent',
                      color: activeSection === s.key ? C.purple : C.body,
                      fontSize: 13, fontWeight: activeSection === s.key ? 600 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {s.title}
                  </button>
                  {hoveredSection === s.id && (
                    <div style={{ display: 'flex', gap: 1, paddingRight: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => reorderSection(s.id, 'up')}
                        disabled={sections.indexOf(s) === 0}
                        style={{ background: 'none', border: 'none', cursor: sections.indexOf(s) === 0 ? 'default' : 'pointer', color: sections.indexOf(s) === 0 ? C.lineSoft : C.mute, padding: 3, display: 'flex', borderRadius: 4 }}
                        title="Move up"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        onClick={() => reorderSection(s.id, 'down')}
                        disabled={sections.indexOf(s) === sections.length - 1}
                        style={{ background: 'none', border: 'none', cursor: sections.indexOf(s) === sections.length - 1 ? 'default' : 'pointer', color: sections.indexOf(s) === sections.length - 1 ? C.lineSoft : C.mute, padding: 3, display: 'flex', borderRadius: 4 }}
                        title="Move down"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        onClick={() => { setEditingSection(s.id); setEditSectionTitle(s.title) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mute, padding: 3, display: 'flex', borderRadius: 4 }}
                        title="Rename"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => setDeletingSection(s.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mute, padding: 3, display: 'flex', borderRadius: 4 }}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* New section */}
          <div style={{ height: 1, background: C.lineSoft, margin: '6px 0' }} />
          {showNewSection ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px 8px' }}>
              <input
                autoFocus
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateSection(); if (e.key === 'Escape') { setShowNewSection(false); setNewSectionTitle('') } }}
                placeholder="Section name…"
                style={{ ...INPUT_STYLE, padding: '4px 8px', fontSize: 13, flex: 1 }}
              />
              <button onClick={handleCreateSection} disabled={savingSection || !newSectionTitle.trim()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.purple, padding: 2, display: 'flex' }}>
                <Check size={14} />
              </button>
              <button onClick={() => { setShowNewSection(false); setNewSectionTitle('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.mute, padding: 2, display: 'flex' }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewSection(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                padding: '8px 14px', border: 'none', background: 'transparent',
                color: C.mute, fontSize: 12, cursor: 'pointer',
              }}
            >
              <Plus size={12} /> New section
            </button>
          )}
        </div>

        {/* Orphaned images */}
        <div style={{ ...CARD_STYLE, marginTop: 12, padding: '12px 14px' }}>
          <p style={{ ...EYEBROW_STYLE, marginBottom: 8 }}>Images</p>
          {orphan.phase === 'idle' && (
            <button
              onClick={handleScanOrphans}
              style={{ background: 'none', border: 'none', padding: 0, color: C.mute, fontSize: 12, cursor: 'pointer', textAlign: 'left' }}
            >
              Scan for orphaned images
            </button>
          )}
          {orphan.phase === 'scanning' && (
            <p style={{ fontSize: 12, color: C.mute, margin: 0 }}>Scanning…</p>
          )}
          {orphan.phase === 'found' && (
            <div>
              <p style={{ fontSize: 12, color: C.body, margin: '0 0 8px' }}>
                {orphan.count === 0 ? 'No orphaned images.' : `${orphan.count} orphaned image${orphan.count !== 1 ? 's' : ''} found.`}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {orphan.count > 0 && (
                  <button
                    onClick={() => handleDeleteOrphans(orphan.ids)}
                    style={{ padding: '3px 10px', borderRadius: 6, border: 'none', background: C.red, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Delete {orphan.count}
                  </button>
                )}
                <button
                  onClick={() => setOrphan({ phase: 'idle' })}
                  style={{ padding: '3px 10px', borderRadius: 6, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, fontSize: 11, cursor: 'pointer' }}
                >
                  {orphan.count === 0 ? 'OK' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
          {orphan.phase === 'deleting' && (
            <p style={{ fontSize: 12, color: C.mute, margin: 0 }}>Deleting…</p>
          )}
          {orphan.phase === 'done' && (
            <div>
              <p style={{ fontSize: 12, color: C.green, margin: '0 0 8px' }}>Deleted {orphan.deleted} image{orphan.deleted !== 1 ? 's' : ''}.</p>
              <button
                onClick={() => setOrphan({ phase: 'idle' })}
                style={{ background: 'none', border: 'none', padding: 0, color: C.mute, fontSize: 12, cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <p style={EYEBROW_STYLE}>Internal knowledge base</p>
            <h1 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 32, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', margin: '6px 0 0' }}>
              {activeSectionRecord ? activeSectionRecord.title : 'Kbase'}
            </h1>
          </div>
          <Link
            href="/docs/new"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 999, border: 'none',
              background: C.purple, color: '#fff',
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}
          >
            <Plus size={14} />
            New article
          </Link>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.mute, pointerEvents: 'none' }} />
          <input
            style={{ ...INPUT_STYLE, paddingLeft: 36 }}
            placeholder="Search articles…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Article list */}
        {kbLoading ? (
          <div style={{ ...CARD_STYLE, padding: '48px', textAlign: 'center', color: C.mute, fontSize: 13 }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ ...CARD_STYLE, padding: '48px', textAlign: 'center' }}>
            <BookOpen size={32} color={C.mute} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: C.mute, margin: 0 }}>No articles found.</p>
            {!searchQuery && sections.length === 0 && <p style={{ fontSize: 12, color: C.mute, marginTop: 6 }}>Create a section in the sidebar first.</p>}
          </div>
        ) : activeSection === 'all' ? (
          <>
            {Object.entries(groupedBySection).map(([sectionKey, items]) => {
              const label = sectionKey === '__other__' ? 'Other'
                : sections.find(s => s.key === sectionKey)?.title ?? sectionKey
              return (
                <div key={sectionKey} style={{ marginBottom: 28 }}>
                  <div style={{ ...EYEBROW_STYLE, marginBottom: 10 }}>
                    {label}
                    <span style={{ fontSize: 11, color: C.mute, fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>({items.length})</span>
                  </div>
                  <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
                    {items.map((article, i) => <ArticleRow key={article.id} article={article} i={i} />)}
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          <>
            {Object.entries(groupedByCategory).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 28 }}>
                {cat !== '__uncategorized__' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <FolderOpen size={13} color={C.purple} />
                    <span style={{ ...EYEBROW_STYLE }}>{cat}</span>
                    <span style={{ fontSize: 11, color: C.mute, fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>({items.length})</span>
                  </div>
                )}
                {cat === '__uncategorized__' && Object.keys(groupedByCategory).length > 1 && (
                  <div style={{ ...EYEBROW_STYLE, marginBottom: 10 }}>
                    Uncategorized
                    <span style={{ fontSize: 11, color: C.mute, fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>({items.length})</span>
                  </div>
                )}
                <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
                  {items.map((article, i) => <ArticleRow key={article.id} article={article} i={i} />)}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
