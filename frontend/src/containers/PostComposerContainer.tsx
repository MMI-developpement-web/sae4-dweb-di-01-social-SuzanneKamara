/**
 * Post Composer Container
 * Gère la création de posts
 */

import { useState } from 'react'
import { useAuth, usePosts } from '@/store'
import { MESSAGES } from '@/constants/messages'
import PostComposer from '@/component/ui/features/post/PostComposer'

interface PostComposerContainerProps {
  onPostCreated?: () => void
  replyTo?: string
}

export default function PostComposerContainer({ onPostCreated }: PostComposerContainerProps) {
  const { user, isAuthenticated } = useAuth()
  const { createPost, isLoading, error } = usePosts()
  const [content, setContent] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])

  if (!isAuthenticated || !user) {
    return <div className="p-4 text-center text-gray-500">Connectez-vous pour créer un post</div>
  }

  const handleCreatePost = async () => {
    if (!content.trim()) return

    try {
      await createPost({
        content,
        hashtags,
      })
      setContent('')
      setHashtags([])
      onPostCreated?.()
    } catch (err) {
      console.error('Erreur création post:', err)
    }
  }

  const handleAddHashtag = (tag: string) => {
    if (!hashtags.includes(tag)) {
      setHashtags([...hashtags, tag])
    }
  }

  return (
    <PostComposer
      content={content}
      onContentChange={setContent}
      hashtags={hashtags}
      onAddHashtag={handleAddHashtag}
      onRemoveHashtag={(tag) => setHashtags(hashtags.filter((h) => h !== tag))}
      onSubmit={handleCreatePost}
      isLoading={isLoading}
      error={error}
      author={user}
    />
  )
}
