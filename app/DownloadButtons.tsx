'use client'
import Image from 'next/image'
import { useState, useRef, useCallback } from 'react'

interface DownloadButtonsProps {
  variant: 'hero' | 'cta'
}

const APP_STORE_URL = 'https://apps.apple.com/us/app/tablemesh/id6760209899'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.tablemeshnative'

// Strip non-digits for validation
function digitsOnly(s: string) {
  return s.replace(/\D/g, '')
}

// Format as (XXX) XXX-XXXX while typing
function formatPhoneDisplay(raw: string): string {
  const d = digitsOnly(raw).slice(0, 10)
  if (d.length <= 3) return d
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

function isValidPhone(raw: string): boolean {
  return digitsOnly(raw).length === 10
}

type Status = 'idle' | 'loading' | 'success' | 'error'

function PhoneGate({ variant }: { variant: 'hero' | 'cta' }) {
  const [display, setDisplay] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const valid = isValidPhone(display)
  const isHero = variant === 'hero'

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = digitsOnly(e.target.value).slice(0, 10)
    setDisplay(formatPhoneDisplay(digits))
    setErrorMsg('')
    if (status === 'error') setStatus('idle')
  }, [status])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || status === 'loading') return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/send-download-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: digitsOnly(display),
          source: isHero ? 'hero' : 'cta',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        return
      }
      setStatus('success')
      setUnlocked(true)

      // Push event to Google Tag Manager dataLayer
      if (typeof window !== 'undefined') {
        ;(window as any).dataLayer = (window as any).dataLayer || []
        ;(window as any).dataLayer.push({
          event: 'phone_submit',
          phone_source: isHero ? 'hero' : 'cta',
          sms_sent: data.smsSent ?? false,
        })
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please check your connection and try again.')
    }
  }, [valid, status, display, isHero])

  return (
    <div className={`w-full ${isHero ? 'max-w-xs sm:max-w-md' : 'max-w-sm sm:max-w-lg mx-auto'}`}>

      {/* ── Phone capture form ── */}
      {!unlocked && (
        <form onSubmit={handleSubmit} className="mb-4 sm:mb-5">
          <p className={`text-xs font-medium mb-2 ${isHero ? 'text-white/70' : 'text-white/80'}`}>
            📲 Get the download link sent straight to your phone
          </p>
          <div className="flex items-stretch gap-2">
            {/* Country code badge */}
            <div className={`flex items-center gap-1.5 px-3 rounded-xl text-sm font-semibold select-none flex-shrink-0
              ${isHero
                ? 'bg-white/15 text-white border border-white/20'
                : 'bg-white/20 text-white border border-white/30'
              }`}>
              <span className="text-base leading-none">🇺🇸</span>
              <span>+1</span>
            </div>

            {/* Phone input */}
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="(555) 867-5309"
              value={display}
              onChange={handleChange}
              disabled={status === 'loading'}
              className={`flex-1 min-w-0 px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all
                placeholder:text-gray-400 bg-white text-gray-900 border-2
                ${
                  valid
                    ? 'border-green-400 ring-1 ring-green-300'
                    : status === 'error'
                      ? 'border-red-400 ring-1 ring-red-300'
                      : 'border-transparent focus:border-orange-400 focus:ring-1 focus:ring-orange-300'
                }
              `}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={!valid || status === 'loading'}
              className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-bold transition-all
                ${
                  valid && status !== 'loading'
                    ? 'bg-[var(--primary)] hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-500/30 hover:scale-105 active:scale-95'
                    : 'bg-white/20 text-white/40 cursor-not-allowed'
                }
              `}
              aria-label="Send download link"
            >
              {status === 'loading' ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <span className="whitespace-nowrap">Send link →</span>
              )}
            </button>
          </div>

          {/* Inline feedback */}
          {errorMsg && (
            <p className="mt-2 text-xs text-red-300 flex items-center gap-1">
              <span>⚠️</span> {errorMsg}
            </p>
          )}
          {valid && status === 'idle' && (
            <p className="mt-2 text-xs text-green-300 flex items-center gap-1">
              <span>✓</span> Looks good — tap &ldquo;Send link&rdquo; to unlock the download buttons
            </p>
          )}
        </form>
      )}

      {/* ── Success banner ── */}
      {unlocked && (
        <div className="mb-4 flex items-center gap-3 bg-green-500/20 border border-green-400/40 rounded-xl px-4 py-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="text-white text-sm font-semibold">Link sent to your phone!</p>
            <p className="text-white/70 text-xs">Check your texts — the download link is on its way.</p>
          </div>
        </div>
      )}

      {/* ── Download badges ── */}
      <div className={`flex flex-row items-center gap-3 sm:gap-4 mb-3 ${isHero ? '' : 'justify-center'} relative`}>
        {/* Lock overlay — tapping focuses the phone input */}
        {!unlocked && (
          <div
            className="absolute inset-0 z-10 rounded-xl flex items-center justify-center cursor-pointer"
            onClick={() => inputRef.current?.focus()}
            title="Enter your phone number to unlock"
          >
            <div className="absolute inset-0 bg-black/40 rounded-xl backdrop-blur-[1px]" />
            <div className="relative flex items-center gap-2 bg-black/60 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Enter your number to unlock
            </div>
          </div>
        )}

        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => { if (!unlocked) e.preventDefault() }}
          className={`transition-all ${isHero ? 'flex-1 sm:flex-none' : ''} ${unlocked ? 'hover:scale-105' : 'pointer-events-none'}`}
          tabIndex={unlocked ? 0 : -1}
          aria-disabled={!unlocked}
        >
          <Image
            src="/google-play-badge.png"
            alt="Get it on Google Play"
            width={isHero ? 180 : 200}
            height={isHero ? 54 : 60}
            className={`${isHero ? 'h-[46px] sm:h-[54px]' : 'h-[50px] sm:h-[60px]'} w-auto transition-opacity ${!unlocked ? 'opacity-40' : 'opacity-100'}`}
          />
        </a>

        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => { if (!unlocked) e.preventDefault() }}
          className={`transition-all ${isHero ? 'flex-1 sm:flex-none' : ''} ${unlocked ? 'hover:scale-105' : 'pointer-events-none'}`}
          tabIndex={unlocked ? 0 : -1}
          aria-disabled={!unlocked}
        >
          <Image
            src="/app-store-badge.svg"
            alt="Download on the App Store"
            width={isHero ? 180 : 200}
            height={isHero ? 54 : 60}
            className={`${isHero ? 'h-[46px] sm:h-[54px]' : 'h-[50px] sm:h-[60px]'} w-auto transition-opacity ${!unlocked ? 'opacity-40' : 'opacity-100'}`}
          />
        </a>
      </div>

      <p className={`text-xs ${isHero ? 'text-white/50' : 'text-white/60 text-center sm:text-sm'}`}>
        {unlocked
          ? 'Available now on iOS and Android.'
          : 'Enter your number above to unlock the download buttons.'}
      </p>
    </div>
  )
}

export default function DownloadButtons({ variant }: DownloadButtonsProps) {
  return <PhoneGate variant={variant} />
}
