import FollowButton from '../FollowButton';

interface AvatarProps {
  
  isAuthorBlocked: boolean;
  tweet: any; // Replace with actual tweet type
}

export default function Avatar({ isAuthorBlocked, tweet }: AvatarProps) {
    return (
        <div className='relative flex-shrink-0'>
    <div className='size-[51px] rounded-full bg-[#D3D3D3]' />
                 {!isAuthorBlocked && (
                              <div className='absolute right-[-12px] bottom-[2px] grid size-[24px] place-items-center rounded-[2px] bg-[#111] text-white'>
                                {/* follow button */}
                                <FollowButton 
                                  targetUserId={tweet.author?.id} 
                                  className='text-white hover:text-blue-300'
                                />
                              </div>
                            )}
              </div>
            )}