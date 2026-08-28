// Plain (non-client) module so these can be called from server code too
// (generateStaticParams), unlike everything in hooks.ts which is 'use client'.

export function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function articleSlug(article: { title: string; id: string }): string {
  return `${slugify(article.title)}--${article.id}`
}

export function articleIdFromSlug(slug: string): string {
  const parts = slug.split('--')
  return parts[parts.length - 1]
}
