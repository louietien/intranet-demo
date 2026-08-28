'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Pin, User } from '../types'
import { C, CARD_STYLE, EYEBROW_STYLE } from '../tokens'
import { Avatar } from './Avatar'
import { Modal } from './Modal'
import { relativeTime } from '../utils'
import { useApp } from '../context/app-context'
import { MarkdownEditor } from './MarkdownEditor'
import { renderMarkdown } from '../lib/markdownRenderer'
import { SEED_NEWS_POST_IDS } from '../lib/mockData'

function getPreview(body: string, maxLen = 140): string {
  const stripped = body
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^```[\s\S]*?```/gm, '')
  const lines = stripped.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.match(/^[-*]{3,}$/) && !l.match(/^\|[-|\s:]+\|$/) && !l.startsWith('|'))
  const joined = lines.join(' · ')
  return joined.length > maxLen ? joined.slice(0, maxLen).trimEnd() + '…' : joined
}

type PostDraft = { tag: string; title: string; body: string; cta: { label: string; href: string } }

interface Props {
  posts: Pin[]
  me: User
  onAdd: (draft: PostDraft, author: User) => void
  onEdit: (id: string, draft: PostDraft) => void
  onDelete: (id: string) => void
}

const FIELD: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  borderRadius: 10,
  border: `1px solid ${C.line}`,
  background: C.inputBg,
  color: C.ink,
  fontSize: 14,
  fontFamily: 'Geist, -apple-system, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

const LABEL: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: C.body,
  letterSpacing: '0.04em',
  marginBottom: 6,
  display: 'block',
}

function ComposeModal({ me, onClose, onSubmit }: { me: User; onClose: () => void; onSubmit: Props['onAdd'] }) {
  const [tag, setTag] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [ctaLabel, setCtaLabel] = useState('')
  const [ctaHref, setCtaHref] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    onSubmit(
      {
        tag: tag.trim() || 'Update',
        title: title.trim(),
        body: body.trim(),
        cta: { label: ctaLabel.trim() || 'Read more', href: ctaHref.trim() || '#' },
      },
      me,
    )
    onClose()
  }

  return (
    <Modal title="New post" onClose={onClose} width={860}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={LABEL}>Tag</label>
          <input style={FIELD} placeholder="e.g. Company win, Update, Reminder" value={tag} onChange={e => setTag(e.target.value)} />
        </div>
        <div>
          <label style={LABEL}>Title *</label>
          <input style={FIELD} placeholder="What's the headline?" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label style={LABEL}>Body *</label>
          <MarkdownEditor value={body} onChange={setBody} minHeight={240} placeholder="Give the team the full picture..." draftKey={null} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={LABEL}>CTA label</label>
            <input style={FIELD} placeholder="Read the brief" value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} />
          </div>
          <div>
            <label style={LABEL}>CTA link</label>
            <input style={FIELD} placeholder="https://..." type="url" value={ctaHref} onChange={e => setCtaHref(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 999, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" style={{ padding: '9px 22px', borderRadius: 999, border: 'none', background: C.purple, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Post
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function EditModal({ post, onClose, onSubmit }: { post: Pin; onClose: () => void; onSubmit: (id: string, draft: PostDraft) => void }) {
  const [tag, setTag] = useState(post.tag)
  const [title, setTitle] = useState(post.title)
  const [body, setBody] = useState(post.body)
  const [ctaLabel, setCtaLabel] = useState(post.cta.label === 'Read more' && post.cta.href === '#' ? '' : post.cta.label)
  const [ctaHref, setCtaHref] = useState(post.cta.href === '#' ? '' : post.cta.href)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    onSubmit(post.id, {
      tag: tag.trim() || 'Update',
      title: title.trim(),
      body: body.trim(),
      cta: { label: ctaLabel.trim() || 'Read more', href: ctaHref.trim() || '#' },
    })
    onClose()
  }

  return (
    <Modal title="Edit post" onClose={onClose} width={860}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={LABEL}>Tag</label>
          <input style={FIELD} placeholder="e.g. Company win, Update, Reminder" value={tag} onChange={e => setTag(e.target.value)} />
        </div>
        <div>
          <label style={LABEL}>Title *</label>
          <input style={FIELD} placeholder="What's the headline?" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div>
          <label style={LABEL}>Body *</label>
          <MarkdownEditor value={body} onChange={setBody} minHeight={240} placeholder="Give the team the full picture..." draftKey={null} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={LABEL}>CTA label</label>
            <input style={FIELD} placeholder="Read the brief" value={ctaLabel} onChange={e => setCtaLabel(e.target.value)} />
          </div>
          <div>
            <label style={LABEL}>CTA link</label>
            <input style={FIELD} placeholder="https://..." type="url" value={ctaHref} onChange={e => setCtaHref(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 999, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" style={{ padding: '9px 22px', borderRadius: 999, border: 'none', background: C.purple, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}

function PostCard({ post, onDelete, onEdit }: { post: Pin; onDelete: (id: string) => void; onEdit: (id: string, draft: PostDraft) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [editing, setEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()
  const { me, isAdmin } = useApp()
  const canDelete = isAdmin || post.author.email === me.email
  // Posts created in this browser session (not part of the seed set) have no
  // pre-rendered static page in this static-export deploy — expand inline instead.
  const hasStaticPage = SEED_NEWS_POST_IDS.has(post.id)

  return (
    <>
    <article
      onClick={() => hasStaticPage ? router.push(`/news/${post.id}`) : setExpanded(v => !v)}
      style={{ padding: '18px 20px', borderBottom: `1px solid ${C.lineSoft}`, display: 'flex', gap: 14, cursor: 'pointer' }}
    >
      <Avatar name={post.author.name} size={34} avatarUrl={post.author.avatarUrl} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.purple }}>{post.tag}</span>
          <span style={{ fontSize: 12, color: C.mute }}>·</span>
          <span style={{ fontSize: 12, fontWeight: 500, color: C.body }}>{post.author.name}</span>
          <span style={{ fontSize: 12, color: C.mute }}>·</span>
          <span style={{ fontSize: 12, color: C.mute }}>{relativeTime(post.postedAt)}</span>
          {!hasStaticPage && (
            <span style={{ fontSize: 10, fontWeight: 700, color: C.purple, background: C.purpleSoft, padding: '2px 7px', borderRadius: 999, letterSpacing: '0.04em' }}>SESSION</span>
          )}
        </div>
        <p style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 15, fontWeight: 700, color: C.ink, margin: '0 0 5px', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
          {post.title}
        </p>
        {expanded && !hasStaticPage ? (
          <div
            className="kb-prose"
            style={{ fontSize: 13, color: C.body, lineHeight: 1.6, margin: '0 0 10px' }}
            onClick={e => e.stopPropagation()}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
          />
        ) : (
          <p style={{ fontSize: 13, color: C.body, lineHeight: 1.5, margin: '0 0 10px' }}>
            {getPreview(post.body)}
          </p>
        )}
        {post.cta.href !== '#' && (
          <a href={post.cta.href} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 12, fontWeight: 600, color: C.purple, textDecoration: 'none' }}>
            {post.cta.label} →
          </a>
        )}
      </div>

      {canDelete && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexShrink: 0 }}>
          {confirming ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: C.mute }}>Delete?</span>
              <button onClick={e => { e.stopPropagation(); onDelete(post.id) }} style={{ padding: '4px 10px', borderRadius: 999, border: 'none', background: C.red, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Yes</button>
              <button onClick={e => { e.stopPropagation(); setConfirming(false) }} style={{ padding: '4px 10px', borderRadius: 999, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, fontSize: 12, cursor: 'pointer' }}>No</button>
            </div>
          ) : (
            <>
              <button onClick={e => { e.stopPropagation(); setEditing(true) }} aria-label="Edit post" style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.mute, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button onClick={e => { e.stopPropagation(); setConfirming(true) }} aria-label="Delete post" style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.mute, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </article>
    {editing && <EditModal post={post} onClose={() => setEditing(false)} onSubmit={(id, draft) => { onEdit(id, draft); setEditing(false) }} />}
    </>
  )
}

export function NewsFeed({ posts, me, onAdd, onEdit, onDelete }: Props) {
  const [composing, setComposing] = useState(false)

  return (
    <>
      <section style={{ ...CARD_STYLE, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.lineSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={EYEBROW_STYLE}>News feed</span>
          <button
            onClick={() => setComposing(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: 'none', background: C.purple, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            New post
          </button>
        </div>

        {posts.length === 0 ? (
          <p style={{ padding: '24px 20px', color: C.mute, fontSize: 14 }}>No posts yet.</p>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} onDelete={onDelete} onEdit={onEdit} />)
        )}
      </section>

      {composing && <ComposeModal me={me} onClose={() => setComposing(false)} onSubmit={onAdd} />}
    </>
  )
}
