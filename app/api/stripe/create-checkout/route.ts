import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  })
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const supabase = getSupabase()

    const { restaurantId, billingPeriod = 'monthly' } = await request.json()

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
      .select('stripe_customer_id, plan, status')
      .eq('restaurant_id', restaurantId)
      .single()

    // Don't allow re-subscribing if already on pro/trialing
    if (existingSub?.plan === 'pro' && (existingSub?.status === 'active' || existingSub?.status === 'trialing')) {
      return NextResponse.json({ error: 'Already subscribed to Pro plan' }, { status: 400 })
    }

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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tablemesh.com'

    // Monthly: $49/month | Yearly: $470/year (~2 months free)
    const isYearly = billingPeriod === 'yearly'
    const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
      currency: 'usd',
      product_data: {
        name: 'TableMesh Restaurant Pro',
        description: isYearly
          ? 'Up to 3 deals, hostless dining auto-generation, full analytics, verified badge — billed yearly (save ~$118)'
          : 'Up to 3 deals, hostless dining auto-generation, full analytics, verified badge',
      },
      unit_amount: isYearly ? 47000 : 4900,
      recurring: {
        interval: isYearly ? 'year' : 'month',
      },
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          restaurant_id: restaurantId,
          owner_id: restaurant.owner_id,
          billing_period: billingPeriod,
        },
      },
      success_url: `${baseUrl}/partner/dashboard/billing?success=true`,
      cancel_url: `${baseUrl}/partner/dashboard/billing?canceled=true`,
      metadata: {
        restaurant_id: restaurantId,
        owner_id: restaurant.owner_id,
        billing_period: billingPeriod,
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
