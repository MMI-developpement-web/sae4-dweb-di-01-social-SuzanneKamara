export default function ProfileEditFormSkeleton() {
  return (
    <div className='w-full max-w-[600px] space-y-6 p-6 bg-white rounded-lg border border-gray-200'>
      {/* Banner Skeleton */}
      <div>
        <div className='h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse'></div>
        <div className='mb-3 rounded-lg overflow-hidden border border-gray-200'>
          <div className='w-full h-[200px] bg-gray-200 animate-pulse' />
        </div>
        <div className='flex gap-2 mb-3'>
          <div className='flex-1 h-10 bg-gray-200 rounded animate-pulse'></div>
          <div className='flex-1 h-10 bg-gray-200 rounded animate-pulse'></div>
        </div>
        <div className='w-full h-10 bg-gray-200 rounded-lg animate-pulse'></div>
      </div>

      {/* Avatar Skeleton */}
      <div>
        <div className='h-4 w-32 bg-gray-200 rounded mb-3 animate-pulse'></div>
        <div className='mb-3 w-[100px] h-[100px] rounded-full bg-gray-200 animate-pulse'></div>
        <div className='flex gap-2 mb-3'>
          <div className='flex-1 h-10 bg-gray-200 rounded animate-pulse'></div>
          <div className='flex-1 h-10 bg-gray-200 rounded animate-pulse'></div>
        </div>
        <div className='w-full h-10 bg-gray-200 rounded-lg animate-pulse'></div>
      </div>

      {/* Bio Skeleton */}
      <div>
        <div className='h-4 w-20 bg-gray-200 rounded mb-3 animate-pulse'></div>
        <div className='w-full h-[100px] bg-gray-200 rounded-lg animate-pulse'></div>
      </div>

      {/* Location Skeleton */}
      <div>
        <div className='h-4 w-28 bg-gray-200 rounded mb-3 animate-pulse'></div>
        <div className='w-full h-10 bg-gray-200 rounded-lg animate-pulse'></div>
      </div>

      {/* Website Skeleton */}
      <div>
        <div className='h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse'></div>
        <div className='w-full h-10 bg-gray-200 rounded-lg animate-pulse'></div>
      </div>

      {/* Buttons Skeleton */}
      <div className='flex flex-col gap-3 pt-4'>
        <div className='flex gap-3'>
          <div className='flex-1 h-12 bg-gray-200 rounded-lg animate-pulse'></div>
          <div className='flex-1 h-12 bg-gray-200 rounded-lg animate-pulse'></div>
        </div>
        <div className='w-full h-12 bg-gray-200 rounded-lg animate-pulse'></div>
      </div>
    </div>
  )
}
