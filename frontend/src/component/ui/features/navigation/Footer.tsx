import { cn } from '../../../../lib/utils.ts'

export default function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn('w-full border-t border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-500', className)}>
      © 2025 Social App. All rights reserved.
    </footer>
  )
}
