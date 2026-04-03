import { cn } from '../../../../lib/utils.ts'
import TweetHeader from './TweetHeader'
import TweetContent from './TweetContent'
import TweetFooter from './TweetFooter'

interface TweetProps {
  tweet: {
    id: number
    content: string
    createdAt: string
    author?: {
      id: number
      username: string
      avatar?: string
    }
    likes?: number
    comments?: number
    reposts?: number
  }
  isAuthorBlocked?: boolean
  onDelete?: () => void
  onUpdate?: () => void
  onReply?: () => void
  className?: string
}

export default function Tweet({
  tweet,
  isAuthorBlocked = false,
  onDelete,
  onUpdate,
  onReply,
  className,
}: TweetProps) {
  return (
    <article
      className={cn(
        'border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer',
        className
      )}
    >
      <TweetHeader
        username={tweet.author?.username}
        avatar={tweet.author?.avatar}
        createdAt={tweet.createdAt}
        isAuthorBlocked={isAuthorBlocked}
      />

      {isAuthorBlocked ? (
        <div className='flex h-[calc(100%-91px)] flex-col items-center justify-center px-[22px] pb-[20px]'>
          <p className='text-[24px] font-semibold text-yellow-900 mb-2'>⚠️</p>
          <p className='text-center text-[14px] font-semibold text-yellow-900'>
            Ce compte a été bloqué
          </p>
          <p className='text-center text-[12px] text-yellow-800 mt-1'>
            pour non respect des conditions d'utilisation
          </p>
        </div>
      ) : (
        <TweetContent content={tweet.content} />
      )}

      {!isAuthorBlocked && (
        <TweetFooter
          tweetId={tweet.id}
          likesCount={tweet.likes || 0}
          commentsCount={tweet.comments || 0}
          repostsCount={tweet.reposts || 0}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onReply={onReply}
        />
      )}
    </article>
  )
}
