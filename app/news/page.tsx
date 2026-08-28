'use client'
import { useApp } from '../../context/app-context'
import { NewsFeed } from '../../components/NewsFeed'

export default function NewsPage() {
  const { posts, me, addPost, updatePost, deletePost } = useApp()
  return (
    <div className="news-page" style={{ maxWidth: 780, margin: '0 auto', padding: '40px 36px 60px' }}>
      <NewsFeed posts={posts} me={me} onAdd={addPost} onEdit={updatePost} onDelete={deletePost} />
    </div>
  )
}
