

interface PostCounterProps {
  charCount: number;
  maxChars: number;
    isOverLimit: boolean;
    isNearLimit: boolean;
}

export default function PostCounter({
  charCount,
  maxChars,
    
 isOverLimit,
 isNearLimit
}: PostCounterProps) {
  return (
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
  );
}