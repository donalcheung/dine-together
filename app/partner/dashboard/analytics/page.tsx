'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '../../../lib/supabase-browser'

interface DealAnalytics {
  id: string
  title: string
  is_active: boolean
  views: number
  redemptions: number
  conversionRate: number
}

interface RecentRedemption {
  id: string
  deal_title: string
  party_size: number
  redeemed_at: string
  status: string
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [totalViews, setTotalViews] = useState(0)
  const [totalRedemptions, setTotalRedemptions] = useState(0)
  const [totalDiningRequests, setTotalDiningRequests] = useState(0)
  const [totalDiners, setTotalDiners] = useState(0)
  const [dealAnalytics, setDealAnalytics] = useState<DealAnalytics[]>([])
  const [recentRedemptions, setRecentRedemptions] = useState<RecentRedemption[]>([])
  const [subscription, setSubscription] = useState<string>('free')

  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const loadAnalytics = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!restaurant) return

      const { data: sub } = await supabase
        .from('restaurant_subscriptions')
        .select('plan')
        .eq('restaurant_id', restaurant.id)
        .single()

      setSubscription(sub?.plan || 'free')

      // Total views
      const { count: viewsCount } = await supabase
        .from('deal_views')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id)
      setTotalViews(viewsCount || 0)

      // Total redemptions
      const { count: redemptionsCount } = await supabase
        .from('deal_redemptions')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurant.id)
      setTotalRedemptions(redemptionsCount || 0)

      // Total dining requests
      const { data: requests } = await supabase
        .from('dining_requests')
        .select('id, total_seats, seats_available')
        .eq('restaurant_id', restaurant.id)
      setTotalDiningRequests(requests?.length || 0)

      // Estimate total diners from dining requests
      const diners = (requests || []).reduce((sum, r) => sum + (r.total_seats - r.seats_available), 0)
      setTotalDiners(diners)

      // Per-deal analytics
      const { data: deals } = await supabase
        .from('restaurant_deals')
        .select('id, title, is_active, redemptions_count')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })

      if (deals) {
        const analytics: DealAnalytics[] = []
        for (const deal of deals) {
          const { count: dealViews } = await supabase
            .from('deal_views')
            .select('*', { count: 'exact', head: true })
            .eq('deal_id', deal.id)

          const views = dealViews || 0
          const redemptions = deal.redemptions_count || 0
          analytics.push({
            id: deal.id,
            title: deal.title,
            is_active: deal.is_active,
            views,
            redemptions,
            conversionRate: views > 0 ? (redemptions / views) * 100 : 0,
          })
        }
        setDealAnalytics(analytics)
      }

      // Recent redemptions
      const { data: redemptions } = await supabase
        .from('deal_redemptions')
        .select('id, party_size, redeemed_at, status, deal_id')
        .eq('restaurant_id', restaurant.id)
        .order('redeemed_at', { ascending: false })
        .limit(10)

      if (redemptions) {
        const enriched: RecentRedemption[] = []
        for (const r of redemptions) {
          const { data: deal } = await supabase
            .from('restaurant_deals')
            .select('title')
            .eq('id', r.deal_id)
            .single()

          enriched.push({
            id: r.id,
            deal_title: deal?.title || 'Unknown Deal',
            party_size: r.party_size,
            redeemed_at: r.redeemed_at,
            status: r.status,
          })
        }
        setRecentRedemptions(enriched)
      }

      setLoading(false)
    }

    loadAnalytics()
  }, [supabase])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const isPro = subscription === 'pro' || subscription === 'enterprise'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Track how your deals and restaurant are performing.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Deal Views</p>
          <p className="text-3xl font-bold text-[var(--neutral)]">{totalViews}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Redemptions</p>
          <p className="text-3xl font-bold text-[var(--neutral)]">{totalRedemptions}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Dining Requests</p>
          <p className="text-3xl font-bold text-[var(--neutral)]">{totalDiningRequests}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total Diners</p>
          <p className="text-3xl font-bold text-[var(--neutral)]">{totalDiners}</p>
        </div>
      </div>

      {/* Deal Performance Table — Pro only */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[var(--neutral)]">Deal Performance</h2>
          {!isPro && (
            <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-1 rounded-full">Pro only</span>
          )}
        </div>
        {!isPro ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Per-deal breakdown is a Pro feature</p>
            <p className="text-xs text-gray-500">See views, redemptions, and conversion rate for each individual deal.</p>
          </div>
        ) : dealAnalytics.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No deals to analyze yet. Create a deal to start tracking performance.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-5 py-3">Deal</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Views</th>
                  <th className="px-5 py-3">Redemptions</th>
                  <th className="px-5 py-3">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dealAnalytics.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-[var(--neutral)]">{deal.title}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        deal.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {deal.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{deal.views}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{deal.redemptions}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{deal.conversionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Redemptions — Pro only */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[var(--neutral)]">Recent Redemptions</h2>
          {!isPro && (
            <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-1 rounded-full">Pro only</span>
          )}
        </div>
        {!isPro ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Redemption history is a Pro feature</p>
            <p className="text-xs text-gray-500">See who redeemed your deals, party sizes, and redemption status.</p>
          </div>
        ) : recentRedemptions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No redemptions yet. When diners use your deals, they&apos;ll appear here.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentRedemptions.map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--neutral)]">{r.deal_title}</p>
                  <p className="text-xs text-gray-500">Party of {r.party_size}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    r.status === 'verified' ? 'bg-green-100 text-green-700' :
                    r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {r.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.redeemed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pro Upsell */}
      {!isPro && (
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-xl p-6 text-white">
          <h3 className="font-bold text-lg mb-2">Unlock Full Analytics with Pro</h3>
          <p className="text-white/90 text-sm mb-4">
            Upgrade to Pro to see per-deal performance breakdowns, redemption history, conversion rates, and more. Start with a free 1-month trial.
          </p>
          <a
            href="/partner/dashboard/billing"
            className="inline-block px-4 py-2 bg-white text-[var(--primary)] rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
          >
            Start Free Trial — then $49/month
          </a>
        </div>
      )}
    </div>
  )
}
