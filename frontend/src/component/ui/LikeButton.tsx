import { useState, useEffect } from 'react'
import { likeTweet, unlikeTweet, getLikesByUserAndTweet } from '../../lib/likeService'
import { useAuth } from '../../auth/useAuth'

interface LikeButtonProps {
  tweetId: number
  initialLikeCount?: number
  displayText?: boolean
  className?: string
}

export default function LikeButton({
  tweetId,
  initialLikeCount = 0,
  displayText = true,
  className = '',
}: LikeButtonProps) {
  const { userId: currentUserId } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [likeId, setLikeId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load like status on mount
  useEffect(() => {
    if (!currentUserId) {
      console.warn(`[LikeButton] No currentUserId for tweet ${tweetId}`)
      return
    }

    const loadLikeStatus = async () => {
      try {
        console.log(`[LikeButton] Loading like status for user ${currentUserId}, tweet ${tweetId}`)
        const likes = await getLikesByUserAndTweet(currentUserId, tweetId)
        console.log(`[LikeButton] Got likes:`, likes)
        if (likes.length > 0) {
          setIsLiked(true)
          setLikeId(likes[0].id)
        }
      } catch (err) {
        console.error('[LikeButton] Failed to load like status:', err)
      }
    }

    loadLikeStatus()
  }, [tweetId, currentUserId])

  const handleToggle = async () => {
    if (!currentUserId || isLoading) {
      console.warn(`[LikeButton] Cannot toggle: currentUserId=${currentUserId}, isLoading=${isLoading}`)
      return
    }

    try {
      setIsLoading(true)

      if (isLiked && likeId) {
        // Unlike
        console.log(`[LikeButton] Unliking like ${likeId}`)
        await unlikeTweet(likeId)
        setIsLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
        setLikeId(null)
        console.log(`[LikeButton] Unlike successful`)
      } else {
        // Like
        console.log(`[LikeButton] Liking tweet ${tweetId}`)
        const result = await likeTweet(tweetId)
        console.log(`[LikeButton] Like successful:`, result)
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
        setLikeId(result.id)
      }
    } catch (err) {
      console.error('[LikeButton] Failed to toggle like:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type='button'
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 text-sm transition-colors hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${
        isLiked ? 'text-red-500' : 'text-gray-500'
      } ${className}`}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <span>{isLiked ? '❤️' : '♡'}</span>
      {displayText && <span>{likeCount > 0 ? likeCount : 'Like'}</span>}
      {!displayText && likeCount > 0 && <span>{likeCount}</span>}
    </button>
  )
}
