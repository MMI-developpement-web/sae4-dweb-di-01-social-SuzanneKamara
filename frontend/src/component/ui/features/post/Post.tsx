import { cn } from '../../../../lib/utils.ts'

interface PostProps {
  className?: string
  post?: any
}

export default function Post({ className }: PostProps) {
  return (
    <div
      className={cn(
        'w-full p-4 border border-gray-200 rounded-lg',
        className
      )}
    >
      {/* Post component wrapper */}
    </div>
  )
}
