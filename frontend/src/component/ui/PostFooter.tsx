import Button from "./Button";

interface PostFooterProps {
  charCount: number;
  maxChars: number;
  onPost: () => void;
  isDisabled: boolean;
}

export default function PostFooter({
  charCount,
  maxChars,
  onPost,
  isDisabled,
}: PostFooterProps) {
  const remainingChars = maxChars - charCount;
  const isNearLimit = remainingChars < 50;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="mt-4 flex items-center justify-center">
      <div className="text-xs font-medium absolute bottom-20 right-10">
        <span
          className={
            isOverLimit
              ? "text-red-600"
              : isNearLimit
              ? "text-yellow-600"
              : "text-white"
          }
        >
          {charCount}/{maxChars}
        </span>
      </div>
      <div className="">
      <Button
        variant="black"
        size="lg"
        onClick={onPost}
        disabled={isDisabled || isOverLimit}
      >
        Post
      </Button>
      </div>
    </div>
  );
}
