import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

const BACKEND_ADMIN_URL = 'http://127.0.0.1:8080/admin'

type HeaderConfig = {
  kicker: string
  title: string
}

function getHeaderConfig(pathname: string): HeaderConfig {
  if (pathname.startsWith('/feed')) {
    return { kicker: 'Feed', title: 'LnkUp' }
  }

  if (pathname === '/' || pathname.startsWith('/tweets')) {
    return { kicker: 'Explore', title: 'LnkUp' }
  }

  if (pathname.startsWith('/users')) {
    return { kicker: 'Data', title: 'Users' }
  }

  if (pathname.startsWith('/hashtags')) {
    return { kicker: 'Data', title: 'Hashtags' }
  }

  return { kicker: 'Edition', title: 'LnkUp' }
}

export default function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()

  if (!isAuthenticated || location.pathname === '/login') {
    return null
  }

  const { kicker, title } = getHeaderConfig(location.pathname)

  const onAdmin = useCallback(() => {
    window.location.href = BACKEND_ADMIN_URL
  }, [])

  const onLogout = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  return (
    <header className='sticky top-0 z-40 mx-auto w-full max-w-[375px]  backdrop-blur-sm'>
      <div className='mb-[14px] flex items-start justify-between gap-[10px] px-[25px] pt-[18px]'>
        <div>
          <p className='ui-kicker text-[10px] text-black/60'>{kicker}</p>
          <p className='ui-title mt-1 text-[32px] leading-[26px] text-black'>{title}</p>
        </div>
        <div className='flex items-center gap-[10px]'>
          <button
            type='button'
            onClick={onAdmin}
            className='ui-kicker cursor-pointer text-[11px] text-[#EA4098] underline underline-offset-2 hover:opacity-80'
          >
            Admin
          </button>
          <button
            type='button'
            onClick={onLogout}
            className='ui-kicker h-[35px] cursor-pointer rounded-[10px] border border-black/10 bg-[#ea4098] px-[12px] text-[11px] text-white transition-colors hover:bg-[#d03588]'
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
