import { cn } from '../../../lib/utils.ts'

export default function NavigationBar({ className }: { className?: string }) {
  return (
    <nav className={cn('w-full border-t border-gray-200 bg-white', className)}>
      {/* Navigation content */}
    </nav>
  )
}
