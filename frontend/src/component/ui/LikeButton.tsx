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
        // Unlike
        await unlikeTweet(likeId)
        setIsLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
        setLikeId(null)
      } else {
        // Like
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
      <svg
        width='24'
        height='24'
        viewBox='0 0 24 24'
        fill={isLiked ? 'currentColor' : 'none'}
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className='transition-colors'
      >
        <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'></path>
      </svg>
      {displayText && <span>{likeCount > 0 ? likeCount : 'Like'}</span>}
      {!displayText && likeCount > 0 && <span>{likeCount}</span>}
    </button>
  )
}
