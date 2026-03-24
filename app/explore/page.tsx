'use client'
import { useEffect, useState, useCallback } from 'react'
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
  latitude: number | null
  longitude: number | null
  host: {
    name: string
    avatar_url: string | null
  } | null
}

const CUISINES = ['All', 'Japanese', 'Korean', 'Chinese', 'Italian', 'Mexican', 'American', 'Indian', 'Thai', 'Mediterranean', 'Other']
const PRICE_LEVELS = ['All', '$', '$$', '$$$', '$$$$']

function formatDate(iso: string, timezone?: string | null) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    timeZone: timezone || undefined,
  })
}

function cityFromAddress(address: string): string {
  const parts = address.split(',')
  if (parts.length >= 2) return parts[parts.length - 3]?.trim() || parts[0].trim()
  return address
}

function priceLabel(level: string | null) {
  if (!level) return null
  return level
}

function cuisineEmoji(cuisine: string | null) {
  const map: Record<string, string> = {
    japanese: '🍣', korean: '🥩', chinese: '🥟', italian: '🍝',
    mexican: '🌮', american: '🍔', indian: '🍛', thai: '🍜',
    mediterranean: '🫒', pizza: '🍕', bbq: '🔥', seafood: '🦞',
    sushi: '🍱', ramen: '🍜', dim: '🥢', tasting: '⭐',
  }
  if (!cuisine) return '🍽'
  const lower = cuisine.toLowerCase()
  for (const [key, emoji] of Object.entries(map)) {
    if (lower.includes(key)) return emoji
  }
  return '🍽'
}

export default function ExplorePage() {
  const [requests, setRequests] = useState<DiningRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [cityFilter, setCityFilter] = useState('')
  const [cuisineFilter, setCuisineFilter] = useState('All')
  const [priceFilter, setPriceFilter] = useState('All')
  const [cities, setCities] = useState<string[]>([])

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    let query = supabase
      .from('dining_requests')
      .select(`
        id, restaurant_name, restaurant_address, dining_time,
        seats_available, total_seats, cuisine_type, price_level,
        description, status, latitude, longitude,
        host:profiles!dining_requests_host_id_fkey(name, avatar_url)
      `)
      .eq('status', 'open')
      .eq('visibility', 'public')
      .gt('dining_time', new Date().toISOString())
      .order('dining_time', { ascending: true })
      .limit(60)

    if (cuisineFilter !== 'All') {
      query = query.ilike('cuisine_type', `%${cuisineFilter}%`)
    }
    if (priceFilter !== 'All') {
      query = query.eq('price_level', priceFilter)
    }

    const { data, error } = await query
    if (!error && data) {
      const items = data as unknown as DiningRequest[]
      setRequests(items)
      // Build city list from addresses
      const citySet = new Set<string>()
      items.forEach(r => {
        const c = cityFromAddress(r.restaurant_address)
        if (c) citySet.add(c)
      })
      setCities(Array.from(citySet).sort())
    }
    setLoading(false)
  }, [cuisineFilter, priceFilter])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const filtered = cityFilter
    ? requests.filter(r => r.restaurant_address.toLowerCase().includes(cityFilter.toLowerCase()))
    : requests

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-orange-100">
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
          {/* City filter */}
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="px-3 py-2 rounded-full border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="">All cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {/* Cuisine filter */}
          <select
            value={cuisineFilter}
            onChange={e => setCuisineFilter(e.target.value)}
            className="px-3 py-2 rounded-full border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:border-[var(--primary)]"
          >
            {CUISINES.map(c => <option key={c} value={c}>{c === 'All' ? 'All cuisines' : c}</option>)}
          </select>
          {/* Price filter */}
          <select
            value={priceFilter}
            onChange={e => setPriceFilter(e.target.value)}
            className="px-3 py-2 rounded-full border border-gray-200 text-sm bg-white text-gray-700 focus:outline-none focus:border-[var(--primary)]"
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
            <p className="text-sm text-gray-400 mb-4 mt-2">{filtered.length} upcoming table{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(r => (
                <Link
                  key={r.id}
                  href={`/dine/${r.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all overflow-hidden group"
                >
                  {/* Card header */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 px-4 pt-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-2xl">{cuisineEmoji(r.cuisine_type)}</span>
                        <h2 className="font-bold text-[var(--neutral)] text-base mt-1 group-hover:text-[var(--primary)] transition-colors leading-tight">
                          {r.restaurant_name}
                        </h2>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {r.seats_available > 0 ? (
                          <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {r.seats_available} seat{r.seats_available !== 1 ? 's' : ''} left
                          </span>
                        ) : (
                          <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Full</span>
                        )}
                        {priceLabel(r.price_level) && (
                          <span className="text-xs text-gray-500">{r.price_level}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Card body */}
                  <div className="px-4 py-3">
                    <p className="text-sm text-[var(--primary)] font-semibold mb-1">
                      📅 {formatDate(r.dining_time)}
                    </p>
                    <p className="text-xs text-gray-500 mb-2 truncate">
                      📍 {r.restaurant_address}
                    </p>
                    {r.cuisine_type && (
                      <span className="inline-block text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full mr-1 mb-2">
                        {r.cuisine_type}
                      </span>
                    )}
                    {r.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{r.description}</p>
                    )}
                    {/* Host */}
                    {r.host && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                        {r.host.avatar_url ? (
                          <img src={r.host.avatar_url} alt={r.host.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-[var(--primary)]">
                            {r.host.name?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <span className="text-xs text-gray-500">Hosted by <span className="font-medium text-gray-700">{r.host.name}</span></span>
                      </div>
                    )}
                  </div>
                  {/* CTA */}
                  <div className="px-4 pb-4">
                    <div className="w-full py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl text-center group-hover:bg-[var(--primary-dark)] transition-colors">
                      View & Join Table →
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Download CTA */}
        <div className="mt-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
            Want to host or join a table?
          </h2>
          <p className="text-orange-100 mb-6 text-sm">
            Download TableMesh to RSVP, message hosts, and discover more dining experiences near you.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="https://apps.apple.com/us/app/tablemesh/id6760209899"
              className="px-6 py-3 bg-white text-orange-600 rounded-full font-bold text-sm hover:bg-orange-50 transition-all"
            >
              App Store
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.tablemeshnative"
              className="px-6 py-3 bg-white text-orange-600 rounded-full font-bold text-sm hover:bg-orange-50 transition-all"
            >
              Google Play
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
    </div>
  )
}
