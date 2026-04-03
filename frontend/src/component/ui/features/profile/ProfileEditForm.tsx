import { useCallback, useState } from 'react'
import { updateUserProfile, uploadProfileImage, type CurrentUser, type UpdateProfileData } from '../../../../lib/userService'
import { MESSAGES } from '../../../../constants/messages'
import DeleteConfirmModal from '../../DeleteConfirmModal'
import Avatar from '../../atoms/Avatar'

interface ProfileEditFormProps {
  user: CurrentUser
  onSave: (user: CurrentUser) => void
  onCancel: () => void
}

export default function ProfileEditForm({ user, onSave, onCancel }: ProfileEditFormProps) {
  const [bio, setBio] = useState(user.bio ?? '')
  const [location, setLocation] = useState(user.location ?? '')
  const [website, setWebsite] = useState(user.website_url ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? '')
  const [bannerUrl, setBannerUrl] = useState(user.banner_url ?? '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [avatarInputMode, setAvatarInputMode] = useState<'url' | 'file'>('url')
  const [bannerInputMode, setBannerInputMode] = useState<'url' | 'file'>('url')
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url ?? '')
  const [bannerPreview, setBannerPreview] = useState(user.banner_url ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Avatar URL input change
  const handleAvatarUrlChange = (value: string) => {
    setAvatarUrl(value)
    setAvatarPreview(value)
    setError(null)
  }

  // Avatar file input change
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setError(null)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Banner URL input change
  const handleBannerUrlChange = (value: string) => {
    setBannerUrl(value)
    setBannerPreview(value)
    setError(null)
  }

  // Banner file input change
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerFile(file)
      setError(null)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const updateData: UpdateProfileData = {
        bio: bio.trim() === '' ? null : bio.trim(),
        location: location.trim() === '' ? null : location.trim(),
        website_url: website.trim() === '' ? null : website.trim(),
      }

      // Determine which image URLs to send based on input mode
      if (avatarInputMode === 'url') {
        updateData.avatar_url = avatarUrl.trim() === '' ? null : avatarUrl.trim()
      } else if (avatarFile) {
        // Upload the file to the media endpoint and get the URL back
        const uploadedUrl = await uploadProfileImage(avatarFile)
        updateData.avatar_url = uploadedUrl
      }

      if (bannerInputMode === 'url') {
        updateData.banner_url = bannerUrl.trim() === '' ? null : bannerUrl.trim()
      } else if (bannerFile) {
        // Upload the file to the media endpoint and get the URL back
        const uploadedUrl = await uploadProfileImage(bannerFile)
        updateData.banner_url = uploadedUrl
      }

      const updatedUser = await updateUserProfile(user.id, updateData)
      setSuccessMessage(MESSAGES.PROFILE_UPDATED)
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
        onSave(updatedUser)
      }, 1500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : MESSAGES.GENERIC_ERROR
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [bio, location, website, avatarUrl, bannerUrl, avatarFile, bannerFile, avatarInputMode, bannerInputMode, user.id, onSave])

  const handleDeleteAccount = useCallback(async () => {
    setShowDeleteConfirm(false)
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Implement account deletion API call when backend is ready
      // const response = await fetch(`/api/users/${user.id}`, { method: 'DELETE' })
      // if (!response.ok) throw new Error('Failed to delete account')
      
      setSuccessMessage(MESSAGES.ACCOUNT_DELETION_PENDING)
      // Redirect to login or home page after deletion
      // window.location.href = '/login'
      
      console.log('Account deletion not yet implemented. Backend endpoint needed.')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : MESSAGES.ACCOUNT_DELETION_FAILED
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [user.id])

  return (
    <div className='w-full max-w-[600px] space-y-6 p-6 bg-white rounded-lg border border-gray-200'>
      {/* Success Message */}
      {successMessage && (
        <div className='p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700'>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700'>
          {error}
        </div>
      )}

      {/* Banner Upload */}
      <div>
        <label className='block text-sm font-semibold text-gray-700 mb-2'>Bannière</label>
        
        {bannerPreview && (
          <div className='mb-3 rounded-lg overflow-hidden border border-gray-200'>
            <img src={bannerPreview} alt='Bannière aperçu' className='w-full h-[200px] object-cover' />
          </div>
        )}

        <div className='flex gap-2 mb-3'>
          <button
            type='button'
            onClick={() => setBannerInputMode('url')}
            className={`flex-1 py-2 px-3 rounded border text-sm font-medium transition-colors ${
              bannerInputMode === 'url'
                ? 'bg-[#ea4098] text-white border-[#ea4098]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            URL
          </button>
          <button
            type='button'
            onClick={() => setBannerInputMode('file')}
            className={`flex-1 py-2 px-3 rounded border text-sm font-medium transition-colors ${
              bannerInputMode === 'file'
                ? 'bg-[#ea4098] text-white border-[#ea4098]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Fichier
          </button>
        </div>

        {bannerInputMode === 'url' ? (
          <input
            type='text'
            value={bannerUrl}
            onChange={(e) => handleBannerUrlChange(e.target.value)}
            placeholder='https://exemple.com/banner.jpg'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea4098] text-sm'
          />
        ) : (
          <input
            type='file'
            accept='image/*'
            onChange={handleBannerFileChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea4098] text-sm'
          />
        )}
      </div>

      {/* Avatar Upload */}
      <div>
        <label className='block text-sm font-semibold text-gray-700 mb-2'>Photo de profil</label>
        
        <div className='mb-3'>
          {avatarPreview ? (
            <img src={avatarPreview} alt='Avatar aperçu' className='w-[100px] h-[100px] rounded-full object-cover border-2 border-gray-200' />
          ) : (
            <Avatar
              url={undefined}
              username={user.username}
              size='lg'
              className='border-2 border-gray-200'
            />
          )}
        </div>

        <div className='flex gap-2 mb-3'>
          <button
            type='button'
            onClick={() => setAvatarInputMode('url')}
            className={`flex-1 py-2 px-3 rounded border text-sm font-medium transition-colors ${
              avatarInputMode === 'url'
                ? 'bg-[#ea4098] text-white border-[#ea4098]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            URL
          </button>
          <button
            type='button'
            onClick={() => setAvatarInputMode('file')}
            className={`flex-1 py-2 px-3 rounded border text-sm font-medium transition-colors ${
              avatarInputMode === 'file'
                ? 'bg-[#ea4098] text-white border-[#ea4098]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Fichier
          </button>
        </div>

        {avatarInputMode === 'url' ? (
          <input
            type='text'
            value={avatarUrl}
            onChange={(e) => handleAvatarUrlChange(e.target.value)}
            placeholder='https://exemple.com/avatar.jpg'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea4098] text-sm'
          />
        ) : (
          <input
            type='file'
            accept='image/*'
            onChange={handleAvatarFileChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea4098] text-sm'
          />
        )}
      </div>

      {/* Bio */}
      <div>
        <label className='block text-sm font-semibold text-gray-700 mb-2'>
          Bio ({bio.length}/{500})
        </label>
        <textarea
          value={bio}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              setBio(e.target.value)
              setError(null)
            }
          }}
          placeholder='Un peu à votre sujet...'
          maxLength={500}
          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea4098] text-sm min-h-[100px]'
        />
      </div>

      {/* Location */}
      <div>
        <label className='block text-sm font-semibold text-gray-700 mb-2'>
          Localisation ({location.length}/{100})
        </label>
        <input
          type='text'
          value={location}
          onChange={(e) => {
            if (e.target.value.length <= 100) {
              setLocation(e.target.value)
              setError(null)
            }
          }}
          placeholder='Ville, pays'
          maxLength={100}
          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea4098] text-sm'
        />
      </div>

      {/* Website */}
      <div>
        <label className='block text-sm font-semibold text-gray-700 mb-2'>
          Site web ({website.length}/{500})
        </label>
        <input
          type='text'
          value={website}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              setWebsite(e.target.value)
              setError(null)
            }
          }}
          placeholder='https://exemple.com'
          maxLength={500}
          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea4098] text-sm'
        />
      </div>

      {/* Buttons */}
      <div className='flex flex-col gap-3 pt-4'>
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={handleSave}
            disabled={isLoading}
            className='flex-1 py-3 px-4 bg-[#ea4098] text-white rounded-lg font-semibold hover:bg-[#d63f7f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
          <button
            type='button'
            onClick={onCancel}
            disabled={isLoading}
            className='flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            Annuler
          </button>
        </div>

        {/* Delete Account Button */}
        <button
          type='button'
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isLoading}
          className='w-full py-3 px-4 bg-red-100 text-red-700 border border-red-300 rounded-lg font-semibold hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          Supprimer le compte
        </button>
      </div>

      {/* Delete Account Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title="Supprimer votre compte"
        message={MESSAGES.CONFIRM_DELETE_ACCOUNT}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={isLoading}
      />
    </div>
  )
}
