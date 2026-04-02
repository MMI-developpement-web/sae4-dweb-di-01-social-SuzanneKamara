import { cn } from '../../../lib/utils.ts'
import PP from '../../atoms/PP'

interface ProfileBannerProps {
  backgroundImage?: string
  className?: string
}

export default function Banner({ backgroundImage, className }: ProfileBannerProps) {
  return (
    <div
      className={cn(
        'w-full h-40 bg-gradient-to-r from-blue-400 to-purple-500',
        className
      )}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    />
  )
}
