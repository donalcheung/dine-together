import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey) : null

const GROUPON_API_TOKEN = process.env.GROUPON_API_TOKEN || ''
const GROUPON_AFFILIATE_ID = process.env.GROUPON_AFFILIATE_ID || ''

interface GrouponDeal {
  id: string
  dealUrl: string
  title: string
  highlightsBody?: string
  finePrint?: string
  merchant: {
    name: string
    streetAddress1?: string
    streetAddress2?: string
    city?: string
    state?: string
    postalCode?: string
    phoneNumber?: string
    websiteUrl?: string
  }
  options: Array<{
    title: string
    price: {
      amount: number
      formattedAmount: string
    }
    value: {
      amount: number
      formattedAmount: string
    }
    discountPercent: number
  }>
  division?: {
    lat?: number
    lng?: number
  }
  grid4ImageUrl?: string
  endAt?: string
  isSoldOut?: boolean
}

export async function POST(req: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }
    if (!GROUPON_API_TOKEN || !GROUPON_AFFILIATE_ID) {
      return NextResponse.json({ error: 'Groupon API not configured' }, { status: 500 })
    }
    const { location = 'new-york', limit = 50 } = await req.json()
    
    console.log('[Groupon Sync] Starting sync for:', location)
    
    // 1. Fetch deals from Groupon
    const grouponResponse = await fetch(
      `https://partner-api.groupon.com/deals.json?tsToken=${GROUPON_API_TOKEN}&division_id=${location}&filters=category:food-and-drink&limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )
    
    if (!grouponResponse.ok) {
      const errorText = await grouponResponse.text()
      console.error('[Groupon Sync] API Error:', errorText)
      throw new Error(`Groupon API request failed: ${grouponResponse.status}`)
    }
    
    const grouponData = await grouponResponse.json()
    const deals: GrouponDeal[] = grouponData.deals || []
    
    console.log(`[Groupon Sync] Found ${deals.length} deals`)
    
    let importedRestaurants = 0
    let importedDeals = 0
    let skipped = 0
    
    // 2. Process each deal
    for (const deal of deals) {
      try {
        // Skip sold out or expired deals
        if (deal.isSoldOut || !deal.merchant?.name) {
          skipped++
          continue
        }
        
        const merchant = deal.merchant
        const city = merchant.city || 'Unknown'
        
        // 3. Check if restaurant exists
        let restaurantId: string
        
        const { data: existingRestaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('name', merchant.name)
          .eq('city', city)
          .single()
        
        if (existingRestaurant) {
          restaurantId = existingRestaurant.id
        } else {
          // 4. Create restaurant
          const { data: newRestaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .insert([
              {
                name: merchant.name,
                description: `Check out great deals from ${merchant.name} on Groupon!`,
                address: merchant.streetAddress1 || 'Address not available',
                city: city,
                state: merchant.state || '',
                postal_code: merchant.postalCode || '',
                latitude: deal.division?.lat || null,
                longitude: deal.division?.lng || null,
                phone: merchant.phoneNumber || '',
                website: merchant.websiteUrl || '',
                cuisine_types: ['Restaurant'], // Groupon doesn't provide detailed categories
                price_range: 2,
                verification_status: 'verified', // Groupon deals are verified
                is_active: true,
                is_accepting_deals: true,
              }
            ])
            .select()
            .single()
          
          if (restaurantError) {
            console.error(`[Groupon Sync] Error creating restaurant ${merchant.name}:`, restaurantError)
            skipped++
            continue
          }
          
          restaurantId = newRestaurant.id
          importedRestaurants++
          console.log(`[Groupon Sync] Created restaurant: ${merchant.name}`)
        }
        
        // 5. Create deal from Groupon offer
        const mainOption = deal.options[0]
        if (!mainOption) {
          skipped++
          continue
        }
        
        // Check if deal already exists
        const { data: existingDeal } = await supabase
          .from('restaurant_deals')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .eq('title', deal.title)
          .single()
        
        if (existingDeal) {
          console.log(`[Groupon Sync] Deal already exists: ${deal.title}`)
          continue
        }
        
        // Parse discount
        const discountValue = mainOption.discountPercent || 
          Math.round(((mainOption.value.amount - mainOption.price.amount) / mainOption.value.amount) * 100)
        
        // Parse expiration
        const expiresAt = deal.endAt ? new Date(deal.endAt).toISOString() : 
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days default
        
        // Add affiliate tracking to URL
        const affiliateUrl = `${deal.dealUrl}?affiliate=${GROUPON_AFFILIATE_ID}`
        
        const { error: dealError } = await supabase
          .from('restaurant_deals')
          .insert([
            {
              restaurant_id: restaurantId,
              title: deal.title,
              description: `${deal.highlightsBody || deal.title}\n\n⚠️ ${deal.finePrint || 'See Groupon for full terms.'}\n\n🔗 Purchase on Groupon: ${affiliateUrl}`,
              discount_type: 'percentage',
              discount_value: discountValue,
              min_party_size: 1,
              valid_days: [1, 2, 3, 4, 5, 6, 7], // Usually valid all week
              is_active: true,
              expires_at: expiresAt,
              // Store Groupon-specific data
              verification_method: 'groupon_import',
            }
          ])
        
        if (dealError) {
          console.error(`[Groupon Sync] Error creating deal:`, dealError)
          skipped++
        } else {
          importedDeals++
          console.log(`[Groupon Sync] Created deal: ${deal.title}`)
        }
        
      } catch (error) {
        console.error(`[Groupon Sync] Error processing deal:`, error)
        skipped++
      }
    }
    
    console.log('[Groupon Sync] Complete:', {
      restaurants: importedRestaurants,
      deals: importedDeals,
      skipped: skipped
    })
    
    return NextResponse.json({
      success: true,
      imported_restaurants: importedRestaurants,
      imported_deals: importedDeals,
      skipped: skipped,
      total_scanned: deals.length
    })
    
  } catch (error: any) {
    console.error('[Groupon Sync] Fatal error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync Groupon data' },
      { status: 500 }
    )
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }
    const { count: totalRestaurants } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
    
    const { count: grouponDeals } = await supabase
      .from('restaurant_deals')
      .select('*', { count: 'exact', head: true })
      .eq('verification_method', 'groupon_import')
      .eq('is_active', true)
    
    return NextResponse.json({
      total_restaurants: totalRestaurants || 0,
      groupon_deals: grouponDeals || 0,
      last_sync: 'Check logs for last sync time'
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
