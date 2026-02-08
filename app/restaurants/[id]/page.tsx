'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Utensils, ArrowLeft, MapPin, Phone, Globe, ExternalLink, Clock, Calendar, Users, Tag, CheckCircle, AlertCircle, Star, Navigation } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Restaurant {
  id: string
  name: string
  description?: string
  address: string
  city: string
  state?: string
  phone?: string
  email?: string
  website?: string
  verification_status: string
  logo_url?: string
  cover_image_url?: string
  cuisine_types?: string[]
  price_range?: number
  latitude?: number
  longitude?: number
}

interface Deal {
  id: string
  title: string
  description: string
  discount_type: 'percentage' | 'fixed_amount' | 'free_item'
  discount_value: number
  min_party_size: number
  max_party_size?: number
  min_spend?: number
  valid_days?: number[]
  valid_time_start?: string
  valid_time_end?: string
  expires_at?: string
  is_active: boolean
  redemptions_count: number
  max_redemptions?: number
}

export default function RestaurantDetailPage() {
  const router = useRouter()
  const params = useParams()
  const restaurantId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    loadRestaurant()
    loadDeals()
  }, [restaurantId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const loadRestaurant = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single()

      if (error) throw error
      setRestaurant(data)
    } catch (error) {
      console.error('Error loading restaurant:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_deals')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Filter out expired deals
      const activeDeals = (data || []).filter(deal => {
        if (!deal.expires_at) return true
        return new Date(deal.expires_at) > new Date()
      })

      setDeals(activeDeals)
    } catch (error) {
      console.error('Error loading deals:', error)
    }
  }

  const handleClaimDeal = async (deal: Deal) => {
    if (!user) {
      router.push('/auth')
      return
    }

    // For now, just show a success message
    // In production, this would create a redemption record
    alert(`Deal claimed! Show this code to the restaurant: DEAL-${deal.id.slice(0, 6).toUpperCase()}`)
  }

  const getPriceRange = (range?: number) => {
    if (!range) return ''
    return '$'.repeat(range)
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

  const isDealActive = (deal: Deal) => {
    const now = new Date()
    const currentDay = now.getDay() // 0-6 (Sunday-Saturday)
    const adjustedDay = currentDay === 0 ? 7 : currentDay // Convert to 1-7 (Mon-Sun)
    const currentTime = now.toTimeString().slice(0, 5) // "14:30"
    
    // Check if today is valid
    if (deal.valid_days && !deal.valid_days.includes(adjustedDay)) {
      return false
    }
    
    // Check if current time is valid
    if (deal.valid_time_start && deal.valid_time_end) {
      if (currentTime < deal.valid_time_start || currentTime > deal.valid_time_end) {
        return false
      }
    }
    
    return true
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Restaurant not found</h2>
          <Link href="/restaurants" className="text-[var(--primary)] hover:underline mt-4 inline-block">
            Back to Restaurants
          </Link>
        </div>
      </div>
    )
  }

  const mapUrl = restaurant.latitude && restaurant.longitude
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${restaurant.latitude},${restaurant.longitude}&zoom=15`
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/restaurants" className="flex items-center gap-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Restaurants</span>
          </Link>
          
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="w-7 h-7 text-[var(--primary)]" strokeWidth={2.5} />
            <h1 className="text-xl font-bold text-[var(--neutral)]">DineTogether</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Restaurant Header */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Cover Image */}
              {restaurant.cover_image_url ? (
                <div className="h-64 overflow-hidden">
                  <img
                    src={restaurant.cover_image_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                  <Utensils className="w-32 h-32 text-white opacity-50" />
                </div>
              )}

              {/* Restaurant Info */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-[var(--neutral)] mb-2">
                      {restaurant.name}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-5 h-5" />
                      <span>{restaurant.address}</span>
                    </div>
                  </div>
                  {getVerificationBadge(restaurant.verification_status)}
                </div>

                {restaurant.description && (
                  <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                    {restaurant.description}
                  </p>
                )}

                {/* Cuisine Types & Price */}
                <div className="flex flex-wrap gap-3 items-center">
                  {restaurant.cuisine_types?.map((cuisine, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-200"
                    >
                      {cuisine}
                    </span>
                  ))}
                  {restaurant.price_range && (
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                      {getPriceRange(restaurant.price_range)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Active Deals */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-[var(--neutral)] mb-6 flex items-center gap-3">
                <Tag className="w-8 h-8 text-[var(--primary)]" />
                Available Deals
              </h2>

              {deals.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    No active deals right now
                  </h3>
                  <p className="text-gray-600">
                    Check back later for special offers!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {deals.map((deal) => {
                    const isActive = isDealActive(deal)
                    
                    return (
                      <div
                        key={deal.id}
                        className={`border-2 rounded-2xl p-6 transition-all ${
                          isActive
                            ? 'border-green-300 bg-green-50'
                            : 'border-amber-300 bg-amber-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-[var(--neutral)] mb-2">
                              {deal.title}
                            </h3>
                            <p className="text-gray-700 mb-4">{deal.description}</p>
                          </div>
                          <div className={`px-4 py-2 rounded-full font-bold text-2xl ${
                            isActive ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {deal.discount_type === 'percentage' && `-${deal.discount_value}%`}
                            {deal.discount_type === 'fixed_amount' && `-$${deal.discount_value}`}
                            {deal.discount_type === 'free_item' && 'FREE'}
                          </div>
                        </div>

                        {/* Deal Details */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Users className="w-4 h-4 text-[var(--primary)]" />
                            <span>
                              Min {deal.min_party_size} people
                              {deal.max_party_size && `, max ${deal.max_party_size}`}
                            </span>
                          </div>
                          
                          {deal.min_spend && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Tag className="w-4 h-4 text-[var(--primary)]" />
                              <span>Min spend: ${deal.min_spend}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-[var(--primary)]" />
                            <span>{formatDays(deal.valid_days)}</span>
                          </div>

                          {deal.valid_time_start && deal.valid_time_end && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Clock className="w-4 h-4 text-[var(--primary)]" />
                              <span>{deal.valid_time_start} - {deal.valid_time_end}</span>
                            </div>
                          )}
                        </div>

                        {/* Status & Action */}
                        {isActive ? (
                          <div>
                            <div className="flex items-center gap-2 text-green-700 mb-3">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-semibold">Available now!</span>
                            </div>
                            <button
                              onClick={() => handleClaimDeal(deal)}
                              className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-[var(--primary-dark)] transition-all"
                            >
                              Claim Deal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-700">
                            <Clock className="w-5 h-5" />
                            <span className="font-semibold">
                              Not available at this time. Valid {formatDays(deal.valid_days)} from {deal.valid_time_start} - {deal.valid_time_end}
                            </span>
                          </div>
                        )}

                        {/* Redemption Count */}
                        {deal.max_redemptions && (
                          <div className="mt-4 pt-4 border-t border-gray-300">
                            <div className="text-sm text-gray-600">
                              {deal.redemptions_count} / {deal.max_redemptions} claimed
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[var(--primary)] h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min((deal.redemptions_count / deal.max_redemptions) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Map */}
            {mapUrl && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-bold">
                  📍 Location
                </div>
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                ></iframe>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg text-[var(--neutral)] mb-4">Contact</h3>
              
              <div className="space-y-3">
                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">{restaurant.phone}</span>
                  </a>
                )}

                {restaurant.website && (
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium flex-1">Website</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className="text-sm">{restaurant.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
