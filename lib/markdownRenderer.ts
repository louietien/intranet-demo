import DOMPurify from 'isomorphic-dompurify'
import { marked, Renderer } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js/lib/core'
import langBash from 'highlight.js/lib/languages/bash'
import langJs from 'highlight.js/lib/languages/javascript'
import langTs from 'highlight.js/lib/languages/typescript'
import langPy from 'highlight.js/lib/languages/python'
import langJson from 'highlight.js/lib/languages/json'
import langYaml from 'highlight.js/lib/languages/yaml'
import langSql from 'highlight.js/lib/languages/sql'
import langCss from 'highlight.js/lib/languages/css'
import langXml from 'highlight.js/lib/languages/xml'
import langPowershell from 'highlight.js/lib/languages/powershell'
import langMarkdown from 'highlight.js/lib/languages/markdown'

const DARK_HLJS = `
.dark pre code.hljs{display:block;overflow-x:auto;padding:1em}
.dark code.hljs{padding:3px 5px}
.dark .hljs{color:#adbac7;background:#22272e}
.dark .hljs-doctag,.dark .hljs-keyword,.dark .hljs-meta .hljs-keyword,.dark .hljs-template-tag,.dark .hljs-template-variable,.dark .hljs-type,.dark .hljs-variable.language_{color:#f47067}
.dark .hljs-title,.dark .hljs-title.class_,.dark .hljs-title.class_.inherited__,.dark .hljs-title.function_{color:#dcbdfb}
.dark .hljs-attr,.dark .hljs-attribute,.dark .hljs-literal,.dark .hljs-meta,.dark .hljs-number,.dark .hljs-operator,.dark .hljs-variable,.dark .hljs-selector-attr,.dark .hljs-selector-class,.dark .hljs-selector-id{color:#6cb6ff}
.dark .hljs-regexp,.dark .hljs-string,.dark .hljs-meta .hljs-string{color:#96d0ff}
.dark .hljs-built_in,.dark .hljs-symbol{color:#f69d50}
.dark .hljs-comment,.dark .hljs-code,.dark .hljs-formula{color:#768390}
.dark .hljs-name,.dark .hljs-quote,.dark .hljs-selector-tag,.dark .hljs-selector-pseudo{color:#8ddb8c}
.dark .hljs-subst{color:#adbac7}
.dark .hljs-section{color:#316dca;font-weight:bold}
.dark .hljs-bullet{color:#eac55f}
.dark .hljs-emphasis{color:#adbac7;font-style:italic}
.dark .hljs-strong{color:#adbac7;font-weight:bold}
.dark .hljs-addition{color:#b4f1b4;background-color:#1b4721}
.dark .hljs-deletion{color:#ffd8d3;background-color:#78191b}
`
if (typeof document !== 'undefined') {
  const el = document.createElement('style')
  el.id = 'hljs-dark-theme'
  el.textContent = DARK_HLJS
  document.head.appendChild(el)
}

hljs.registerLanguage('bash', langBash)
hljs.registerLanguage('shell', langBash)
hljs.registerLanguage('javascript', langJs)
hljs.registerLanguage('js', langJs)
hljs.registerLanguage('typescript', langTs)
hljs.registerLanguage('ts', langTs)
hljs.registerLanguage('python', langPy)
hljs.registerLanguage('py', langPy)
hljs.registerLanguage('json', langJson)
hljs.registerLanguage('yaml', langYaml)
hljs.registerLanguage('yml', langYaml)
hljs.registerLanguage('sql', langSql)
hljs.registerLanguage('css', langCss)
hljs.registerLanguage('xml', langXml)
hljs.registerLanguage('html', langXml)
hljs.registerLanguage('powershell', langPowershell)
hljs.registerLanguage('ps1', langPowershell)
hljs.registerLanguage('markdown', langMarkdown)
hljs.registerLanguage('md', langMarkdown)

const renderer = new Renderer()
renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `<h${depth} id="${id}">${text}</h${depth}>\n`
}

marked.use({ async: false, gfm: true, breaks: false, renderer })
marked.use(markedHighlight({
  emptyLangClass: 'hljs',
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    if (!lang || !hljs.getLanguage(lang)) return code
    return hljs.highlight(code, { language: lang }).value
  },
}))

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function buildSlug(article: { title: string; id: string }): string {
  return `${slugify(article.title)}--${article.id}`
}

function resolveWikiLinks(content: string, articles: Array<{ id: string; title: string }>): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, title: string) => {
    const found = articles.find(a => a.title.toLowerCase() === title.trim().toLowerCase())
    const href = found ? `/docs/${buildSlug(found)}` : `/docs?q=${encodeURIComponent(title.trim())}`
    return `[${title.trim()}](${href})`
  })
}

function resolveImageWidths(content: string): string {
  return content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)\{width=([^}]+)\}/g,
    (_, alt: string, src: string, width: string) =>
      `<img src="${src}" alt="${alt}" style="width:${width};max-width:100%;border-radius:8px;border:1px solid var(--c-line);display:block;margin:0.5em 0" />`,
  )
}

export interface RenderOptions {
  articles?: Array<{ id: string; title: string }>
}

export function renderMarkdown(content: string, options?: RenderOptions): string {
  try {
    let processed = content || ''
    if (options?.articles?.length) processed = resolveWikiLinks(processed, options.articles)
    processed = resolveImageWidths(processed)
    const raw = marked.parse(processed) as string
    return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } })
  } catch {
    return `<pre>${content.replace(/</g, '&lt;')}</pre>`
  }
}

export interface Heading { level: number; text: string; id: string }

export function extractHeadings(content: string): Heading[] {
  return content.split('\n').flatMap(line => {
    const m = line.match(/^(#{2,4})\s+(.+)$/)
    if (!m) return []
    const text = m[2].replace(/[*_~`]/g, '').trim()
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return [{ level: m[1].length, text, id }]
  })
}
