'use client'
import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { KbStatus } from '../../../types'
import { C, CARD_STYLE } from '../../../tokens'
import { MarkdownEditor, KbShortcuts } from '../../../components/MarkdownEditor'
import { useApp } from '../../../context/app-context'

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

const BLANK_FORM = {
  title: '',
  summary: '',
  section: '',
  category: '',
  status: 'draft' as KbStatus,
  tags: '',
  content: '',
}

export default function KbaseNewArticlePage() {
  const router = useRouter()
  const { articles, sections, createArticle, me } = useApp()
  const [form, setForm] = useState({ ...BLANK_FORM, section: sections[0]?.key ?? '' })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const clearDraftRef = useRef<(() => void) | null>(null)

  const sectionCategories = useMemo(() => {
    const cats = new Set(
      articles.filter(a => a.section === form.section && a.category).map(a => a.category)
    )
    return Array.from(cats).sort()
  }, [articles, form.section])

  async function handleCreate() {
    if (!form.title.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      clearDraftRef.current?.()
      await createArticle({
        title: form.title.trim(),
        summary: form.summary.trim(),
        section: form.section || sections[0]?.key || '',
        category: form.category.trim(),
        status: form.status,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        owners: [],
        content: form.content,
        authorEmail: me.email ?? '',
        lastReviewed: new Date().toISOString().slice(0, 10),
      })
      // This is a static export — a freshly created article has no pre-rendered
      // page of its own, so send the user back to the list where it shows inline.
      router.push('/docs')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 1500, margin: '0 auto', padding: 'var(--editor-page-pad, 40px 36px 80px)' }}>
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
        <span style={{ color: C.ink }}>New article</span>
      </nav>

      <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: `1px solid ${C.lineSoft}` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              autoFocus
              style={{ ...INPUT_STYLE, fontSize: 22, fontWeight: 700, fontFamily: '"Bricolage Grotesque", sans-serif' }}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Article title"
            />
            <div className="editor-meta-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.mute, display: 'block', marginBottom: 4 }}>Section</label>
                <select
                  style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                  value={form.section}
                  onChange={e => setForm(f => ({ ...f, section: e.target.value, category: '' }))}
                >
                  {sections.length === 0 && <option value="">No sections yet</option>}
                  {sections.map(s => <option key={s.id} value={s.key}>{s.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.mute, display: 'block', marginBottom: 4 }}>Status</label>
                <select
                  style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as KbStatus }))}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.mute, display: 'block', marginBottom: 4 }}>Subsection</label>
                <input
                  list="new-category-suggestions"
                  style={INPUT_STYLE}
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder={sectionCategories.length ? 'Pick or type new…' : 'e.g. onboarding'}
                />
                <datalist id="new-category-suggestions">
                  {sectionCategories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>
            <div className="editor-meta-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.mute, display: 'block', marginBottom: 4 }}>Summary</label>
                <input
                  style={INPUT_STYLE}
                  value={form.summary}
                  onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                  placeholder="One-line description"
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: C.mute, display: 'block', marginBottom: 4 }}>Tags</label>
                <input
                  style={INPUT_STYLE}
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="Comma-separated, e.g. security, onboarding"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px' }}>
          <div className="editor-body-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, alignItems: 'start' }}>
            <MarkdownEditor
              value={form.content}
              onChange={v => setForm(f => ({ ...f, content: v }))}
              minHeight={620}
              draftKey="new-article"
              articles={articles}
              clearDraftRef={clearDraftRef}
            />
            <div className="mobile-hide">
              <KbShortcuts />
            </div>
          </div>
          {saveError && <p style={{ fontSize: 12, color: C.red, margin: '12px 0 0' }}>{saveError}</p>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <Link
              href="/docs"
              style={{ padding: '8px 16px', borderRadius: 999, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Cancel
            </Link>
            <button
              onClick={handleCreate}
              disabled={saving || !form.title.trim()}
              style={{ padding: '8px 20px', borderRadius: 999, border: 'none', background: C.purple, color: '#fff', fontSize: 13, fontWeight: 600, cursor: saving || !form.title.trim() ? 'default' : 'pointer', opacity: saving || !form.title.trim() ? 0.6 : 1 }}
            >
              {saving ? 'Creating…' : 'Create article'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
