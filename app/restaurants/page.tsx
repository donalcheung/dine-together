'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Utensils, MapPin, Star, ChevronRight, Tag, Search, Filter, CheckCircle, Clock, Store, Users, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Restaurant {
  id: string
  name: string
  description?: string
  address: string
  city: string
  state?: string
  verification_status: 'unverified' | 'pending' | 'verified' | 'premium'
  logo_url?: string
  cover_image_url?: string
  cuisine_types?: string[]
  price_range?: number
  is_active: boolean
  active_deals_count?: number
}

export default function BrowseRestaurantsPage() {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [dealsOnly, setDealsOnly] = useState(true)

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    try {
      let query = supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('verification_status', { ascending: false })
        .order('name', { ascending: true })

      const { data, error } = await query

      if (error) throw error

      // Load active deals count for each restaurant
      const restaurantsWithDeals = await Promise.all(
        (data || []).map(async (restaurant) => {
          const { count } = await supabase
            .from('restaurant_deals')
            .select('*', { count: 'exact', head: true })
            .eq('restaurant_id', restaurant.id)
            .eq('is_active', true)

          return {
            ...restaurant,
            active_deals_count: count || 0,
          }
        })
      )

      setRestaurants(restaurantsWithDeals)
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRestaurants = restaurants.filter((restaurant) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = restaurant.name.toLowerCase().includes(query)
      const matchesCuisine = restaurant.cuisine_types?.some(c => c.toLowerCase().includes(query))
      const matchesCity = restaurant.city.toLowerCase().includes(query)
      
      if (!matchesName && !matchesCuisine && !matchesCity) return false
    }

    // Cuisine filter
    if (selectedCuisine !== 'all') {
      if (!restaurant.cuisine_types?.includes(selectedCuisine)) return false
    }

    // Verified only filter
    if (verifiedOnly) {
      if (restaurant.verification_status === 'unverified' || restaurant.verification_status === 'pending') {
        return false
      }
    }

    // Deals only filter
    if (dealsOnly) {
      if (!restaurant.active_deals_count || restaurant.active_deals_count === 0) return false
    }

    return true
  })

  // Get unique cuisines for filter
  const allCuisines = Array.from(
    new Set(
      restaurants.flatMap((r) => r.cuisine_types || [])
    )
  ).sort()

  const getPriceRange = (range?: number) => {
    if (!range) return ''
    return '$'.repeat(range)
  }

  const getVerificationBadge = (status: string) => {
    const badges = {
      verified: { icon: CheckCircle, text: 'Verified', color: 'text-green-600 bg-green-100' },
      premium: { icon: CheckCircle, text: 'Premium', color: 'text-purple-600 bg-purple-100' },
    }
    
    const badge = badges[status as keyof typeof badges]
    if (!badge) return null
    
    const Icon = badge.icon
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${badge.color}`}>
        <Icon className="w-3 h-3" />
        <span className="text-xs font-medium">{badge.text}</span>
      </div>
    )
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
          
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="w-7 h-7 text-[var(--primary)]" strokeWidth={2.5} />
            <h1 className="text-xl font-bold text-[var(--neutral)]">DineTogether</h1>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">
              Restaurant Deals & Discounts
            </h1>
            <p className="text-xl text-purple-100">
              Discover exclusive restaurant deals and limited-time offers
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Restaurant name, cuisine, or city..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Cuisine Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Type
              </label>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
              >
                <option value="all">All Cuisines</option>
                {allCuisines.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filters
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-gray-700">Verified only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dealsOnly}
                  onChange={(e) => setDealsOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-gray-700">Active deals only</span>
              </label>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredRestaurants.length}</span> of{' '}
              <span className="font-semibold">{restaurants.length}</span> restaurants
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading restaurants...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRestaurants.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search query
            </p>
          </div>
        )}

        {/* Restaurant Grid */}
        {!loading && filteredRestaurants.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden block"
              >
                {/* Cover Image */}
                {restaurant.cover_image_url ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={restaurant.cover_image_url}
                      alt={restaurant.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <Utensils className="w-20 h-20 text-white opacity-50" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[var(--neutral)] mb-1">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{restaurant.city}{restaurant.state && `, ${restaurant.state}`}</span>
                      </div>
                    </div>
                    {getVerificationBadge(restaurant.verification_status)}
                  </div>

                  {restaurant.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>
                  )}

                  {/* Cuisine Types */}
                  {restaurant.cuisine_types && restaurant.cuisine_types.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {restaurant.cuisine_types.slice(0, 3).map((cuisine, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {cuisine}
                        </span>
                      ))}
                      {restaurant.cuisine_types.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{restaurant.cuisine_types.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      {restaurant.price_range && (
                        <span className="text-sm font-semibold text-gray-700">
                          {getPriceRange(restaurant.price_range)}
                        </span>
                      )}
                    </div>

                    {restaurant.active_deals_count && restaurant.active_deals_count > 0 ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                        <Tag className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {restaurant.active_deals_count} {restaurant.active_deals_count === 1 ? 'deal' : 'deals'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No active deals</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Call to Action for Restaurant Owners */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl shadow-lg p-8 border-2 border-purple-200">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Own a restaurant?
              </h3>
              <p className="text-gray-700 mb-4">
                Join DineTogether and offer exclusive time-based deals to attract more diners.
              </p>
              <Link
                href="/restaurants/claim"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all font-medium shadow-md"
              >
                <Store className="w-5 h-5" />
                Claim Your Restaurant
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
