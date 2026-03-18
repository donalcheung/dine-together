'use client'

import Image from 'next/image'

interface DownloadButtonsProps {
  variant: 'hero' | 'cta'
}

const APP_STORE_URL = 'https://apps.apple.com/us/app/tablemesh/id6760209899'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.tablemeshnative'

export default function DownloadButtons({ variant }: DownloadButtonsProps) {
  if (variant === 'hero') {
    return (
      <div className="w-full max-w-xs sm:max-w-md">
        <div className="flex flex-row items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105 flex-1 sm:flex-none"
          >
            <Image
              src="/google-play-badge.png"
              alt="Get it on Google Play"
              width={180}
              height={54}
              className="h-[46px] sm:h-[54px] w-auto"
            />
          </a>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105 flex-1 sm:flex-none"
          >
            <Image
              src="/app-store-badge.svg"
              alt="Download on the App Store"
              width={180}
              height={54}
              className="h-[46px] sm:h-[54px] w-auto"
            />
          </a>
        </div>
        <p className="text-white/50 text-xs">Available now on iOS and Android.</p>
      </div>
    )
  }

  // CTA variant (bottom section)
  return (
    <div className="w-full max-w-sm sm:max-w-lg mx-auto">
      <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105"
        >
          <Image
            src="/google-play-badge.png"
            alt="Get it on Google Play"
            width={200}
            height={60}
            className="h-[50px] sm:h-[60px] w-auto"
          />
        </a>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform hover:scale-105"
        >
          <Image
            src="/app-store-badge.svg"
            alt="Download on the App Store"
            width={200}
            height={60}
            className="h-[50px] sm:h-[60px] w-auto"
          />
        </a>
      </div>
      <p className="text-white/60 text-xs sm:text-sm text-center">Available now on iOS and Android.</p>
    </div>
  )
}
