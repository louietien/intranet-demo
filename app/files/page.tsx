'use client'
import { useState } from 'react'
import { FileText, Upload, Trash2, Download } from 'lucide-react'
import { C, CARD_STYLE, EYEBROW_STYLE } from '../../tokens'
import { useApp } from '../../context/app-context'
import { useDocuments } from '../../hooks'

const EXT_COLORS: Record<string, string> = {
  pdf: '#E25C5C',
  doc: '#4472C4', docx: '#4472C4',
  xls: '#217346', xlsx: '#217346',
  ppt: '#D24726', pptx: '#D24726',
  jpg: '#E8A340', jpeg: '#E8A340', png: '#E8A340', gif: '#E8A340', webp: '#E8A340',
}

function getExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  border: `1px solid ${C.line}`, borderRadius: 8,
  padding: '8px 12px', fontSize: 13, color: C.ink,
  background: C.inputBg, outline: 'none', fontFamily: 'Geist, -apple-system, sans-serif',
}

export default function FilesPage() {
  const { me, isAdmin } = useApp()
  const { docs, docsLoading, uploadDocument, deleteDocument } = useDocuments()
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [file, setFile] = useState<File | null>(null)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !title.trim()) return
    setUploading(true)
    try {
      await uploadDocument(file, { title: title.trim(), description: description.trim(), category }, me)
      setTitle('')
      setDescription('')
      setCategory('General')
      setFile(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 36px 80px' }}>
      <div style={{ marginBottom: 24 }}>
        <p style={EYEBROW_STYLE}>Shared documents</p>
        <h1 style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 32, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', margin: '6px 0 0' }}>
          Files
        </h1>
      </div>

      <form
        onSubmit={handleUpload}
        style={{ ...CARD_STYLE, padding: '18px 20px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <p style={{ ...EYEBROW_STYLE, marginBottom: 0 }}>Upload a file</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input style={INPUT_STYLE} placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <input style={INPUT_STYLE} placeholder="Category (e.g. HR, Engineering)" value={category} onChange={e => setCategory(e.target.value)} />
        </div>
        <input style={INPUT_STYLE} placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} style={{ fontSize: 13 }} />
          <button
            type="submit"
            disabled={!file || !title.trim() || uploading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 'auto',
              padding: '8px 16px', borderRadius: 999, border: 'none',
              background: C.purple, color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: !file || !title.trim() || uploading ? 'default' : 'pointer',
              opacity: !file || !title.trim() || uploading ? 0.6 : 1,
            }}
          >
            <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
        <p style={{ fontSize: 11, color: C.mute, margin: 0 }}>
          Files are stored only in your browser for this demo session — nothing is uploaded to a server.
        </p>
      </form>

      {docsLoading ? (
        <div style={{ ...CARD_STYLE, padding: '40px', textAlign: 'center', color: C.mute, fontSize: 13 }}>Loading…</div>
      ) : docs.length === 0 ? (
        <div style={{ ...CARD_STYLE, padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: C.mute, margin: 0 }}>No files yet.</p>
        </div>
      ) : (
        <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
          {docs.map((doc, i) => {
            const ext = getExt(doc.fileName)
            const color = EXT_COLORS[ext] ?? C.mute
            const canDelete = isAdmin || doc.uploadedByEmail === me.email
            return (
              <div
                key={doc.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                  borderTop: i === 0 ? 'none' : `1px solid ${C.lineSoft}`,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={22} color={color} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{doc.title}</div>
                  {doc.description && <div style={{ fontSize: 12, color: C.mute, marginTop: 2 }}>{doc.description}</div>}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: C.purple, background: C.purpleSoft, padding: '2px 8px', borderRadius: 999 }}>{doc.category}</span>
                    <span style={{ fontSize: 12, color: C.mute }}>{doc.uploadedByName}</span>
                    <span style={{ fontSize: 11, color: C.mute }}>·</span>
                    <span style={{ fontSize: 12, color: C.mute }}>{formatDate(doc.created)}</span>
                  </div>
                </div>
                {doc.fileUrl && (
                  <a
                    href={doc.fileUrl}
                    download={doc.fileName}
                    title="Download"
                    style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}
                  >
                    <Download size={14} />
                  </a>
                )}
                {canDelete && (
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    title="Delete"
                    style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.mute, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
