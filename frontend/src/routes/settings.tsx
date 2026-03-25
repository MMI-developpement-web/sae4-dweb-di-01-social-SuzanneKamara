import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../auth/useAuth'
import { useRefreshPreferences } from '../context/RefreshPreferencesContext'

export default function Settings() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const { preferences, updatePreferences } = useRefreshPreferences()
  const [localAutoRefresh, setLocalAutoRefresh] = useState(preferences.autoRefreshEnabled)
  const [localInterval, setLocalInterval] = useState(preferences.autoRefreshInterval)
  const [saveSuccess, setSaveSuccess] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: { pathname: location.pathname } }} replace />
  }

  const handleSavePreferences = () => {
    updatePreferences({
      autoRefreshEnabled: localAutoRefresh,
      autoRefreshInterval: Math.max(5, Math.min(300, localInterval)), // Clamp between 5 and 300 seconds
    })
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value)) {
      setLocalInterval(value)
    }
  }

  return (
    <div className='editorial-bg min-h-screen w-full pb-[132px]'>
      <div className='mx-auto flex w-full max-w-[375px] flex-col items-center px-[25px] pt-4'>
        {/* Header */}
        <div className='mb-6 w-full flex items-center gap-3'>
          <a href='/feed' className='flex items-center justify-center size-[36px] rounded-full hover:bg-gray-200 transition-colors'>
            <FiArrowLeft size={24} />
          </a>
          <h1 className='text-2xl font-semibold'>Paramètres</h1>
        </div>

        {/* Settings Card */}
        <div className='ui-surface w-full rounded-[12px] p-6 space-y-6'>
          {/* Auto Refresh Settings */}
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold'>Rafraîchissement automatique</h2>
            
            {/* Toggle */}
            <label className='flex items-center gap-3 cursor-pointer'>
              <input
                type='checkbox'
                checked={localAutoRefresh}
                onChange={(e) => setLocalAutoRefresh(e.target.checked)}
                className='w-5 h-5 rounded cursor-pointer'
              />
              <span className='text-sm'>Activer le rafraîchissement automatique</span>
            </label>

            {/* Interval Setting */}
            {localAutoRefresh && (
              <div className='mt-4 space-y-2'>
                <label htmlFor='refresh-interval' className='block text-sm font-medium'>
                  Intervalle de rafraîchissement (secondes)
                </label>
                <div className='flex items-center gap-3'>
                  <input
                    id='refresh-interval'
                    type='number'
                    min='5'
                    max='300'
                    step='5'
                    value={localInterval}
                    onChange={handleIntervalChange}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                  />
                  <span className='text-sm text-gray-600 min-w-[60px]'>{localInterval}s</span>
                </div>
                <p className='text-xs text-gray-500'>Entre 5 et 300 secondes</p>
              </div>
            )}

            {/* Info */}
            <div className='mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200'>
              <p className='text-xs text-blue-900'>
                {localAutoRefresh 
                  ? `Les posts sur la page d'exploration se rafraîchiront automatiquement toutes les ${localInterval} secondes.`
                  : 'Activez cette option pour rafraîchir automatiquement vos posts.'}
              </p>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSavePreferences}
            className='w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors'
          >
            Enregistrer les paramètres
          </button>

          {/* Success Message */}
          {saveSuccess && (
            <div className='p-3 bg-green-50 rounded-lg border border-green-200'>
              <p className='text-sm text-green-800'>✓ Paramètres enregistrés avec succès</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
