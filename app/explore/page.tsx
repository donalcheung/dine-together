'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '../lib/supabase-browser'
import Navbar from '../components/Navbar'

interface DiningRequest {
  id: string
  restaurant_name: string
  restaurant_address: string
  dining_time: string
  seats_available: number
  total_seats: number
  cuisine_type: string | null
  price_level: string | null
  description: string | null
  status: string
  google_place_id: string | null
  photoUrl?: string | null
  host: {
    name: string
    avatar_url: string | null
  } | null
}

const CUISINES = ['All', 'Japanese', 'Korean', 'Chinese', 'Italian', 'Mexican', 'American', 'Indian', 'Thai', 'Mediterranean']

const CUISINE_FALLBACKS: Record<string, string> = {
  japanese: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=75',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=75',
  korean: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=600&q=75',
  chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=75',
  italian: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=75',
  mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=75',
  american: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=75',
  indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=75',
  thai: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&q=75',
  mediterranean: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=75',
  default: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',
}

function getFallbackImage(cuisine: string | null): string {
  if (!cuisine) return CUISINE_FALLBACKS.default
  const lower = cuisine.toLowerCase()
  for (const [key, url] of Object.entries(CUISINE_FALLBACKS)) {
    if (lower.includes(key)) return url
  }
  return CUISINE_FALLBACKS.default
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function cityFromAddress(address: string): string {
  const parts = address.split(',').map(p => p.trim())
  if (parts.length >= 3) {
    const candidate = parts[parts.length - 2]
    if (/^[A-Z]{2}\s+\d{5}/.test(candidate) || /^[A-Z]{2}$/.test(candidate)) {
      return parts[parts.length - 3] || parts[0]
    }
    if (!/\d/.test(candidate)) return candidate
  }
  if (parts.length >= 2) return parts[parts.length - 2]
  return parts[0]
}

// ── Sign-up / Trial Modal ───────────────────────────────────────────────────

interface SignUpModalProps {
  targetId: string | null
  onClose: () => void
  onSuccess: () => void
}

function SignUpModal({ targetId, onClose, onSuccess }: SignUpModalProps) {
  const [mode, setMode] = useState<'choose' | 'signup' | 'success'>('choose')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Please fill in all fields. Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, email, name }, { onConflict: 'id' })
    }
    setLoading(false)
    setMode('success')
    setTimeout(() => {
      onSuccess()
      if (targetId) window.location.href = `/dine/${targetId}`
    }, 1800)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Orange accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-t-3xl sm:rounded-t-3xl" />

        <div className="p-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors text-xl leading-none"
          >
            ×
          </button>

          {mode === 'choose' && (
            <>
              {/* Trial badge */}
              <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                <span>⭐</span> Limited time offer
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1 leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
                Join free & get 7 days of Plus
              </h2>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Sign up now and unlock a free 7-day trial of TableMesh Plus — message hosts, see who&apos;s going, and join any table.
              </p>

              {/* Plus perks */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 mb-5 border border-orange-100">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-3">What you unlock with Plus</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: '💬', text: 'Message hosts' },
                    { icon: '👥', text: 'See who\'s going' },
                    { icon: '🍽', text: 'Join any table' },
                    { icon: '⭐', text: 'Priority seating' },
                    { icon: '🎁', text: 'Restaurant deals' },
                    { icon: '🔔', text: 'Instant alerts' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                      <span>{p.icon}</span> {p.text}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setMode('signup')}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-base mb-3 hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
              >
                Create Free Account →
              </button>

              <div className="relative flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">or download the app</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <div className="flex gap-2.5">
                <a
                  href="https://apps.apple.com/us/app/tablemesh/id6760209899"
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm text-center hover:bg-gray-800 transition-colors"
                >
                  🍎 App Store
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.tablemeshnative"
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm text-center hover:bg-gray-800 transition-colors"
                >
                  ▶ Google Play
                </a>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">No credit card required. Cancel anytime.</p>
            </>
          )}

          {mode === 'signup' && (
            <>
              <button onClick={() => setMode('choose')} className="flex items-center gap-1 text-sm text-gray-400 mb-4 hover:text-gray-600">
                ← Back
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
                Create your account
              </h2>
              <p className="text-sm text-gray-400 mb-5">Your 7-day Plus trial starts immediately.</p>
              <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
                  required
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
                  required
                />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-gray-50"
                  required
                />
                {error && <p className="text-red-500 text-xs px-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-base mt-1 hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-60 shadow-md shadow-orange-200"
                >
                  {loading ? 'Creating account…' : 'Create Account & Start Trial'}
                </button>
              </form>
              <p className="text-center text-xs text-gray-400 mt-3">
                By signing up you agree to our{' '}
                <Link href="/terms-of-service" className="text-orange-500 hover:underline">Terms</Link>
                {' '}and{' '}
                <Link href="/privacy-policy" className="text-orange-500 hover:underline">Privacy Policy</Link>.
              </p>
            </>
          )}

          {mode === 'success' && (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
                Welcome to TableMesh!
              </h2>
              <p className="text-sm text-gray-500">Your 7-day Plus trial is active. Taking you to the table…</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(60px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── Restaurant Card ─────────────────────────────────────────────────────────

interface CardProps {
  request: DiningRequest
  onCardClick: (id: string) => void
}

function RestaurantCard({ request: r, onCardClick }: CardProps) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const photoSrc = r.photoUrl || getFallbackImage(r.cuisine_type)
  const isFull = r.seats_available <= 0

  return (
    <div
      onClick={() => onCardClick(r.id)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all overflow-hidden group flex flex-col cursor-pointer"
    >
      {/* Photo header */}
      <div className="relative h-44 bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden">
        <img
          src={photoSrc}
          alt={r.restaurant_name}
          className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {r.cuisine_type && (
            <span className="text-xs font-bold bg-white/90 text-gray-800 px-2.5 py-1 rounded-full backdrop-blur-sm">
              {r.cuisine_type}
            </span>
          )}
          {r.price_level && (
            <span className="text-xs font-bold bg-white/90 text-gray-800 px-2.5 py-1 rounded-full backdrop-blur-sm">
              {r.price_level}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          {isFull ? (
            <span className="text-xs font-bold bg-red-500 text-white px-2.5 py-1 rounded-full">Full</span>
          ) : (
            <span className="text-xs font-bold bg-green-500 text-white px-2.5 py-1 rounded-full">
              {r.seats_available} left
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h2 className="font-bold text-white text-lg leading-tight drop-shadow-sm group-hover:text-orange-200 transition-colors">
            {r.restaurant_name}
          </h2>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 py-3 flex-1 flex flex-col">
        <p className="text-sm font-semibold text-orange-500 mb-1">📅 {formatDate(r.dining_time)}</p>
        <p className="text-xs text-gray-400 mb-2 truncate">📍 {r.restaurant_address}</p>
        {r.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{r.description}</p>
        )}
        {r.host && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-50 mt-auto">
            {r.host.avatar_url ? (
              <img src={r.host.avatar_url} alt={r.host.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-orange-100" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-500">
                {r.host.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <span className="text-xs text-gray-500">
              Hosted by <span className="font-semibold text-gray-700">{r.host.name}</span>
            </span>
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <div className={`w-full py-3 text-white text-sm font-bold rounded-xl text-center transition-colors ${isFull ? 'bg-gray-400' : 'bg-orange-500 group-hover:bg-orange-600'}`}>
          {isFull ? 'Table Full' : 'View & Join Table →'}
        </div>
      </div>
    </div>
  )
}

// ── App Download Wall ───────────────────────────────────────────────────────

function AppWall({ hiddenCount, onSignUp }: { hiddenCount: number; onSignUp: () => void }) {
  return (
    <div className="relative mt-2">
      {/* Blurred ghost cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pointer-events-none select-none">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-72 opacity-40 blur-sm" />
        ))}
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl border border-orange-100 p-7 sm:p-9 text-center max-w-sm mx-4">
          <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <span>⭐</span> Sign up offer
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            View More on the App
          </h3>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            Sign up free and get a <strong className="text-orange-600">7-day Plus trial</strong> — join tables, message hosts, and see who&apos;s going.
          </p>
          <button
            onClick={onSignUp}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold text-sm mb-3 hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
          >
            Sign Up Free & Start Trial
          </button>
          <div className="flex gap-2.5">
            <a
              href="https://apps.apple.com/us/app/tablemesh/id6760209899"
              className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-xs text-center hover:bg-gray-800 transition-colors"
            >
              🍎 App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.tablemeshnative"
              className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-xs text-center hover:bg-gray-800 transition-colors"
            >
              ▶ Google Play
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────

const DEMO_LIMIT = 6

export default function ExplorePage() {
  const [allItems, setAllItems] = useState<DiningRequest[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [cuisineFilter, setCuisineFilter] = useState('All')
  const [cities, setCities] = useState<string[]>([])
  const [cityFilter, setCityFilter] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [modalTargetId, setModalTargetId] = useState<string | null>(null)
  const [showModalForWall, setShowModalForWall] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session))
  }, [])

  const fetchFeed = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (cuisineFilter !== 'All') params.set('cuisine', cuisineFilter)
      if (cityFilter) params.set('city', cityFilter)

      const res = await fetch(`/api/explore-feed?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setAllItems(data.items || [])
      setTotalCount(data.totalCount || 0)

      // Build city list
      const citySet = new Set<string>()
      ;(data.items || []).forEach((r: DiningRequest) => {
        const c = cityFromAddress(r.restaurant_address)
        if (c && c.length > 1 && !/^\d/.test(c)) citySet.add(c)
      })
      setCities(Array.from(citySet).sort())
    } catch {
      setAllItems([])
    }
    setLoading(false)
  }, [cuisineFilter, cityFilter])

  useEffect(() => { fetchFeed() }, [fetchFeed])

  const filtered = cityFilter
    ? allItems.filter(r => cityFromAddress(r.restaurant_address).toLowerCase() === cityFilter.toLowerCase())
    : allItems

  const visibleItems = filtered.slice(0, DEMO_LIMIT)
  const hiddenCount = Math.max(0, totalCount - DEMO_LIMIT)

  const handleCardClick = (id: string) => {
    if (isLoggedIn) {
      window.location.href = `/dine/${id}`
    } else {
      setModalTargetId(id)
      setShowModalForWall(false)
    }
  }

  const handleWallSignUp = () => {
    setModalTargetId(null)
    setShowModalForWall(true)
  }

  const showModal = modalTargetId !== null || showModalForWall

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Sign-up modal */}
      {showModal && (
        <SignUpModal
          targetId={modalTargetId}
          onClose={() => { setModalTargetId(null); setShowModalForWall(false) }}
          onSuccess={() => setIsLoggedIn(true)}
        />
      )}

      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-8 px-4 text-center bg-gradient-to-b from-orange-50 to-[#faf7f2]">
        {/* Demo badge */}
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          Live tables near you
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
          Dining tables near you
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto mb-6">
          Browse upcoming group meals hosted by real people. Join one, or host your own.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center max-w-xl mx-auto">
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:border-orange-400 shadow-sm"
          >
            <option value="">All cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={cuisineFilter}
            onChange={e => setCuisineFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:border-orange-400 shadow-sm"
          >
            {CUISINES.map(c => <option key={c} value={c}>{c === 'All' ? 'All cuisines' : c}</option>)}
          </select>
        </div>
      </section>

      {/* Results */}
      <main className="max-w-6xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Finding tables near you…</p>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🍽</p>
            <p className="text-gray-500 text-lg mb-2">No tables found right now.</p>
            <p className="text-gray-400 text-sm mb-6">Be the first to host one in your city.</p>
            <a
              href="https://apps.apple.com/us/app/tablemesh/id6760209899"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all"
            >
              Host a Table on TableMesh
            </a>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4 mt-1">
              Showing {visibleItems.length} of {totalCount} upcoming tables
              {cityFilter ? ` in ${cityFilter}` : ''}
            </p>

            {/* 5 visible cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleItems.map(r => (
                <RestaurantCard
                  key={r.id}
                  request={r}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>

            {/* App wall — always shown after the 5 cards */}
            <AppWall
              hiddenCount={hiddenCount}
              onSignUp={handleWallSignUp}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center bg-white">
        <p className="text-sm text-gray-400">
          <Link href="/" className="text-orange-500 hover:underline">TableMesh</Link>
          {' '}— Coordinate meals with friends, coworkers &amp; food lovers
        </p>
        <p className="text-xs text-gray-300 mt-1">© 2025 Sheep Labs LLC. All rights reserved.</p>
      </footer>
    </div>
  )
}
