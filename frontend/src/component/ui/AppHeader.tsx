import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiSettings, FiLogOut, FiUser } from 'react-icons/fi'
import { useAuth } from '../../auth/useAuth'
// import logoUrl from '/Vector3.svg?url'
import textLogoUrl from '/textLogo.svg?url'

type HeaderConfig = {
  kicker: string
  
}

function getHeaderConfig(pathname: string): HeaderConfig {
  if (pathname.startsWith('/feed')) {
    return { kicker: 'Feed' }
  }

  if (pathname === '/' || pathname.startsWith('/tweets')) {
    return { kicker: 'Explore' }
  }

  if (pathname.startsWith('/users')) {
    return { kicker: 'Data' }
  }


  if (pathname.startsWith('/settings')) {
    return { kicker: 'Profil' }
  }

  if (pathname.startsWith('/profile')) {
    return { kicker: 'Profil' }
  }

  return { kicker: 'Edition'}
}

export default function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()

  if (!isAuthenticated || location.pathname === '/login') {
    return null
  }

  const { kicker} = getHeaderConfig(location.pathname)

  const onLogout = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const onNavigateToProfile = useCallback(() => {
    navigate('/profile')
  }, [navigate])

  const onNavigateToSettings = useCallback(() => {
    navigate('/settings')
  }, [navigate])

  return (
    <header className='sticky top-0 z-40 mx-auto w-full max-w-[375px] backdrop-blur-sm'>
      <div className='px-[25px] pt-[18px] pb-[12px]'>
        {/* Logo Section */}
       
        
        {/* Header Content with Navigation */}
        <div className='flex items-start justify-between gap-[10px]'>
          <div>
            <p className='ui-kicker text-[10px] text-black/60'>{kicker}</p>
             <div className='mb-[16px] flex items-center gap-[12px]'>
          {/* <img 
            src={logoUrl}
            alt="LnkUp Logo" 
            className='w-[32px] h-[32px]'
          /> */}
          <img src={textLogoUrl} alt="LnkUp Text Logo" className='w-[100px] h-[24px]' />
        </div>
          </div>
          <div className='flex items-center gap-[10px]'>
          <button
            type='button'
            onClick={onNavigateToProfile}
            className='flex items-center justify-center h-[35px] w-[35px] rounded-[10px] border border-black/10 bg-white hover:bg-gray-50 transition-colors'
            aria-label='Profil'
          >
            <FiUser size={18} />
          </button>
          <button
            type='button'
            onClick={onNavigateToSettings}
            className='flex items-center justify-center h-[35px] w-[35px] rounded-[10px] border border-black/10 bg-white hover:bg-gray-50 transition-colors'
            aria-label='Paramètres'
          >
            <FiSettings size={18} />
          </button>
          <button
            type='button'
            onClick={onLogout}
            className='ui-kicker h-[35px] cursor-pointer rounded-[10px] border border-black/10 bg-[#ea4098] px-[12px] text-[11px] text-white transition-colors hover:bg-[#d03588] flex items-center gap-2'
          >
            <FiLogOut size={14} />
            <span>Logout</span>
          </button>
          </div>
        </div>
      </div>
    </header>
  )
}
