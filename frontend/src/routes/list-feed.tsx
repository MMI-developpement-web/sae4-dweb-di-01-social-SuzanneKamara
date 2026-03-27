import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import TweetCard from '../component/ui/TweetCard'
import TweetComposer from '../component/ui/TweetComposer'
import { useAuth } from '../auth/useAuth'
import type { Tweet } from '../lib/tweetService'
import { fetchFollowingTweetsPage } from '../lib/tweetService'

const FEED_PAGE_SIZE = 20

export default function ListFeed() {
  const navigate = useNavigate()
  const { isAuthenticated, userId } = useAuth()
  
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const prefetchedPageRef = useRef<any>(null)
  const prefetchedOffsetRef = useRef<number | null>(null)

  const loadInitialTweets = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    prefetchedPageRef.current = null
    prefetchedOffsetRef.current = null

    try {
      const page = await fetchFollowingTweetsPage(FEED_PAGE_SIZE, 0)
      setTweets(page.tweets)
      setOffset(page.tweets.length)
      setHasMore(page.hasMore)

      if (page.tweets.length === 0) {
        setError('Aucun post des comptes suivis pour le moment.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tweets.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMoreTweets = useCallback(async () => {
    if (isFetchingMore || !hasMore || isLoading) {
      return
    }

    setIsFetchingMore(true)
    try {
      const page = await fetchFollowingTweetsPage(FEED_PAGE_SIZE, offset)

      setTweets((prev) => {
        const existingIds = new Set(prev.map((t) => t.id))
        return [
          ...prev,
          ...page.tweets.filter((t) => !existingIds.has(t.id)),
        ]
      })

      const newOffset = offset + page.tweets.length
      setOffset(newOffset)
      setHasMore(page.hasMore)
    } catch (err) {
      console.error('Failed to load more tweets:', err)
    } finally {
      setIsFetchingMore(false)
    }
  }, [offset, isFetchingMore, hasMore, isLoading])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    loadInitialTweets()
  }, [isAuthenticated, loadInitialTweets])

  useEffect(() => {
    if (!sentinelRef.current || !isAuthenticated) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreTweets()
        }
      },
      { rootMargin: '500px' }
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [loadMoreTweets, isAuthenticated])

  const handleTweetDeleted = useCallback((deletedTweetId: number) => {
    setTweets((prev) => prev.filter((t) => t.id !== deletedTweetId))
  }, [])

  const handleTweetUpdated = useCallback((updatedTweet: Tweet) => {
    setTweets((prev) =>
      prev.map((t) => (t.id === updatedTweet.id ? updatedTweet : t))
    )
  }, [])

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-2xl px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Feed</h1>
          <p className='text-gray-600'>Posts from people you follow</p>
        </div>

        {/* Tweet Composer */}
        <div className='mb-8'>
          <TweetComposer
            onTweetCreated={(newTweet) => {
              setTweets((prev) => [newTweet, ...prev])
            }}
          />
        </div>

        {/* Error Message */}
        {error && !isLoading && (
          <div className='mb-4 rounded-lg border border-red-200 bg-red-50 p-4'>
            <p className='text-sm text-red-800'>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className='space-y-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='h-48 animate-pulse rounded-lg bg-gray-200'
              />
            ))}
          </div>
        )}

        {/* Tweets List */}
        {!isLoading && tweets.length > 0 && (
          <div className='space-y-4'>
            {tweets.map((tweet) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                isOwnTweet={tweet.author?.id === userId}
                onDeleted={() => handleTweetDeleted(tweet.id)}
                onUpdated={handleTweetUpdated}
              />
            ))}
          </div>
        )}

        {/* Loading More Sentinel */}
        {hasMore && !isLoading && (
          <div
            ref={sentinelRef}
            className='py-8 text-center'
          >
            {isFetchingMore && (
              <p className='text-gray-500 text-sm'>Loading more posts...</p>
            )}
          </div>
        )}

        {/* No More Content */}
        {!hasMore && tweets.length > 0 && (
          <div className='py-8 text-center'>
            <p className='text-gray-500 text-sm'>No more posts to load</p>
          </div>
        )}

        {/* Navigation Links */}
        <div className='mt-12 flex gap-4 justify-center'>
          <button
            onClick={() => navigate('/feed')}
            className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition'
          >
            Original Feed
          </button>
          <button
            onClick={() => navigate('/tweets')}
            className='px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition'
          >
            Explore
          </button>
        </div>
      </div>
    </div>
  )
}
