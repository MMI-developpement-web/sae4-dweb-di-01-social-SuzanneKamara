import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FiCompass, FiHome, FiMessageSquare, FiPlus, FiRepeat, FiX } from 'react-icons/fi';
import { fetchExploreTweetsPage } from '../lib/tweetService';
import { useAuth } from '../auth/useAuth';
import { useRefreshPreferences } from '../context/RefreshPreferencesContext';
import RefreshButton from '../component/ui/RefreshButton';
import LikeButton from '../component/ui/LikeButton';
import FollowButton from '../component/ui/FollowButton';

const EXPLORE_PAGE_SIZE = 40;

function extractHashtagNames(tweet) {
  if (tweet.hashtags && tweet.hashtags.length > 0) {
    return tweet.hashtags.map((tag) => `#${tag.name}`);
  }

  const matches = tweet.content.match(/#[\w]+/g);
  return matches ?? [];
}

function LargeTweetOverlay({ tweet, onClose }) {
  const isAuthorBlocked = tweet.author?.is_blocked === true;
  const hashtags = extractHashtagNames(tweet);
  const createdAt = tweet.createdAt
    ? new Date(tweet.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Date inconnue';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[1px]'>
      <button
        type='button'
        onClick={onClose}
        className='absolute inset-0 h-full w-full cursor-pointer'
        aria-label='Fermer le tweet'
      />

      <div className='relative w-full max-w-[360px]'>
        <button
          type='button'
          onClick={onClose}
          className='absolute top-[-48px] right-0 grid size-[40px] place-items-center rounded-[10px] bg-white/90 text-[#333]'
          aria-label='Fermer'
        >
          <FiX className='size-[24px]' aria-hidden='true' />
        </button>

        <div className='relative w-[333px]'>
          <div className='absolute top-[30px] left-[8px] -z-10 h-[555px] w-[322px] border-2 border-black/10 bg-white/20' />

          <div className={`ui-surface relative h-[558px] w-[325px] overflow-hidden ${isAuthorBlocked ? 'bg-yellow-50' : ''}`}>
            <div className='flex items-start justify-between p-[20px]'>
              {/* pt-[18px] */}
              <div className=' flex-1 min-w-0'>
                <p className='ui-title text-[30px] leading-[22px] text-[#6d6d6d] max-w-[50%] truncate'>@{tweet.author?.username || 'username'}</p>
                <p className='ui-kicker mt-2 text-[10px] text-[#8a8a8a]'>{createdAt}</p>
              </div>

              <div className='relative flex-shrink-0'>
                <div className='size-[51px] rounded-full bg-[#D3D3D3]' />
                {!isAuthorBlocked && (
                  <div className='absolute right-[-12px] bottom-[2px] grid size-[24px] place-items-center rounded-[2px] bg-[#111] text-white'>
                    <FollowButton 
                      targetUserId={tweet.author?.id} 
                      className='text-white hover:text-blue-300'
                    />
                  </div>
                )}
              </div>
            </div>

            {isAuthorBlocked ? (
              <div className='flex h-[calc(100%-91px)] flex-col items-center justify-center px-[22px] pb-[20px]'>
                <p className='text-[24px] font-semibold text-yellow-900 mb-2'>⚠️</p>
                <p className='text-center text-[14px] font-semibold text-yellow-900'>Ce compte a été bloqué</p>
                <p className='text-center text-[12px] text-yellow-800 mt-1'>pour non respect des conditions d'utilisation</p>
              </div>
            ) : (
              <div className='flex h-[calc(100%-91px)] flex-col px-[22px] pb-[20px]'>
                <p className='ui-kicker mb-[18px] text-[12px] leading-[16px] text-[#747272]'>
                  {hashtags.length > 0 ? hashtags.join(' ') : '#post #contenu'}
                </p>

                <div className='flex-1 overflow-auto whitespace-pre-line text-[34px] leading-[42px] text-[#111]'>
                  {tweet.content}
                </div>
              </div>
            )}
          </div>

          {!isAuthorBlocked && (
            <div className='mt-[15px] mb-[8px] ml-[22px] flex items-center gap-[19px]'>
              <div onClick={(e) => e.stopPropagation()}>
                <LikeButton 
            tweetId={tweet.id} 
            initialLikeCount={tweet.likes || 0}
            displayText={false}
            className='text-[#DE6E2D] hover:text-red-500 w-[35px] h-[35px] grid place-items-center rounded-full transition-transform hover:scale-110'
          />
              </div>
              <button type='button' aria-label='Retweet' className='grid size-[35px] cursor-pointer place-items-center transition-transform hover:scale-110'>
                <FiRepeat className='size-[28px]' aria-hidden='true' />
              </button>
              <button type='button' aria-label='Commenter' className='grid size-[35px] cursor-pointer place-items-center transition-transform hover:scale-110'>
                <FiMessageSquare className='size-[26px]' aria-hidden='true' />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Tweets() {
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);
  const [selectedTweet, setSelectedTweet] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sentinelRef = useRef(null);
  const prefetchedPageRef = useRef(null);
  const prefetchedOffsetRef = useRef(null);
  const prefetchPromiseRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isExploreActive = location.pathname.startsWith('/tweets');
  const isHomeActive = location.pathname.startsWith('/feed');

  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const appendUniqueTweets = useCallback((incoming) => {
    setTweets((previous) => {
      const next = [...previous];
      const existingIds = new Set(previous.map((tweet) => String(tweet.id)));

      incoming.forEach((tweet) => {
        const id = String(tweet.id);
        if (!existingIds.has(id)) {
          existingIds.add(id);
          next.push(tweet);
        }
      });

      return next;
    });
  }, []);

  const prefetchPage = useCallback(async (targetOffset) => {
    if (prefetchPromiseRef.current) {
      return;
    }

    if (prefetchedOffsetRef.current === targetOffset && prefetchedPageRef.current) {
      return;
    }

    prefetchPromiseRef.current = (async () => {
      try {
        const page = await fetchExploreTweetsPage(EXPLORE_PAGE_SIZE, targetOffset);
        prefetchedPageRef.current = page;
        prefetchedOffsetRef.current = targetOffset;
      } catch {
        // Keep pagination silent for seamless behavior.
      } finally {
        prefetchPromiseRef.current = null;
      }
    })();

    await prefetchPromiseRef.current;
  }, []);

  const loadInitialTweets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    prefetchedPageRef.current = null;
    prefetchedOffsetRef.current = null;
    prefetchPromiseRef.current = null;

    try {
      const page = await fetchExploreTweetsPage(EXPLORE_PAGE_SIZE, 0);
      const shuffledTweets = shuffleArray(page.tweets);
      setTweets(shuffledTweets);
      setOffset(shuffledTweets.length);
      setHasMore(page.hasMore);

      if (page.hasMore && shuffledTweets.length > 0) {
        void prefetchPage(shuffledTweets.length);
      }

      if (shuffledTweets.length === 0) {
        setError('Aucun post disponible pour le moment.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de charger les posts.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [prefetchPage, shuffleArray]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadInitialTweets();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadInitialTweets]);

  const loadMoreTweets = useCallback(async () => {
    if (isFetchingMore || !hasMore || isLoading) {
      return;
    }

    setIsFetchingMore(true);
    try {
      let page;

      if (prefetchedOffsetRef.current === offset && prefetchedPageRef.current) {
        page = prefetchedPageRef.current;
        prefetchedPageRef.current = null;
        prefetchedOffsetRef.current = null;
      } else {
        page = await fetchExploreTweetsPage(EXPLORE_PAGE_SIZE, offset);
      }

      appendUniqueTweets(page.tweets);

      const nextOffset = offset + page.tweets.length;
      setOffset(nextOffset);
      setHasMore(page.hasMore);

      if (page.hasMore && page.tweets.length > 0) {
        void prefetchPage(nextOffset);
      }
    } finally {
      setIsFetchingMore(false);
    }
  }, [appendUniqueTweets, hasMore, isFetchingMore, isLoading, offset, prefetchPage]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void loadInitialTweets();
  }, [isAuthenticated, loadInitialTweets]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !isAuthenticated) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          void loadMoreTweets();
        }
      },
      {
        root: null,
        rootMargin: '1200px 0px 1200px 0px',
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [isAuthenticated, loadMoreTweets]);

  useEffect(() => {
    if (!selectedTweet) {
      return;
    }

    const onEscape = (event) => {
      if (event.key === 'Escape') {
        setSelectedTweet(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onEscape);
    };
  }, [selectedTweet]);

  // Auto-refresh effect
  const { preferences } = useRefreshPreferences();
  
  useEffect(() => {
    if (!preferences.autoRefreshEnabled || !isAuthenticated) {
      return;
    }

    const intervalId = setInterval(() => {
      void loadInitialTweets();
    }, preferences.autoRefreshInterval * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [preferences.autoRefreshEnabled, preferences.autoRefreshInterval, isAuthenticated, loadInitialTweets]);

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: { pathname: location.pathname } }} replace />;
  }

  return (
    <section className='editorial-bg min-h-screen pb-[132px]'>
      <div className='mx-auto w-full max-w-[375px] px-[25px]'>
        {error && !isLoading && (
          <div className='mb-4 rounded-[10px] border border-red-200 bg-red-50 p-4'>
            <p className='text-sm text-red-800'>{error}</p>
          </div>
        )}

        <div className='mb-4 flex justify-center m-2 sticky'>
          <RefreshButton onClick={handleRefresh} isLoading={isRefreshing} />
        </div>

        <div className='w-full' style={{ columnCount: 2, columnGap: '10px' }}>
          {isLoading ? (
            <>
              <div className='mb-[10px] h-[260px] animate-pulse rounded-[12px] bg-[#ECECEC]' style={{ breakInside: 'avoid' }} />
              <div className='mb-[10px] h-[380px] animate-pulse rounded-[12px] bg-[#ECECEC]' style={{ breakInside: 'avoid' }} />
              <div className='mb-[10px] h-[380px] animate-pulse rounded-[12px] bg-[#ECECEC]' style={{ breakInside: 'avoid' }} />
              <div className='mb-[10px] h-[260px] animate-pulse rounded-[12px] bg-[#ECECEC]' style={{ breakInside: 'avoid' }} />
            </>
          ) : (
            tweets.map((tweet) => {
              const isAuthorBlocked = tweet.author?.is_blocked === true;
              
              // Calculate height based on content length (roughly 35px per line)
              const estimatedLines = Math.ceil(tweet.content.length / 35);
              const minHeight = Math.max(150, estimatedLines * 35 + 80);

              const createdAt = tweet.createdAt
                ? new Date(tweet.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                  })
                : 'Date inconnue';

              return (
                <article
                  key={tweet.id}
                  className={`ui-surface mb-[10px] group relative overflow-hidden rounded-[12px] cursor-pointer transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:scale-[1.01] ${
                    isAuthorBlocked ? 'bg-yellow-50' : ''
                  }`}
                  onClick={() => setSelectedTweet(tweet)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedTweet(tweet);
                    }
                  }}
                  style={{
                    minHeight: `${minHeight}px`,
                    breakInside: 'avoid',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div className='flex h-full flex-col justify-between p-3 relative'>
                    <div>
                      <p className='ui-kicker text-[9px] text-[#8d8d8d] truncate'>@{tweet.author?.username || 'username'}</p>
                      <p className='ui-kicker mt-1 text-[9px] text-[#8d8d8d]'>{createdAt}</p>
                    </div>
                    {isAuthorBlocked ? (
                      <div className='absolute inset-0 flex items-center justify-center bg-yellow-50/95 rounded-[12px]'>
                        <div className='text-center px-3'>
                          <p className='text-xs font-semibold text-yellow-900'>⚠️</p>
                          <p className='text-[11px] font-semibold text-yellow-900 mt-1'>Compte bloqué</p>
                          <p className='text-[9px] text-yellow-800'>Non respect des conditions</p>
                        </div>
                      </div>
                    ) : (
                      <p className='mt-4 text-[14px] leading-[18px] text-[#222] line-clamp-none'>
                        {tweet.content}
                      </p>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {!isLoading && tweets.length > 0 && <div ref={sentinelRef} className='h-1' />}

        {selectedTweet && <LargeTweetOverlay tweet={selectedTweet} onClose={() => setSelectedTweet(null)} />}

        <div className='fixed bottom-[32px] left-1/2 z-30 h-[84px] w-[298px] -translate-x-1/2'>
          <div className='absolute bottom-0 flex h-[70px] w-[298px] items-center justify-between rounded-[20px] border border-black/20 bg-[rgba(25,29,33,0.55)] px-[23px] text-white backdrop-blur-md'>
            <button
              type='button'
              onClick={() => navigate('/tweets')}
              className={`grid size-[56px] place-items-center rounded-full border-2 transition-transform hover:scale-110 ${
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
              onClick={() => navigate('/feed')}
              className={`grid size-[56px] place-items-center rounded-full border-2 transition-transform hover:scale-110 ${
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
            onClick={() => navigate('/feed?compose=1')}
            className={`absolute top-0 left-1/2 grid size-[76px] -translate-x-1/2 place-items-center rounded-[15px] border-[5px] transition-transform hover:scale-110 ${
              isHomeActive
                ? 'border-white bg-[#ea4098] text-white shadow-[0_0_0_2px_rgba(234,64,152,0.35)]'
                : 'border-[#ECECEC] bg-[#ECECEC] text-black'
            }`}
            aria-label='Go to composer'
          >
            <FiPlus className='size-[34px]' aria-hidden='true' />
          </button>
        </div>
      </div>
    </section>
  );
}
