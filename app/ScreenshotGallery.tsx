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

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 10)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
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
    el.scrollBy({ left: direction === 'left' ? -312 : 312, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all border border-gray-200"
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
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all border border-gray-200"
          aria-label="Scroll right"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto pb-8 px-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {screens.map((screen, i) => (
          <div key={i} className="flex-shrink-0 snap-center">
            <div className="relative mx-auto" style={{ width: '280px' }}>
              {/* Phone frame */}
              <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-10" />
                <div className="rounded-[2.5rem] overflow-hidden bg-white">
                  <Image
                    src={screen.src}
                    alt={screen.label}
                    width={280}
                    height={607}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
            <div className="text-center mt-6">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${screen.tagColor}`}>
                {screen.tag}
              </span>
              <h3 className="text-lg font-bold text-[var(--neutral)]">{screen.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{screen.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex md:hidden justify-center mt-4 gap-2">
        <span className="text-sm text-gray-400">Swipe to explore</span>
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </div>
    </div>
  )
}
