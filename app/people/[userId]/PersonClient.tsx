'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, ArrowLeft, Cake } from 'lucide-react'
import { C, CARD_STYLE } from '../../../tokens'
import { Avatar } from '../../../components/Avatar'
import { useUserProfile } from '../../../hooks'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: `1px solid ${C.line}`, borderRadius: 8,
  padding: '8px 12px', fontSize: 13, color: C.ink,
  background: C.inputBg, outline: 'none', fontFamily: 'Geist, -apple-system, sans-serif',
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: C.mute, letterSpacing: '0.1em',
  textTransform: 'uppercase', margin: '0 0 14px',
}

export default function PersonClient({ userId }: { userId: string }) {
  const { profile, extras, loading, saveExtras } = useUserProfile(userId)
  const [editingBio, setEditingBio] = useState(false)
  const [bioDraft, setBioDraft] = useState('')
  const [skillsDraft, setSkillsDraft] = useState('')
  const [birthdayDraft, setBirthdayDraft] = useState('')
  const [saving, setSaving] = useState(false)

  function startEdit() {
    setBioDraft(extras?.bio ?? '')
    setSkillsDraft(extras?.skills ?? '')
    setBirthdayDraft(extras?.birthday ?? '')
    setEditingBio(true)
  }

  async function handleSave() {
    if (!profile?.email) return
    setSaving(true)
    try {
      await saveExtras({ bio: bioDraft, skills: skillsDraft, birthday: birthdayDraft }, profile.email)
      setEditingBio(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 36px' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 40 }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: C.lineSoft }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '40%', height: 20, borderRadius: 8, background: C.lineSoft, marginBottom: 10 }} />
            <div style={{ width: '25%', height: 14, borderRadius: 6, background: C.lineSoft }} />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 36px', textAlign: 'center' }}>
        <p style={{ color: C.mute, marginBottom: 16 }}>Person not found.</p>
        <Link href="/people" style={{ fontSize: 13, fontWeight: 600, color: C.purple, textDecoration: 'none' }}>← People</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 36px 80px' }}>
      <Link href="/people" style={{ fontSize: 13, fontWeight: 600, color: C.mute, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        <ArrowLeft size={14} /> People
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32 }}>
        <Avatar name={profile.name} size={96} avatarUrl={profile.avatarUrl} />
        <div>
          <h1 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            {profile.name}
          </h1>
          {profile.role && <p style={{ fontSize: 15, color: C.body, margin: '0 0 4px' }}>{profile.role}</p>}
          {profile.department && <p style={{ fontSize: 13, color: C.mute, margin: 0 }}>{profile.department}</p>}
        </div>
      </div>

      {/* Contact */}
      {(profile.email || profile.phone || profile.officeLocation) && (
        <div style={{ ...CARD_STYLE, padding: '20px', marginBottom: 16 }}>
          <p style={SECTION_LABEL}>Contact</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profile.email && (
              <a href={`mailto:${profile.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: C.body, fontSize: 13 }}>
                <Mail size={15} color={C.mute} strokeWidth={1.6} /> {profile.email}
              </a>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: C.body, fontSize: 13 }}>
                <Phone size={15} color={C.mute} strokeWidth={1.6} /> {profile.phone}
              </a>
            )}
            {profile.officeLocation && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: C.body }}>
                <MapPin size={15} color={C.mute} strokeWidth={1.6} /> {profile.officeLocation}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Manager */}
      {profile.manager && (
        <div style={{ ...CARD_STYLE, padding: '20px', marginBottom: 16 }}>
          <p style={SECTION_LABEL}>Reports to</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={profile.manager.name} size={36} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{profile.manager.name}</div>
              {profile.manager.role && <div style={{ fontSize: 12, color: C.mute }}>{profile.manager.role}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Direct reports */}
      {profile.directReports && profile.directReports.length > 0 && (
        <div style={{ ...CARD_STYLE, padding: '20px', marginBottom: 16 }}>
          <p style={SECTION_LABEL}>Direct reports ({profile.directReports.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profile.directReports.map(r => (
              <Link key={r.id} href={`/people/${r.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                <Avatar name={r.name} size={36} avatarUrl={r.avatarUrl} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{r.name}</div>
                  {r.role && <div style={{ fontSize: 12, color: C.mute }}>{r.role}</div>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bio & Skills */}
      <div style={{ ...CARD_STYLE, padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ ...SECTION_LABEL, marginBottom: 0 }}>About</p>
          {!editingBio && (
            <button onClick={startEdit} style={{ fontSize: 12, fontWeight: 500, color: C.purple, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Edit</button>
          )}
        </div>
        {editingBio ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.body, marginBottom: 4, display: 'block' }}>Bio</label>
              <textarea
                style={{ ...INPUT_STYLE, minHeight: 80, resize: 'vertical' }}
                value={bioDraft}
                onChange={e => setBioDraft(e.target.value)}
                placeholder="Tell the team a bit about yourself…"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.body, marginBottom: 4, display: 'block' }}>Skills</label>
              <input
                style={INPUT_STYLE}
                value={skillsDraft}
                onChange={e => setSkillsDraft(e.target.value)}
                placeholder="e.g. React, Strategy, UX Design"
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.body, marginBottom: 4, display: 'block' }}>Birthday</label>
              <input
                type="date"
                style={{ ...INPUT_STYLE, width: 'auto' }}
                value={birthdayDraft ? `2000-${birthdayDraft}` : ''}
                onChange={e => {
                  const val = e.target.value
                  if (!val) { setBirthdayDraft(''); return }
                  const parts = val.split('-')
                  setBirthdayDraft(`${parts[1]}-${parts[2]}`)
                }}
              />
              <span style={{ fontSize: 11, color: C.mute, marginTop: 4, display: 'block' }}>Only month and day are stored — the year is ignored.</span>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingBio(false)} style={{ padding: '7px 14px', borderRadius: 999, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '7px 16px', borderRadius: 999, border: 'none', background: C.purple, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {extras?.bio ? (
              <p style={{ fontSize: 14, color: C.body, lineHeight: 1.6, margin: '0 0 12px' }}>{extras.bio}</p>
            ) : (
              <p style={{ fontSize: 13, color: C.mute, fontStyle: 'italic', margin: '0 0 12px' }}>
                No bio yet.
              </p>
            )}
            {extras?.skills && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: extras?.birthday ? 12 : 0 }}>
                {extras.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => (
                  <span key={skill} style={{ fontSize: 12, fontWeight: 500, color: C.purple, background: C.purpleSoft, padding: '3px 10px', borderRadius: 999 }}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
            {extras?.birthday && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.body }}>
                <Cake size={14} color={C.mute} strokeWidth={1.6} />
                {new Date(`2000-${extras.birthday}`).toLocaleDateString('en-GB', { month: 'long', day: 'numeric' })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
