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
  const stripe = getStripe()
  const supabase = getSupabase()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const restaurantId = session.metadata?.restaurant_id
        const ownerId = session.metadata?.owner_id

        if (restaurantId && session.subscription) {
          // Get subscription details
          const subResponse = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const subscription = subResponse as any

          await supabase
            .from('restaurant_subscriptions')
            .upsert({
              restaurant_id: restaurantId,
              owner_id: ownerId,
              plan: 'pro',
              status: 'active',
              price_cents: 4900,
              currency: 'usd',
              billing_period: 'monthly',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : new Date().toISOString(),
              current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : new Date().toISOString(),
              cancel_at_period_end: false,
            }, { onConflict: 'restaurant_id' })

          // Mark restaurant as verified (Pro perk)
          await supabase
            .from('restaurants')
            .update({ is_verified: true })
            .eq('id', restaurantId)
        }
        break
      }

      case 'customer.subscription.updated': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any
        const customerId = (subscription.customer as string) || ''

        // Find restaurant by stripe customer ID
        const { data: sub } = await supabase
          .from('restaurant_subscriptions')
          .select('restaurant_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (sub) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing'

          await supabase
            .from('restaurant_subscriptions')
            .update({
              status: isActive ? 'active' : subscription.status,
              plan: isActive ? 'pro' : 'free',
              current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : new Date().toISOString(),
              current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : new Date().toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            })
            .eq('restaurant_id', sub.restaurant_id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any
        const customerId = (subscription.customer as string) || ''

        const { data: sub } = await supabase
          .from('restaurant_subscriptions')
          .select('restaurant_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (sub) {
          // Downgrade to free
          await supabase
            .from('restaurant_subscriptions')
            .update({
              plan: 'free',
              status: 'canceled',
              price_cents: 0,
              stripe_subscription_id: null,
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            })
            .eq('restaurant_id', sub.restaurant_id)

          // Remove verified badge
          await supabase
            .from('restaurants')
            .update({ is_verified: false })
            .eq('id', sub.restaurant_id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: sub } = await supabase
          .from('restaurant_subscriptions')
          .select('restaurant_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (sub) {
          await supabase
            .from('restaurant_subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('restaurant_id', sub.restaurant_id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
