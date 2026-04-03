import { cn } from '../../../../lib/utils.ts'
import PostCounter from './PostCounter'
import Button from '../../atoms/Button'

interface PostComposerProps {
  placeholder?: string
  maxChars?: number
  onSubmit?: (content: string) => void | Promise<void>
  isLoading?: boolean
  className?: string
  content?: string
  onContentChange?: (content: string) => void
  hashtags?: string[]
  onAddHashtag?: (tag: string) => void
  onRemoveHashtag?: (tag: string) => void
  error?: string | null
  author?: any
  displayText?: boolean
}

export default function PostComposer({
  placeholder = 'Tell us what\'s on your mind...',
  maxChars = 500,
  onSubmit,
  isLoading = false,
  className,
  // Autres props acceptées mais non utilisées dans ce composant
  content: _content,
  onContentChange: _onContentChange,
  hashtags: _hashtags,
  onAddHashtag: _onAddHashtag,
  onRemoveHashtag: _onRemoveHashtag,
  error: _error,
  author: _author,
  displayText: _displayText,
}: PostComposerProps) {
  const handleSubmit = (formData: FormData) => {
    const content = formData.get('content') as string
    onSubmit?.(content)
  }

  return (
    <form
      action={handleSubmit}
      className={cn('relative w-full', className)}
    >
      <textarea
        name='content'
        placeholder={placeholder}
        maxLength={maxChars}
        disabled={isLoading}
        className={cn(
          'w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
          'placeholder-gray-400 resize-none',
          isLoading && 'opacity-50 cursor-not-allowed'
        )}
        rows={4}
      />
      <PostCounter maxChars={maxChars} />
      <div className='flex justify-end mt-3'>
        <Button
          type='submit'
          variant='primary'
          size='md'
          disabled={isLoading}
          isLoading={isLoading}
        >
          Post
        </Button>
      </div>
    </form>
  )
}
