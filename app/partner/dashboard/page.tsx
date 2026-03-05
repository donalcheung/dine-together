'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createSupabaseBrowserClient } from '../../lib/supabase-browser'

interface DealSummary {
  id: string
  title: string
  discount_type: string
  discount_value: number
  is_active: boolean
  redemptions_count: number
}

interface Stats {
  totalDeals: number
  activeDeals: number
  totalViews: number
  totalRedemptions: number
  totalDiningRequests: number
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({ totalDeals: 0, activeDeals: 0, totalViews: 0, totalRedemptions: 0, totalDiningRequests: 0 })
  const [recentDeals, setRecentDeals] = useState<DealSummary[]>([])
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createSupabaseBrowserClient()
  const searchParams = useSearchParams()
  const previewMode = searchParams.get('preview') === 'true'
  const previewRestaurantId = searchParams.get('restaurant_id')

  useEffect(() => {
    const loadDashboard = async () => {
      let restId: string | null = null

      if (previewMode && previewRestaurantId) {
        restId = previewRestaurantId
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        if (!restaurant) return
        restId = restaurant.id
      }

      setRestaurantId(restId)

      // Get deals
      const { data: deals } = await supabase
        .from('restaurant_deals')
        .select('id, title, discount_type, discount_value, is_active, redemptions_count')
        .eq('restaurant_id', restId)
        .order('created_at', { ascending: false })

      const dealsList = deals || []
      setRecentDeals(dealsList.slice(0, 5))

      // Get views count
      const { count: viewsCount } = await supabase
        .from('deal_views')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restId)

      // Get redemptions count
      const { count: redemptionsCount } = await supabase
        .from('deal_redemptions')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restId)

      // Get dining requests count
      const { count: requestsCount } = await supabase
        .from('dining_requests')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restId)

      setStats({
        totalDeals: dealsList.length,
        activeDeals: dealsList.filter(d => d.is_active).length,
        totalViews: viewsCount || 0,
        totalRedemptions: redemptionsCount || 0,
        totalDiningRequests: requestsCount || 0,
      })

      setLoading(false)
    }

    loadDashboard()
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back! Here&apos;s how your restaurant is performing.</p>
        </div>
        <Link
          href="/partner/dashboard/deals"
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all text-sm font-semibold"
        >
          + New Deal
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--neutral)]">{stats.activeDeals}</p>
              <p className="text-xs text-gray-500">Active Deals</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">{stats.totalDeals} total deals created</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--neutral)]">{stats.totalViews}</p>
              <p className="text-xs text-gray-500">Deal Views</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Times users viewed your deals</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--neutral)]">{stats.totalRedemptions}</p>
              <p className="text-xs text-gray-500">Redemptions</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Deals redeemed by diners</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--neutral)]">{stats.totalDiningRequests}</p>
              <p className="text-xs text-gray-500">Dining Requests</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Groups dining at your restaurant</p>
        </div>
      </div>

      {/* Recent Deals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-[var(--neutral)]">Your Deals</h2>
          <Link href="/partner/dashboard/deals" className="text-sm text-[var(--primary)] font-medium hover:underline">
            View All
          </Link>
        </div>
        {recentDeals.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[var(--neutral)] mb-1">No deals yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first deal to start attracting group diners.</p>
            <Link
              href="/partner/dashboard/deals"
              className="inline-block px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--primary-dark)] transition-all"
            >
              Create Your First Deal
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentDeals.map((deal) => (
              <div key={deal.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${deal.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="font-medium text-sm text-[var(--neutral)]">{deal.title}</p>
                    <p className="text-xs text-gray-500">
                      {deal.discount_type === 'percentage' ? `${deal.discount_value}% off` :
                       deal.discount_type === 'fixed' ? `$${deal.discount_value} off` :
                       deal.discount_type === 'free_item' ? 'Free item' : deal.discount_type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--neutral)]">{deal.redemptions_count} redemptions</p>
                  <p className={`text-xs ${deal.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                    {deal.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Link href="/partner/dashboard/deals" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
            <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm text-[var(--neutral)] mb-1">Create a Deal</h3>
          <p className="text-xs text-gray-500">Set up a new promotion for group diners</p>
        </Link>

        <Link href="/partner/dashboard/profile" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm text-[var(--neutral)] mb-1">Edit Profile</h3>
          <p className="text-xs text-gray-500">Update your restaurant information</p>
        </Link>

        <Link href="/partner/dashboard/billing" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
          </div>
          <h3 className="font-semibold text-sm text-[var(--neutral)] mb-1">Upgrade Plan</h3>
          <p className="text-xs text-gray-500">Unlock unlimited deals and priority placement</p>
        </Link>
      </div>
    </div>
  )
}
