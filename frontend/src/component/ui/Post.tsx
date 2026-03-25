import { useState } from "react";
import PostContent from "./PostContent";

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
  placeholder = "Tell us what's on your mind...",
}: PostProps) {
  const [content, setContent] = useState("");

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
