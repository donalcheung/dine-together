import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Helper function to extract cuisine from types array
const extractCuisine = (types: string[]): string | null => {
  if (!types || types.length === 0) return null
  
  const cuisineMap: Record<string, string> = {
    'italian_restaurant': 'Italian',
    'chinese_restaurant': 'Chinese',
    'japanese_restaurant': 'Japanese',
    'mexican_restaurant': 'Mexican',
    'thai_restaurant': 'Thai',
    'indian_restaurant': 'Indian',
    'french_restaurant': 'French',
    'korean_restaurant': 'Korean',
    'vietnamese_restaurant': 'Vietnamese',
    'greek_restaurant': 'Greek',
    'spanish_restaurant': 'Spanish',
    'mediterranean_restaurant': 'Mediterranean',
    'american_restaurant': 'American',
    'seafood_restaurant': 'Seafood',
    'steakhouse': 'Steakhouse',
    'sushi_restaurant': 'Sushi',
    'pizza_restaurant': 'Pizza',
    'bakery': 'Bakery',
    'cafe': 'Cafe',
    'bar': 'Bar & Grill',
    'fast_food_restaurant': 'Fast Food',
    'sandwich_shop': 'Sandwiches',
    'breakfast_restaurant': 'Breakfast',
    'brunch_restaurant': 'Brunch',
    'barbecue_restaurant': 'BBQ',
    'hamburger_restaurant': 'Burgers',
    'ramen_restaurant': 'Ramen',
    'noodle_house': 'Noodles',
  }

  for (const type of types) {
    if (cuisineMap[type]) {
      return cuisineMap[type]
    }
  }

  if (types.includes('restaurant')) {
    return 'Restaurant'
  }

  return null
}

// Fetch restaurant details from Places API
const fetchRestaurantDetails = async (name: string, address: string) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/places?name=${encodeURIComponent(name)}&address=${encodeURIComponent(address)}`
    const response = await fetch(url)
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (!data) return null

    // Convert price_level to readable format
    let priceLevel = null
    if (data.price_level !== undefined && data.price_level !== null) {
      const priceLevels = ['Free', '$', '$$', '$$$', '$$$$']
      priceLevel = priceLevels[parseInt(data.price_level)] || null
    }

    // Extract cuisine from types
    const cuisineType = data.types ? extractCuisine(data.types) : null

    return {
      price_level: priceLevel,
      cuisine_type: cuisineType,
    }
  } catch (error) {
    console.error('Error fetching restaurant details:', error)
    return null
  }
}

export async function POST(req: Request) {
  try {
    // Verify admin access (you can add more sophisticated auth here)
    const { searchParams } = new URL(req.url)
    const secret = searchParams.get('secret')
    
    if (secret !== process.env.BACKFILL_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Initialize Supabase with service role key for admin access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all requests missing cuisine_type OR price_level
    const { data: requests, error: fetchError } = await supabase
      .from('dining_requests')
      .select('id, restaurant_name, restaurant_address, cuisine_type, price_level')
      .or('cuisine_type.is.null,price_level.is.null')
      .limit(100) // Process in batches - good for local development

    if (fetchError) throw fetchError

    if (!requests || requests.length === 0) {
      return NextResponse.json({
        message: 'No requests to update',
        updated: 0
      })
    }

    console.log(`[Backfill] Processing ${requests.length} requests...`)

    let updated = 0
    let failed = 0
    const results = []

    // Process each request
    for (const request of requests) {
      try {
        console.log(`[Backfill] Processing request ${request.id}: ${request.restaurant_name}`)
        
        const details = await fetchRestaurantDetails(
          request.restaurant_name,
          request.restaurant_address
        )

        if (details && (details.cuisine_type || details.price_level)) {
          const { error: updateError } = await supabase
            .from('dining_requests')
            .update({
              cuisine_type: details.cuisine_type || request.cuisine_type,
              price_level: details.price_level || request.price_level,
            })
            .eq('id', request.id)

          if (updateError) {
            console.error(`[Backfill] Failed to update ${request.id}:`, updateError)
            failed++
            results.push({
              id: request.id,
              name: request.restaurant_name,
              status: 'failed',
              error: updateError.message
            })
          } else {
            console.log(`[Backfill] ✅ Updated ${request.id}`)
            updated++
            results.push({
              id: request.id,
              name: request.restaurant_name,
              status: 'success',
              cuisine: details.cuisine_type,
              price: details.price_level
            })
          }
        } else {
          results.push({
            id: request.id,
            name: request.restaurant_name,
            status: 'no_data',
            message: 'No restaurant data found'
          })
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error: any) {
        console.error(`[Backfill] Error processing ${request.id}:`, error)
        failed++
        results.push({
          id: request.id,
          name: request.restaurant_name,
          status: 'error',
          error: error.message
        })
      }
    }

    return NextResponse.json({
      message: 'Backfill complete',
      processed: requests.length,
      updated,
      failed,
      results
    })
  } catch (error: any) {
    console.error('[Backfill] Fatal error:', error)
    return NextResponse.json(
      { error: 'Backfill failed', details: error.message },
      { status: 500 }
    )
  }
}
