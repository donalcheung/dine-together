import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')
  const address = searchParams.get('address')

  console.log('[Places API] Request received:', { name, address })

  if (!name || !address) {
    console.log('[Places API] Missing name or address')
    return NextResponse.json(null)
  }

  // Check for API key in both locations
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error('[Places API] No API key found in environment variables')
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Step 1: Find place ID
    const searchQuery = `${name} ${address}`
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      searchQuery
    )}&inputtype=textquery&fields=place_id&key=${apiKey}`

    console.log('[Places API] Searching for:', searchQuery)

    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json()

    console.log('[Places API] Search response status:', searchData.status)

    if (searchData.status === 'REQUEST_DENIED') {
      console.error('[Places API] Request denied:', searchData.error_message)
      return NextResponse.json(
        { error: 'API request denied. Check API key restrictions.' },
        { status: 403 }
      )
    }

    const placeId = searchData?.candidates?.[0]?.place_id

    if (!placeId) {
      console.log('[Places API] No place found for query')
      return NextResponse.json(null)
    }

    console.log('[Places API] Found place_id:', placeId)

    // Step 2: Get place details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,opening_hours,rating,price_level&key=${apiKey}`

    const detailsRes = await fetch(detailsUrl)
    const detailsData = await detailsRes.json()

    console.log('[Places API] Details response status:', detailsData.status)

    if (detailsData.status === 'REQUEST_DENIED') {
      console.error('[Places API] Details request denied:', detailsData.error_message)
      return NextResponse.json(
        { error: 'API request denied for details' },
        { status: 403 }
      )
    }

    if (detailsData.result) {
      console.log('[Places API] Successfully fetched restaurant info:', {
        hasPhone: !!detailsData.result.formatted_phone_number,
        hasWebsite: !!detailsData.result.website,
        hasRating: !!detailsData.result.rating,
        hasPriceLevel: !!detailsData.result.price_level
      })
      return NextResponse.json(detailsData.result)
    } else {
      console.log('[Places API] No result in details response')
      return NextResponse.json(null)
    }
  } catch (error) {
    console.error('[Places API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurant info' },
      { status: 500 }
    )
  }
}
