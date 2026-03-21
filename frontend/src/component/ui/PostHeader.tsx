import Avatar from "./Avatar";

interface PostHeaderProps {
  userAvatar: string;
  userName: string;
}

export default function PostHeader({
  userAvatar,
  userName,
}: PostHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <Avatar url={userAvatar} name={userName} />
      <span className="text-sm font-medium text-gray-700">{userName}</span>
    </div>
  );
}
