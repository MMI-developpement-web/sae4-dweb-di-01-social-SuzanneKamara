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
  const [isAnimating, setIsAnimating] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

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

  const generateParticles = () => {
    const newParticles = Array.from({ length: 5 }).map((_, i) => ({
      id: Math.random(),
      x: (Math.random() - 0.5) * 60,
      y: Math.random() * -60,
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 600)
  }

  const handleToggle = async () => {
    if (!currentUserId || isLoading) return

    try {
      setIsLoading(true)
      setIsAnimating(true)

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
        generateParticles()
      }

      // Reset animation
      setTimeout(() => setIsAnimating(false), 600)
    } catch (err) {
      console.error('Failed to toggle like:', err)
      setIsAnimating(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='relative'>
      <style>{`
        @keyframes heartBeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.4); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes heartGlow {
          0%, 100% { filter: drop-shadow(0 0 0px #ff4458); }
          50% { filter: drop-shadow(0 0 12px #ff4458); }
        }
        @keyframes countPop {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes particleFloat {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) scale(0);
          }
        }
        .heart-animate {
          animation: heartBeat 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), heartGlow 0.6s ease-out;
        }
        .count-animate {
          animation: countPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .particle {
          position: fixed;
          pointer-events: none;
          animation: particleFloat 0.6s ease-out forwards;
          --tx: 0px;
          --ty: 0px;
        }
      `}</style>

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className='particle text-red-500 text-lg font-bold'
          style={{
            left: '0px',
            top: '0px',
            '--tx': `${particle.x}px`,
            '--ty': `${particle.y}px`,
          } as React.CSSProperties}
        >
          ❤️
        </div>
      ))}

      <button
        type='button'
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative inline-flex items-center gap-2 text-sm transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
          isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
        } ${className}`}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        <div className='relative'>
          <FiHeart 
            className={`w-5 h-5 transition-all ${
              isAnimating && isLiked ? 'heart-animate' : ''
            }`}
            fill={isLiked ? 'currentColor' : 'none'}
            strokeWidth={isLiked ? 0 : 2}
          />
        </div>

        {displayText && (
          <span className={isAnimating && isLiked ? 'count-animate' : ''}>
            {likeCount > 0 ? likeCount : 'Like'}
          </span>
        )}
        {!displayText && likeCount > 0 && (
          <span className={isAnimating && isLiked ? 'count-animate' : ''}>
            {likeCount}
          </span>
        )}
      </button>
    </div>
  )
}
