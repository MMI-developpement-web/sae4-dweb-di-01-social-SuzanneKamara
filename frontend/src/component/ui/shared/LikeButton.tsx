import { useState, useEffect } from 'react'
import { FiHeart } from 'react-icons/fi'
import { likeTweet, unlikeTweet, getLikesByUserAndTweet, getLikeCountByTweet } from '../../../lib/likeService'
import { useAuth } from '../../../auth/useAuth'

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

  // Load total like count for this tweet on mount
  useEffect(() => {
    const loadTotalLikes = async () => {
      try {
        const count = await getLikeCountByTweet(tweetId)
        setLikeCount(count)
      } catch (err) {
        console.error('Failed to load total like count:', err)
      }
    }

    loadTotalLikes()
  }, [tweetId])

  // Load like status for current user on mount
  useEffect(() => {
    if (!currentUserId) return

    const loadLikeStatus = async () => {
      try {
        const likes = await getLikesByUserAndTweet(currentUserId, tweetId)
        if (likes.length > 0) {
          setIsLiked(true)
          setLikeId(likes[0].id)
        }
      } catch (err) {
        console.error('Failed to load like status:', err)
      }
    }

    loadLikeStatus()
  }, [tweetId, currentUserId])

  const handleToggle = async () => {
    if (!currentUserId || isLoading) return

    try {
      setIsLoading(true)

      if (isLiked && likeId) {
        await unlikeTweet(likeId)
        setIsLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
        setLikeId(null)
      } else {
        const result = await likeTweet(tweetId)
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
        setLikeId(result.id)
      }
    } catch (err) {
      console.error('Failed to toggle like:', err)
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
      <FiHeart 
        className='w-5 h-5 transition-all'
        fill={isLiked ? 'currentColor' : 'none'}
      />
      {displayText && <span>{likeCount > 0 ? likeCount : 'Like'}</span>}
      {!displayText && likeCount > 0 && <span>{likeCount}</span>}
    </button>
  )
}
