import { cn } from '../../../lib/utils.ts'

export default function Header({ className }: { className?: string }) {
  return (
    <header className={cn('w-full border-b border-gray-200 sticky top-0 z-40 bg-white', className)}>
      {/* Header content */}
    </header>
  )
}
