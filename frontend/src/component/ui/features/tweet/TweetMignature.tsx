import { cn } from '../../../lib/utils.ts'

interface TweetMignatureProps {
  username: string
  avatar?: string
  content: string
  createdAt: string
  className?: string
}

export default function TweetMignature({
  username,
  avatar,
  content,
  createdAt,
  className,
}: TweetMignatureProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article
      className={cn(
        'flex gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors',
        className
      )}
    >
      {avatar && (
        <img
          src={avatar}
          alt={username}
          className='w-10 h-10 rounded-full object-cover flex-shrink-0'
        />
      )}

      <div className='flex-1 min-w-0'>
        <div className='flex items-baseline gap-2'>
          <p className='font-semibold text-gray-900'>@{username}</p>
          <p className='text-xs text-gray-500'>{formattedDate}</p>
        </div>

        <p className='text-sm text-gray-700 line-clamp-3'>
          {content}
        </p>
      </div>
    </article>
  )
}
