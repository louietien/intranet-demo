'use client'
import { useState, useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import type { User } from '../types'
import { C } from '../tokens'
import { Avatar } from './Avatar'
import { useComments } from '../hooks'
import { relativeTime } from '../utils'

interface Props {
  postId: string
  postTitle: string
  postAuthorEmail: string
  postUrl: string
  me: User
  team?: User[]
  isAdmin?: boolean
}

export function CommentSection({ postId, postTitle, postAuthorEmail, postUrl, me, team = [], isAdmin = false }: Props) {
  const teamByEmail = useMemo(
    () => new Map(team.filter(u => u.email).map(u => [u.email!.toLowerCase(), u])),
    [team]
  )
  const { comments, loading, addComment, deleteComment } = useComments(postId)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || posting) return
    setPosting(true)
    try {
      await addComment(body.trim(), me)
      setBody('')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div style={{ marginTop: 40, paddingTop: 32, borderTop: `1px solid ${C.line}` }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: '0 0 20px' }}>
        {comments.length} comment{comments.length !== 1 ? 's' : ''}
      </h3>

      {loading ? (
        <p style={{ fontSize: 13, color: C.mute, marginBottom: 24 }}>Loading comments…</p>
      ) : comments.length === 0 ? (
        <p style={{ fontSize: 13, color: C.mute, marginBottom: 24 }}>No comments yet. Be the first!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 12 }}>
              <Avatar name={c.authorName} size={32} avatarUrl={teamByEmail.get(c.authorEmail?.toLowerCase())?.avatarUrl} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{c.authorName}</span>
                  <span style={{ fontSize: 12, color: C.mute }}>{relativeTime(c.created)}</span>
                  {(me.email === c.authorEmail || isAdmin) && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      style={{ marginLeft: 'auto', width: 24, height: 24, borderRadius: 6, border: `1px solid ${C.line}`, background: 'transparent', color: C.mute, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: 13, color: C.body, lineHeight: 1.5, margin: 0 }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar name={me.name} size={32} avatarUrl={me.avatarUrl} />
        <div style={{ flex: 1 }}>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write a comment…"
            rows={2}
            style={{
              width: '100%', boxSizing: 'border-box',
              border: `1px solid ${C.line}`, borderRadius: 10,
              padding: '9px 13px', fontSize: 13, color: C.ink,
              background: C.inputBg, outline: 'none', resize: 'vertical',
              fontFamily: 'Geist, -apple-system, sans-serif',
            }}
            onFocus={e => { e.target.style.borderColor = C.purple }}
            onBlur={e => { e.target.style.borderColor = C.line }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="submit"
              disabled={!body.trim() || posting}
              style={{
                padding: '7px 18px', borderRadius: 999, border: 'none',
                background: body.trim() ? C.purple : C.lineSoft,
                color: body.trim() ? '#fff' : C.mute,
                fontSize: 13, fontWeight: 600,
                cursor: body.trim() && !posting ? 'pointer' : 'default',
                transition: 'all 150ms',
              }}
            >
              {posting ? 'Posting…' : 'Comment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
