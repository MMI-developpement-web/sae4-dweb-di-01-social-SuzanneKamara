import React, { useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiVolume2, FiVolumeX } from 'react-icons/fi'

interface Media {
  id: string | number
  media_type: string
  file_url: string
  file_size: number
}

interface MediaCarouselProps {
  media: Media[]
  className?: string
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ media, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [videoMuted, setVideoMuted] = useState(true)

  if (!media || media.length === 0) {
    return null
  }

  const currentMedia = media[currentIndex]
  const isVideo = currentMedia.media_type.startsWith('video/')
  const isImage = currentMedia.media_type.startsWith('image/')

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
  }

  return (
    <div className={` overflow-hidden  ${className}`}>
      {/* Media Container */}
      <div className='relative w-full '>
        {/* Flexible container that adapts to media aspect ratio */}
        <div className='relative flex items-center justify-center w-full'>
          {isImage && (
            <img
              src={currentMedia.file_url}
              alt='Tweet media'
              className='w-full h-auto object-contain'
            />
          )}
          {isVideo && (
            <video
              src={currentMedia.file_url}
              className='w-full h-auto object-contain'
              muted={videoMuted}
              autoPlay
              loop
            />
          )}

          {/* Navigation Arrows */}
          {media.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className='absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all z-10 backdrop-blur-sm'
                aria-label='Previous media'
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                onClick={goToNext}
                className='absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all z-10 backdrop-blur-sm'
                aria-label='Next media'
              >
                <FiChevronRight size={20} />
              </button>
            </>
          )}

          {/* Video Mute Button */}
          {isVideo && (
            <button
              onClick={() => setVideoMuted(!videoMuted)}
              className='absolute bottom-3 right-3 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all z-10 backdrop-blur-sm'
              aria-label='Toggle mute'
            >
              {videoMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
            </button>
          )}

          {/* Index Counter */}
          {media.length > 1 && (
            <div className='absolute top-3 right-3 bg-black/60 px-2 py-1 rounded text-white text-xs font-medium backdrop-blur-sm'>
              {currentIndex + 1}/{media.length}
            </div>
          )}
        </div>

        {/* Indicators Dots */}
        {media.length > 1 && (
          <div className='flex justify-center gap-1.5 px-3 py-2 bg-black/40'>
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 transition-all ${
                  index === currentIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/70 w-1.5'
                }`}
                aria-label={`Go to media ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaCarousel
