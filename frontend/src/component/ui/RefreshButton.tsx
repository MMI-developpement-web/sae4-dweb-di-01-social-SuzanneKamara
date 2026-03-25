import { FiRefreshCw } from 'react-icons/fi';

interface RefreshButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export default function RefreshButton({ onClick, isLoading = false }: RefreshButtonProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={isLoading}
      className='flex items-center gap-[8px] rounded-[10px] bg-[#9e33fd] px-[10px] py-[5px] text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
      aria-label='Rafraîchir'
    >
      <FiRefreshCw
        className={`size-[24px] ${isLoading ? 'animate-spin' : ''}`}
        aria-hidden='true'
      />
      <span className='text-[16px] font-normal leading-[19px]'>Refresh</span>
    </button>
  );
}
