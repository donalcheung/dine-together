import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

const PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''

async function fetchPlacePhoto(placeId: string): Promise<string | null> {
  if (!PLACES_API_KEY || !placeId) return null

  try {
    // Fetch place details to get photo references
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${PLACES_API_KEY}`
    const res = await fetch(detailsUrl, { next: { revalidate: 86400 } }) // cache 24h
    if (!res.ok) return null

    const data = await res.json()
    const photoRef = data?.result?.photos?.[0]?.photo_reference
    if (!photoRef) return null

    // Return the photo URL (this URL itself is served by Google and is public)
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${PLACES_API_KEY}`
  } catch {
    return null
  }
}

const getCachedPlacePhoto = unstable_cache(
  fetchPlacePhoto,
  ['place-photo'],
  { revalidate: 86400 } // 24 hours
)

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place_id')

  if (!placeId) {
    return NextResponse.json({ photoUrl: null }, { status: 400 })
  }

  const photoUrl = await getCachedPlacePhoto(placeId)

  return NextResponse.json(
    { photoUrl },
    {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    }
  )
}
