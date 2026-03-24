'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '../lib/supabase-browser'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ name?: string; avatar_url?: string } | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('id', data.user.id)
          .single()
        setUser(profile ?? { name: data.user.email })
      }
    })
  }, [])

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">

        {/* Logo — far left */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0" onClick={() => setMenuOpen(false)}>
          <Image src="/logo.png" alt="TableMesh Logo" width={36} height={36} className="w-9 h-9 rounded-xl" />
          <span className="text-xl sm:text-2xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            TableMesh
          </span>
        </Link>

        {/* Desktop nav — center links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/features" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">Features</Link>
          <Link href="/explore" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">Explore</Link>
          <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">Blog</Link>
          <Link href="/partner" className="text-sm font-medium text-[var(--primary)] border border-[var(--primary)] px-4 py-1.5 rounded-full hover:bg-orange-50 transition-colors">For Restaurants</Link>
        </div>

        {/* Desktop right side — Sign In / avatar + Get the App */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <Link href="/account" className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[var(--primary)] transition-colors">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-orange-200" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                  {(user.name ?? 'U')[0].toUpperCase()}
                </div>
              )}
              <span>{user.name?.split(' ')[0] ?? 'Account'}</span>
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] transition-colors">Sign In</Link>
          )}
          <a
            href="https://apps.apple.com/us/app/tablemesh/id6760209899"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg text-sm font-semibold"
          >
            Get the App
          </a>
        </div>

        {/* Mobile: Get the App + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="https://apps.apple.com/us/app/tablemesh/id6760209899"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-full text-sm font-semibold"
          >
            Get the App
          </a>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-orange-100 px-4 py-4 flex flex-col gap-4">
          <Link href="/features" className="text-base font-medium text-gray-700 py-2 border-b border-gray-100" onClick={() => setMenuOpen(false)}>Features</Link>
          <Link href="/explore" className="text-base font-medium text-gray-700 py-2 border-b border-gray-100" onClick={() => setMenuOpen(false)}>Explore</Link>
          <Link href="/blog" className="text-base font-medium text-gray-700 py-2 border-b border-gray-100" onClick={() => setMenuOpen(false)}>Blog</Link>
          <Link href="/partner" className="text-base font-medium text-[var(--primary)] py-2 border-b border-gray-100" onClick={() => setMenuOpen(false)}>For Restaurants →</Link>
          {user ? (
            <Link href="/account" className="flex items-center gap-2 text-base font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="w-7 h-7 rounded-full object-cover border border-orange-200" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                  {(user.name ?? 'U')[0].toUpperCase()}
                </div>
              )}
              My Account
            </Link>
          ) : (
            <Link href="/login" className="text-base font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Sign In</Link>
          )}
        </div>
      )}
    </nav>
  )
}
