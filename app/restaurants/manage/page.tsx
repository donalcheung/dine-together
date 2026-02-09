'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Utensils, ArrowLeft, Plus, Settings, BarChart3, Users, DollarSign, TrendingUp, Edit2, Eye, Trash2, Power, PowerOff, Store, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Restaurant {
  id: string
  name: string
  description?: string
  address: string
  verification_status: 'unverified' | 'pending' | 'verified' | 'premium'
  is_active: boolean
  is_accepting_deals: boolean
  logo_url?: string
  cover_image_url?: string
  cuisine_types?: string[]
  price_range?: number
  created_at: string
}

interface Deal {
  id: string
  title: string
  description: string
  discount_type: 'percentage' | 'fixed_amount' | 'free_item'
  discount_value: number
  min_party_size: number
  valid_days?: number[]
  valid_time_start?: string
  valid_time_end?: string
  expires_at?: string
  is_active: boolean
  redemptions_count: number
  max_redemptions?: number
}

export default function RestaurantManagePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_deals: 0,
    active_deals: 0,
    total_redemptions: 0,
    this_month_redemptions: 0,
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }
    
    setUser(user)
    loadRestaurant(user.id)
  }

  const loadRestaurant = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', userId)
        .single()

      if (error) {
        // No restaurant found, redirect to claim page
        router.push('/restaurants/claim')
        return
      }

      setRestaurant(data)
      loadDeals(data.id)
      loadStats(data.id)
    } catch (error) {
      console.error('Error loading restaurant:', error)
      router.push('/restaurants/claim')
    } finally {
      setLoading(false)
    }
  }

  const loadDeals = async (restaurantId: string) => {
    try {
      const { data, error } = await supabase
        .from('restaurant_deals')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDeals(data || [])
    } catch (error) {
      console.error('Error loading deals:', error)
    }
  }

  const loadStats = async (restaurantId: string) => {
    try {
      // Get total redemptions
      const { data: redemptions, error: redemptionsError } = await supabase
        .from('deal_redemptions')
        .select('*')
        .eq('restaurant_id', restaurantId)

      if (redemptionsError) throw redemptionsError

      // Get this month's redemptions
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const thisMonthRedemptions = redemptions?.filter(r => 
        new Date(r.redeemed_at) >= startOfMonth
      ).length || 0

      // Get deals count
      const { data: allDeals, error: dealsError } = await supabase
        .from('restaurant_deals')
        .select('*')
        .eq('restaurant_id', restaurantId)

      if (dealsError) throw dealsError

      const activeDeals = allDeals?.filter(d => d.is_active).length || 0

      setStats({
        total_deals: allDeals?.length || 0,
        active_deals: activeDeals,
        total_redemptions: redemptions?.length || 0,
        this_month_redemptions: thisMonthRedemptions,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const toggleDealActive = async (dealId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('restaurant_deals')
        .update({ is_active: !currentStatus })
        .eq('id', dealId)

      if (error) throw error

      if (restaurant) {
        loadDeals(restaurant.id)
        loadStats(restaurant.id)
      }
    } catch (error: any) {
      alert(`Failed to update deal: ${error.message}`)
    }
  }

  const deleteDeal = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal? This cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('restaurant_deals')
        .delete()
        .eq('id', dealId)

      if (error) throw error

      if (restaurant) {
        loadDeals(restaurant.id)
        loadStats(restaurant.id)
      }
    } catch (error: any) {
      alert(`Failed to delete deal: ${error.message}`)
    }
  }

  const getVerificationBadge = (status: string) => {
    const badges = {
      unverified: { icon: AlertCircle, text: 'Unverified', color: 'text-gray-600 bg-gray-100' },
      pending: { icon: Clock, text: 'Pending', color: 'text-yellow-600 bg-yellow-100' },
      verified: { icon: CheckCircle, text: 'Verified', color: 'text-green-600 bg-green-100' },
      premium: { icon: CheckCircle, text: 'Premium', color: 'text-purple-600 bg-purple-100' },
    }
    
    const badge = badges[status as keyof typeof badges] || badges.unverified
    const Icon = badge.icon
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${badge.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{badge.text}</span>
      </div>
    )
  }

  const formatDays = (days?: number[]) => {
    if (!days || days.length === 0) return 'All days'
    if (days.length === 7) return 'Every day'
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map(d => dayNames[d - 1]).join(', ')
  }

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  if (!restaurant) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Utensils className="w-7 h-7 text-[var(--primary)]" strokeWidth={2.5} />
              <h1 className="text-xl font-bold text-[var(--neutral)]">TableMesh</h1>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-[var(--neutral)] mb-2">
                {restaurant.name}
              </h1>
              <p className="text-gray-600 text-lg">{restaurant.address}</p>
            </div>
            <div className="flex items-center gap-3">
              {getVerificationBadge(restaurant.verification_status)}
              <Link
                href={`/restaurants/${restaurant.id}/settings`}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all border border-gray-200 font-medium flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>
          </div>

          {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {restaurant.cuisine_types.map((cuisine, i) => (
                <span key={i} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                  {cuisine}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--neutral)]">{stats.total_deals}</div>
                <div className="text-sm text-gray-600">Total Deals</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--neutral)]">{stats.active_deals}</div>
                <div className="text-sm text-gray-600">Active Deals</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--neutral)]">{stats.total_redemptions}</div>
                <div className="text-sm text-gray-600">Total Uses</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-[var(--neutral)]">{stats.this_month_redemptions}</div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Deals Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--neutral)]">Your Deals</h2>
            <Link
              href={`/restaurants/${restaurant.id}/deals/create`}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Deal
            </Link>
          </div>

          {deals.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No deals yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first deal to attract customers during non-peak hours
              </p>
              <Link
                href={`/restaurants/${restaurant.id}/deals/create`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Your First Deal
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {deals.map((deal) => {
                const expired = isExpired(deal.expires_at)
                
                return (
                  <div
                    key={deal.id}
                    className={`border-2 rounded-xl p-6 transition-all ${
                      deal.is_active && !expired
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-[var(--neutral)]">{deal.title}</h3>
                          {deal.is_active && !expired && (
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                              ACTIVE
                            </span>
                          )}
                          {expired && (
                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                              EXPIRED
                            </span>
                          )}
                          {!deal.is_active && !expired && (
                            <span className="px-3 py-1 bg-gray-400 text-white text-xs font-bold rounded-full">
                              INACTIVE
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4">{deal.description}</p>

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Discount:</span>
                            <span className="ml-2 font-semibold text-[var(--neutral)]">
                              {deal.discount_type === 'percentage' && `${deal.discount_value}% off`}
                              {deal.discount_type === 'fixed_amount' && `$${deal.discount_value} off`}
                              {deal.discount_type === 'free_item' && 'Free item'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Min Party:</span>
                            <span className="ml-2 font-semibold text-[var(--neutral)]">
                              {deal.min_party_size} people
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Redemptions:</span>
                            <span className="ml-2 font-semibold text-[var(--neutral)]">
                              {deal.redemptions_count}
                              {deal.max_redemptions && ` / ${deal.max_redemptions}`}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-sm">
                          {deal.valid_days && (
                            <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-gray-200">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>{formatDays(deal.valid_days)}</span>
                            </div>
                          )}
                          {deal.valid_time_start && deal.valid_time_end && (
                            <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-gray-200">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>{deal.valid_time_start} - {deal.valid_time_end}</span>
                            </div>
                          )}
                          {deal.expires_at && (
                            <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-gray-200">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>Expires {new Date(deal.expires_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleDealActive(deal.id, deal.is_active)}
                          className={`p-2 rounded-lg transition-colors ${
                            deal.is_active
                              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                          title={deal.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {deal.is_active ? <PowerOff className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                        </button>
                        
                        <button
                          onClick={() => deleteDeal(deal.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
