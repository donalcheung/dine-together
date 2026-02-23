'use client'

import { useState } from 'react'

interface WaitlistFormProps {
  variant: 'hero' | 'cta'
}

export default function WaitlistForm({ variant }: WaitlistFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

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
        setMessage(data.message || "You're on the list! We'll email you when TableMesh launches.")
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
        {status === 'success' ? (
          <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="text-white font-semibold text-sm">You&apos;re on the list!</span>
            </div>
            <p className="text-white/80 text-sm">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-semibold hover:bg-[var(--accent)]/90 transition-all hover:shadow-lg disabled:opacity-60 text-sm whitespace-nowrap"
            >
              {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="text-red-300 text-sm mt-2">{message}</p>
        )}
        {status === 'idle' && (
          <p className="text-white/50 text-xs mt-3">Be the first to know when we launch. No spam, ever.</p>
        )}
      </div>
    )
  }

  // CTA variant (bottom section, white on gradient background)
  return (
    <div className="w-full max-w-lg mx-auto">
      {status === 'success' ? (
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-5">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            <span className="text-white font-bold text-lg">You&apos;re on the list!</span>
          </div>
          <p className="text-white/80 text-sm text-center">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
            required
            className="flex-1 px-5 py-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-base"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-8 py-4 bg-white text-[var(--primary)] rounded-xl font-bold hover:bg-white/90 transition-all hover:shadow-lg disabled:opacity-60 text-base whitespace-nowrap"
          >
            {status === 'loading' ? 'Joining...' : 'Join the Waitlist'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-red-200 text-sm mt-3 text-center">{message}</p>
      )}
      {status === 'idle' && (
        <p className="text-white/60 text-sm mt-4 text-center">Be the first to know when we launch. No spam, ever.</p>
      )}
    </div>
  )
}
