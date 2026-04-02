import { cn } from '../../../lib/utils.ts'
import LikeButton from '../../shared/LikeButton'
import RepublicationButton from '../../shared/RepublicationButton'
import CommentButton from '../../shared/CommentButton'

interface TweetFooterProps {
  tweetId: number
  likesCount?: number
  commentsCount?: number
  repostsCount?: number
  onDelete?: () => void
  onUpdate?: () => void
  onReply?: () => void
  className?: string
}

export default function TweetFooter({
  tweetId,
  likesCount = 0,
  commentsCount = 0,
  repostsCount = 0,
  onDelete,
  onUpdate,
  onReply,
  className,
}: TweetFooterProps) {
  return (
    <div className={cn('flex items-center gap-4 px-[22px] py-[12px] border-t border-gray-200', className)}>
      <CommentButton
        count={commentsCount}
        onComment={onReply}
        className='flex-1'
      />
      <RepublicationButton
        count={repostsCount}
        className='flex-1'
      />
      <LikeButton
        tweetId={tweetId}
        initialLikeCount={likesCount}
        displayText={true}
        className='flex-1'
      />
    </div>
  )
}
