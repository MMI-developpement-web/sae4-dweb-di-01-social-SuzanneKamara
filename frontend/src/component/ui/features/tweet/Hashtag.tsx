import { cn } from '../../../lib/utils.ts'

interface HashtagProps {
  tag: string
  onClick?: () => void
  className?: string
}

export default function Hashtag({ tag, onClick, className }: HashtagProps) {
  return (
    <span
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'text-blue-600 hover:underline cursor-pointer',
        onClick && 'hover:text-blue-800 transition-colors',
        className
      )}
    >
      #{tag}
    </span>
  )
}
