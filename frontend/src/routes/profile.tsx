import { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiEdit2, FiMapPin, FiGlobe } from 'react-icons/fi'
import { useAuth } from '../auth/useAuth'

interface UserData {
  id: number
  username: string
  email: string
  bio?: string
  avatar_url?: string
  banner_url?: string
  location?: string
  website_url?: string
  is_verified?: boolean
}

export default function Profile() {
  const navigate = useNavigate()
  const { isAuthenticated, token } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userPosts, setUserPosts] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Fetch user data - will be implemented once we have the current user endpoint
    // For now, we'll just display a placeholder
    setIsLoading(false)
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

        {/* Profile Content */}
        <div className='w-full px-[25px] space-y-4'>
          {/* Banner */}
          <div className='relative h-[175px] rounded-[10px] overflow-hidden bg-gradient-to-r from-[#61bdfc]/30 via-[#595880]/30 to-[#3a7196]/30'>
            <button
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
                <div className='size-[60px] rounded-full bg-[#939292] flex items-center justify-center text-white text-2xl font-bold'>
                  {userData?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className='flex-1 flex items-start justify-between'>
                <div>
                  <p className='font-semibold text-black'>
                    {userData?.username || 'Utilisateur'}
                  </p>
                  <p className='text-sm text-gray-600'>@{userData?.username || 'username'}</p>
                </div>
                <button
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

          {/* User Posts Section */}
          <div className='space-y-3'>
            <h2 className='font-semibold text-black'>Posts</h2>
            <div className='grid grid-cols-2 gap-3 rounded-[10px] overflow-hidden'>
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div key={post.id} className='bg-[#d6d6d6] rounded-[10px] aspect-square' />
                ))
              ) : (
                <div className='col-span-2 bg-[#f0f0f0] rounded-[10px] py-12 flex items-center justify-center'>
                  <p className='text-gray-500 text-sm'>Aucun post pour le moment</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
