'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMenuOpen(false)}>
          <Image src="/logo.png" alt="TableMesh" width={32} height={32} className="w-8 h-8 rounded-xl" />
          <span className="text-xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
            TableMesh
          </span>
        </Link>

        {/* Desktop center links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/explore" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Explore</Link>
          <Link href="/features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Features</Link>
          <Link href="/blog" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Blog</Link>
        </div>

        {/* Desktop right — Get the App only */}
        <div className="hidden md:flex items-center shrink-0">
          <a
            href="https://apps.apple.com/us/app/tablemesh/id6760209899"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[var(--primary)] text-white rounded-full text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all hover:shadow-md"
          >
            Get the App
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col">
          <Link href="/explore" className="text-sm font-medium text-gray-700 py-3 border-b border-gray-100" onClick={() => setMenuOpen(false)}>Explore</Link>
          <Link href="/features" className="text-sm font-medium text-gray-700 py-3 border-b border-gray-100" onClick={() => setMenuOpen(false)}>Features</Link>
          <Link href="/blog" className="text-sm font-medium text-gray-700 py-3 border-b border-gray-100" onClick={() => setMenuOpen(false)}>Blog</Link>
          <Link href="/partner" className="text-sm font-medium text-gray-700 py-3 border-b border-gray-100" onClick={() => setMenuOpen(false)}>For Restaurants</Link>
          <a
            href="https://apps.apple.com/us/app/tablemesh/id6760209899"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full text-center py-3 bg-[var(--primary)] text-white rounded-full text-sm font-semibold"
            onClick={() => setMenuOpen(false)}
          >
            Get the App
          </a>
        </div>
      )}
    </nav>
  )
}
