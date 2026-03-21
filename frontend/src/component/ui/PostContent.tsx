import PostFooter from "./PostFooter";

interface PostContentProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function PostContent({
  placeholder = "Tell us what's on your mind...",
  value,
  onChange,
}: PostContentProps) {
  const handlePost = () => {
    // Handle post submission
  };

  return (
    <div className="relative">
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className=" text-white text-sm w-80 h-96 bg-gradient-to-br from-neutral-700 to-neutral-400 p-[1rem] "
    />
    <PostFooter maxChars={500} charCount={value.length} onPost={handlePost} isDisabled={value.length === 0} />
    </div>
  );
}
