import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

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
  host: {
    name: string
    avatar_url: string | null
  } | null
}

function slugToCity(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
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

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = slugToCity(citySlug)
  return {
    title: `Group Dining in ${city} — TableMesh`,
    description: `Browse upcoming group dining tables in ${city}. Find people to eat with at local restaurants — Korean BBQ, dim sum, tasting menus and more. Join a table or host your own on TableMesh.`,
    alternates: { canonical: `/explore/${citySlug}` },
    openGraph: {
      title: `Group Dining in ${city} — TableMesh`,
      description: `Upcoming group meals in ${city}. Join a table or host your own.`,
      url: `https://tablemesh.com/explore/${citySlug}`,
    },
  }
}

async function getRequestsForCity(citySlug: string): Promise<DiningRequest[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const city = slugToCity(citySlug)
  const { data, error } = await supabase
    .from('dining_requests')
    .select(`
      id, restaurant_name, restaurant_address, dining_time,
      seats_available, total_seats, cuisine_type, price_level, description,
      host:profiles!dining_requests_host_id_fkey(name, avatar_url)
    `)
    .eq('status', 'open')
    .eq('visibility', 'public')
    .gt('dining_time', new Date().toISOString())
    .ilike('restaurant_address', `%${city}%`)
    .order('dining_time', { ascending: true })
    .limit(40)

  if (error || !data) return []
  return data as unknown as DiningRequest[]
}

export default async function CityExplorePage({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params
  const city = slugToCity(citySlug)
  const requests = await getRequestsForCity(citySlug)

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
            <Link href="/explore" className="text-sm font-medium text-gray-600 hover:text-[var(--primary)]">← All cities</Link>
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
        <div className="text-4xl mb-3">📍</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--neutral)] mb-3" style={{ fontFamily: 'Fraunces, serif' }}>
          Group dining in {city}
        </h1>
        <p className="text-gray-600 text-base sm:text-lg max-w-xl mx-auto">
          Upcoming tables hosted by real people in {city}. Browse, join, or host your own.
        </p>
      </section>

      {/* Results */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        {requests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🍽</p>
            <p className="text-gray-500 text-lg mb-2">No open tables in {city} right now.</p>
            <p className="text-gray-400 text-sm mb-6">Download the app to host the first one.</p>
            <a
              href="https://apps.apple.com/us/app/tablemesh/id6760209899"
              className="inline-block px-6 py-3 bg-[var(--primary)] text-white rounded-full font-semibold hover:bg-[var(--primary-dark)] transition-all"
            >
              Host a Table in {city}
            </a>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4 mt-2">{requests.length} upcoming table{requests.length !== 1 ? 's' : ''} in {city}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map(r => (
                <Link
                  key={r.id}
                  href={`/dine/${r.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all overflow-hidden group"
                >
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 px-4 pt-4 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-2xl">{cuisineEmoji(r.cuisine_type)}</span>
                        <h2 className="font-bold text-[var(--neutral)] text-base mt-1 group-hover:text-[var(--primary)] transition-colors leading-tight">
                          {r.restaurant_name}
                        </h2>
                      </div>
                      {r.seats_available > 0 ? (
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">
                          {r.seats_available} left
                        </span>
                      ) : (
                        <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full shrink-0">Full</span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-sm text-[var(--primary)] font-semibold mb-1">
                      📅 {formatDate(r.dining_time)}
                    </p>
                    <p className="text-xs text-gray-500 mb-2 truncate">📍 {r.restaurant_address}</p>
                    {r.cuisine_type && (
                      <span className="inline-block text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full mr-1 mb-2">
                        {r.cuisine_type}
                      </span>
                    )}
                    {r.price_level && (
                      <span className="inline-block text-xs text-gray-500 border border-gray-100 px-2 py-0.5 rounded-full mb-2">
                        {r.price_level}
                      </span>
                    )}
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

        {/* SEO text block */}
        <div className="mt-12 prose prose-sm max-w-none text-gray-500">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Group dining in {city}</h2>
          <p>
            TableMesh makes it easy to find and join group dining experiences in {city}. Whether you&apos;re looking
            for a Korean BBQ table that needs a few more people, a team lunch spot, or a tasting menu that requires
            a minimum party — TableMesh connects you with hosts who are already planning the meal.
          </p>
          <p className="mt-2">
            Browse the tables above, or{' '}
            <a href="https://apps.apple.com/us/app/tablemesh/id6760209899" className="text-[var(--primary)]">
              download the app
            </a>{' '}
            to host your own table in {city} and invite friends, coworkers, or the public to join.
          </p>
        </div>

        {/* Download CTA */}
        <div className="mt-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
            Ready to join a table in {city}?
          </h2>
          <p className="text-orange-100 mb-6 text-sm">
            Download TableMesh to RSVP, message hosts, and discover more dining experiences.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="https://apps.apple.com/us/app/tablemesh/id6760209899" className="px-6 py-3 bg-white text-orange-600 rounded-full font-bold text-sm hover:bg-orange-50 transition-all">
              App Store
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.tablemeshnative" className="px-6 py-3 bg-white text-orange-600 rounded-full font-bold text-sm hover:bg-orange-50 transition-all">
              Google Play
            </a>
          </div>
        </div>
      </main>

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
