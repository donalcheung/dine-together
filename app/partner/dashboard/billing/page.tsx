'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '../../../lib/supabase-browser'

interface SubscriptionData {
  id: string
  plan: string
  status: string
  price_cents: number
  billing_period: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const loadBilling = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!restaurant) return
      setRestaurantId(restaurant.id)

      const { data: sub } = await supabase
        .from('restaurant_subscriptions')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .single()

      setSubscription(sub)
      setLoading(false)
    }

    loadBilling()
  }, [supabase])

  const handleUpgrade = async () => {
    setCheckoutLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to create checkout session')
      }
    } catch {
      alert('Failed to start checkout. Please try again.')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to open billing portal')
      }
    } catch {
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  const isPro = subscription?.plan === 'pro'
  const isEnterprise = subscription?.plan === 'enterprise'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>Billing & Plan</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your subscription and billing details.</p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[var(--neutral)]">Current Plan</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            isPro ? 'bg-[var(--primary)] text-white' :
            isEnterprise ? 'bg-purple-600 text-white' :
            'bg-gray-100 text-gray-600'
          }`}>
            {subscription?.plan || 'Free'}
          </span>
        </div>

        {isPro || isEnterprise ? (
          <div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold text-[var(--neutral)]">
                ${(subscription?.price_cents || 0) / 100}
              </span>
              <span className="text-gray-500">/{subscription?.billing_period || 'month'}</span>
            </div>
            {subscription?.current_period_end && (
              <p className="text-sm text-gray-500 mb-4">
                {subscription.cancel_at_period_end
                  ? `Cancels on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : `Renews on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                }
              </p>
            )}
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
            >
              {portalLoading ? 'Loading...' : 'Manage Billing'}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              You&apos;re on the <strong>Free</strong> plan. Upgrade to Pro to unlock unlimited deals, priority placement, and advanced analytics.
            </p>
          </div>
        )}
      </div>

      {/* Plan Comparison */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Basic */}
        <div className={`bg-white rounded-xl p-6 border-2 ${!isPro && !isEnterprise ? 'border-[var(--primary)]' : 'border-gray-200'}`}>
          {!isPro && !isEnterprise && (
            <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Current Plan</span>
          )}
          <h3 className="text-xl font-bold text-[var(--neutral)] mt-2">Basic</h3>
          <div className="my-4">
            <span className="text-3xl font-bold text-[var(--neutral)]">Free</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              1 active deal
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Restaurant profile
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Basic analytics
            </li>
          </ul>
        </div>

        {/* Pro */}
        <div className={`bg-white rounded-xl p-6 border-2 ${isPro ? 'border-[var(--primary)] shadow-lg' : 'border-gray-200'}`}>
          {isPro && (
            <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Current Plan</span>
          )}
          {!isPro && !isEnterprise && (
            <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">Recommended</span>
          )}
          <h3 className="text-xl font-bold text-[var(--neutral)] mt-2">Pro</h3>
          <div className="my-4">
            <span className="text-3xl font-bold text-[var(--primary)]">$49</span>
            <span className="text-gray-500">/month</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Unlimited active deals
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Priority placement
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Verified badge
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Advanced analytics
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Auto-generated requests
            </li>
          </ul>
          {!isPro && !isEnterprise && (
            <button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="w-full py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all font-semibold text-sm disabled:opacity-50"
            >
              {checkoutLoading ? 'Loading...' : 'Upgrade to Pro'}
            </button>
          )}
        </div>

        {/* Enterprise */}
        <div className={`bg-white rounded-xl p-6 border-2 ${isEnterprise ? 'border-purple-600' : 'border-gray-200'}`}>
          {isEnterprise && (
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Current Plan</span>
          )}
          <h3 className="text-xl font-bold text-[var(--neutral)] mt-2">Enterprise</h3>
          <div className="my-4">
            <span className="text-3xl font-bold text-[var(--neutral)]">Custom</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Everything in Pro
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Multi-location
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Custom branding
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Dedicated support
            </li>
          </ul>
          <a
            href="/contact"
            className="block w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold text-sm text-center"
          >
            Contact Sales
          </a>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-[var(--neutral)] mb-4">Billing FAQ</h2>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-[var(--neutral)] mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600">Yes, you can cancel your Pro subscription at any time. You&apos;ll continue to have access until the end of your billing period.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--neutral)] mb-1">Are there any commission fees?</h4>
            <p className="text-sm text-gray-600">No. Unlike delivery apps, TableMesh charges a flat monthly fee. You keep 100% of your revenue from diners.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--neutral)] mb-1">What payment methods do you accept?</h4>
            <p className="text-sm text-gray-600">We accept all major credit cards through our secure payment processor, Stripe.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--neutral)] mb-1">What happens if I downgrade?</h4>
            <p className="text-sm text-gray-600">If you downgrade to Free, extra active deals beyond the limit will be deactivated. Your data and deal history are preserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
