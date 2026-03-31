import { useState, useEffect } from 'react'
import { FiPlus, FiCheckCircle } from 'react-icons/fi'
import { followUser, unfollowUser, getFollowStatus } from '../../lib/followService'
import { useAuth } from '../../auth/useAuth'

interface FollowButtonProps {
  targetUserId: number
  className?: string
  showLabel?: boolean
}

export default function FollowButton({
  targetUserId,
  className = '',
  showLabel = false,
}: FollowButtonProps) {
  const { userId: currentUserId } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followRelationId, setFollowRelationId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load follow status on mount
  useEffect(() => {
    if (!currentUserId || currentUserId === targetUserId) return

    const loadFollowStatus = async () => {
      try {
        const followRelation = await getFollowStatus(currentUserId, targetUserId)
        if (followRelation) {
          setIsFollowing(true)
          setFollowRelationId(followRelation.id)
        }
      } catch (err) {
        console.error('Failed to load follow status:', err)
      }
    }

    loadFollowStatus()
  }, [targetUserId, currentUserId])

  const handleToggle = async () => {
    if (!currentUserId || isLoading || currentUserId === targetUserId) return

    try {
      setIsLoading(true)

      if (isFollowing && followRelationId) {
        // Unfollow
        await unfollowUser(followRelationId)
        setIsFollowing(false)
        setFollowRelationId(null)
      } else {
        // Follow
        const result = await followUser(targetUserId)
        setIsFollowing(true)
        setFollowRelationId(result.id)
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show button if it's the current user
  if (currentUserId === targetUserId) {
    return null
  }

  return (
    <button
      type='button'
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 text-sm transition-colors hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
        isFollowing ? 'text-blue-500' : 'text-gray-500'
      } ${className}`}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      title={isFollowing ? 'Ne plus suivre' : 'Suivre'}
    >
      {isFollowing ? (
        <>
          <FiCheckCircle className='size-[20px]' aria-hidden='true' />
          {showLabel && <span>Suivi</span>}
        </>
      ) : (
        <>
          <FiPlus className='size-[20px]' aria-hidden='true' />
          {showLabel && <span>Suivre</span>}
        </>
      )}
    </button>
  )
}
