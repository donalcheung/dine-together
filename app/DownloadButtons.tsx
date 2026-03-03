'use client'

import { useState } from 'react'
import Image from 'next/image'

interface DownloadButtonsProps {
  variant: 'hero' | 'cta'
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.tablemeshnative'

export default function DownloadButtons({ variant }: DownloadButtonsProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showIosForm, setShowIosForm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || "You're on the list! We'll notify you when the iOS app launches.")
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  if (variant === 'hero') {
    return (
      <div className="w-full max-w-md">
        {/* Store Badges */}
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform hover:scale-105"
          >
            <Image
              src="/google-play-badge.png"
              alt="Get it on Google Play"
              width={180}
              height={54}
              className="h-[54px] w-auto"
            />
          </a>
          <button
            onClick={() => setShowIosForm(!showIosForm)}
            className="flex items-center gap-2.5 h-[54px] px-5 bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/25 transition-all"
          >
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z"/>
            </svg>
            <div className="text-left">
              <div className="text-white/70 text-[10px] leading-tight uppercase tracking-wide">Coming Soon on</div>
              <div className="text-white text-base font-semibold leading-tight">App Store</div>
            </div>
          </button>
        </div>

        {/* iOS Waitlist Form (expandable) */}
        {showIosForm && (
          <div className="mt-3 animate-in slide-in-from-top-2">
            {status === 'success' ? (
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl px-5 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-white font-semibold text-sm">You&apos;re on the iOS waitlist!</span>
                </div>
                <p className="text-white/80 text-sm">{message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Email for iOS launch notification"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
                  required
                  className="flex-1 px-4 py-2.5 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-lg font-semibold hover:bg-[var(--accent)]/90 transition-all disabled:opacity-60 text-sm whitespace-nowrap"
                >
                  {status === 'loading' ? 'Joining...' : 'Notify Me'}
                </button>
              </form>
            )}
            {status === 'error' && (
              <p className="text-red-300 text-sm mt-2">{message}</p>
            )}
          </div>
        )}

        <p className="text-white/50 text-xs mt-3">Available now on Android. iOS coming soon.</p>
      </div>
    )
  }

  // CTA variant (bottom section)
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Store Badges - centered */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
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
            className="h-[60px] w-auto"
          />
        </a>
        <button
          onClick={() => setShowIosForm(!showIosForm)}
          className="flex items-center gap-2.5 h-[60px] px-6 bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/25 transition-all"
        >
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11Z"/>
          </svg>
          <div className="text-left">
            <div className="text-white/70 text-[10px] leading-tight uppercase tracking-wide">Coming Soon on</div>
            <div className="text-white text-lg font-semibold leading-tight">App Store</div>
          </div>
        </button>
      </div>

      {/* iOS Waitlist Form (expandable) */}
      {showIosForm && (
        <div className="mt-2 animate-in slide-in-from-top-2">
          {status === 'success' ? (
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-5">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span className="text-white font-bold text-lg">You&apos;re on the iOS waitlist!</span>
              </div>
              <p className="text-white/80 text-sm text-center">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Email for iOS launch notification"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
                required
                className="flex-1 px-5 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-base"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-white text-[var(--primary)] rounded-xl font-bold hover:bg-white/90 transition-all hover:shadow-lg disabled:opacity-60 text-base whitespace-nowrap"
              >
                {status === 'loading' ? 'Joining...' : 'Notify Me'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="text-red-200 text-sm mt-3 text-center">{message}</p>
          )}
        </div>
      )}

      <p className="text-white/60 text-sm mt-4 text-center">Available now on Android. iOS coming soon.</p>
    </div>
  )
}
