import { articleSlug } from '../../../lib/slugs'
import { buildSeedKbArticles } from '../../../lib/mockData'
import KbaseArticleClient from './KbaseArticleClient'

export function generateStaticParams() {
  return buildSeedKbArticles(new Date()).map(a => ({ slug: articleSlug(a) }))
}

export default async function KbaseArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <KbaseArticleClient slug={slug} />
}
