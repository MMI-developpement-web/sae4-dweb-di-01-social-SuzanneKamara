import { cn } from '../../../../lib/utils.ts'

interface PostCounterProps {
  charCount?: number
  maxChars?: number
  isOverLimit?: boolean
  isNearLimit?: boolean
}

export default function PostCounter({
  charCount = 0,
  maxChars = 500,
  isOverLimit = false,
  isNearLimit = false,
}: PostCounterProps) {
  return (
    <div className='text-xs font-medium absolute bottom-2 right-4'>
      <span
        className={cn(
          isOverLimit
            ? 'text-red-600'
            : isNearLimit
              ? 'text-yellow-600'
              : 'text-gray-400'
        )}
      >
        {charCount}/{maxChars}
      </span>
    </div>
  )
}
