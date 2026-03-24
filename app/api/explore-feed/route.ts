import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

const PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function fetchPhotoUrl(placeId: string): Promise<string | null> {
  if (!PLACES_API_KEY || !placeId) return null
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${PLACES_API_KEY}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const photoRef = data?.result?.photos?.[0]?.photo_reference
    if (!photoRef) return null
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${photoRef}&key=${PLACES_API_KEY}`
  } catch {
    return null
  }
}

const getCachedFeed = unstable_cache(
  async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
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
      .limit(8)

    if (error || !data) return { items: [], totalCount: 0 }

    // Get total count for the "X more tables" wall
    const { count } = await supabase
      .from('dining_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open')
      .eq('visibility', 'public')
      .gt('dining_time', new Date().toISOString())

    // Fetch photos in parallel for all 8 items
    const itemsWithPhotos = await Promise.all(
      data.map(async (item: Record<string, unknown>) => {
        const placeId = item.google_place_id as string | null
        const photoUrl = placeId ? await fetchPhotoUrl(placeId) : null
        return { ...item, photoUrl }
      })
    )

    return { items: itemsWithPhotos, totalCount: count || 0 }
  },
  ['explore-feed'],
  { revalidate: 300 } // Cache for 5 minutes
)

export async function GET(request: NextRequest) {
  const cuisine = request.nextUrl.searchParams.get('cuisine') || ''
  const city = request.nextUrl.searchParams.get('city') || ''

  // For filtered requests, bypass cache and query directly
  if (cuisine || city) {
    const supabase = getSupabase()
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
      .limit(8)

    if (cuisine) query = query.ilike('cuisine_type', `%${cuisine}%`)

    const { data, error } = await query
    if (error || !data) return NextResponse.json({ items: [], totalCount: 0 })

    const { count } = await supabase
      .from('dining_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open')
      .eq('visibility', 'public')
      .gt('dining_time', new Date().toISOString())

    const itemsWithPhotos = await Promise.all(
      data.map(async (item: Record<string, unknown>) => {
        const placeId = item.google_place_id as string | null
        const photoUrl = placeId ? await fetchPhotoUrl(placeId) : null
        return { ...item, photoUrl }
      })
    )

    return NextResponse.json(
      { items: itemsWithPhotos, totalCount: count || 0 },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    )
  }

  const result = await getCachedFeed()
  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' },
  })
}
