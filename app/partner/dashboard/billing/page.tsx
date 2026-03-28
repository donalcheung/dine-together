'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '../../../lib/supabase-browser'
import { Suspense } from 'react'

interface SubscriptionData {
  id: string
  plan: string
  status: string
  price_cents: number
  billing_period: string
  current_period_start: string | null
  current_period_end: string | null
  trial_end_date: string | null
  cancel_at_period_end: boolean
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

function BillingContent() {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const searchParams = useSearchParams()
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('You\'re now on Pro! Your free trial has started. No charge until the trial ends.')
    }
    if (searchParams.get('canceled') === 'true') {
      setErrorMessage('Checkout was canceled. No changes were made.')
    }
  }, [searchParams])

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
    setErrorMessage('')
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, billingPeriod }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setErrorMessage(data.error || 'Failed to create checkout session')
      }
    } catch {
      setErrorMessage('Failed to start checkout. Please try again.')
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
        setErrorMessage(data.error || 'Failed to open billing portal')
      }
    } catch {
      setErrorMessage('Failed to open billing portal. Please try again.')
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
  const isTrialing = subscription?.status === 'trialing'
  const trialEndDate = subscription?.trial_end_date
    ? new Date(subscription.trial_end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  const monthlyPrice = 49
  const yearlyPrice = 470
  const yearlySavings = monthlyPrice * 12 - yearlyPrice // $118

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>Billing & Plan</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your subscription and billing details.</p>
      </div>

      {/* Success / Error banners */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {errorMessage}
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[var(--neutral)]">Current Plan</h2>
          <div className="flex items-center gap-2">
            {isTrialing && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">
                Free Trial
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              isPro ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {subscription?.plan || 'Free'}
            </span>
          </div>
        </div>

        {isPro ? (
          <div>
            {isTrialing && trialEndDate ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-blue-800">Free trial active</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Your trial ends on <strong>{trialEndDate}</strong>. You won&apos;t be charged until then. Cancel anytime before the trial ends to avoid being charged.
                </p>
              </div>
            ) : (
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-[var(--neutral)]">
                  ${(subscription?.price_cents || 0) / 100}
                </span>
                <span className="text-gray-500">/{subscription?.billing_period === 'yearly' ? 'year' : 'month'}</span>
              </div>
            )}
            {subscription?.current_period_end && !isTrialing && (
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
              You&apos;re on the <strong>Free</strong> plan. Upgrade to Pro to unlock up to 3 deals, hostless dining auto-generation, full analytics, and a verified badge. <strong>Start with a free 1-month trial.</strong>
            </p>
          </div>
        )}
      </div>

      {/* Plan Comparison */}
      {!isPro && (
        <>
          {/* Billing period toggle */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gray-100 rounded-xl p-1 flex items-center gap-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  billingPeriod === 'monthly' ? 'bg-white shadow text-[var(--neutral)]' : 'text-gray-500'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  billingPeriod === 'yearly' ? 'bg-white shadow text-[var(--neutral)]' : 'text-gray-500'
                }`}
              >
                Yearly
                <span className="text-xs bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">
                  Save ${yearlySavings}
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Free */}
            <div className="bg-white rounded-xl p-6 border-2 border-[var(--primary)]">
              <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Current Plan</span>
              <h3 className="text-xl font-bold text-[var(--neutral)] mt-2">Free</h3>
              <div className="my-4">
                <span className="text-3xl font-bold text-[var(--neutral)]">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  1 active deal
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Restaurant profile
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Basic analytics (totals only)
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-400">No auto-generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  <span className="text-gray-400">No verified badge</span>
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[var(--primary)] text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                Recommended
              </div>
              <h3 className="text-xl font-bold text-[var(--neutral)] mt-2">Pro</h3>
              <div className="my-4">
                {billingPeriod === 'monthly' ? (
                  <>
                    <span className="text-3xl font-bold text-[var(--primary)]">${monthlyPrice}</span>
                    <span className="text-gray-500">/month</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-[var(--primary)]">${yearlyPrice}</span>
                    <span className="text-gray-500">/year</span>
                    <span className="ml-2 text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                      ~${(yearlyPrice / 12).toFixed(0)}/mo
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-blue-600 font-semibold mb-4 bg-blue-50 rounded-lg px-3 py-2">
                🎉 Start with a free 1-month trial — no charge until the trial ends
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Up to 3 active deals
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Hostless dining auto-generation
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Verified badge
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Full analytics + redemption history
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Cancel anytime
                </li>
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="w-full py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all font-semibold text-sm disabled:opacity-50"
              >
                {checkoutLoading ? 'Loading...' : `Start Free Trial — then $${billingPeriod === 'monthly' ? monthlyPrice + '/mo' : yearlyPrice + '/yr'}`}
              </button>
            </div>
          </div>
        </>
      )}

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-[var(--neutral)] mb-4">Billing FAQ</h2>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-[var(--neutral)] mb-1">How does the free trial work?</h4>
            <p className="text-sm text-gray-600">You get full Pro access for 30 days at no cost. Your card is saved but not charged until the trial ends. Cancel before the trial ends and you won&apos;t be charged anything.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--neutral)] mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600">Yes, you can cancel your Pro subscription at any time. You&apos;ll continue to have access until the end of your billing period.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--neutral)] mb-1">What&apos;s the difference between monthly and yearly?</h4>
            <p className="text-sm text-gray-600">Monthly is $49/month billed each month. Yearly is $470 billed once per year — that&apos;s about $39/month, saving you $118 compared to monthly billing.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--neutral)] mb-1">Are there any commission fees?</h4>
            <p className="text-sm text-gray-600">No. Unlike delivery apps, TableMesh charges a flat monthly fee. You keep 100% of your revenue from diners.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--neutral)] mb-1">What happens if I downgrade?</h4>
            <p className="text-sm text-gray-600">If you downgrade to Free, extra active deals beyond 1 will be deactivated. Your data and deal history are preserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}
