import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiEdit2, FiMapPin, FiGlobe } from 'react-icons/fi'
import { useAuth } from '../auth/useAuth'
import { getCurrentUser, type CurrentUser } from '../lib/userService'
import { fetchUserTweetsPage, type Tweet } from '../lib/tweetService'
import TweetCard from '../component/ui/TweetCard'
import ProfileEditForm from '../component/ui/features/profile/ProfileEditForm'

export default function Profile() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [userData, setUserData] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userTweets, setUserTweets] = useState<Tweet[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const loadProfileData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch current user data
        const user = await getCurrentUser()
        setUserData(user)

        // Fetch user's tweets
        const tweetsPage = await fetchUserTweetsPage(user.id, 40, 0)
        setUserTweets(tweetsPage.tweets)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors du chargement du profil'
        setError(message)
        console.error('Error loading profile:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className='editorial-bg min-h-screen w-full pb-[132px]'>
        <div className='mx-auto flex w-full max-w-[375px] items-center justify-center pt-20'>
          <p className='text-gray-500'>Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='editorial-bg min-h-screen w-full pb-[132px]'>
        <div className='mx-auto flex w-full max-w-[375px] flex-col items-center'>
          <button
            onClick={() => navigate(-1)}
            className='self-start p-4'
            aria-label='Retour'
          >
            <FiArrowLeft size={24} />
          </button>
          <div className='flex items-center justify-center pt-20'>
            <p className='text-gray-500'>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='editorial-bg min-h-screen w-full pb-[132px]'>
      <div className='mx-auto flex w-full max-w-[375px] flex-col items-center'>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className='self-start p-4'
          aria-label='Retour'
        >
          <FiArrowLeft size={24} />
        </button>

        {/* Edit Mode: Show Form */}
        {isEditMode && userData ? (
          <div className='w-full px-[25px] py-4'>
            <h2 className='text-2xl font-bold text-black mb-6'>Modifier le profil</h2>
            <ProfileEditForm
              user={userData}
              onSave={(updatedUser) => {
                setUserData(updatedUser)
                setIsEditMode(false)
              }}
              onCancel={() => setIsEditMode(false)}
            />
          </div>
        ) : (
          <>
            {/* Profile Content */}
            <div className='w-full px-[25px] space-y-4'>
              {/* Banner */}
              <div
                className='relative h-[175px] rounded-[10px] overflow-hidden bg-cover bg-center'
                style={{
                  backgroundImage: userData?.banner_url
                    ? `url(${userData.banner_url})`
                    : 'linear-gradient(to right, rgba(97, 189, 252, 0.3), rgba(89, 88, 128, 0.3), rgba(58, 113, 150, 0.3))',
                }}
              >
                <button
                  onClick={() => setIsEditMode(true)}
                  className='absolute bottom-3 right-3 bg-white p-2 rounded-lg hover:bg-gray-50'
                  aria-label='Modifier la bannière'
                >
                  <FiEdit2 size={16} className='text-gray-600' />
                </button>
              </div>

              {/* User Card */}
              <div className='ui-surface bg-white rounded-[10px] p-4 space-y-3'>
                {/* User Header */}
                <div className='flex items-start gap-3 pb-3 border-b border-gray-200'>
                  <div className='relative shrink-0'>
                    {userData?.avatar_url ? (
                      <img
                        src={userData.avatar_url}
                        alt={userData.username}
                        className='size-[60px] rounded-full object-cover'
                      />
                    ) : (
                      <div className='size-[60px] rounded-full bg-[#939292] flex items-center justify-center text-white text-2xl font-bold'>
                        {userData?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className='flex-1 flex items-start justify-between'>
                    <div>
                      <p className='font-semibold text-black'>
                        {userData?.username || 'Utilisateur'}
                      </p>
                      <p className='text-sm text-gray-600'>@{userData?.username || 'username'}</p>
                    </div>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className='bg-white border border-gray-300 p-2 rounded-lg hover:bg-gray-50'
                      aria-label='Modifier le profil'
                    >
                      <FiEdit2 size={16} className='text-gray-600' />
                    </button>
                  </div>
                </div>

                {/* Bio */}
                {userData?.bio && (
                  <div className='py-3 border-b border-gray-200'>
                    <p className='text-sm text-gray-700'>{userData.bio}</p>
                  </div>
                )}

                {/* Location */}
                {userData?.location && (
                  <div className='flex items-center gap-2 py-2'>
                    <FiMapPin size={16} className='text-gray-600' />
                    <p className='text-sm text-gray-600'>{userData.location}</p>
                  </div>
                )}

                {/* Website */}
                {userData?.website_url && (
                  <div className='flex items-center gap-2 py-2'>
                    <FiGlobe size={16} className='text-gray-600' />
                    <a
                      href={userData.website_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-[#ea4098] hover:underline'
                    >
                      {userData.website_url}
                    </a>
                  </div>
                )}
              </div>

              {/* User Tweets Section */}
              <div className='space-y-3'>
                <h2 className='font-semibold text-black'>Tweets</h2>
                {userTweets.length > 0 ? (
                  <div className='space-y-3'>
                    {userTweets.map((tweet) => (
                      <TweetCard key={tweet.id} tweet={tweet} isOwnTweet={true} />
                    ))}
                  </div>
                ) : (
                  <div className='bg-white rounded-[10px] py-12 flex items-center justify-center'>
                    <p className='text-gray-500 text-sm'>Aucun tweet pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
