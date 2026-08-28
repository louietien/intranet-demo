'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useApp } from '../../../context/app-context'
import { C } from '../../../tokens'
import { Avatar } from '../../../components/Avatar'
import { relativeTime } from '../../../utils'
import { CommentSection } from '../../../components/CommentSection'
import { renderMarkdown } from '../../../lib/markdownRenderer'
import { EditModal } from '../../../components/NewsFeed'

export default function NewsPostClient({ id }: { id: string }) {
  const { posts, me, team, isAdmin, updatePost } = useApp()
  const [editing, setEditing] = useState(false)
  const post = posts.find(p => p.id === id)

  if (!post) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 36px', textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: C.mute, marginBottom: 20 }}>Post not found.</p>
        <Link href="/news" style={{ fontSize: 13, fontWeight: 600, color: C.purple, textDecoration: 'none' }}>
          ← Back to news
        </Link>
      </div>
    )
  }

  return (
    <>
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 36px 80px' }}>
      <Link
        href="/news"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: C.mute,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 36,
        }}
      >
        ← News
      </Link>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          letterSpacing: '0.14em',
          fontWeight: 600,
          color: C.purple,
          textTransform: 'uppercase',
          marginBottom: 16,
          padding: '5px 10px 5px 8px',
          borderRadius: 999,
          background: C.purpleSoft,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <path d="M5 19l4-4M12 4l8 8-5 2-3 3-2-3-3-2 5-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {post.tag}
      </div>

      <h1
        style={{
          fontFamily: '"Bricolage Grotesque", sans-serif',
          fontSize: 44,
          fontWeight: 800,
          color: C.ink,
          letterSpacing: '-0.03em',
          lineHeight: 1.06,
          margin: '0 0 24px',
        }}
      >
        {post.title}
        <span style={{ color: C.purple }}>.</span>
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, paddingBottom: 28, borderBottom: `1px solid ${C.line}` }}>
        <Avatar name={post.author.name} size={32} avatarUrl={post.author.avatarUrl} />
        <span style={{ fontSize: 13, color: C.body }}>
          <span style={{ fontWeight: 600, color: C.ink }}>{post.author.name}</span>
          {post.author.role && (
            <span style={{ color: C.mute }}> · {post.author.role}</span>
          )}
        </span>
        <span style={{ fontSize: 13, color: C.mute }}>·</span>
        <span style={{ fontSize: 13, color: C.mute }}>{relativeTime(post.postedAt)}</span>
        {(isAdmin || post.author.email === me.email) && (
          <button
            onClick={() => setEditing(true)}
            style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 999, border: `1px solid ${C.line}`, background: 'transparent', color: C.mute, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Edit
          </button>
        )}
      </div>

      <div
        className="kb-prose"
        style={{ fontSize: 16, lineHeight: 1.75, color: C.body }}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
      />

      {post.cta.href !== '#' && (
        <div style={{ marginTop: 40, paddingTop: 32, borderTop: `1px solid ${C.line}` }}>
          <a
            href={post.cta.href}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              borderRadius: 999,
              background: C.purple,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {post.cta.label} →
          </a>
        </div>
      )}

      <CommentSection
        postId={post.id}
        postTitle={post.title}
        postAuthorEmail={post.author.email ?? ''}
        postUrl={`/news/${post.id}`}
        me={me}
        team={team}
        isAdmin={isAdmin}
      />
    </div>

    {editing && (
      <EditModal
        post={post}
        onClose={() => setEditing(false)}
        onSubmit={(id, draft) => { updatePost(id, draft); setEditing(false) }}
      />
    )}
    </>
  )
}
