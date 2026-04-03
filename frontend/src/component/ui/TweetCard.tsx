import { useState } from 'react'
import type { FormEvent } from 'react'
import { cn } from '../../lib/utils.ts'
import Button from './atoms/Button'
import Avatar from './atoms/Avatar'
import LikeButton from './shared/LikeButton'
import FollowButton from './shared/FollowButton'
import DeleteConfirmModal from './DeleteConfirmModal'
import MediaCarousel from './features/tweet/MediaCarousel'
import type { Tweet } from '../../lib/tweetService'
import { deleteTweet, updateTweet } from '../../lib/tweetService'

interface TweetCardProps {
  tweet: Tweet
  onDeleted?: () => void
  onUpdated?: (tweet: Tweet) => void
  onError?: (error: string) => void
  isOwnTweet?: boolean
  className?: string
}

export default function TweetCard({
  tweet,
  onDeleted,
  onUpdated,
  onError,
  isOwnTweet = false,
  className,
}: TweetCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(tweet.content)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!editContent.trim()) {
      setError('Tweet cannot be empty.')
      return
    }

    try {
      setIsLoading(true)
      const updated = await updateTweet(tweet.id, { content: editContent.trim() })
      setIsEditing(false)
      onUpdated?.(updated)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update tweet.'
      setError(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setShowDeleteConfirm(false)

    try {
      setIsLoading(true)
      await deleteTweet(tweet.id)
      onDeleted?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete tweet.'
      setError(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }



  const createdAt = tweet.createdAt
    ? new Date(tweet.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown date'

  if (isEditing) {
    return (
      <form
        onSubmit={handleEdit}
        className={cn('rounded-lg border border-gray-200 bg-white p-4 shadow-sm', className)}
      >
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          disabled={isLoading}
          maxLength={500}
          className='w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
          rows={3}
        />

        <div className='mt-3 flex gap-2'>
          <Button
            type='submit'
            variant='pink'
            size='sm'
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => {
              setIsEditing(false)
              setEditContent(tweet.content)
              setError(null)
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>

        {error && <p className='mt-2 text-xs text-red-500'>{error}</p>}
      </form>
    )
  }

  // Check if the author is blocked
  const isAuthorBlocked = tweet.author?.is_blocked === true

  return (
    <article
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
        isAuthorBlocked ? 'relative overflow-hidden' : '',
        className
      )}
    >
      <div className='mb-3 flex items-start gap-3'>
        <div className='flex-shrink-0'>
          <Avatar
            url={tweet.author?.avatar_url}
            username={tweet.author?.username || 'unknown'}
            size='md'
          />
        </div>
        
        <div className='flex-1 flex items-start justify-between gap-2 min-w-0'>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-semibold text-gray-900 truncate'>@{tweet.author?.username || 'unknown'}</p>
            <p className='text-xs text-gray-500'>{createdAt}</p>
          </div>

          <div className='flex-shrink-0'>
            {!isAuthorBlocked && isOwnTweet ? (
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className='rounded-md px-2 py-1 text-xs text-blue-600 hover:bg-blue-50'
              >
                Edit
              </button>
              <button
                type='button'
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className='rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50'
              >
                Delete
              </button>
            </div>
            ) : !isAuthorBlocked ? (
              tweet.author?.id && <FollowButton targetUserId={Number(tweet.author.id)} showLabel={false} />
            ) : null}
          </div>
        </div>
      </div>

      {isAuthorBlocked ? (
        <div className='relative w-full min-h-[200px]'>
          {/* Contenu flou */}
          <div className='blur-md pointer-events-none select-none opacity-30'>
            <p className='mb-3 text-sm text-gray-700 leading-relaxed'>{tweet.content}</p>

            {tweet.hashtags && tweet.hashtags.length > 0 && (
              <div className='mb-3 flex flex-wrap gap-2'>
                {tweet.hashtags.map((tag) => (
                  <span key={tag.id} className='text-xs text-blue-600 hover:underline cursor-pointer'>
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className='flex gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500'>
              <span>❤️ {tweet.likes || 0}</span>
              <button type='button' className='hover:text-blue-500'>
                💬 Reply
              </button>
              <button type='button' className='hover:text-green-500'>
                ↻ Retweet
              </button>
            </div>
          </div>

          {/* Message d'avertissement en superposition */}
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center px-6 py-8 bg-yellow-100/90 rounded-lg border-2 border-yellow-600'>
              <p className='text-lg font-bold text-yellow-900'>⚠️</p>
              <p className='text-sm font-semibold text-yellow-900 mt-2'>
                Ce compte a été bloqué
              </p>
              <p className='text-xs text-yellow-800 mt-1'>
                pour non respect des conditions d'utilisation
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {tweet.hashtags && tweet.hashtags.length > 0 && (
            <div className='mb-4 flex flex-wrap gap-2'>
              {tweet.hashtags.map((tag) => (
                <span key={tag.id} className='text-xs text-blue-600 hover:underline cursor-pointer'>
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {tweet.media && tweet.media.length > 0 && (
            <div className='mb-4 -mx-4 -mb-4'>
              <MediaCarousel media={tweet.media} className='rounded-none' />
            </div>
          )}

          <p className='mb-4 text-sm text-gray-900 leading-relaxed whitespace-pre-wrap'>{tweet.content}</p>

          <div className='flex gap-6 border-t border-gray-100 pt-3 text-sm text-gray-500'>
            <LikeButton tweetId={Number(tweet.id)} initialLikeCount={tweet.likes || 0} />
            <button type='button' className='hover:text-blue-500 transition-colors'>
              💬 Reply
            </button>
            <button type='button' className='hover:text-green-500 transition-colors'>
              ↻ Retweet
            </button>
          </div>
        </>
      )}

      {error && <p className='mt-2 text-xs text-red-500'>{error}</p>}

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title="Confirmation de suppression"
        message="Vous êtes sur le point de supprimer cette publication"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isLoading}
      />
    </article>
  )
}
