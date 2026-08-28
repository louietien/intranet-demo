'use client'
import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { renderMarkdown, extractHeadings } from '../../../lib/markdownRenderer'
import { articleIdFromSlug } from '../../../hooks'
import { Edit2, Trash2, Check, X, ChevronRight, AlertTriangle, Copy } from 'lucide-react'
import type { KbSection, KbStatus } from '../../../types'
import { C, CARD_STYLE } from '../../../tokens'
import { MarkdownEditor, KbShortcuts } from '../../../components/MarkdownEditor'
import { useApp } from '../../../context/app-context'

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

const STALE_DAYS = 90

function isStale(lastReviewed: string): boolean {
  if (!lastReviewed) return true
  const diff = Date.now() - new Date(lastReviewed).getTime()
  return diff > STALE_DAYS * 24 * 60 * 60 * 1000
}

export default function KbaseArticleClient({ slug }: { slug: string }) {
  const router = useRouter()
  const { articles, sections, updateArticle, deleteArticle, me, isAdmin } = useApp()
  const id = articleIdFromSlug(slug)
  const article = articles.find(a => a.id === id)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<typeof article | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [copied, setCopied] = useState(false)

  const clearDraftRef = useRef<(() => void) | null>(null)

  const htmlContent = useMemo(
    () => renderMarkdown(article?.content ?? '', { articles }),
    [article, articles],
  )

  const headings = useMemo(() => extractHeadings(article?.content ?? ''), [article])

  const sectionCategories = useMemo(() => {
    if (!form) return []
    const cats = new Set(
      articles.filter(a => a.section === form.section && a.category && a.id !== form.id).map(a => a.category)
    )
    return Array.from(cats).sort()
  }, [articles, form])

  if (!article) {
    return (
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 36px 80px' }}>
        <div style={{ ...CARD_STYLE, padding: '48px', textAlign: 'center' }}>
          <p style={{ color: C.mute, fontSize: 14 }}>Article not found.</p>
          <Link href="/docs" style={{ fontSize: 13, color: C.purple }}>Back to Kbase</Link>
        </div>
      </div>
    )
  }

  const stale = isStale(article.lastReviewed)
  const canEdit = isAdmin || article.authorEmail === me.email

  function startEdit() {
    setForm({ ...article! })
    setEditing(true)
    setSaveError(null)
  }

  function cancelEdit() {
    setEditing(false)
    setForm(null)
    setSaveError(null)
  }

  async function handleSave() {
    if (!form || !form.title.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      await updateArticle(article!.id, {
        title: form.title.trim(),
        summary: form.summary,
        section: form.section,
        category: form.category,
        status: form.status,
        tags: typeof form.tags === 'string'
          ? (form.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean)
          : form.tags,
        owners: form.owners,
        content: form.content,
        lastReviewed: form.lastReviewed,
      })
      clearDraftRef.current?.()
      setEditing(false)
      setForm(null)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function markReviewed() {
    await updateArticle(article!.id, { lastReviewed: new Date().toISOString().slice(0, 10) })
  }

  async function handleDelete() {
    await deleteArticle(article!.id)
    router.push('/docs')
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const hasToc = !editing && headings.length >= 2

  return (
    <div style={{ maxWidth: editing ? 1500 : hasToc ? 1160 : 900, margin: '0 auto', padding: 'var(--editor-page-pad, 40px 36px 80px)' }}>
      <style>{`
        @media (max-width: 767px) {
          :root { --editor-page-pad: 16px 16px 80px; }
          .editor-meta-grid-3 { grid-template-columns: 1fr !important; }
          .editor-meta-grid-2 { grid-template-columns: 1fr !important; }
          .editor-body-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, fontSize: 13, color: C.mute }}>
        <Link href="/docs" style={{ color: C.mute, textDecoration: 'none' }}>Kbase</Link>
        <ChevronRight size={12} />
        <span style={{ color: C.mute }}>{sections.find(s => s.key === article.section)?.title ?? article.section}</span>
        <ChevronRight size={12} />
        <span style={{ color: C.ink }}>{article.title}</span>
      </nav>

      {/* Stale warning */}
      {stale && !editing && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', marginBottom: 16, background: C.amber + '22', border: `1px solid ${C.amber}55`, borderRadius: 10, fontSize: 13 }}>
          <AlertTriangle size={15} color={C.amber} style={{ flexShrink: 0 }} />
          <span style={{ color: C.ink, flex: 1 }}>
            {article.lastReviewed
              ? `Last reviewed ${new Date(article.lastReviewed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — may be out of date.`
              : 'This article has never been reviewed — accuracy not confirmed.'}
          </span>
          <button
            onClick={markReviewed}
            style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: C.amber, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Mark reviewed
          </button>
        </div>
      )}

      {/* Article card + TOC */}
      <div className="article-layout" style={{ display: hasToc ? 'grid' : 'block', gridTemplateColumns: '1fr 200px', gap: 28, alignItems: 'start' }}>
        <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '24px 28px 20px', borderBottom: `1px solid ${C.lineSoft}` }}>
            {editing && form ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  style={{ ...INPUT_STYLE, fontSize: 22, fontWeight: 700, fontFamily: '"Bricolage Grotesque", sans-serif' }}
                  value={form.title}
                  onChange={e => setForm(f => f ? { ...f, title: e.target.value } : f)}
                />
                <div className="editor-meta-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.mute, display: 'block', marginBottom: 4 }}>Section</label>
                    <select style={{ ...INPUT_STYLE, cursor: 'pointer' }} value={form.section} onChange={e => setForm(f => f ? { ...f, section: e.target.value as KbSection, category: '' } : f)}>
                      {sections.map(s => <option key={s.id} value={s.key}>{s.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.mute, display: 'block', marginBottom: 4 }}>Status</label>
                    <select style={{ ...INPUT_STYLE, cursor: 'pointer' }} value={form.status} onChange={e => setForm(f => f ? { ...f, status: e.target.value as KbStatus } : f)}>
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="deprecated">Deprecated</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.mute, display: 'block', marginBottom: 4 }}>Category</label>
                    <input
                      list="edit-category-suggestions"
                      style={INPUT_STYLE}
                      value={form.category}
                      onChange={e => setForm(f => f ? { ...f, category: e.target.value } : f)}
                      placeholder="e.g. onboarding"
                    />
                    <datalist id="edit-category-suggestions">
                      {sectionCategories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.mute, display: 'block', marginBottom: 4 }}>Summary</label>
                  <input style={INPUT_STYLE} value={form.summary} onChange={e => setForm(f => f ? { ...f, summary: e.target.value } : f)} placeholder="One-line description" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.mute, display: 'block', marginBottom: 4 }}>Tags</label>
                  <input
                    style={INPUT_STYLE}
                    value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
                    onChange={e => setForm(f => f ? { ...f, tags: e.target.value as unknown as string[] } : f)}
                    placeholder="Comma-separated tags"
                  />
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <h1 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', margin: 0 }}>
                    {article.title}
                  </h1>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={copyLink}
                      title="Copy link"
                      style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: copied ? C.green : C.mute, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Copy size={13} />
                    </button>
                    {canEdit && (
                      <button
                        onClick={startEdit}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, fontSize: 12, cursor: 'pointer' }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    )}
                    {canEdit && (confirmDelete ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button onClick={handleDelete} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: C.red, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                        <button onClick={() => setConfirmDelete(false)} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, fontSize: 12, cursor: 'pointer' }}>No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(true)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.mute, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={13} />
                      </button>
                    ))}
                  </div>
                </div>
                {article.summary && <p style={{ fontSize: 13, color: C.mute, margin: '8px 0 0' }}>{article.summary}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLORS[article.status] }}>{article.status}</span>
                  <span style={{ fontSize: 11, color: C.mute }}>·</span>
                  <span style={{ fontSize: 11, color: C.mute }}>{sections.find(s => s.key === article.section)?.title ?? article.section}</span>
                  {article.category && <><span style={{ fontSize: 11, color: C.mute }}>·</span><span style={{ fontSize: 11, color: C.mute }}>{article.category}</span></>}
                  {article.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 11, color: C.purple, background: C.purpleSoft, padding: '2px 8px', borderRadius: 999 }}>#{tag}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: '24px 28px' }}>
            {editing && form ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="editor-body-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, alignItems: 'start' }}>
                  <MarkdownEditor
                    value={form.content}
                    onChange={v => setForm(f => f ? { ...f, content: v } : f)}
                    minHeight={620}
                    draftKey={article.id}
                    articles={articles}
                    clearDraftRef={clearDraftRef}
                  />
                  <div className="mobile-hide">
                    <KbShortcuts />
                  </div>
                </div>
                {saveError && <p style={{ fontSize: 12, color: C.red, margin: 0 }}>{saveError}</p>}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={cancelEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, fontSize: 13, cursor: 'pointer' }}>
                    <X size={13} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 999, border: 'none', background: C.purple, color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
                    <Check size={13} /> {saving ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="kb-prose"
                style={{ fontSize: 14, lineHeight: 1.8, color: C.body }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </div>

          {/* Footer */}
          {!editing && (
            <div style={{ padding: '12px 28px', borderTop: `1px solid ${C.lineSoft}`, display: 'flex', gap: 16, fontSize: 11, color: C.mute }}>
              {article.authorEmail && <span>By {article.authorEmail}</span>}
              <span>Updated {new Date(article.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {article.lastReviewed && <span>Reviewed {new Date(article.lastReviewed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
            </div>
          )}
        </div>

        {/* TOC sidebar */}
        {hasToc && (
          <nav className="mobile-hide" style={{ position: 'sticky', top: 92, borderLeft: `2px solid ${C.lineSoft}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.mute, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px', paddingLeft: 12 }}>On this page</p>
            {headings.map(h => (
              <a
                key={h.id}
                href={`#${h.id}`}
                style={{
                  display: 'block',
                  paddingLeft: 12 + (h.level - 2) * 10,
                  paddingTop: 4,
                  paddingBottom: 4,
                  paddingRight: 4,
                  fontSize: 12,
                  color: C.mute,
                  textDecoration: 'none',
                  lineHeight: 1.4,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.purple }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = C.mute }}
              >
                {h.text}
              </a>
            ))}
          </nav>
        )}
      </div>

      {/* Prose styles */}
      <style>{`
        .kb-prose h1,.kb-prose h2,.kb-prose h3,.kb-prose h4 {
          font-family: "Bricolage Grotesque", sans-serif;
          font-weight: 700;
          color: var(--c-ink);
          margin: 1.5em 0 0.5em;
          letter-spacing: -0.02em;
          scroll-margin-top: 100px;
        }
        .kb-prose h1 { font-size: 22px; }
        .kb-prose h2 { font-size: 18px; }
        .kb-prose h3 { font-size: 15px; }
        .kb-prose p { margin: 0 0 1em; }
        .kb-prose a { color: var(--c-purple); }
        .kb-prose code {
          font-family: monospace;
          font-size: 12px;
          background: var(--c-purpleSoft);
          padding: 2px 5px;
          border-radius: 4px;
        }
        .kb-prose pre {
          background: var(--c-surface);
          border: 1px solid var(--c-line);
          border-radius: 10px;
          padding: 16px;
          overflow-x: auto;
          margin: 0 0 1em;
        }
        .kb-prose pre code {
          background: none;
          padding: 0;
          font-size: 13px;
        }
        .kb-prose ul,.kb-prose ol { padding-left: 24px; margin: 0 0 1em; }
        .kb-prose ul { list-style-type: disc; }
        .kb-prose ol { list-style-type: decimal; }
        .kb-prose ul ul { list-style-type: circle; }
        .kb-prose li { margin-bottom: 4px; display: list-item; }
        .kb-prose blockquote {
          margin: 0 0 1em;
          padding: 8px 16px;
          border-left: 3px solid var(--c-line);
          color: var(--c-mute);
        }
        .kb-prose hr {
          border: none;
          border-top: 1px solid var(--c-line);
          margin: 1.5em 0;
        }
        .kb-prose table { border-collapse: collapse; width: 100%; margin: 0 0 1em; display: block; overflow-x: auto; }
        .kb-prose th,.kb-prose td { border: 1px solid var(--c-line); padding: 8px 12px; font-size: 13px; text-align: left; }
        .kb-prose th { background: var(--c-surface); font-weight: 600; color: var(--c-ink); }
        .kb-prose img { max-width: 100%; border-radius: 8px; border: 1px solid var(--c-line); display: block; margin: 0.5em 0; }
      `}</style>
    </div>
  )
}
