import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

const PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''

export interface PlaceDetails {
  photoUrl: string | null
  photoUrls: string[]
  rating: number | null
  userRatingsTotal: number | null
  website: string | null
  phone: string | null
  reviews: Array<{
    author_name: string
    rating: number
    text: string
    relative_time_description: string
    profile_photo_url: string | null
  }>
}

async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const empty: PlaceDetails = {
    photoUrl: null, photoUrls: [], rating: null,
    userRatingsTotal: null, website: null, phone: null, reviews: [],
  }
  if (!PLACES_API_KEY || !placeId) return empty
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos,rating,user_ratings_total,website,formatted_phone_number,reviews&key=${PLACES_API_KEY}`
    const res = await fetch(detailsUrl, { next: { revalidate: 86400 } })
    if (!res.ok) return empty
    const data = await res.json()
    const result = data?.result
    if (!result) return empty
    const photoUrls: string[] = (result.photos || []).slice(0, 3).map((p: any) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${PLACES_API_KEY}`
    )
    const reviews = (result.reviews || [])
      .filter((r: any) => r.text && r.text.length > 20)
      .slice(0, 3)
      .map((r: any) => ({
        author_name: r.author_name,
        rating: r.rating,
        text: r.text,
        relative_time_description: r.relative_time_description,
        profile_photo_url: r.profile_photo_url || null,
      }))
    return {
      photoUrl: photoUrls[0] || null,
      photoUrls,
      rating: result.rating || null,
      userRatingsTotal: result.user_ratings_total || null,
      website: result.website || null,
      phone: result.formatted_phone_number || null,
      reviews,
    }
  } catch { return empty }
}

const getCachedPlaceDetails = unstable_cache(fetchPlaceDetails, ['place-details'], { revalidate: 86400 })

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place_id')
  if (!placeId) {
    return NextResponse.json({ photoUrl: null, photoUrls: [], rating: null, userRatingsTotal: null, website: null, phone: null, reviews: [] }, { status: 400 })
  }
  const details = await getCachedPlaceDetails(placeId)
  return NextResponse.json(details, {
    headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600' },
  })
}
