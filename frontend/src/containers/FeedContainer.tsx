/**
 * Feed Container
 * Gère la logique du feed (chargement, intégration store)
 * Passe les données au composant UI présentation pure
 */

import { useEffect } from 'react'
import { usePosts } from '@/store'
import Feed from '@/component/ui/features/post/Post'

export default function FeedContainer() {
  const { posts, feed, isLoading, error, fetchFeed } = usePosts()

  // Charger le feed au montage du composant
  useEffect(() => {
    fetchFeed()
  }, [])

  // Filtrer les posts par IDs du feed pour maintenir l'ordre
  const feedPosts = feed.map((id) => posts.find((p) => p.id === id)).filter(Boolean)

  if (isLoading) return <div className="p-4 text-center">Chargement...</div>
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>
  if (feedPosts.length === 0) return <div className="p-4 text-center">Aucun post</div>

  return (
    <div className="space-y-4">
      {feedPosts.map((post) => (
        <Feed key={post?.id} post={post!} />
      ))}
    </div>
  )
}
