import { SEED_NEWS_POST_IDS } from '../../../lib/mockData'
import NewsPostClient from './NewsPostClient'

export function generateStaticParams() {
  return Array.from(SEED_NEWS_POST_IDS).map(id => ({ id }))
}

export default async function NewsPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <NewsPostClient id={id} />
}
