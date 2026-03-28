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
        const billingPeriod = session.metadata?.billing_period || 'monthly'

        if (restaurantId && session.subscription) {
          // Get full subscription details from Stripe
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string) as any

          const isTrialing = stripeSub.status === 'trialing'
          const trialEnd = stripeSub.trial_end
            ? new Date(stripeSub.trial_end * 1000).toISOString()
            : null

          const priceCents = billingPeriod === 'yearly' ? 47000 : 4900

          await supabase
            .from('restaurant_subscriptions')
            .upsert({
              restaurant_id: restaurantId,
              owner_id: ownerId,
              plan: 'pro',
              status: stripeSub.status, // 'trialing' or 'active'
              price_cents: priceCents,
              currency: 'usd',
              billing_period: billingPeriod,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: stripeSub.id,
              current_period_start: stripeSub.current_period_start
                ? new Date(stripeSub.current_period_start * 1000).toISOString()
                : new Date().toISOString(),
              current_period_end: stripeSub.current_period_end
                ? new Date(stripeSub.current_period_end * 1000).toISOString()
                : new Date().toISOString(),
              trial_end_date: trialEnd,
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'restaurant_id' })

          // Note: is_verified is managed exclusively by admin review.
          // The Pro subscription does NOT grant or affect the verified status.
        }
        break
      }

      case 'customer.subscription.updated': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stripeSub = event.data.object as any
        const customerId = (stripeSub.customer as string) || ''

        // Find restaurant by stripe customer ID
        const { data: sub } = await supabase
          .from('restaurant_subscriptions')
          .select('restaurant_id, billing_period')
          .eq('stripe_customer_id', customerId)
          .single()

        if (sub) {
          const status = stripeSub.status // 'trialing', 'active', 'past_due', 'canceled', etc.
          const isPro = status === 'active' || status === 'trialing'
          const trialEnd = stripeSub.trial_end
            ? new Date(stripeSub.trial_end * 1000).toISOString()
            : null

          // Determine billing period from subscription interval
          const interval = stripeSub.items?.data?.[0]?.price?.recurring?.interval
          const billingPeriod = interval === 'year' ? 'yearly' : (sub.billing_period || 'monthly')
          const priceCents = billingPeriod === 'yearly' ? 47000 : 4900

          await supabase
            .from('restaurant_subscriptions')
            .update({
              status,
              plan: isPro ? 'pro' : 'free',
              price_cents: isPro ? priceCents : 0,
              billing_period: billingPeriod,
              current_period_start: stripeSub.current_period_start
                ? new Date(stripeSub.current_period_start * 1000).toISOString()
                : new Date().toISOString(),
              current_period_end: stripeSub.current_period_end
                ? new Date(stripeSub.current_period_end * 1000).toISOString()
                : new Date().toISOString(),
              trial_end_date: trialEnd,
              cancel_at_period_end: stripeSub.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            })
            .eq('restaurant_id', sub.restaurant_id)

          // Note: is_verified is managed exclusively by admin review, not by subscription status.
        }
        break
      }

      case 'customer.subscription.deleted': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stripeSub = event.data.object as any
        const customerId = (stripeSub.customer as string) || ''

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
              trial_end_date: null,
              cancel_at_period_end: false,
              updated_at: new Date().toISOString(),
            })
            .eq('restaurant_id', sub.restaurant_id)

          // Deactivate extra deals beyond free limit (1 deal max)
          // Note: is_verified is NOT changed on cancellation — admin controls verification.
          const { data: activeDeals } = await supabase
            .from('restaurant_deals')
            .select('id, created_at')
            .eq('restaurant_id', sub.restaurant_id)
            .eq('is_active', true)
            .order('created_at', { ascending: true })

          if (activeDeals && activeDeals.length > 1) {
            // Keep the oldest deal active, deactivate the rest
            const toDeactivate = activeDeals.slice(1).map((d) => d.id)
            await supabase
              .from('restaurant_deals')
              .update({ is_active: false })
              .in('id', toDeactivate)
          }
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

      case 'invoice.payment_succeeded': {
        // Trial converted to paid subscription
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
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('restaurant_id', sub.restaurant_id)
          // Note: is_verified is managed exclusively by admin review.
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
