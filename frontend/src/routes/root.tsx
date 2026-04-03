import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AppHeader from '../component/ui/AppHeader'
import ErrorBoundary from '../component/ui/ErrorBoundary'
import { useBlockedStatus } from '../hooks/useBlockedStatus'
import { useAuth } from '../auth/useAuth'
import '../App.css'

export default function Root() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [blockedAlertVisible, setBlockedAlertVisible] = useState(false)

  // Monitor if user gets blocked during session
  useBlockedStatus(() => {
    setBlockedAlertVisible(true)
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='app'>
      {/* Alert banner if user gets blocked */}
      {blockedAlertVisible && (
        <div className='fixed top-0 left-0 right-0 z-40 bg-red-50 border-b-2 border-red-300 p-4 shadow-md'>
          <div className='max-w-7xl mx-auto flex items-center justify-between'>
            <div>
              <p className='text-sm font-semibold text-red-900'>⚠️ Compte bloqué</p>
              <p className='text-xs text-red-800 mt-1'>
                Votre compte a été bloqué pour non respect des conditions d'utilisation.
              </p>
            </div>
            <button
              type='button'
              onClick={handleLogout}
              className='ml-4 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors'
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      <AppHeader />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </div>
  )
}
