'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'

const screens = [
  {
    src: '/Screenshots/iPhone/Discover.png',
    label: 'Discover Meals',
    desc: 'Browse dining experiences near you',
    tag: 'All Diners',
    tagColor: 'bg-orange-100 text-orange-700',
  },
  {
    src: '/Screenshots/iPhone/food buddies.png',
    label: 'Find Food Buddies',
    desc: 'Connect with locals who share your taste in food',
    tag: 'Foodies & Explorers',
    tagColor: 'bg-purple-100 text-purple-700',
  },
  {
    src: '/Screenshots/iPhone/Group.png',
    label: 'Dining Groups',
    desc: 'Build your community — free for organizers',
    tag: 'Community',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    src: '/Screenshots/iPhone/Map.png',
    label: 'Discover on Map',
    desc: 'See live meal requests near you',
    tag: 'Travelers & Newcomers',
    tagColor: 'bg-green-100 text-green-700',
  },
  {
    src: '/Screenshots/iPhone/My Meals.png',
    label: 'My Meals',
    desc: 'Track upcoming and past meals',
    tag: 'All Diners',
    tagColor: 'bg-orange-100 text-orange-700',
  },
  {
    src: '/Screenshots/iPhone/Profile.png',
    label: 'Your Profile',
    desc: 'Level up your foodie reputation as you dine',
    tag: 'All Diners',
    tagColor: 'bg-red-100 text-red-700',
  },
]

export default function ScreenshotGallery() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
    // Estimate active card index based on scroll position
    const cardWidth = el.scrollWidth / screens.length
    setActiveIndex(Math.round(el.scrollLeft / cardWidth))
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    // On mobile use smaller scroll amount to match smaller card size
    const isMobile = window.innerWidth < 640
    const amount = isMobile ? 220 : 312
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-[45%] -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all border border-gray-200"
          aria-label="Scroll left"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-0 top-[45%] -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all border border-gray-200"
          aria-label="Scroll right"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-8 overflow-x-auto pb-6 sm:pb-8 px-2 sm:px-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {screens.map((screen, i) => (
          <div key={i} className="flex-shrink-0 snap-center">
            {/* Phone frame — smaller on mobile (200px) vs desktop (280px) */}
            <div className="relative mx-auto w-[200px] sm:w-[280px]">
              <div className="bg-gray-900 rounded-[2.5rem] sm:rounded-[3rem] p-2.5 sm:p-3 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-6 sm:h-7 bg-gray-900 rounded-b-2xl z-10" />
                <div className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-white">
                  <Image
                    src={screen.src}
                    alt={screen.label}
                    width={280}
                    height={607}
                    className="w-full h-auto"
                    sizes="(max-width: 640px) 200px, 280px"
                    quality={80}
                  />
                </div>
              </div>
            </div>
            <div className="text-center mt-4 sm:mt-6 w-[200px] sm:w-[280px] mx-auto">
              <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1 sm:mb-2 ${screen.tagColor}`}>
                {screen.tag}
              </span>
              <h3 className="text-sm sm:text-lg font-bold text-[var(--neutral)]">{screen.label}</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">{screen.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: dot indicators + swipe hint */}
      <div className="flex md:hidden flex-col items-center gap-2 mt-2">
        <div className="flex gap-1.5">
          {screens.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${i === activeIndex ? 'w-4 h-2 bg-[var(--primary)]' : 'w-2 h-2 bg-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">Swipe to explore →</span>
      </div>
    </div>
  )
}
