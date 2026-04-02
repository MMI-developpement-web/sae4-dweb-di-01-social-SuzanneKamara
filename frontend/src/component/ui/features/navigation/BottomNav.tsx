import { FiCompass, FiHome, FiPlus } from 'react-icons/fi'

interface BottomNavProps {
  onOpenComposer: () => void
  onExplore: () => void
  onHome: () => void
  activeRoute: 'feed' | 'explore'
  isComposerActive: boolean
}

export default function BottomNav({
  onOpenComposer,
  onExplore,
  onHome,
  activeRoute,
  isComposerActive,
}: BottomNavProps) {
  const isExploreActive = activeRoute === 'explore'
  const isHomeActive = activeRoute === 'feed' && !isComposerActive

  return (
    <div className='fixed bottom-[32px] left-1/2 z-30 h-[84px] w-[298px] -translate-x-1/2'>
      <div className='absolute bottom-0 flex h-[70px] w-[298px] items-center justify-between rounded-[20px] border border-black/20 bg-[rgba(25,29,33,0.55)] px-[23px] text-white backdrop-blur-md'>
        <button
          type='button'
          onClick={onExplore}
          className={`grid size-[56px] cursor-pointer place-items-center rounded-full border-2 transition-transform hover:scale-110 ${
            isExploreActive
              ? 'border-[#ea4098] bg-white/20 text-[#ea4098]'
              : 'border-white/90 text-white'
          }`}
          aria-label='Explore'
        >
          <FiCompass className='size-[26px]' aria-hidden='true' />
        </button>
        <button
          type='button'
          onClick={onHome}
          className={`grid size-[56px] cursor-pointer place-items-center rounded-full border-2 transition-transform hover:scale-110 ${
            isHomeActive
              ? 'border-[#ea4098] bg-white/20 text-[#ea4098]'
              : 'border-transparent text-white'
          }`}
          aria-label='Home'
        >
          <FiHome className='size-[32px]' aria-hidden='true' />
        </button>
      </div>

      <button
        type='button'
        onClick={onOpenComposer}
        className={`absolute top-0 left-1/2 grid size-[76px] -translate-x-1/2 cursor-pointer place-items-center rounded-[15px] border-[5px] transition-transform hover:scale-110 ${
          isComposerActive
            ? 'border-white bg-[#ea4098] text-white shadow-[0_0_0_2px_rgba(234,64,152,0.35)]'
            : 'border-[#ECECEC] bg-[#ECECEC] text-black'
        }`}
        aria-label='Composer'
      >
        <FiPlus className='size-[34px]' aria-hidden='true' />
      </button>
    </div>
  )
}
