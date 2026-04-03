import { cn } from '../../../../lib/utils.ts'

interface TweetContentProps {
  content: string
  hashtags?: string[]
  image?: string
  className?: string
}

export default function TweetContent({
  content,
  hashtags = [],
  image,
  className,
}: TweetContentProps) {
  const defaultHashtags = hashtags.length > 0 ? hashtags.join(' ') : '#post #contenu'

  return (
    <div className={cn('flex flex-col px-[22px] pb-[20px]', className)}>
      {hashtags.length > 0 && (
        <p className='text-[12px] leading-[16px] text-gray-600 mb-[18px]'>
          {defaultHashtags}
        </p>
      )}

      <p className='whitespace-pre-line text-[16px] leading-[24px] text-gray-900 break-words'>
        {content}
      </p>

      {image && (
        <img
          src={image}
          alt='Tweet content'
          className='mt-3 rounded-lg max-w-full h-auto'
        />
      )}
    </div>
  )
}
