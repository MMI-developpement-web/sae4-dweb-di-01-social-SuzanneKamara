import { cn } from '../../../lib/utils.ts'
import Avatar from '../../atoms/Avatar'
import Username from '../../atoms/Username'
import FollowButton from '../../shared/FollowButton'
import { useAuth } from '../../../auth/useAuth.ts'

interface TweetHeaderProps {
  username?: string
  avatar?: string
  createdAt: string
  isAuthorBlocked?: boolean
  authorId?: number
  className?: string
}

export default function TweetHeader({
  username = 'unknown',
  avatar,
  createdAt,
  isAuthorBlocked = false,
  authorId,
  className,
}: TweetHeaderProps) {
  const { userId: currentUserId } = useAuth()
  const formattedDate = new Date(createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={cn('flex items-start justify-between p-[20px]', className)}>
      <div className='flex gap-3 flex-1 min-w-0'>
        <Avatar
          url={avatar}
          username={username}
          size='md'
        />
        <div className='flex-1 min-w-0'>
          <Username
            username={username}
            size='md'
            color={isAuthorBlocked ? 'muted' : 'default'}
          />
          <p className='text-[10px] text-gray-500 mt-1'>{formattedDate}</p>
        </div>
      </div>

      {authorId && !isAuthorBlocked && currentUserId !== authorId && (
        <FollowButton
          targetUserId={authorId}
          className='text-xs'
        />
      )}
    </div>
  )
}
