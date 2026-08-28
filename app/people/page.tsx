'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, Users, GitBranch } from 'lucide-react'
import { useApp } from '../../context/app-context'
import { C, CARD_STYLE, EYEBROW_STYLE, STATUS_LABEL, STATUS_COLOR } from '../../tokens'
import { Avatar } from '../../components/Avatar'
import type { User } from '../../types'

type OrgNode = {
  id: string
  name: string
  role: string
  email: string
  avatarUrl?: string
  children: OrgNode[]
}

function buildOrgTree(users: User[]): OrgNode[] {
  const nodeMap = new Map<string, OrgNode>()
  for (const u of users) {
    nodeMap.set(u.id, {
      id: u.id,
      name: u.name,
      role: u.role,
      email: u.email ?? '',
      avatarUrl: u.avatarUrl,
      children: [],
    })
  }
  const byEmail = new Map(users.filter(u => u.email).map(u => [u.email!.toLowerCase(), u]))
  const roots: OrgNode[] = []
  for (const u of users) {
    const node = nodeMap.get(u.id)!
    const manager = u.manager?.email ? byEmail.get(u.manager.email.toLowerCase()) : undefined
    if (manager && nodeMap.has(manager.id)) {
      nodeMap.get(manager.id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

function OrgCard({ node }: { node: OrgNode }) {
  return (
    <Link href={`/people/${node.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          ...CARD_STYLE,
          padding: '14px 16px 12px',
          width: 160,
          height: 148,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          transition: 'transform 150ms',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = '' }}
      >
        <Avatar name={node.name} size={48} avatarUrl={node.avatarUrl} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: C.ink, lineHeight: 1.3 }}>{node.name}</div>
          {node.role && <div style={{ fontSize: 11, color: C.mute, marginTop: 2 }}>{node.role}</div>}
        </div>
      </div>
    </Link>
  )
}

function OrgTreeNode({ node }: { node: OrgNode }) {
  const n = node.children.length
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <OrgCard node={node} />
      {n > 0 && (
        <>
          <div style={{ width: 2, height: 20, background: C.line }} />
          <div style={{ display: 'flex', gap: 0 }}>
            {node.children.map((child, idx) => {
              const isFirst = idx === 0
              const isLast = idx === n - 1
              const clip = n === 1 ? 'none' : isFirst ? 'inset(0 0 0 50%)' : isLast ? 'inset(0 50% 0 0)' : 'none'
              return (
                <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 10px' }}>
                  <div style={{ position: 'relative', width: '100%', height: 20 }}>
                    {n > 1 && (
                      <div style={{
                        position: 'absolute', top: 0, left: -10, right: -10,
                        height: 2, background: C.line, clipPath: clip,
                      }} />
                    )}
                    <div style={{
                      position: 'absolute', top: 0, left: '50%',
                      transform: 'translateX(-50%)', width: 2, height: 20, background: C.line,
                    }} />
                  </div>
                  <OrgTreeNode node={child} />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default function PeoplePage() {
  const { me, team, teamLoading, teamError } = useApp()
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'directory' | 'org'>('directory')

  const filtered = team.filter(m => {
    const q = query.toLowerCase()
    return !q || m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q) || (m.department ?? '').toLowerCase().includes(q)
  })

  const orgTree = buildOrgTree([me, ...team])

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '7px 16px',
    borderRadius: 8,
    border: `1px solid ${active ? C.purple : C.line}`,
    background: active ? C.purpleSoft : 'transparent',
    color: active ? C.purple : C.mute,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'Geist, -apple-system, sans-serif',
  })

  return (
    <div className="people-page" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 36px 80px' }}>
      <div style={{ marginBottom: 28 }}>
        <p style={EYEBROW_STYLE}>Directory</p>
        <h1 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 32, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', margin: '6px 0 0' }}>
          The team
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <button style={tabBtn(view === 'directory')} onClick={() => setView('directory')}>
          <Users size={14} />
          Directory
        </button>
        <button style={tabBtn(view === 'org')} onClick={() => setView('org')}>
          <GitBranch size={14} />
          Org chart
        </button>
      </div>

      {view === 'directory' ? (
        <>
          <div style={{ position: 'relative', marginBottom: 28 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.mute, pointerEvents: 'none' }} />
            <input
              style={{
                width: '100%', maxWidth: 420, boxSizing: 'border-box',
                border: `1px solid ${C.line}`, borderRadius: 10,
                padding: '9px 13px 9px 36px', fontSize: 13, color: C.ink,
                background: C.inputBg, outline: 'none', fontFamily: 'Geist, -apple-system, sans-serif',
              }}
              placeholder="Search by name, role, or department…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={e => { e.target.style.borderColor = C.purple }}
              onBlur={e => { e.target.style.borderColor = C.line }}
            />
          </div>

          {teamLoading ? (
            <div className="people-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ ...CARD_STYLE, padding: '24px 16px 20px', height: 210, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.lineSoft }} />
                  <div style={{ width: '60%', height: 12, borderRadius: 6, background: C.lineSoft }} />
                  <div style={{ width: '40%', height: 10, borderRadius: 6, background: C.lineSoft }} />
                </div>
              ))}
            </div>
          ) : teamError ? (
            <p style={{ color: C.mute, fontSize: 13 }}>{teamError}</p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', color: C.mute, fontSize: 13, marginTop: 40 }}>No team members match "{query}"</p>
          ) : (
            <div className="people-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
              {filtered.map((m, i) => (
                <Link key={m.id} href={`/people/${m.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{ ...CARD_STYLE, padding: '24px 16px 20px', height: 210, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', transition: 'box-shadow 180ms, transform 180ms', cursor: 'pointer', animation: 'fadeUp 280ms ease both', animationDelay: `${i * 40}ms` }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = 'translateY(-5px) scale(1.01)'; el.style.boxShadow = '0 14px 32px -10px rgba(19,20,46,0.22)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = ''; el.style.boxShadow = '' }}
                  >
                    <Avatar name={m.name} size={64} status={m.status} avatarUrl={m.avatarUrl} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, letterSpacing: '-0.005em', marginBottom: 2 }}>{m.name}</div>
                      {m.role && <div style={{ fontSize: 12, color: C.mute }}>{m.role}</div>}
                      {m.department && <div style={{ fontSize: 11, color: C.mute, marginTop: 2 }}>{m.department}</div>}
                      <div style={{ fontSize: 11, color: STATUS_COLOR[m.status], fontWeight: 500, marginTop: 5 }}>{STATUS_LABEL[m.status]}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          {orgTree.length === 0 ? (
            <p style={{ color: C.mute, fontSize: 13, padding: '40px 0' }}>No org data available.</p>
          ) : (
            <div style={{ paddingBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '8px 24px 0' }}>
                {orgTree.map(root => <OrgTreeNode key={root.id} node={root} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
