import { Outlet } from 'react-router-dom'
import AppHeader from '../component/ui/AppHeader'
import '../App.css'

export default function Root() {
  return (
    <div className='app'>
      <AppHeader />
      <Outlet />
    </div>
  )
}
