'use client'
import { useState } from 'react'
import {
  Users, Clock, BookOpen, Headphones, Receipt,
  User, UserPlus, Briefcase, Building, Building2,
  Timer, Calendar, CalendarDays,
  Book, FileText, FileSearch, GraduationCap, Lightbulb,
  Phone, MessageSquare, Mail, Video, Bell,
  CreditCard, DollarSign, Wallet, TrendingUp, BarChart2, PieChart,
  Folder, FolderOpen, HardDrive, Database, Code, Terminal, Settings, Wrench, Cpu,
  Globe, Link, ExternalLink,
  Home, Star, Shield, Lock, Key, MapPin, LayoutDashboard, Grid3x3, List, Layers,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { QuickLink } from '../types'
import { C, CARD_STYLE } from '../tokens'
import { Modal } from './Modal'

// ---------- Custom brand SVGs (no public icon library equivalent) ----------
const CUSTOM_SVG: Record<string, React.ReactNode> = {
  monday: (
    <g>
      <circle cx="7" cy="12" r="2.4" fill="#FF3D57" />
      <circle cx="13" cy="12" r="2.4" fill="#FFCC00" />
      <circle cx="19" cy="12" r="2.4" fill="#00CA72" />
    </g>
  ),
  sugar: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M4 10h16M9 14h2" />
    </g>
  ),
  journey: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17c0-4 3-4 7-4s7 0 7-4" />
      <circle cx="5" cy="17" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="19" cy="9" r="1.8" fill="currentColor" stroke="none" />
    </g>
  ),
  make: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l6 6-6 6M14 18h6" />
    </g>
  ),
  drive: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
    </g>
  ),
}

// ---------- Lucide icon registry (key → component + label) ----------
const LUCIDE_REGISTRY: Record<string, { Component: LucideIcon; label: string }> = {
  // Mapped from existing quick link keys
  hr:        { Component: Users,           label: 'People / HR' },
  time:      { Component: Clock,           label: 'Clock / Time' },
  handbook:  { Component: BookOpen,        label: 'Handbook / Book' },
  helpdesk:  { Component: Headphones,      label: 'Helpdesk' },
  expense:   { Component: Receipt,         label: 'Receipt / Expense' },
  // People
  user:      { Component: User,            label: 'Person' },
  'user-plus': { Component: UserPlus,      label: 'Add Person' },
  briefcase: { Component: Briefcase,       label: 'Briefcase' },
  building:  { Component: Building,        label: 'Building' },
  'building-2': { Component: Building2,    label: 'Office' },
  // Time
  timer:     { Component: Timer,           label: 'Timer' },
  calendar:  { Component: Calendar,        label: 'Calendar' },
  'calendar-days': { Component: CalendarDays, label: 'Schedule' },
  // Knowledge
  book:      { Component: Book,            label: 'Notebook' },
  'file-text': { Component: FileText,      label: 'Document' },
  'file-search': { Component: FileSearch,  label: 'Search Doc' },
  'graduation-cap': { Component: GraduationCap, label: 'Training' },
  lightbulb: { Component: Lightbulb,       label: 'Ideas' },
  // Communication
  phone:     { Component: Phone,           label: 'Phone' },
  'message-square': { Component: MessageSquare, label: 'Chat' },
  mail:      { Component: Mail,            label: 'Email' },
  video:     { Component: Video,           label: 'Video' },
  bell:      { Component: Bell,            label: 'Notifications' },
  // Finance
  'credit-card': { Component: CreditCard,  label: 'Card' },
  'dollar-sign': { Component: DollarSign,  label: 'Finance' },
  wallet:    { Component: Wallet,          label: 'Wallet' },
  'trending-up': { Component: TrendingUp,  label: 'Growth' },
  'bar-chart': { Component: BarChart2,     label: 'Charts' },
  'pie-chart': { Component: PieChart,      label: 'Reports' },
  // Files / Tech
  folder:    { Component: Folder,          label: 'Folder' },
  'folder-open': { Component: FolderOpen,  label: 'Files' },
  'hard-drive': { Component: HardDrive,    label: 'Drive' },
  database:  { Component: Database,        label: 'Database' },
  code:      { Component: Code,            label: 'Code' },
  terminal:  { Component: Terminal,        label: 'Terminal' },
  settings:  { Component: Settings,        label: 'Settings' },
  wrench:    { Component: Wrench,          label: 'Tools' },
  cpu:       { Component: Cpu,             label: 'System' },
  // Web
  globe:     { Component: Globe,           label: 'Website' },
  link:      { Component: Link,            label: 'Link' },
  'external-link': { Component: ExternalLink, label: 'External' },
  // General
  home:      { Component: Home,            label: 'Home' },
  star:      { Component: Star,            label: 'Favourite' },
  shield:    { Component: Shield,          label: 'Security' },
  lock:      { Component: Lock,            label: 'Access' },
  key:       { Component: Key,             label: 'Credentials' },
  'map-pin': { Component: MapPin,          label: 'Location' },
  dashboard: { Component: LayoutDashboard, label: 'Dashboard' },
  grid:      { Component: Grid3x3,         label: 'Grid' },
  list:      { Component: List,            label: 'List' },
  layers:    { Component: Layers,          label: 'Layers' },
}

// ---------- Icon render helper ----------
function renderIcon(iconKey: string, size: number, color = 'currentColor'): React.ReactNode {
  if (CUSTOM_SVG[iconKey]) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ color }}>
        {CUSTOM_SVG[iconKey]}
      </svg>
    )
  }
  const entry = LUCIDE_REGISTRY[iconKey]
  if (entry) {
    return <entry.Component size={size} strokeWidth={1.6} color={color} />
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  )
}

// ---------- About modal ----------
function AboutModal({ link, onClose }: { link: QuickLink; onClose: () => void }) {
  return (
    <Modal title={link.label} onClose={onClose} width={480}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: C.purpleSoft, color: C.navy,
          }}>
            {renderIcon(link.icon, 26)}
          </span>
          <div>
            <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: '-0.02em' }}>
              {link.label}
            </div>
            <div style={{ fontSize: 12, color: C.mute, marginTop: 2, wordBreak: 'break-all' }}>{link.href}</div>
          </div>
        </div>

        {link.description && (
          <p style={{ fontSize: 14, color: C.body, lineHeight: 1.65, margin: 0, padding: '16px', background: C.surface, borderRadius: 12, border: `1px solid ${C.lineSoft}` }}>
            {link.description}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 20px', borderRadius: 999, background: 'transparent', border: `1px solid ${C.line}`, color: C.mute, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Close
          </button>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '9px 22px', borderRadius: 999,
              background: C.navy, color: '#fff',
              fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            Visit
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </Modal>
  )
}

// ---------- Single tile ----------
function QuickLinkTile({ link, index = 0 }: { link: QuickLink; index?: number }) {
  const [hover, setHover] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  return (
    <>
      <div
        style={{ position: 'relative', animation: 'fadeUp 260ms ease both', animationDelay: `${index * 35}ms` }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 10px 16px',
            borderRadius: 10,
            background: hover ? C.bgWarm : C.surface,
            border: `1px solid ${hover ? '#DCD3BD' : C.lineSoft}`,
            textDecoration: 'none',
            transition: 'all 160ms ease',
            transform: hover ? 'translateY(-4px) scale(1.02)' : 'none',
            boxShadow: hover ? '0 8px 20px -8px rgba(19,20,46,0.18)' : 'none',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: hover ? '#fff' : 'rgba(255,255,255,0.7)',
              color: C.navy,
              marginBottom: 12,
              boxShadow: hover ? '0 4px 14px -6px rgba(19,20,46,0.22)' : 'none',
              transition: 'all 160ms ease',
            }}
          >
            {renderIcon(link.icon, 22)}
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.ink, letterSpacing: '-0.005em', textAlign: 'center', lineHeight: 1.3 }}>
            {link.label}
          </span>
          {link.badge != null && (
            <span
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                minWidth: 20,
                height: 20,
                padding: '0 6px',
                borderRadius: 999,
                background: C.purple,
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {link.badge}
            </span>
          )}
        </a>

        {link.description && (
          <button
            onClick={() => setShowAbout(true)}
            title="About"
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              border: `1px solid ${C.line}`,
              color: C.mute,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1,
              transition: 'all 120ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.purpleSoft; (e.currentTarget as HTMLButtonElement).style.borderColor = C.purple; (e.currentTarget as HTMLButtonElement).style.color = C.purple }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.92)'; (e.currentTarget as HTMLButtonElement).style.borderColor = C.line; (e.currentTarget as HTMLButtonElement).style.color = C.mute }}
          >
            i
          </button>
        )}
      </div>

      {showAbout && <AboutModal link={link} onClose={() => setShowAbout(false)} />}
    </>
  )
}

// ---------- Icon picker modal ----------
function IconPickerModal({ current, onPick, onClose }: { current: string; onPick: (icon: string) => void; onClose: () => void }) {
  const [search, setSearch] = useState('')
  const q = search.toLowerCase()

  const customEntries = Object.keys(CUSTOM_SVG).filter(k => k.includes(q))
  const lucideEntries = Object.entries(LUCIDE_REGISTRY).filter(
    ([k, v]) => !q || k.includes(q) || v.label.toLowerCase().includes(q)
  )

  const TILE: React.CSSProperties = {
    width: 52,
    height: 52,
    borderRadius: 10,
    border: `1px solid ${C.lineSoft}`,
    background: C.surface,
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    cursor: 'pointer',
    transition: 'all 120ms ease',
    fontSize: 9,
    fontWeight: 500,
    letterSpacing: '0.02em',
    color: C.mute,
  }

  return (
    <Modal title="Choose icon" onClose={onClose} width={560}>
      <input
        autoFocus
        placeholder="Search icons…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          border: `1px solid ${C.line}`,
          borderRadius: 10,
          padding: '8px 14px',
          fontSize: 13,
          color: C.ink,
          background: C.inputBg,
          outline: 'none',
          marginBottom: 18,
          marginTop: -8,
        }}
        onFocus={e => { e.target.style.borderColor = C.purple }}
        onBlur={e => { e.target.style.borderColor = C.line }}
      />

      {customEntries.length > 0 && (
        <>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.mute, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Brand</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {customEntries.map(k => (
              <button
                key={k}
                onClick={() => onPick(k)}
                title={k}
                style={{
                  ...TILE,
                  background: current === k ? C.purpleSoft : C.surface,
                  border: `1px solid ${current === k ? C.purple : C.lineSoft}`,
                  color: current === k ? C.purple : C.navy,
                }}
              >
                {renderIcon(k, 22)}
              </button>
            ))}
          </div>
        </>
      )}

      {lucideEntries.length > 0 && (
        <>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.mute, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Icons</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {lucideEntries.map(([k, v]) => (
              <button
                key={k}
                onClick={() => onPick(k)}
                title={v.label}
                style={{
                  ...TILE,
                  background: current === k ? C.purpleSoft : C.surface,
                  border: `1px solid ${current === k ? C.purple : C.lineSoft}`,
                  color: current === k ? C.purple : C.navy,
                }}
              >
                <v.Component size={22} strokeWidth={1.6} color={current === k ? C.purple : C.navy} />
                <span style={{ fontSize: 9, color: current === k ? C.purple : C.mute }}>{v.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {customEntries.length === 0 && lucideEntries.length === 0 && (
        <p style={{ textAlign: 'center', color: C.mute, fontSize: 13, padding: '24px 0' }}>No icons match "{search}"</p>
      )}
    </Modal>
  )
}

// ---------- Customize modal ----------
const INPUT_STYLE: React.CSSProperties = {
  border: `1px solid ${C.line}`,
  borderRadius: 8,
  padding: '7px 11px',
  fontSize: 13,
  color: C.ink,
  background: C.inputBg,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

function CustomizeModal({ links, onSave, onClose }: { links: QuickLink[]; onSave: (links: QuickLink[]) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<QuickLink[]>(links.map(l => ({ ...l })))
  const [pickingIconFor, setPickingIconFor] = useState<string | null>(null)

  function update(id: string, field: 'label' | 'href' | 'description', value: string) {
    setDraft(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  function setIcon(id: string, icon: string) {
    setDraft(prev => prev.map(l => l.id === id ? { ...l, icon } : l))
    setPickingIconFor(null)
  }

  function remove(id: string) {
    setDraft(prev => prev.filter(l => l.id !== id))
  }

  function addLink() {
    setDraft(prev => [...prev, { id: `link-${Date.now()}`, icon: 'globe', label: '', href: '', description: '' }])
  }

  if (pickingIconFor) {
    const link = draft.find(l => l.id === pickingIconFor)
    return (
      <IconPickerModal
        current={link?.icon ?? ''}
        onPick={icon => setIcon(pickingIconFor, icon)}
        onClose={() => setPickingIconFor(null)}
      />
    )
  }

  return (
    <Modal title="Customize quick links" onClose={onClose} width={560}>
      <p style={{ fontSize: 13, color: C.mute, marginBottom: 18, marginTop: -8 }}>
        Edit the label and URL for each shortcut. Click the icon to change it.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {draft.map(link => (
          <div
            key={link.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '10px 12px',
              background: C.surface,
              borderRadius: 12,
              border: `1px solid ${C.lineSoft}`,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '36px 140px 1fr 28px', gap: 10, alignItems: 'center' }}>
              <button
                onClick={() => setPickingIconFor(link.id)}
                title="Change icon"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff',
                  color: C.navy,
                  flexShrink: 0,
                  border: `1px solid ${C.lineSoft}`,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {renderIcon(link.icon, 18)}
              </button>
              <input
                value={link.label}
                onChange={e => update(link.id, 'label', e.target.value)}
                placeholder="Label"
                style={INPUT_STYLE}
                onFocus={e => { e.target.style.borderColor = C.purple }}
                onBlur={e => { e.target.style.borderColor = C.line }}
              />
              <input
                value={link.href}
                onChange={e => update(link.id, 'href', e.target.value)}
                placeholder="https://…"
                style={INPUT_STYLE}
                onFocus={e => { e.target.style.borderColor = C.purple }}
                onBlur={e => { e.target.style.borderColor = C.line }}
              />
              <button
                onClick={() => remove(link.id)}
                title="Remove"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: `1px solid ${C.lineSoft}`,
                  background: 'transparent',
                  color: C.mute,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <textarea
              value={link.description ?? ''}
              onChange={e => update(link.id, 'description', e.target.value)}
              placeholder="Description (optional) — shown in the About panel"
              rows={2}
              style={{
                ...INPUT_STYLE,
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                minHeight: 52,
              }}
              onFocus={e => { e.target.style.borderColor = C.purple }}
              onBlur={e => { e.target.style.borderColor = C.line }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={addLink}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: 12,
          border: `1.5px dashed ${C.line}`,
          background: 'transparent',
          color: C.mute,
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add link
      </button>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button
          onClick={onClose}
          style={{ padding: '9px 20px', borderRadius: 999, background: 'transparent', border: `1px solid ${C.line}`, color: C.mute, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          onClick={() => { onSave(draft); onClose() }}
          style={{ padding: '9px 22px', borderRadius: 999, background: C.navy, border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Save
        </button>
      </div>
    </Modal>
  )
}

// ---------- Main component ----------
interface Props {
  links: QuickLink[]
  onUpdateLinks: (links: QuickLink[]) => void
}

export function QuickLinks({ links, onUpdateLinks }: Props) {
  const [customizing, setCustomizing] = useState(false)

  return (
    <>
      <section style={{ ...CARD_STYLE, padding: 'var(--ql-pad)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>
            Quick links
          </h2>
          <button
            onClick={() => setCustomizing(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.mute,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Customize
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="ql-grid" style={{ display: 'grid', gridTemplateColumns: 'var(--ql-cols)', gap: 'var(--ql-gap)' }}>
          {links.map((l, i) => <QuickLinkTile key={l.id} link={l} index={i} />)}
        </div>
      </section>

      {customizing && (
        <CustomizeModal
          links={links}
          onSave={onUpdateLinks}
          onClose={() => setCustomizing(false)}
        />
      )}
    </>
  )
}
