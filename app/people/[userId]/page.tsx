import { TEAM } from '../../../lib/mockData'
import PersonClient from './PersonClient'

export function generateStaticParams() {
  return TEAM.map(u => ({ userId: u.id }))
}

export default async function PersonPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  return <PersonClient userId={userId} />
}
