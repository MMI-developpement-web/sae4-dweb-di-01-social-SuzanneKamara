import Avatar from "./atoms/Avatar";

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
      <Avatar url={userAvatar} username={userName} size='md' />
      <span className="text-sm font-medium text-gray-700 w-[13.6rem] truncate">{userName}</span>
    </div>
  );
}
