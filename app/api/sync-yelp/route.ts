import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const YELP_API_KEY = process.env.YELP_API_KEY!

interface YelpBusiness {
  id: string
  name: string
  location: {
    address1: string
    city: string
    state: string
    zip_code: string
  }
  coordinates: {
    latitude: number
    longitude: number
  }
  phone: string
  price?: string
  categories: Array<{ title: string }>
  rating?: number
  url?: string
}

export async function POST(req: Request) {
  try {
    const { location = 'New York, NY', radius = 10000, limit = 50 } = await req.json()
    
    console.log('[Yelp Sync] Starting sync for:', location)
    
    // 1. Search Yelp for restaurants
    const yelpResponse = await fetch(
      `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(location)}&term=restaurant&limit=${limit}&radius=${radius}`,
      {
        headers: {
          'Authorization': `Bearer ${YELP_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    )
    
    if (!yelpResponse.ok) {
      const errorText = await yelpResponse.text()
      console.error('[Yelp Sync] API Error:', errorText)
      throw new Error(`Yelp API request failed: ${yelpResponse.status}`)
    }
    
    const yelpData = await yelpResponse.json()
    const businesses: YelpBusiness[] = yelpData.businesses || []
    
    console.log(`[Yelp Sync] Found ${businesses.length} businesses`)
    
    let importedCount = 0
    let updatedCount = 0
    let skippedCount = 0
    
    // 2. Process each business
    for (const business of businesses) {
      try {
        // Skip if missing required data
        if (!business.name || !business.location.city) {
          console.log(`[Yelp Sync] Skipping ${business.name} - missing data`)
          skippedCount++
          continue
        }
        
        // 3. Check if restaurant already exists
        const { data: existingRestaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('name', business.name)
          .eq('city', business.location.city)
          .single()
        
        const restaurantData = {
          name: business.name,
          description: `Imported from Yelp`,
          address: business.location.address1 || 'Address not available',
          city: business.location.city,
          state: business.location.state || '',
          postal_code: business.location.zip_code || '',
          latitude: business.coordinates?.latitude || null,
          longitude: business.coordinates?.longitude || null,
          phone: business.phone || '',
          website: business.url || '',
          cuisine_types: business.categories?.map(c => c.title).slice(0, 5) || [],
          price_range: business.price ? business.price.length : 2,
          verification_status: 'unverified',
          is_active: true,
          is_accepting_deals: true,
        }
        
        if (existingRestaurant) {
          // Update existing restaurant
          const { error: updateError } = await supabase
            .from('restaurants')
            .update(restaurantData)
            .eq('id', existingRestaurant.id)
          
          if (updateError) {
            console.error(`[Yelp Sync] Error updating ${business.name}:`, updateError)
          } else {
            console.log(`[Yelp Sync] Updated: ${business.name}`)
            updatedCount++
          }
        } else {
          // Create new restaurant
          const { data: newRestaurant, error: insertError } = await supabase
            .from('restaurants')
            .insert([restaurantData])
            .select()
            .single()
          
          if (insertError) {
            console.error(`[Yelp Sync] Error creating ${business.name}:`, insertError)
          } else {
            console.log(`[Yelp Sync] Imported: ${business.name}`)
            importedCount++
            
            // 4. Create a sample "Yelp Special" deal for new restaurants
            await createSampleDeal(newRestaurant.id, business.name)
          }
        }
      } catch (error) {
        console.error(`[Yelp Sync] Error processing ${business.name}:`, error)
        skippedCount++
      }
    }
    
    console.log('[Yelp Sync] Complete:', {
      imported: importedCount,
      updated: updatedCount,
      skipped: skippedCount
    })
    
    return NextResponse.json({
      success: true,
      imported: importedCount,
      updated: updatedCount,
      skipped: skippedCount,
      total_scanned: businesses.length
    })
    
  } catch (error: any) {
    console.error('[Yelp Sync] Fatal error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync Yelp data' },
      { status: 500 }
    )
  }
}

// Helper: Create a sample deal for newly imported restaurants
async function createSampleDeal(restaurantId: string, restaurantName: string) {
  try {
    // Check if deal already exists
    const { data: existingDeal } = await supabase
      .from('restaurant_deals')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .single()
    
    if (existingDeal) return // Already has a deal
    
    // Create a generic "Yelp Special" deal
    const { error } = await supabase
      .from('restaurant_deals')
      .insert([
        {
          restaurant_id: restaurantId,
          title: 'Lunch Special',
          description: 'Join us for lunch! Ask staff about daily specials and promotions.',
          discount_type: 'percentage',
          discount_value: 15,
          min_party_size: 2,
          valid_days: [1, 2, 3, 4, 5], // Weekdays
          valid_time_start: '11:00',
          valid_time_end: '15:00',
          is_active: true,
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        }
      ])
    
    if (!error) {
      console.log(`[Yelp Sync] Created sample deal for ${restaurantName}`)
    }
  } catch (error) {
    console.error('[Yelp Sync] Error creating sample deal:', error)
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    const { count: totalRestaurants } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalDeals } = await supabase
      .from('restaurant_deals')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    
    return NextResponse.json({
      total_restaurants: totalRestaurants || 0,
      total_active_deals: totalDeals || 0,
      last_sync: 'Check logs for last sync time'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
