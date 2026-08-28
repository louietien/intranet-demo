'use client'
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { renderMarkdown } from '../lib/markdownRenderer'
import type { KbArticle } from '../types'
import { C } from '../tokens'
import { createKbImage } from '../lib/mockStore'
import { useDraft } from '../lib/useDraft'

// ── Image upload helpers ──────────────────────────────────────────────────────

async function compressToWebP(file: File, maxBytes = 5 * 1024 * 1024): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const MAX_DIM = 1920
      let w = img.naturalWidth, h = img.naturalHeight
      if (w > MAX_DIM || h > MAX_DIM) {
        const scale = MAX_DIM / Math.max(w, h)
        w = Math.round(w * scale)
        h = Math.round(h * scale)
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      const qualities = [0.92, 0.82, 0.72, 0.62, 0.5]
      let qi = 0
      const attempt = () => {
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error('Canvas conversion failed')); return }
          if (blob.size <= maxBytes || qi === qualities.length - 1) resolve(blob)
          else { qi++; attempt() }
        }, 'image/webp', qualities[qi])
      }
      attempt()
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = objectUrl
  })
}

async function uploadKbImage(file: File): Promise<string> {
  const blob = await compressToWebP(file)
  const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' })
  const { url } = await createKbImage(compressed)
  return url
}

type Layout = 'split' | 'stack' | 'preview'

// ── Format helpers ────────────────────────────────────────────────────────────

interface ApplyResult { value: string; selStart: number; selEnd: number }

function wrapInline(
  value: string, ss: number, se: number,
  open: string, close = open,
): ApplyResult {
  const sel = value.slice(ss, se)
  const already = sel.startsWith(open) && sel.endsWith(close) && sel.length > open.length + close.length
  if (already) {
    const inner = sel.slice(open.length, sel.length - close.length)
    return { value: value.slice(0, ss) + inner + value.slice(se), selStart: ss, selEnd: ss + inner.length }
  }
  const wrapped = open + sel + close
  return { value: value.slice(0, ss) + wrapped + value.slice(se), selStart: ss + open.length, selEnd: se + open.length }
}

function prependLines(
  value: string, ss: number, se: number,
  prefix: string,
): ApplyResult {
  const before = value.slice(0, ss)
  const sel = value.slice(ss, se) || ''
  const after = value.slice(se)
  const lines = sel ? sel.split('\n') : ['']
  const toggling = lines.every(l => l.startsWith(prefix))
  const newLines = toggling ? lines.map(l => l.slice(prefix.length)) : lines.map(l => prefix + l)
  const newSel = newLines.join('\n')
  return { value: before + newSel + after, selStart: ss, selEnd: ss + newSel.length }
}

function insertCodeBlock(value: string, ss: number, se: number): ApplyResult {
  const sel = value.slice(ss, se)
  const block = '```\n' + (sel || '') + '\n```'
  const newVal = value.slice(0, ss) + block + value.slice(se)
  return { value: newVal, selStart: ss + 4, selEnd: ss + 4 + (sel || '').length }
}

function insertLink(value: string, ss: number, se: number): ApplyResult {
  const sel = value.slice(ss, se)
  const insert = sel ? `[${sel}](url)` : '[text](url)'
  const newVal = value.slice(0, ss) + insert + value.slice(se)
  const urlStart = ss + insert.indexOf('(') + 1
  return { value: newVal, selStart: urlStart, selEnd: urlStart + 3 }
}

function insertHeading(value: string, ss: number, level: number): ApplyResult {
  const lineStart = value.lastIndexOf('\n', ss - 1) + 1
  const prefix = '#'.repeat(level) + ' '
  const already = value.slice(lineStart).startsWith(prefix)
  if (already) {
    const newVal = value.slice(0, lineStart) + value.slice(lineStart + prefix.length)
    return { value: newVal, selStart: ss - prefix.length, selEnd: ss - prefix.length }
  }
  // strip any existing heading prefix
  const stripped = value.slice(lineStart).replace(/^#{1,6}\s/, '')
  const diff = value.slice(lineStart).length - stripped.length
  const newVal = value.slice(0, lineStart) + prefix + stripped
  return { value: newVal, selStart: ss - diff + prefix.length, selEnd: ss - diff + prefix.length }
}

function resizeNearestImage(value: string, cursor: number, width: string): ApplyResult | null {
  const imgRe = /!\[([^\]]*)\]\(([^)]+)\)(\{width=[^}]+\})?/g
  let last: RegExpExecArray | null = null
  let m: RegExpExecArray | null
  while ((m = imgRe.exec(value)) !== null) {
    if (m.index <= cursor) last = m
    else break
  }
  if (!last) return null
  const replacement = `![${last[1]}](${last[2]}){width=${width}}`
  const end = last.index + last[0].length
  return {
    value: value.slice(0, last.index) + replacement + value.slice(end),
    selStart: last.index,
    selEnd: last.index + replacement.length,
  }
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function calcStats(value: string) {
  const words = value.trim() ? value.trim().split(/\s+/).length : 0
  const chars = value.length
  const lines = value ? value.split('\n').length : 0
  const readMin = Math.max(1, Math.round(words / 200))
  return { words, chars, lines, readMin }
}

// ── Toolbar button ────────────────────────────────────────────────────────────

function TBtn({ label, title, onClick }: { label: string; title: string; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        padding: '3px 9px',
        borderRadius: 6,
        border: `1px solid ${C.line}`,
        background: 'transparent',
        color: C.body,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        lineHeight: 1.6,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = C.purpleSoft; (e.currentTarget as HTMLButtonElement).style.color = C.purple }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = C.body }}
    >
      {label}
    </button>
  )
}

function Divider() {
  return <span style={{ width: 1, height: 18, background: C.line, flexShrink: 0 }} />
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  value: string
  onChange: (v: string) => void
  minHeight?: number
  placeholder?: string
  draftKey?: string | null
  articles?: KbArticle[]
  clearDraftRef?: React.MutableRefObject<(() => void) | null>
}

export function MarkdownEditor({ value, onChange, minHeight = 480, placeholder = 'Write in Markdown…', draftKey = null, articles, clearDraftRef }: Props) {
  const [layout, setLayout] = useState<Layout>('stack')
  useEffect(() => {
    if (window.innerWidth >= 768) setLayout('split')
  }, [])
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Mutable ref so async upload callbacks always see the latest value
  const latestValue = useRef(value)
  latestValue.current = value

  // Draft auto-save
  const { hasDraft, getDraft, clearDraft } = useDraft(draftKey, value)
  const [draftBanner, setDraftBanner] = useState(hasDraft)
  useEffect(() => { if (hasDraft) setDraftBanner(true) }, [hasDraft])
  useEffect(() => { if (clearDraftRef) clearDraftRef.current = clearDraft }, [clearDraft, clearDraftRef])

  function restoreDraft() {
    const saved = getDraft()
    if (saved !== null) onChange(saved)
    setDraftBanner(false)
  }

  const html = useMemo(() => renderMarkdown(value, { articles }), [value, articles])
  const stats = useMemo(() => calcStats(value), [value])

  const insertImageMd = useCallback((url: string, alt: string) => {
    const ta = taRef.current
    const ss = ta ? ta.selectionStart : latestValue.current.length
    const md = `![${alt}](${url})\n`
    const cur = latestValue.current
    const next = cur.slice(0, ss) + md + cur.slice(ss)
    latestValue.current = next
    onChange(next)
    if (ta) requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(ss + md.length, ss + md.length)
    })
  }, [onChange])

  const processFiles = useCallback(async (files: File[]) => {
    const images = files.filter(f => f.type.startsWith('image/'))
    if (!images.length) return
    setUploading(true)
    try {
      for (const f of images) {
        const url = await uploadKbImage(f)
        const alt = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
        insertImageMd(url, alt)
      }
    } catch (err) {
      console.error('Image upload failed:', err)
      alert('Image upload failed.')
    } finally {
      setUploading(false)
    }
  }, [insertImageMd])

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imageItems = Array.from(e.clipboardData.items).filter(i => i.type.startsWith('image/'))
    if (!imageItems.length) return
    e.preventDefault()
    processFiles(imageItems.map(i => i.getAsFile()!))
  }, [processFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (Array.from(e.dataTransfer.items).some(i => i.kind === 'file' && i.type.startsWith('image/'))) {
      e.preventDefault()
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback(() => setIsDragOver(false), [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    processFiles(Array.from(e.dataTransfer.files))
  }, [processFiles])

  // Apply a format and restore focus + cursor
  const applyFormat = useCallback((fn: (v: string, ss: number, se: number) => ApplyResult) => {
    const ta = taRef.current
    if (!ta) return
    const ss = ta.selectionStart
    const se = ta.selectionEnd
    const result = fn(value, ss, se)
    onChange(result.value)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(result.selStart, result.selEnd)
    })
  }, [value, onChange])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.ctrlKey || e.metaKey
    if (!mod) return
    if (e.key === 'b') { e.preventDefault(); applyFormat((v, ss, se) => wrapInline(v, ss, se, '**')) }
    else if (e.key === 'i') { e.preventDefault(); applyFormat((v, ss, se) => wrapInline(v, ss, se, '*')) }
    else if (e.key === 'e') { e.preventDefault(); applyFormat((v, ss, _se) => wrapInline(v, ss, _se, '`')) }
    else if (e.key === 'k') { e.preventDefault(); applyFormat(insertLink) }
  }, [applyFormat])

  const [syncScroll, setSyncScroll] = useState(true)

  // Synchronized scroll: mirror scroll ratio from editor to preview
  const handleScroll = useCallback(() => {
    const ta = taRef.current
    const preview = previewRef.current
    if (!ta || !preview) return
    const ratio = ta.scrollTop / (ta.scrollHeight - ta.clientHeight)
    if (isFinite(ratio)) {
      preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight)
    }
  }, [])

  // Exit fullscreen on Escape
  useEffect(() => {
    if (!isFullscreen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullscreen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isFullscreen])

  return (
    <div style={{
      border: `1px solid ${C.line}`,
      borderRadius: isFullscreen ? 0 : 12,
      overflow: 'hidden',
      background: C.card,
      ...(isFullscreen && {
        position: 'fixed' as const,
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column' as const,
      }),
    }}>
      {/* Toolbar row 1 — formatting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderBottom: `1px solid ${C.line}`, flexWrap: 'wrap' }}>
        <TBtn label="B" title="Bold (Ctrl+B)" onClick={() => applyFormat((v, ss, se) => wrapInline(v, ss, se, '**'))} />
        <TBtn label="/" title="Italic (Ctrl+I)" onClick={() => applyFormat((v, ss, se) => wrapInline(v, ss, se, '*'))} />
        <TBtn label="S" title="Strikethrough" onClick={() => applyFormat((v, ss, se) => wrapInline(v, ss, se, '~~'))} />
        <TBtn label="Code" title="Inline code (Ctrl+E)" onClick={() => applyFormat((v, ss, se) => wrapInline(v, ss, se, '`'))} />
        <Divider />
        <TBtn label="H2" title="Heading 2" onClick={() => applyFormat((v, ss) => insertHeading(v, ss, 2))} />
        <TBtn label="H3" title="Heading 3" onClick={() => applyFormat((v, ss) => insertHeading(v, ss, 3))} />
        <TBtn label="H4" title="Heading 4" onClick={() => applyFormat((v, ss) => insertHeading(v, ss, 4))} />
        <Divider />
        <TBtn label="List" title="Bullet list" onClick={() => applyFormat((v, ss, se) => prependLines(v, ss, se, '- '))} />
        <TBtn label="1." title="Ordered list" onClick={() => applyFormat((v, ss, se) => prependLines(v, ss, se, '1. '))} />
        <TBtn label="Tasks" title="Task list" onClick={() => applyFormat((v, ss, se) => prependLines(v, ss, se, '- [ ] '))} />
        <TBtn label="Quote" title="Blockquote" onClick={() => applyFormat((v, ss, se) => prependLines(v, ss, se, '> '))} />
        <TBtn label="Code Block" title="Code block" onClick={() => applyFormat(insertCodeBlock)} />
        <Divider />
        <TBtn label="Link" title="Link (Ctrl+K)" onClick={() => applyFormat(insertLink)} />
        <Divider />
        <TBtn
          label={uploading ? 'Uploading…' : 'Image'}
          title="Upload image (or paste / drag-drop)"
          onClick={() => !uploading && fileInputRef.current?.click()}
        />
        <TBtn
          label="Resize"
          title="Set width of nearest image (e.g. 60%, 400px)"
          onClick={() => {
            const ta = taRef.current
            if (!ta) return
            const w = window.prompt('Image width (e.g. 60%, 400px):', '60%')
            if (!w) return
            const result = resizeNearestImage(value, ta.selectionStart, w.trim())
            if (!result) { alert('No image found near the cursor.'); return }
            onChange(result.value)
            requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(result.selStart, result.selEnd) })
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={e => { if (e.target.files) processFiles(Array.from(e.target.files)); e.target.value = '' }}
        />
      </div>

      {/* Toolbar row 2 — view controls + stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderBottom: `1px solid ${C.line}`, background: C.bg }}>
        {(['split', 'stack', 'preview'] as Layout[]).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setLayout(m)}
            style={{
              padding: '3px 10px',
              borderRadius: 6,
              border: `1px solid ${layout === m ? C.purple : C.line}`,
              background: layout === m ? C.purpleSoft : 'transparent',
              color: layout === m ? C.purple : C.mute,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {m}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <span className="mobile-hide" style={{ fontSize: 11, color: C.mute }}>
          {stats.words} words &nbsp;·&nbsp; {stats.chars} chars &nbsp;·&nbsp; {stats.lines} lines &nbsp;·&nbsp; {stats.readMin} min read
        </span>
        {layout === 'split' && (
          <button
            type="button"
            onClick={() => setSyncScroll(s => !s)}
            title={syncScroll ? 'Scroll sync on — click to disable' : 'Scroll sync off — click to enable'}
            style={{
              padding: '3px 10px',
              borderRadius: 6,
              border: `1px solid ${syncScroll ? C.purple : C.line}`,
              background: syncScroll ? C.purpleSoft : 'transparent',
              color: syncScroll ? C.purple : C.mute,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Sync scroll
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsFullscreen(f => !f)}
          title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
          style={{
            padding: '3px 10px',
            borderRadius: 6,
            border: `1px solid ${isFullscreen ? C.purple : C.line}`,
            background: isFullscreen ? C.purpleSoft : 'transparent',
            color: isFullscreen ? C.purple : C.mute,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {isFullscreen ? '⊠ Exit Full' : '⛶ Fullscreen'}
        </button>
      </div>

      {/* Draft restore banner */}
      {draftBanner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: C.amber + '22', borderBottom: `1px solid ${C.amber}55`, fontSize: 12 }}>
          <span style={{ color: C.ink, flex: 1 }}>Unsaved draft found — restore it?</span>
          <button onClick={restoreDraft} style={{ padding: '3px 10px', borderRadius: 6, border: 'none', background: C.amber, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Restore</button>
          <button onClick={() => { clearDraft(); setDraftBanner(false) }} style={{ padding: '3px 10px', borderRadius: 6, border: `1px solid ${C.line}`, background: 'transparent', color: C.body, fontSize: 11, cursor: 'pointer' }}>Discard</button>
        </div>
      )}

      {/* Pane area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: layout === 'split' ? 'minmax(0,1fr) minmax(0,1fr)' : '1fr',
          gap: 0,
          alignItems: 'stretch',
          ...(isFullscreen && { flex: 1, overflow: 'hidden', minHeight: 0 }),
        }}
      >
        {/* Markdown pane */}
        {(layout === 'split' || layout === 'stack') && (
          <div style={{
            borderRight: layout === 'split' ? `1px solid ${C.line}` : 'none',
            ...(isFullscreen && { display: 'flex', flexDirection: 'column', overflow: 'hidden' }),
          }}>
            <div style={{ padding: '4px 12px', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 11, fontWeight: 700, color: C.mute, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
              Markdown
            </div>
            <textarea
              ref={taRef}
              value={value}
              onChange={e => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onScroll={layout === 'split' && syncScroll ? handleScroll : undefined}
              placeholder={placeholder}
              spellCheck={false}
              style={{
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                ...(isFullscreen
                  ? { flex: 1, height: '100%', resize: 'none' }
                  : { minHeight, resize: 'vertical' }
                ),
                border: 'none',
                borderRadius: 0,
                padding: '14px 16px',
                fontSize: 13,
                lineHeight: 1.65,
                fontFamily: 'Consolas, "Courier New", monospace',
                color: C.ink,
                background: isDragOver ? C.purpleSoft : C.inputBg,
                outline: isDragOver ? `2px solid ${C.purple}` : 'none',
                transition: 'background 0.1s, outline 0.1s',
                overflowY: 'auto',
              }}
            />
          </div>
        )}

        {/* Preview pane */}
        {(layout === 'split' || layout === 'preview') && (
          <div style={{
            ...(isFullscreen && { display: 'flex', flexDirection: 'column', overflow: 'hidden' }),
          }}>
            <div style={{ padding: '4px 12px', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 11, fontWeight: 700, color: C.mute, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
              Live Preview
            </div>
            <div
              ref={previewRef}
              style={{
                padding: '14px 18px',
                fontSize: 14,
                lineHeight: 1.8,
                color: value ? C.body : C.mute,
                ...(isFullscreen
                  ? { flex: 1, overflow: 'auto' }
                  : { height: minHeight, overflowY: 'auto' }
                ),
              }}
            >
              {value ? (
                <div className="kb-prose" dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <span style={{ fontStyle: 'italic', fontSize: 13 }}>Preview will appear here…</span>
              )}
            </div>
          </div>
        )}

        {/* Stack: preview below editor */}
        {layout === 'stack' && (
          <div style={{
            borderTop: `1px solid ${C.line}`,
            ...(isFullscreen && { display: 'flex', flexDirection: 'column', overflow: 'hidden' }),
          }}>
            <div style={{ padding: '4px 12px', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 11, fontWeight: 700, color: C.mute, letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0 }}>
              Live Preview
            </div>
            <div style={{
              padding: '14px 18px',
              fontSize: 14,
              lineHeight: 1.8,
              color: value ? C.body : C.mute,
              ...(isFullscreen ? { flex: 1, overflow: 'auto' } : { minHeight: minHeight / 2 }),
            }}>
              {value ? (
                <div className="kb-prose" dangerouslySetInnerHTML={{ __html: html }} />
              ) : (
                <span style={{ fontStyle: 'italic', fontSize: 13 }}>Preview will appear here…</span>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Prose styles */}
      <style>{`
        .kb-prose h1,.kb-prose h2,.kb-prose h3,.kb-prose h4 {
          font-family: "Bricolage Grotesque", sans-serif;
          font-weight: 700; color: var(--c-ink);
          margin: 1.4em 0 0.4em; letter-spacing: -0.02em;
        }
        .kb-prose h1{font-size:22px}.kb-prose h2{font-size:18px}.kb-prose h3{font-size:15px}
        .kb-prose p{margin:0 0 1em}
        .kb-prose a{color:var(--c-purple)}
        .kb-prose code{font-family:monospace;font-size:12px;background:var(--c-purpleSoft);padding:2px 5px;border-radius:4px}
        .kb-prose pre{background:var(--c-surface,var(--c-bg));border:1px solid var(--c-line);border-radius:10px;padding:14px 16px;overflow-x:auto;margin:0 0 1em}
        .kb-prose pre code{background:none;padding:0;font-size:13px}
        .kb-prose ul,.kb-prose ol{padding-left:24px;margin:0 0 1em}
        .kb-prose ul{list-style-type:disc}
        .kb-prose ol{list-style-type:decimal}
        .kb-prose ul ul{list-style-type:circle}
        .kb-prose li{margin-bottom:4px;display:list-item}
        .kb-prose blockquote{margin:0 0 1em;padding:8px 16px;border-left:3px solid var(--c-line);color:var(--c-mute)}
        .kb-prose hr{border:none;border-top:1px solid var(--c-line);margin:1.5em 0}
        .kb-prose table{border-collapse:collapse;width:100%;margin:0 0 1em}
        .kb-prose th,.kb-prose td{border:1px solid var(--c-line);padding:8px 12px;font-size:13px;text-align:left}
        .kb-prose th{background:var(--c-surface,var(--c-bg));font-weight:600;color:var(--c-ink)}
        .kb-prose input[type=checkbox]{margin-right:6px}
        .kb-prose img{max-width:100%;border-radius:8px;border:1px solid var(--c-line);display:block;margin:0.5em 0}
      `}</style>
    </div>
  )
}

const SHORTCUTS = [
  ['Ctrl+B', 'Bold'],
  ['Ctrl+I', 'Italic'],
  ['Ctrl+E', 'Inline code'],
  ['Ctrl+K', 'Link'],
  ['Ctrl+Shift+1–4', 'Headings'],
  ['Ctrl+Z', 'Undo'],
  ['Ctrl+Y', 'Redo'],
  ['Paste / Drop', 'Upload image'],
]

export function KbShortcuts() {
  return (
    <div style={{
      border: `1px solid ${C.line}`,
      borderRadius: 12,
      padding: '14px 16px',
      background: C.card,
      position: 'sticky',
      top: 92,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.mute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Shortcuts</div>
      {SHORTCUTS.map(([keys, label]) => (
        <div key={keys} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <kbd style={{
            padding: '2px 7px', borderRadius: 5,
            border: `1px solid ${C.line}`, background: C.bg,
            fontSize: 11, fontWeight: 700, color: C.ink,
            fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
          }}>{keys}</kbd>
          <span style={{ color: C.mute, fontSize: 12 }}>{label}</span>
        </div>
      ))}
    </div>
  )
}
