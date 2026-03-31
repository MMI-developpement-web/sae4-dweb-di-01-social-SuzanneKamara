import PostCounter from "./PostCounter";
import { Button } from "./button";

export default function PostFooter({
  charCount,
  maxChars,
  onPost,
  isDisabled,
}: {
  charCount: number;
  maxChars: number;
  onPost: () => void;
  isDisabled: boolean;
}) {

    const remainingChars = maxChars - charCount;
    const isNearLimit = remainingChars < 50;
    const isOverLimit = remainingChars < 0;
    return (
        <div className="mt-4 flex items-center justify-center">
        <PostCounter maxChars={500} charCount={charCount} isOverLimit={isOverLimit} isNearLimit={isNearLimit} />  
            <Button
            variant="black"
            size="lg"
            onClick={onPost}
            disabled={isDisabled || isOverLimit}
        >
            Post
        </Button>          
        </div>
    );
}