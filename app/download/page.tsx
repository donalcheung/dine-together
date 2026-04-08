'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

const APP_STORE_URL = 'https://apps.apple.com/us/app/tablemesh/id6760209899'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.tablemeshnative'
const LANDING_URL = 'https://tablemesh.com'

type Platform = 'ios' | 'android' | 'unknown'

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent || ''
  // iOS: iPhone, iPad, iPod
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  // macOS Safari — could be iPad with desktop mode
  if (/Macintosh/i.test(ua) && 'ontouchend' in document) return 'ios'
  // Android
  if (/Android/i.test(ua)) return 'android'
  return 'unknown'
}

export default function DownloadPage() {
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const detected = detectPlatform()
    setPlatform(detected)

    // Auto-redirect on mobile
    if (detected === 'ios') {
      setRedirecting(true)
      window.location.href = APP_STORE_URL
    } else if (detected === 'android') {
      setRedirecting(true)
      window.location.href = PLAY_STORE_URL
    }
    // On desktop, show both options
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1207] via-[#2d1f0e] to-[#1a1207] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Logo / Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-500/30 mb-4">
            <span className="text-4xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TableMesh</h1>
          <p className="text-white/60 text-sm">Bring Everyone to the Table</p>
        </div>

        {redirecting ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-6 py-4">
              <svg className="w-5 h-5 animate-spin text-orange-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-white text-sm font-medium">
                Redirecting to the {platform === 'ios' ? 'App Store' : 'Play Store'}...
              </p>
            </div>
            <p className="text-white/40 text-xs">
              Not redirecting?{' '}
              <a
                href={platform === 'ios' ? APP_STORE_URL : PLAY_STORE_URL}
                className="text-orange-400 underline hover:text-orange-300"
              >
                Tap here
              </a>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-white/70 text-sm">
              Download TableMesh for your device:
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
                  className="h-[56px] w-auto"
                />
              </a>
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
                  className="h-[56px] w-auto"
                />
              </a>
            </div>

            <a
              href={LANDING_URL}
              className="inline-block text-white/40 text-xs hover:text-white/60 transition-colors"
            >
              ← Back to tablemesh.app
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
