import { FiRepeat } from 'react-icons/fi'

interface RepublicationButtonProps {
  count?: number
  onRetweet?: () => void
  className?: string
  isRetweeted?: boolean
}

export default function RepublicationButton({
  count = 0,
  onRetweet,
  className = '',
  isRetweeted = false,
}: RepublicationButtonProps) {
  return (
    <button
      type='button'
      onClick={onRetweet}
      className={`inline-flex items-center gap-2 text-sm transition-colors hover:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed ${
        isRetweeted ? 'text-green-500' : 'text-gray-500'
      } ${className}`}
      aria-label='Retweet'
      title='Retweet'
    >
      <FiRepeat className='w-5 h-5' />
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
