import { useState } from 'react'
import type { FormEvent } from 'react'
import { cn } from '../../lib/utils.ts'
import { createTweet } from '../../lib/tweetService'

interface TweetComposerProps {
  onTweetCreated?: () => void
  onError?: (error: string) => void
  placeholder?: string
  maxChars?: number
  className?: string
}

export default function TweetComposer({
  onTweetCreated,
  onError,
  placeholder = "What's on your mind?",
  maxChars = 500,
  className,
}: TweetComposerProps) {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const charCount = content.length
  const remainingChars = maxChars - charCount
  const isOverLimit = remainingChars < 0
  const isNearLimit = remainingChars < 50

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!content.trim()) {
      setError('Tweet cannot be empty.')
      return
    }

    if (isOverLimit) {
      setError(`Tweet is too long. Max ${maxChars} characters.`)
      return
    }

    try {
      setIsLoading(true)
      await createTweet({ content: content.trim() })
      setContent('')
      onTweetCreated?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create tweet.'
      setError(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'w-[325px]',
        className
      )}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        maxLength={maxChars}
        disabled={isLoading}
        className='h-[446px] w-full resize-none rounded-none bg-gradient-to-br from-[#666666] to-[#909090] px-[19px] py-[15px] text-[36px] leading-[17px] text-white placeholder:text-white/90 focus:outline-none'
        rows={10}
      />

      <div className='mt-[9px] flex items-center justify-center'>
        <div className='absolute right-[24px] -mt-[44px] flex items-center gap-2'>
          <span
            className={cn('text-xs font-medium', {
              'text-white/80': charCount === 0,
              'text-white/90': charCount > 0 && !isNearLimit,
              'text-yellow-600': isNearLimit && !isOverLimit,
              'text-red-600': isOverLimit,
            })}
          >
            {charCount}/{maxChars}
          </span>
        </div>

        <button
          type='submit'
          disabled={isLoading || !content.trim() || isOverLimit}
          className='h-[39px] w-[195px] rounded-[10px] bg-black text-[39px] leading-[28px] text-white transition-colors hover:bg-black/85 disabled:opacity-60'
        >
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </div>

      {error && <p className='mt-2 text-xs text-red-600'>{error}</p>}
    </form>
  )
}
