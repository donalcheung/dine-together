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

function emptyPlaceDetails(): PlaceDetails {
  return {
    photoUrl: null,
    photoUrls: [],
    rating: null,
    userRatingsTotal: null,
    website: null,
    phone: null,
    reviews: [],
  }
}

async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const empty = emptyPlaceDetails()
  if (!PLACES_API_KEY || !placeId) return empty
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=photos,rating,user_ratings_total,website,formatted_phone_number,reviews&key=${PLACES_API_KEY}`
    const res = await fetch(detailsUrl, { next: { revalidate: 86400 } })
    if (!res.ok) return empty
    const data = await res.json()
    const result = data?.result
    if (!result) return empty
    const photoUrls: string[] = (result.photos || []).slice(0, 3).map((p: { photo_reference: string }) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${PLACES_API_KEY}`,
    )
    const reviews = (result.reviews || [])
      .filter((r: { text?: string }) => r.text && r.text.length > 20)
      .slice(0, 3)
      .map((r: {
        author_name: string
        rating: number
        text: string
        relative_time_description: string
        profile_photo_url?: string | null
      }) => ({
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
  } catch {
    return empty
  }
}

/** Resolve a Place ID from restaurant name + address when the dining request has no google_place_id. */
async function findPlaceIdFromText(name: string, address: string): Promise<string | null> {
  if (!PLACES_API_KEY) return null
  const input = `${name.trim()} ${address.trim()}`.trim()
  if (!input) return null
  try {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(input)}&inputtype=textquery&fields=place_id&key=${PLACES_API_KEY}`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const data = await res.json()
    const candidate = data?.candidates?.[0]
    const pid = candidate?.place_id as string | undefined
    return pid?.trim() || null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const placeIdParam = request.nextUrl.searchParams.get('place_id')?.trim()
  const nameParam = request.nextUrl.searchParams.get('name')?.trim()
  const addressParam = request.nextUrl.searchParams.get('address')?.trim()

  let resolvedPlaceId = placeIdParam || null
  if (!resolvedPlaceId && nameParam && addressParam) {
    resolvedPlaceId = await findPlaceIdFromText(nameParam, addressParam)
  }

  if (!resolvedPlaceId) {
    return NextResponse.json(emptyPlaceDetails(), {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    })
  }

  const runCached = unstable_cache(
    async () => fetchPlaceDetails(resolvedPlaceId!),
    ['place-details', resolvedPlaceId!],
    { revalidate: 86400 },
  )

  const details = await runCached()
  return NextResponse.json(details, {
    headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600' },
  })
}
