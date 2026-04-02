import { FiEdit2 } from 'react-icons/fi'
import Button from '../atoms/Button'

interface ModifyButtonProps {
  onEdit?: () => void
  className?: string
  variant?: 'icon' | 'button'
  size?: 'sm' | 'md' | 'lg'
}

export default function ModifyButton({
  onEdit,
  className = '',
  variant = 'icon',
  size = 'md',
}: ModifyButtonProps) {
  if (variant === 'icon') {
    return (
      <button
        type='button'
        onClick={onEdit}
        className={`inline-flex items-center justify-center text-gray-500 hover:text-blue-500 transition-colors ${className}`}
        aria-label='Edit'
        title='Edit'
      >
        <FiEdit2 className='w-5 h-5' />
      </button>
    )
  }

  return (
    <Button
      variant='outline'
      size={size}
      onClick={onEdit}
      className={className}
    >
      <FiEdit2 className='w-4 h-4' />
      <span>Edit</span>
    </Button>
  )
}
