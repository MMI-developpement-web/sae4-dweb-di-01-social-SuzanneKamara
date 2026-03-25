import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiCompass, FiHeart, FiHome, FiMessageSquare, FiPlus, FiRepeat } from 'react-icons/fi'
import TweetComposer from '../component/ui/TweetComposer'
import RefreshButton from '../component/ui/RefreshButton'
import { useAuth } from '../auth/useAuth'
import { useRefreshPreferences } from '../context/RefreshPreferencesContext'
import type { FollowingTweetsPage, Tweet } from '../lib/tweetService'
import { fetchFollowingTweetsPage } from '../lib/tweetService'

const FEED_PAGE_SIZE = 40

function extractHashtagNames(tweet: Tweet): string[] {
  if (tweet.hashtags && tweet.hashtags.length > 0) {
    return tweet.hashtags.map((tag) => `#${tag.name}`)
  }

  const matches = tweet.content.match(/#[\w]+/g)
  return matches ?? []
}

function PostCard({ tweet }: { tweet: Tweet }) {
  const hashtags = extractHashtagNames(tweet)
  const createdAt = tweet.createdAt
    ? new Date(tweet.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date inconnue'

  return (
    <div className='relative mb-[28px] w-[333px]'>
      <div className='absolute top-[30px] left-[8px] -z-10 h-[555px] w-[322px] border-2 border-black/10 bg-white/20' />

      <div className='ui-surface relative h-[558px] w-[325px] overflow-hidden'>
        <div className='flex items-start justify-between p-[20px]'>
          <div className='pt-[18px]'>
            <p className='ui-title text-[37px] leading-[22px] text-[#6d6d6d]'>@{tweet.author?.username || 'username'}</p>
            <p className='ui-kicker mt-2 text-[10px] text-[#8a8a8a]'>{createdAt}</p>
          </div>

          <div className='relative'>
            <div className='size-[51px] rounded-full bg-[#D3D3D3]' />
            <div className='absolute right-[-12px] bottom-[2px] grid size-[24px] place-items-center rounded-[2px] bg-[#111] text-white'>
              <FiPlus className='size-[14px]' aria-hidden='true' />
            </div>
          </div>
        </div>

        <div className='flex h-[calc(100%-91px)] flex-col px-[22px] pb-[20px]'>
          <p className='ui-kicker mb-[18px] text-[12px] leading-[16px] text-[#747272]'>
            {hashtags.length > 0 ? hashtags.join(' ') : '#post #contenu'}
          </p>

          <div className='flex-1 overflow-auto whitespace-pre-line text-[34px] leading-[42px] text-[#111]'>
            {tweet.content}
          </div>
        </div>
      </div>

      <div className='mt-[15px] mb-[8px] ml-[22px] flex items-center gap-[19px]'>
        <button type='button' aria-label='Like' className='grid size-[35px] cursor-pointer place-items-center text-[#DE6E2D] transition-transform hover:scale-110'>
          <FiHeart className='size-[28px]' aria-hidden='true' />
        </button>
        <button type='button' aria-label='Retweet' className='grid size-[35px] cursor-pointer place-items-center transition-transform hover:scale-110'>
          <FiRepeat className='size-[28px]' aria-hidden='true' />
        </button>
        <button type='button' aria-label='Commenter' className='grid size-[35px] cursor-pointer place-items-center transition-transform hover:scale-110'>
          <FiMessageSquare className='size-[26px]' aria-hidden='true' />
        </button>
      </div>
    </div>
  )
}

function BottomNav({
  onOpenComposer,
  onExplore,
  onHome,
  activeRoute,
  isComposerActive,
}: {
  onOpenComposer: () => void
  onExplore: () => void
  onHome: () => void
  activeRoute: 'feed' | 'explore'
  isComposerActive: boolean
}) {
  const isExploreActive = activeRoute === 'explore'
  const isHomeActive = activeRoute === 'feed' && !isComposerActive

  return (
    <div className='fixed bottom-[32px] left-1/2 z-30 h-[84px] w-[298px] -translate-x-1/2'>
      <div className='absolute bottom-0 flex h-[70px] w-[298px] items-center justify-between rounded-[20px] border border-black/20 bg-[rgba(25,29,33,0.55)] px-[23px] text-white backdrop-blur-md'>
        <button
          type='button'
          onClick={onExplore}
          className={`grid size-[56px] cursor-pointer place-items-center rounded-full border-2 transition-transform hover:scale-110 ${
            isExploreActive
              ? 'border-[#ea4098] bg-white/20 text-[#ea4098]'
              : 'border-white/90 text-white'
          }`}
          aria-label='Explore'
        >
          <FiCompass className='size-[26px]' aria-hidden='true' />
        </button>
        <button
          type='button'
          onClick={onHome}
          className={`grid size-[56px] cursor-pointer place-items-center rounded-full border-2 transition-transform hover:scale-110 ${
            isHomeActive
              ? 'border-[#ea4098] bg-white/20 text-[#ea4098]'
              : 'border-transparent text-white'
          }`}
          aria-label='Home'
        >
          <FiHome className='size-[32px]' aria-hidden='true' />
        </button>
      </div>

      <button
        type='button'
        onClick={onOpenComposer}
        className={`absolute top-0 left-1/2 grid size-[76px] -translate-x-1/2 cursor-pointer place-items-center rounded-[15px] border-[5px] transition-transform hover:scale-110 ${
          isComposerActive
            ? 'border-white bg-[#ea4098] text-white shadow-[0_0_0_2px_rgba(234,64,152,0.35)]'
            : 'border-[#ECECEC] bg-[#ECECEC] text-black'
        }`}
        aria-label='Composer'
      >
        <FiPlus className='size-[34px]' aria-hidden='true' />
      </button>
    </div>
  )
}

export default function Feed() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const prefetchedPageRef = useRef<FollowingTweetsPage | null>(null)
  const prefetchedOffsetRef = useRef<number | null>(null)
  const prefetchPromiseRef = useRef<Promise<void> | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const activeRoute: 'feed' | 'explore' = location.pathname.startsWith('/tweets') ? 'explore' : 'feed'
  const shouldOpenComposerFromQuery = new URLSearchParams(location.search).get('compose') === '1'

  const appendUniqueTweets = useCallback((incoming: Tweet[]) => {
    setTweets((previous) => {
      const next = [...previous]
      const existingIds = new Set(previous.map((tweet) => String(tweet.id)))

      incoming.forEach((tweet) => {
        const id = String(tweet.id)
        if (!existingIds.has(id)) {
          existingIds.add(id)
          next.push(tweet)
        }
      })

      return next
    })
  }, [])

  const prefetchPage = useCallback(async (targetOffset: number) => {
    if (showComposer || prefetchPromiseRef.current) {
      return
    }

    if (prefetchedOffsetRef.current === targetOffset && prefetchedPageRef.current) {
      return
    }

    prefetchPromiseRef.current = (async () => {
      try {
        const page = await fetchFollowingTweetsPage(FEED_PAGE_SIZE, targetOffset)
        prefetchedPageRef.current = page
        prefetchedOffsetRef.current = targetOffset
      } catch {
        // Keep scroll seamless: do not surface background prefetch errors.
      } finally {
        prefetchPromiseRef.current = null
      }
    })()

    await prefetchPromiseRef.current
  }, [showComposer])

  const loadInitialTweets = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    prefetchedPageRef.current = null
    prefetchedOffsetRef.current = null
    prefetchPromiseRef.current = null

    try {
      const page = await fetchFollowingTweetsPage(FEED_PAGE_SIZE, 0)
      setTweets(page.tweets)
      setOffset(page.tweets.length)
      setHasMore(page.hasMore)

      if (page.hasMore && page.tweets.length > 0) {
        void prefetchPage(page.tweets.length)
      }

      if (page.tweets.length === 0) {
        setError('Aucun post des comptes suivis pour le moment.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tweets.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [prefetchPage])

  const loadMoreTweets = useCallback(async () => {
    if (isFetchingMore || !hasMore || isLoading || showComposer) {
      return
    }

    setIsFetchingMore(true)
    try {
      let page: FollowingTweetsPage

      if (prefetchedOffsetRef.current === offset && prefetchedPageRef.current) {
        page = prefetchedPageRef.current
        prefetchedPageRef.current = null
        prefetchedOffsetRef.current = null
      } else {
        page = await fetchFollowingTweetsPage(FEED_PAGE_SIZE, offset)
      }

      appendUniqueTweets(page.tweets)

      const nextOffset = offset + page.tweets.length
      setOffset(nextOffset)
      setHasMore(page.hasMore)

      if (page.hasMore && page.tweets.length > 0) {
        void prefetchPage(nextOffset)
      }
    } catch {
      // Keep scroll seamless: avoid displaying transient paging errors.
    } finally {
      setIsFetchingMore(false)
    }
  }, [appendUniqueTweets, hasMore, isFetchingMore, isLoading, offset, prefetchPage, showComposer])

  useEffect(() => {
    loadInitialTweets()
  }, [loadInitialTweets])

  useEffect(() => {
    if (showComposer) {
      return
    }

    const target = sentinelRef.current
    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry?.isIntersecting) {
          void loadMoreTweets()
        }
      },
      {
        root: null,
        rootMargin: '1200px 0px 1200px 0px',
        threshold: 0,
      }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [loadMoreTweets, showComposer])

  useEffect(() => {
    setShowComposer(shouldOpenComposerFromQuery)
  }, [shouldOpenComposerFromQuery])

  // Auto-refresh effect
  const { preferences } = useRefreshPreferences()

  useEffect(() => {
    if (!preferences.autoRefreshEnabled || !isAuthenticated || showComposer) {
      return
    }

    const intervalId = setInterval(() => {
      void loadInitialTweets()
    }, preferences.autoRefreshInterval * 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [preferences.autoRefreshEnabled, preferences.autoRefreshInterval, isAuthenticated, showComposer, loadInitialTweets])

  const openComposer = useCallback(() => {
    if (!shouldOpenComposerFromQuery) {
      navigate('/feed?compose=1')
    }
  }, [navigate, shouldOpenComposerFromQuery])

  const closeComposer = useCallback(() => {
    navigate('/feed', { replace: true })
  }, [navigate])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await loadInitialTweets()
    } finally {
      setIsRefreshing(false)
    }
  }, [loadInitialTweets])

  const handleTweetCreated = () => {
    void loadInitialTweets()
  }

  return (
    <div className='editorial-bg min-h-screen w-full overflow-hidden pb-[132px]'>
      <div className='mx-auto flex w-full max-w-[375px] flex-col items-center'>
        {!showComposer && (
          <div className='mb-4 w-[325px] flex justify-end'>
            <RefreshButton onClick={handleRefresh} isLoading={isRefreshing} />
          </div>
        )}

        {showComposer && (
          <div className='mb-5 w-[325px]'>
            <TweetComposer
              onTweetCreated={() => {
                closeComposer()
                handleTweetCreated()
              }}
              onError={(msg) => setError(msg)}
            />
          </div>
        )}

        {!showComposer && error && (
          <div className='mb-4 w-[325px] rounded-[10px] border border-red-200 bg-red-50 p-4'>
            <p className='text-sm text-red-800'>{error}</p>
            <button
              type='button'
              onClick={() => setError(null)}
              className='mt-2 text-xs text-red-600 hover:underline'
            >
              Dismiss
            </button>
          </div>
        )}

        {!showComposer && isLoading && (
          <div className='w-[325px] space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-32 animate-pulse rounded-[10px] bg-[#d9d9d9]' />
            ))}
          </div>
        )}

        {!showComposer && !isLoading && tweets.length === 0 && (
          <div className='w-[325px] rounded-[10px] border border-gray-200 bg-[#ececec] p-8 text-center'>
            <p className='text-gray-600'>Aucun post pour le moment.</p>
          </div>
        )}

        {!showComposer && !isLoading && tweets.length > 0 && (
          <div className='w-full'>
            {tweets.map((tweet) => (
              <PostCard key={tweet.id} tweet={tweet} />
            ))}
            <div ref={sentinelRef} className='h-1 w-full' />
          </div>
        )}
      </div>

      <BottomNav
        onOpenComposer={openComposer}
        onExplore={() => navigate('/tweets')}
        onHome={() => navigate('/feed')}
        activeRoute={activeRoute}
        isComposerActive={showComposer}
      />
    </div>
  )
}
