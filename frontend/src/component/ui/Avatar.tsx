import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";
import type { ReactNode } from "react";

const avatarVariants = cva("w-8 h-8 rounded-full", {
  variants: {}});

interface AvatarDataProps {
  url: string;
  name: string;
}
interface AvatarViewProps extends VariantProps<typeof avatarVariants> {
//   className?: string;
}

interface AvatarProps extends AvatarDataProps, AvatarViewProps {}

export default function Avatar({ url, name }: AvatarProps) {
  return (
    <div
                className={cn(
                    avatarVariants(),
      )}
    >
      <img src={url} alt={`${name}'s avatar`} />
    </div>
  );
}