// import FollowButton from '../FollowButton';


// import FollowButton from "../ui copy/FollowButton";
import Avatar from "./Avatar";

interface TweetHeaderProps {
  isAuthorBlocked: boolean;
  tweet: any; // Replace with actual tweet type
  createdAt: string;
}

export default function TweetHeader({ isAuthorBlocked, tweet, createdAt }: TweetHeaderProps) {
    return (
 <div className='flex items-start justify-between p-[20px]'>
           {/* pt-[18px] */}
              <div className=' flex-1 min-w-0'>
                {/* username */}
                <p className='ui-title text-[30px] leading-[22px] text-[#6d6d6d] max-w-[90%] truncate pt-[18px]'>@{tweet.author?.username || 'username'}</p>
                {/* date of creation */}
                <p className='ui-kicker mt-2 text-[10px] text-[#8a8a8a]'>{createdAt}</p>
          </div>

          <Avatar isAuthorBlocked={isAuthorBlocked} tweet={tweet} />
        </div>
    )

}