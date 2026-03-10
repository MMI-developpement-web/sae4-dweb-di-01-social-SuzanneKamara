import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import Button from './component/ui/button'
import Badge from './component/ui/badge'

function App() {
 

  return (
    <>
      
   <h1 className="bg-amber-500 text-3xl font-bold underline"> Hello Tailwind Css</h1>
   <div className='mt-4 flex flex-col items-center gap-4'>
    {/* <ButtonCn className='bg-red'>Click Me</ButtonCn> */}
    <Button >Click Me</Button>
    {/* <ButtonCn className='bg-red'>Click Me</ButtonCn> */}
    <Button variant='outline' size="lg">Click Me</Button>
    <Button variant='secondary'>Click Me</Button>
    <Button variant='danger'>Click Me</Button>
    <Button variant='secondary'>Click Me</Button>
    <Badge type='success' size='md'>Success</Badge>
    <Badge type='warning' size='lg'>Warning</Badge>
    <Badge type='error' size='sm'>Error</Badge>
    <Badge type='default' size='md'>Default</Badge>
   </div>
    </>
  )
}

export default App
