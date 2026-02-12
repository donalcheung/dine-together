'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Utensils, ArrowLeft, Search, MapPin, Phone, Mail, Globe, Image, Check, AlertCircle, Store } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ClaimRestaurantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50" /> }>
      <ClaimRestaurantContent />
    </Suspense>
  )
}

function ClaimRestaurantContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'search' | 'details' | 'success'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [googleResults, setGoogleResults] = useState<any[]>([])
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    latitude: null as number | null,
    longitude: null as number | null,
    phone: '',
    email: '',
    website: '',
    google_place_id: '',
    cuisine_types: [] as string[],
    price_range: 2,
  })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'manual') {
      setStep('details')
    }
  }, [searchParams])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }
    
    setUser(user)

    // Check if user already owns a restaurant
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (existingRestaurant) {
      router.push('/restaurants/manage')
    }
  }

  const searchGooglePlaces = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery + ' restaurant')}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
      const data = await response.json()
      
      if (data.results) {
        setGoogleResults(data.results.slice(0, 5))
      }
    } catch (error) {
      console.error('Error searching places:', error)
    } finally {
      setSearching(false)
    }
  }

  const selectGooglePlace = async (place: any) => {
    setSelectedPlace(place)
    
    // Fetch detailed info
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,geometry,types,price_level&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
      const data = await response.json()
      const details = data.result

      setFormData({
        name: details.name || place.name,
        description: '',
        address: details.formatted_address || place.formatted_address,
        city: place.formatted_address?.split(',')[1]?.trim() || '',
        state: place.formatted_address?.split(',')[2]?.trim().split(' ')[0] || '',
        postal_code: place.formatted_address?.match(/\d{5}/)?.[0] || '',
        latitude: details.geometry?.location?.lat || place.geometry?.location?.lat,
        longitude: details.geometry?.location?.lng || place.geometry?.location?.lng,
        phone: details.formatted_phone_number || '',
        email: '',
        website: details.website || '',
        google_place_id: place.place_id,
        cuisine_types: [],
        price_range: details.price_level || 2,
      })

      setStep('details')
    } catch (error) {
      console.error('Error fetching place details:', error)
    }
  }

  const handleManualEntry = () => {
    setStep('details')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price_range' ? parseInt(value) : value
    }))
  }

  const handleCuisineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cuisines = e.target.value.split(',').map(c => c.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, cuisine_types: cuisines }))
  }

  const normalizeValue = (value: string) => value.trim()

  const checkForDuplicate = async () => {
    if (formData.google_place_id) {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .eq('google_place_id', formData.google_place_id)
        .limit(1)

      if (error) throw error
      return (data || []).length > 0
    }

    const name = normalizeValue(formData.name)
    const address = normalizeValue(formData.address)
    const city = normalizeValue(formData.city)
    const state = normalizeValue(formData.state)
    const postalCode = normalizeValue(formData.postal_code)

    if (!name || !address || !city) return false

    let query = supabase
      .from('restaurants')
      .select('id')
      .ilike('name', name)
      .ilike('address', address)
      .ilike('city', city)
      .limit(1)

    if (state) {
      query = query.ilike('state', state)
    }

    if (postalCode) {
      query = query.eq('postal_code', postalCode)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []).length > 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const isDuplicate = await checkForDuplicate()
      if (isDuplicate) {
        alert('A restaurant with these details already exists. Try claiming the existing listing instead.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('restaurants')
        .insert([
          {
            ...formData,
            owner_id: user.id,
            verification_status: formData.google_place_id ? 'pending' : 'unverified',
            verification_method: formData.google_place_id ? 'google_business' : null,
            is_active: true,
            is_accepting_deals: true,
          }
        ])
        .select()
        .single()

      if (error) throw error

      setStep('success')
      
      setTimeout(() => {
        router.push('/restaurants/manage')
      }, 3000)
    } catch (error: any) {
      console.error('Error creating restaurant:', error)
      alert(`Failed to create restaurant: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="w-7 h-7 text-[var(--primary)]" strokeWidth={2.5} />
            <h1 className="text-xl font-bold text-[var(--neutral)]">TableMesh</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {step === 'search' && (
          <>
            <div className="mb-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-[var(--neutral)] mb-2">
                Claim Your Restaurant
              </h2>
              <p className="text-gray-600 text-lg">
                Start offering deals to fill tables during non-peak hours
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
              {/* Search Section */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-[var(--neutral)] mb-4">
                  Search for your restaurant on Google
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchGooglePlaces()}
                      placeholder="Search for your restaurant..."
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all text-lg"
                    />
                  </div>
                  <button
                    onClick={searchGooglePlaces}
                    disabled={searching || !searchQuery.trim()}
                    className="px-8 py-4 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  💡 We'll automatically verify your restaurant using Google Business data
                </p>
              </div>

              {/* Search Results */}
              {googleResults.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-[var(--neutral)] mb-4">Select your restaurant:</h3>
                  <div className="space-y-3">
                    {googleResults.map((place) => (
                      <button
                        key={place.place_id}
                        onClick={() => selectGooglePlace(place)}
                        className="w-full p-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-[var(--primary)] rounded-xl transition-all text-left"
                      >
                        <div className="font-semibold text-[var(--neutral)] mb-1">{place.name}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {place.formatted_address}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
              </div>

              {/* Manual Entry */}
              <div className="text-center">
                <p className="text-gray-600 mb-4">Can't find your restaurant?</p>
                <button
                  onClick={handleManualEntry}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Enter Details Manually
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-[var(--neutral)] mb-2">
                Restaurant Details
              </h2>
              <p className="text-gray-600 text-lg">
                Complete your restaurant profile
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Restaurant Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell customers about your restaurant..."
                  />
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  />
                </div>

                {/* City, State, Zip */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <input
                      id="postal_code"
                      name="postal_code"
                      type="text"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="website" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    placeholder="https://"
                  />
                </div>

                {/* Cuisine Types */}
                <div>
                  <label htmlFor="cuisine_types" className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Types (comma-separated)
                  </label>
                  <input
                    id="cuisine_types"
                    type="text"
                    value={formData.cuisine_types.join(', ')}
                    onChange={handleCuisineChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    placeholder="e.g., Italian, Pizza, Pasta"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label htmlFor="price_range" className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select
                    id="price_range"
                    name="price_range"
                    value={formData.price_range}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  >
                    <option value={1}>$ - Budget Friendly</option>
                    <option value={2}>$$ - Moderate</option>
                    <option value={3}>$$$ - Upscale</option>
                    <option value={4}>$$$$ - Fine Dining</option>
                  </select>
                </div>

                {/* Info Box */}
                {formData.google_place_id && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">Google Business Found!</h4>
                        <p className="text-sm text-green-700">
                          Your restaurant will be marked as "Pending Verification". We'll send a verification email to confirm ownership.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!formData.google_place_id && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-1">Manual Entry</h4>
                        <p className="text-sm text-amber-700">
                          Your restaurant will be marked as "Unverified". You can verify it later through phone or document verification.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Profile...
                    </div>
                  ) : (
                    'Claim Restaurant'
                  )}
                </button>
              </form>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-4xl font-bold text-[var(--neutral)] mb-4">
              Restaurant Claimed! 🎉
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Redirecting to your dashboard...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
          </div>
        )}
      </main>
    </div>
  )
}
