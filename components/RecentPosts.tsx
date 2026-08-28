'use client'
import Link from 'next/link'
import type { Pin } from '../types'
import { C, CARD_STYLE, EYEBROW_STYLE } from '../tokens'
import { Avatar } from './Avatar'
import { relativeTime } from '../utils'
import { SEED_NEWS_POST_IDS } from '../lib/mockData'

interface Props {
  posts: Pin[]
}

export function RecentPosts({ posts }: Props) {
  const recent = posts.slice(1, 5)
  if (recent.length === 0) return null

  return (
    <section style={{ ...CARD_STYLE, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.lineSoft}` }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.mute }}>Recent news</span>
      </div>

      {recent.map((post, i) => (
        <article
          key={post.id}
          style={{
            padding: '14px 20px',
            borderBottom: i < recent.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <Avatar name={post.author.name} size={30} avatarUrl={post.author.avatarUrl} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.purple, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {post.tag}
              </span>
              <span style={{ fontSize: 11, color: C.mute }}>·</span>
              <span style={{ fontSize: 12, color: C.mute }}>{post.author.name.split(' ')[0]}</span>
              <span style={{ fontSize: 11, color: C.mute }}>·</span>
              <span style={{ fontSize: 12, color: C.mute }}>{relativeTime(post.postedAt)}</span>
            </div>
            {SEED_NEWS_POST_IDS.has(post.id) ? (
              <Link
                href={`/news/${post.id}`}
                style={{
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.ink,
                  textDecoration: 'none',
                  lineHeight: 1.25,
                  letterSpacing: '-0.01em',
                  display: 'block',
                }}
              >
                {post.title}
              </Link>
            ) : (
              <span
                style={{
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.ink,
                  lineHeight: 1.25,
                  letterSpacing: '-0.01em',
                  display: 'block',
                }}
              >
                {post.title}
              </span>
            )}
            <p style={{ fontSize: 12, color: C.body, margin: '4px 0 0', lineHeight: 1.45 }}>
              {post.body.length > 100 ? post.body.slice(0, 100) + '…' : post.body}
            </p>
          </div>
        </article>
      ))}

      <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.lineSoft}` }}>
        <Link href="/news" style={{ fontSize: 12, fontWeight: 600, color: C.mute, textDecoration: 'none' }}>
          See all news →
        </Link>
      </div>
    </section>
  )
}
