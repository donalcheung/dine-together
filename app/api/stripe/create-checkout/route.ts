import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { restaurantId } = await request.json()

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID is required' }, { status: 400 })
    }

    // Get restaurant and subscription info
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id, name, owner_id')
      .eq('id', restaurantId)
      .single()

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }

    // Get owner email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', restaurant.owner_id)
      .single()

    // Check if already has a stripe customer
    const { data: existingSub } = await supabase
      .from('restaurant_subscriptions')
      .select('stripe_customer_id')
      .eq('restaurant_id', restaurantId)
      .single()

    let customerId = existingSub?.stripe_customer_id

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: profile?.email || undefined,
        metadata: {
          restaurant_id: restaurantId,
          owner_id: restaurant.owner_id,
        },
      })
      customerId = customer.id

      // Save customer ID
      await supabase
        .from('restaurant_subscriptions')
        .upsert({
          restaurant_id: restaurantId,
          owner_id: restaurant.owner_id,
          stripe_customer_id: customerId,
          plan: 'free',
          status: 'active',
        }, { onConflict: 'restaurant_id' })
    }

    // Create or get the Pro price
    // In production, you'd create this once in Stripe dashboard
    // For now, we'll use a price lookup or create inline
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tablemesh.com'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'TableMesh Restaurant Pro',
              description: 'Unlimited deals, priority placement, verified badge, and advanced analytics',
            },
            unit_amount: 4900, // $49.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/partner/dashboard/billing?success=true`,
      cancel_url: `${baseUrl}/partner/dashboard/billing?canceled=true`,
      metadata: {
        restaurant_id: restaurantId,
        owner_id: restaurant.owner_id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
