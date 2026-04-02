import { FiMessageSquare } from 'react-icons/fi'

interface CommentButtonProps {
  count?: number
  onComment?: () => void
  className?: string
}

export default function CommentButton({
  count = 0,
  onComment,
  className = '',
}: CommentButtonProps) {
  return (
    <button
      type='button'
      onClick={onComment}
      className={`inline-flex items-center gap-2 text-sm transition-colors hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 ${className}`}
      aria-label='Comment'
      title='Comment'
    >
      <FiMessageSquare className='w-5 h-5' />
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
