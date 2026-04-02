/**
 * PostComposerContainer - Intelligent wrapper around PostComposer UI component
 * Handles post creation logic and API calls
 */

import { PostComposer as PostComposerUI } from '../../ui/features/post'

interface PostComposerContainerProps {
  onSuccess?: () => void
  className?: string
}

export default function PostComposerContainer({
  onSuccess,
  className,
}: PostComposerContainerProps) {
  // TODO: Connect to store/API
  // TODO: Handle form submission
  // TODO: Manage loading states

  const handleSubmit = async (content: string) => {
    try {
      // Call API to create tweet
      console.log('Creating tweet:', content)
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create tweet:', error)
    }
  }

  return (
    <PostComposerUI
      onSubmit={handleSubmit}
      className={className}
    />
  )
}
