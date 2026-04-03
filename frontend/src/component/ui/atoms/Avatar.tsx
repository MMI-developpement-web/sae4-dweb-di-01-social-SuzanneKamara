import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils.ts";

const avatarVariants = cva("rounded-full object-cover flex items-center justify-center", {
  variants: {
    size: {
      sm: "w-6 h-6 text-xs",
      md: "w-8 h-8 text-sm",
      lg: "w-12 h-12 text-lg",
      xl: "w-16 h-16 text-2xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

// Generate a consistent color based on username
function generateAvatarColor(username: string): string {
  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#D97706', // Orange
  ];
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

interface AvatarProps extends VariantProps<typeof avatarVariants> {
  url?: string;
  username?: string;
  alt?: string;
  className?: string;
}

export default function Avatar({ url, username = "U", alt, size, className }: AvatarProps) {
  // Display image if URL is available
  if (url) {
    return (
      <img
        src={url}
        alt={alt || username}
        className={cn(avatarVariants({ size }), className)}
      />
    );
  }

  // Fallback to colored circle with initials
  const bgColor = generateAvatarColor(username);
  const initial = username.charAt(0).toUpperCase();

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className={cn(
        avatarVariants({ size }),
        "font-bold text-white",
        className
      )}
      title={username}
    >
      {initial}
    </div>
  );
}
