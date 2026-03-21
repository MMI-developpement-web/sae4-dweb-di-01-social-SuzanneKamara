import { cn } from "../../lib/utils.ts";
import { useState } from "react";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import PostFooter from "./PostFooter";

interface PostDataProps {
  userAvatar: string;
  userName: string;
  placeholder?: string;
  maxChars?: number;
  onPost?: (content: string) => void;
}

interface PostViewProps {
  className?: string;
}

interface PostProps extends PostDataProps, PostViewProps {}

export default function Post({
  userAvatar,
  userName,
  placeholder = "Tell us what's on your mind...",
  maxChars = 280,
  onPost,
  className,
}: PostProps) {
  const [content, setContent] = useState("");

  const handlePost = () => {
    if (content.trim() && onPost) {
      onPost(content);
      setContent("");
    }
  };

  return (
    <div
    className="w-full"
    >
      {/* <PostHeader userAvatar={userAvatar} userName={userName} /> */}
      <PostContent
        placeholder={placeholder}
        value={content}
        onChange={setContent}
      />
      
    </div>
  );
}
