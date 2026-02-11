import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')
  const address = searchParams.get('address')

  console.log('[Places API] =====================================')
  console.log('[Places API] Request received:', { name, address })
  console.log('[Places API] Timestamp:', new Date().toISOString())

  if (!name || !address) {
    console.log('[Places API] ❌ Missing name or address')
    return NextResponse.json(null)
  }

  // Check for API key in both locations
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  console.log('[Places API] API Key check:')
  console.log('[Places API] - GOOGLE_MAPS_API_KEY exists:', !!process.env.GOOGLE_MAPS_API_KEY)
  console.log('[Places API] - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY exists:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  console.log('[Places API] - Using key starting with:', apiKey?.substring(0, 10) + '...')

  if (!apiKey) {
    console.error('[Places API] ❌ No API key found in environment variables')
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Step 1: Find place ID using Text Search (New)
    const searchQuery = `${name} ${address}`
    console.log('[Places API] 🔍 Searching for:', searchQuery)
    
    // Try the NEW Places API first
    const newApiUrl = `https://places.googleapis.com/v1/places:searchText`
    console.log('[Places API] 📍 Trying NEW Places API first...')
    
    const newApiResponse = await fetch(newApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,places.priceLevel,places.types'
      },
      body: JSON.stringify({
        textQuery: searchQuery
      })
    })

    console.log('[Places API] New API Response status:', newApiResponse.status)
    
    if (newApiResponse.ok) {
      const newApiData = await newApiResponse.json()
      console.log('[Places API] ✅ New API returned data:', JSON.stringify(newApiData, null, 2))
      
      if (newApiData.places && newApiData.places.length > 0) {
        const place = newApiData.places[0]
        
        // Convert new API price level format to numeric
        let numericPriceLevel = undefined
        if (place.priceLevel) {
          const priceLevelMap: Record<string, number> = {
            'PRICE_LEVEL_FREE': 0,
            'PRICE_LEVEL_INEXPENSIVE': 1,
            'PRICE_LEVEL_MODERATE': 2,
            'PRICE_LEVEL_EXPENSIVE': 3,
            'PRICE_LEVEL_VERY_EXPENSIVE': 4
          }
          numericPriceLevel = priceLevelMap[place.priceLevel]
        }
        
        const result = {
          formatted_phone_number: place.nationalPhoneNumber,
          website: place.websiteUri,
          rating: place.rating,
          price_level: numericPriceLevel,
          types: place.types || []
        }
        
        console.log('[Places API] ✅ Returning formatted result:', result)
        return NextResponse.json(result)
      }
    }

    // Fall back to old API
    console.log('[Places API] 📍 Falling back to old Places API...')
    
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      searchQuery
    )}&inputtype=textquery&fields=place_id&key=${apiKey}`

    console.log('[Places API] 🌐 Fetching from old API...')
    const searchRes = await fetch(searchUrl)
    const searchData = await searchRes.json()

    console.log('[Places API] Old API Search response:', JSON.stringify(searchData, null, 2))

    if (searchData.status === 'REQUEST_DENIED') {
      console.error('[Places API] ❌ REQUEST_DENIED:', searchData.error_message)
      console.error('[Places API] This usually means:')
      console.error('[Places API] 1. API key restrictions are blocking the request')
      console.error('[Places API] 2. Places API is not enabled')
      console.error('[Places API] 3. Billing is not set up')
      return NextResponse.json(
        { 
          error: 'API request denied',
          details: searchData.error_message,
          suggestion: 'Check API key restrictions in Google Cloud Console'
        },
        { status: 403 }
      )
    }

    if (searchData.status === 'ZERO_RESULTS') {
      console.log('[Places API] ⚠️ No results found for:', searchQuery)
      return NextResponse.json(null)
    }

    const placeId = searchData?.candidates?.[0]?.place_id

    if (!placeId) {
      console.log('[Places API] ⚠️ No place_id found in response')
      return NextResponse.json(null)
    }

    console.log('[Places API] ✅ Found place_id:', placeId)

    // Step 2: Get place details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,opening_hours,rating,price_level,types&key=${apiKey}`

    console.log('[Places API] 📞 Fetching place details...')
    const detailsRes = await fetch(detailsUrl)
    const detailsData = await detailsRes.json()

    console.log('[Places API] Details response:', JSON.stringify(detailsData, null, 2))

    if (detailsData.status === 'REQUEST_DENIED') {
      console.error('[Places API] ❌ Details request denied:', detailsData.error_message)
      return NextResponse.json(
        { error: 'API request denied for details', details: detailsData.error_message },
        { status: 403 }
      )
    }

    if (detailsData.result) {
      console.log('[Places API] ✅ Successfully fetched restaurant info:', {
        hasPhone: !!detailsData.result.formatted_phone_number,
        hasWebsite: !!detailsData.result.website,
        hasRating: !!detailsData.result.rating,
        hasPriceLevel: !!detailsData.result.price_level
      })
      return NextResponse.json(detailsData.result)
    } else {
      console.log('[Places API] ⚠️ No result in details response')
      return NextResponse.json(null)
    }
  } catch (error) {
    console.error('[Places API] ❌ Unexpected error:', error)
    console.error('[Places API] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to fetch restaurant info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
