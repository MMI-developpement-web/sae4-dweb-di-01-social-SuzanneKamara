import { useState } from 'react'
import type { FormEvent } from 'react'
import { cn } from '../../lib/utils.ts'
import Button from './Button.tsx'
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
    if (!confirm('Are you sure you want to delete this tweet?')) {
      return
    }

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

  return (
    <article
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className='mb-3 flex items-start justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-semibold text-gray-900'>@{tweet.author?.username || 'unknown'}</p>
          <p className='text-xs text-gray-500'>{createdAt}</p>
        </div>

        {isOwnTweet && (
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
              onClick={handleDelete}
              disabled={isLoading}
              className='rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50'
            >
              Delete
            </button>
          </div>
        )}
      </div>

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
        <button type='button' className='hover:text-orange-500'>
          ♡ Like
        </button>
        <button type='button' className='hover:text-blue-500'>
          💬 Reply
        </button>
        <button type='button' className='hover:text-green-500'>
          ↻ Retweet
        </button>
      </div>

      {error && <p className='mt-2 text-xs text-red-500'>{error}</p>}
    </article>
  )
}
