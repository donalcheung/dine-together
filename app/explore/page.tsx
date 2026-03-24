'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '../lib/supabase-browser'

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
  host: {
    name: string
    avatar_url: string | null
  } | null
}

const CUISINES = ['All', 'Japanese', 'Korean', 'Chinese', 'Italian', 'Mexican', 'American', 'Indian', 'Thai', 'Mediterranean', 'Other']
const PRICE_LEVELS = ['All', '$', '$$', '$$$', '$$$$']

// Cuisine-type fallback images (Unsplash food photos, no API key needed)
const CUISINE_FALLBACKS: Record<string, string> = {
  japanese: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
  korean: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800&q=80',
  chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
  italian: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  american: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  thai: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80',
  mediterranean: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  bbq: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80',
  seafood: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
  ramen: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
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

// Extract proper city name from address like "123 Main St, Chicago, IL 60601"
function cityFromAddress(address: string): string {
  const parts = address.split(',').map(p => p.trim())
  // Address format: "Street, City, State ZIP" or "Street, City, State, Country"
  // City is typically the second-to-last or third-to-last segment
  if (parts.length >= 3) {
    // parts[-2] is usually "State ZIP", parts[-3] is city
    const candidate = parts[parts.length - 2]
    // If it looks like "IL 60601" or "NY 10001", go one more back
    if (/^[A-Z]{2}\s+\d{5}/.test(candidate) || /^[A-Z]{2}$/.test(candidate)) {
      return parts[parts.length - 3] || parts[0]
    }
    // If it's "Chicago" or "New York" style, use it
    if (!/\d/.test(candidate)) return candidate
  }
  if (parts.length >= 2) return parts[parts.length - 2]
  return parts[0]
}

// Photo cache to avoid redundant API calls within the session
const photoCache = new Map<string, string | null>()

async function getRestaurantPhoto(placeId: string | null, cuisine: string | null): Promise<string> {
  if (!placeId) return getFallbackImage(cuisine)

  if (photoCache.has(placeId)) {
    return photoCache.get(placeId) || getFallbackImage(cuisine)
  }

  try {
    const res = await fetch(`/api/places-photo?place_id=${encodeURIComponent(placeId)}`)
    if (res.ok) {
      const data = await res.json()
      const url = data.photoUrl || null
      photoCache.set(placeId, url)
      return url || getFallbackImage(cuisine)
    }
  } catch {
    // fall through to fallback
  }
  photoCache.set(placeId, null)
  return getFallbackImage(cuisine)
}

// ── Sign-up Gate Modal ──────────────────────────────────────────────────────

interface SignUpModalProps {
  targetHref: string
  onClose: () => void
}

function SignUpModal({ targetHref, onClose }: SignUpModalProps) {
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
    // Upsert profile
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, email, name }, { onConflict: 'id' })
    }
    setLoading(false)
    setMode('success')
    // Redirect to the table detail page after a short delay
    setTimeout(() => { window.location.href = targetHref }, 1500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 pb-8 z-10 animate-slide-up">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors text-lg"
        >
          ×
        </button>

        {mode === 'choose' && (
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🍽</div>
              <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
                Join this table
              </h2>
              <p className="text-sm text-gray-500">
                Create a free account to RSVP, message the host, and see who else is going.
              </p>
            </div>

            <button
              onClick={() => setMode('signup')}
              className="w-full py-3.5 bg-[var(--primary)] text-white rounded-2xl font-bold text-base mb-3 hover:bg-[var(--primary-dark)] transition-colors"
            >
              Create Free Account
            </button>

            <div className="relative flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or get the app</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="flex gap-3">
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

            <p className="text-center text-xs text-gray-400 mt-4">
              Already have an account?{' '}
              <button onClick={() => setMode('signup')} className="text-[var(--primary)] font-medium hover:underline">
                Sign in
              </button>
            </p>
          </>
        )}

        {mode === 'signup' && (
          <>
            <button
              onClick={() => setMode('choose')}
              className="flex items-center gap-1 text-sm text-gray-500 mb-4 hover:text-gray-700"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
              Create your account
            </h2>
            <p className="text-sm text-gray-500 mb-5">Free forever. No credit card needed.</p>

            <form onSubmit={handleSignUp} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--primary)] bg-gray-50"
                required
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--primary)] bg-gray-50"
                required
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[var(--primary)] bg-gray-50"
                required
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[var(--primary)] text-white rounded-2xl font-bold text-base mt-1 hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-60"
              >
                {loading ? 'Creating account…' : 'Create Account & View Table'}
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-4">
              By signing up you agree to our{' '}
              <Link href="/terms-of-service" className="text-[var(--primary)] hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy-policy" className="text-[var(--primary)] hover:underline">Privacy Policy</Link>.
            </p>
          </>
        )}

        {mode === 'success' && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
              Account created!
            </h2>
            <p className="text-sm text-gray-500">Taking you to the table…</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Restaurant Card ─────────────────────────────────────────────────────────

interface CardProps {
  request: DiningRequest
  onJoinClick: (id: string) => void
  isLoggedIn: boolean
}

function RestaurantCard({ request: r, onJoinClick, isLoggedIn }: CardProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoLoaded, setPhotoLoaded] = useState(false)

  useEffect(() => {
    getRestaurantPhoto(r.google_place_id, r.cuisine_type).then(setPhotoUrl)
  }, [r.google_place_id, r.cuisine_type])

  const isFull = r.seats_available <= 0

  const handleClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault()
      onJoinClick(r.id)
    }
  }

  return (
    <Link
      href={`/dine/${r.id}`}
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all overflow-hidden group flex flex-col"
    >
      {/* Photo header */}
      <div className="relative h-44 bg-gradient-to-br from-orange-100 to-amber-100 overflow-hidden">
        {photoUrl && (
          <img
            src={photoUrl}
            alt={r.restaurant_name}
            className={`w-full h-full object-cover transition-opacity duration-500 ${photoLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setPhotoLoaded(true)}
            onError={() => setPhotoUrl(getFallbackImage(r.cuisine_type))}
          />
        )}
        {/* Gradient overlay */}
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

        {/* Seats badge */}
        <div className="absolute top-3 right-3">
          {isFull ? (
            <span className="text-xs font-bold bg-red-500 text-white px-2.5 py-1 rounded-full">Full</span>
          ) : (
            <span className="text-xs font-bold bg-green-500 text-white px-2.5 py-1 rounded-full">
              {r.seats_available} seat{r.seats_available !== 1 ? 's' : ''} left
            </span>
          )}
        </div>

        {/* Restaurant name overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h2 className="font-bold text-white text-lg leading-tight drop-shadow-sm group-hover:text-orange-200 transition-colors">
            {r.restaurant_name}
          </h2>
        </div>
      </div>

      {/* Card body */}
      <div className="px-4 py-3 flex-1 flex flex-col">
        <p className="text-sm font-semibold text-[var(--primary)] mb-1">
          📅 {formatDate(r.dining_time)}
        </p>
        <p className="text-xs text-gray-400 mb-2 truncate">
          📍 {r.restaurant_address}
        </p>
        {r.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{r.description}</p>
        )}

        {/* Host row */}
        {r.host && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-50 mt-auto">
            {r.host.avatar_url ? (
              <img src={r.host.avatar_url} alt={r.host.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-orange-100" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-[var(--primary)] ring-2 ring-orange-50">
                {r.host.name?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <span className="text-xs text-gray-500">
              Hosted by <span className="font-semibold text-gray-700">{r.host.name}</span>
            </span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <div className={`w-full py-3 text-white text-sm font-bold rounded-xl text-center transition-colors ${isFull ? 'bg-gray-400' : 'bg-[var(--primary)] group-hover:bg-[var(--primary-dark)]'}`}>
          {isFull ? 'Table Full' : 'View & Join Table →'}
        </div>
      </div>
    </Link>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [requests, setRequests] = useState<DiningRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [cuisineFilter, setCuisineFilter] = useState('All')
  const [priceFilter, setPriceFilter] = useState('All')
  const [cities, setCities] = useState<string[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [modalTargetId, setModalTargetId] = useState<string | null>(null)

  // Check auth state
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session)
    })
  }, [])

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    let query = supabase
      .from('dining_requests')
      .select(`
        id, restaurant_name, restaurant_address, dining_time,
        seats_available, total_seats, cuisine_type, price_level,
        description, status, google_place_id,
        host:profiles!dining_requests_host_id_fkey(name, avatar_url)
      `)
      .eq('status', 'open')
      .eq('visibility', 'public')
      .gt('dining_time', new Date().toISOString())
      .order('dining_time', { ascending: true })
      .limit(60)

    if (cuisineFilter !== 'All') query = query.ilike('cuisine_type', `%${cuisineFilter}%`)
    if (priceFilter !== 'All') query = query.eq('price_level', priceFilter)

    const { data, error } = await query
    if (!error && data) {
      const items = data as unknown as DiningRequest[]
      setRequests(items)

      // Build deduplicated city list from proper city names
      const citySet = new Set<string>()
      items.forEach(r => {
        const c = cityFromAddress(r.restaurant_address)
        if (c && c.length > 1 && !/^\d/.test(c)) citySet.add(c)
      })
      setCities(Array.from(citySet).sort())
    }
    setLoading(false)
  }, [cuisineFilter, priceFilter])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const filtered = cityFilter
    ? requests.filter(r => cityFromAddress(r.restaurant_address).toLowerCase() === cityFilter.toLowerCase())
    : requests

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sign-up modal */}
      {modalTargetId && (
        <SignUpModal
          targetHref={`/dine/${modalTargetId}`}
          onClose={() => setModalTargetId(null)}
        />
      )}

      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-40 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="TableMesh" width={32} height={32} className="rounded-xl" />
            <span className="text-xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
              TableMesh
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/explore" className="text-sm font-semibold text-[var(--primary)]">Explore</Link>
            <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)] hidden sm:block">Blog</Link>
            <a
              href="https://apps.apple.com/us/app/tablemesh/id6760209899"
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-full text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all"
            >
              Get the App
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-8 px-4 text-center bg-gradient-to-b from-orange-50 to-[var(--background)]">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--neutral)] mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
          Dining tables near you
        </h1>
        <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto mb-6">
          Browse upcoming group meals hosted by real people. Join one, or host your own.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:border-[var(--primary)] shadow-sm"
          >
            <option value="">All cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={cuisineFilter}
            onChange={e => setCuisineFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:border-[var(--primary)] shadow-sm"
          >
            {CUISINES.map(c => <option key={c} value={c}>{c === 'All' ? 'All cuisines' : c}</option>)}
          </select>
          <select
            value={priceFilter}
            onChange={e => setPriceFilter(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:border-[var(--primary)] shadow-sm"
          >
            {PRICE_LEVELS.map(p => <option key={p} value={p}>{p === 'All' ? 'Any price' : p}</option>)}
          </select>
        </div>
      </section>

      {/* Results */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🍽</p>
            <p className="text-gray-500 text-lg mb-2">No tables found right now.</p>
            <p className="text-gray-400 text-sm mb-6">Be the first to host one in your city.</p>
            <a
              href="https://apps.apple.com/us/app/tablemesh/id6760209899"
              className="inline-block px-6 py-3 bg-[var(--primary)] text-white rounded-full font-semibold hover:bg-[var(--primary-dark)] transition-all"
            >
              Host a Table on TableMesh
            </a>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4 mt-2">
              {filtered.length} upcoming table{filtered.length !== 1 ? 's' : ''}
              {cityFilter ? ` in ${cityFilter}` : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(r => (
                <RestaurantCard
                  key={r.id}
                  request={r}
                  isLoggedIn={isLoggedIn}
                  onJoinClick={(id) => setModalTargetId(id)}
                />
              ))}
            </div>
          </>
        )}

        {/* Download CTA */}
        <div className="mt-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-8 sm:p-10 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
            Want to host your own table?
          </h2>
          <p className="text-orange-100 mb-6 text-sm sm:text-base max-w-md mx-auto">
            Download TableMesh to create a table, invite friends, and discover dining experiences near you.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="https://apps.apple.com/us/app/tablemesh/id6760209899"
              className="px-7 py-3 bg-white text-orange-600 rounded-full font-bold text-sm hover:bg-orange-50 transition-all shadow-md"
            >
              🍎 App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.tablemeshnative"
              className="px-7 py-3 bg-white text-orange-600 rounded-full font-bold text-sm hover:bg-orange-50 transition-all shadow-md"
            >
              ▶ Google Play
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center">
        <p className="text-sm text-gray-400">
          <Link href="/" className="text-[var(--primary)] hover:underline">TableMesh</Link>
          {' '}— Coordinate meals with friends, coworkers &amp; food lovers
        </p>
        <p className="text-xs text-gray-300 mt-1">© 2025 Sheep Labs LLC. All rights reserved.</p>
      </footer>

      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
