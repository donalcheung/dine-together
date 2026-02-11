'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Utensils, MapPin, Clock, Users, ArrowLeft, Navigation, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { validateProfanity } from '@/lib/profanity-filter'
import { awardXP } from '@/lib/progression'
import { XP_REWARDS } from '@/lib/achievements'

// Load Google Maps script
const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function CreateRequestForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [dailyRequestCount, setDailyRequestCount] = useState<number | null>(null)
  const [dailyLimitReached, setDailyLimitReached] = useState(false)
  
  // NEW: Group support
  const [userGroups, setUserGroups] = useState<any[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  
  const [formData, setFormData] = useState({
    restaurant_name: '',
    restaurant_address: '',
    dining_time: '',
    seats_available: 1,
    description: '',
    latitude: null as number | null,
    longitude: null as number | null,
    price_level: null as string | null,
    cuisine_type: null as string | null,
  })

  useEffect(() => {
    checkUser()
    initializeGoogleMaps()
    loadUserGroups()
    
    // NEW: Get group from URL parameter
    const groupParam = searchParams.get('group')
    if (groupParam) {
      setSelectedGroupId(groupParam)
    }
  }, [])

  const initializeGoogleMaps = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      console.error('Google Maps API key not found')
      return
    }

    try {
      await loadGoogleMapsScript(apiKey)
      setMapsLoaded(true)
    } catch (error) {
      console.error('Error loading Google Maps:', error)
    }
  }

  useEffect(() => {
    if (mapsLoaded && searchInputRef.current) {
      initializeAutocomplete()
    }
  }, [mapsLoaded])

  useEffect(() => {
    if (!user) return
    checkDailyRequestLimit()
  }, [user])

  const checkDailyRequestLimit = async () => {
    if (!user) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const { data: requestsToday, error: countError } = await supabase
      .from('dining_requests')
      .select('id', { count: 'exact' })
      .eq('host_id', user.id)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    if (countError) throw countError
    const count = requestsToday?.length || 0
    setDailyRequestCount(count)
    setDailyLimitReached(count >= 3)
    return count
  }

  const initializeAutocomplete = () => {
    if (!searchInputRef.current || !(window as any).google) return

    const autocomplete = new (window as any).google.maps.places.Autocomplete(
      searchInputRef.current,
      {
        types: ['establishment'],
        fields: ['name', 'formatted_address', 'geometry', 'place_id'],
      }
    )

    autocomplete.addListener('place_changed', async () => {
      const place = autocomplete.getPlace()

      if (place.geometry && place.geometry.location) {
        // Fetch additional restaurant details from our API
        const placeDetails = await fetchRestaurantDetails(
          place.name || '',
          place.formatted_address || ''
        )

        setFormData(prev => ({
          ...prev,
          restaurant_name: place.name || '',
          restaurant_address: place.formatted_address || '',
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          price_level: placeDetails?.price_level || null,
          cuisine_type: placeDetails?.cuisine_type || null,
        }))
      }
    })

    autocompleteRef.current = autocomplete
  }

  // Helper function to extract cuisine from types array
  const extractCuisine = (types: string[]): string | null => {
    if (!types || types.length === 0) return null
    
    // Common cuisine type mappings
    const cuisineMap: Record<string, string> = {
      'italian_restaurant': 'Italian',
      'chinese_restaurant': 'Chinese',
      'japanese_restaurant': 'Japanese',
      'mexican_restaurant': 'Mexican',
      'thai_restaurant': 'Thai',
      'indian_restaurant': 'Indian',
      'french_restaurant': 'French',
      'korean_restaurant': 'Korean',
      'vietnamese_restaurant': 'Vietnamese',
      'greek_restaurant': 'Greek',
      'spanish_restaurant': 'Spanish',
      'mediterranean_restaurant': 'Mediterranean',
      'american_restaurant': 'American',
      'seafood_restaurant': 'Seafood',
      'steakhouse': 'Steakhouse',
      'sushi_restaurant': 'Sushi',
      'pizza_restaurant': 'Pizza',
      'bakery': 'Bakery',
      'cafe': 'Cafe',
      'bar': 'Bar & Grill',
      'fast_food_restaurant': 'Fast Food',
      'sandwich_shop': 'Sandwiches',
      'breakfast_restaurant': 'Breakfast',
      'brunch_restaurant': 'Brunch',
      'barbecue_restaurant': 'BBQ',
      'hamburger_restaurant': 'Burgers',
      'ramen_restaurant': 'Ramen',
      'noodle_house': 'Noodles',
    }

    // Find the first matching cuisine type
    for (const type of types) {
      if (cuisineMap[type]) {
        return cuisineMap[type]
      }
    }

    // If no specific cuisine found, check for generic "restaurant"
    if (types.includes('restaurant')) {
      return 'Restaurant'
    }

    return null
  }

  // Fetch restaurant details including price level and types
  const fetchRestaurantDetails = async (name: string, address: string) => {
    try {
      const response = await fetch(
        `/api/places?name=${encodeURIComponent(name)}&address=${encodeURIComponent(address)}`
      )
      
      if (!response.ok) return null
      
      const data = await response.json()
      
      if (!data) return null

      // Convert price_level to readable format
      let priceLevel = null
      if (data.price_level !== undefined && data.price_level !== null) {
        const priceLevels = ['Free', '$', '$$', '$$$', '$$$$']
        priceLevel = priceLevels[parseInt(data.price_level)] || null
      }

      // Extract cuisine from types
      const cuisineType = data.types ? extractCuisine(data.types) : null

      return {
        price_level: priceLevel,
        cuisine_type: cuisineType,
      }
    } catch (error) {
      console.error('Error fetching restaurant details:', error)
      return null
    }
  }

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }
    
    setUser(user)
  }

  // NEW: Load user's groups
  const loadUserGroups = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('group_members')
      .select(`
        groups (*)
      `)
      .eq('user_id', user.id)

    const groups = data?.map((m: any) => m.groups).filter(Boolean) || []
    setUserGroups(groups)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!user) {
        alert('Please sign in to create a request.')
        setLoading(false)
        return
      }

      // Validate profanity in request description
      if (formData.description) {
        validateProfanity(formData.description, 'Request description')
      }

      const count = await checkDailyRequestLimit()
      if (count >= 3) {
        alert('You can only create up to 3 requests per day.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('dining_requests')
        .insert([
          {
            host_id: user.id,
            restaurant_name: formData.restaurant_name,
            restaurant_address: formData.restaurant_address,
            latitude: formData.latitude,
            longitude: formData.longitude,
            dining_time: formData.dining_time,
            seats_available: formData.seats_available,
            total_seats: formData.seats_available,
            description: formData.description,
            status: 'open',
            price_level: formData.price_level,
            cuisine_type: formData.cuisine_type,
            group_id: selectedGroupId || null, // NEW: Save group_id
          }
        ])
        .select()
        .single()

      if (error) throw error

      await awardXP(user.id, XP_REWARDS.CREATE_REQUEST, 'Created dining request', data.id)

      // NEW: Redirect to group page if created from group
      if (selectedGroupId) {
        router.push(`/groups/${selectedGroupId}`)
      } else {
        router.push(`/request/${data.id}`)
      }
    } catch (error: any) {
      console.error('Error creating request:', error)
      alert(`Failed to create request: ${error?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'seats_available' ? parseInt(value) : value
    }))
  }

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow manual typing in the search field
    setFormData(prev => ({
      ...prev,
      restaurant_name: e.target.value
    }))
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
            <Image
              src="/logo.png"
              alt="TableMesh Logo"
              width={28}
              height={28}
              className="w-7 h-7"
            />
            <h1 className="text-xl font-bold text-[var(--neutral)]">TableMesh</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[var(--neutral)] mb-2">
            Create Dining Request
          </h2>
          <p className="text-gray-600 text-lg">
            Let others know where you're dining and invite them to join!
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {dailyLimitReached && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <div className="font-semibold">Daily limit reached</div>
              <p className="text-sm">
                You have created {dailyRequestCount ?? 3} requests today. Try again tomorrow.
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Restaurant Search with Autocomplete */}
            <div>
              <label htmlFor="restaurant_search" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Search className="w-5 h-5 text-[var(--primary)]" />
                Search for Restaurant
              </label>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  id="restaurant_search"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  placeholder="Start typing restaurant name..."
                />

                {mapsLoaded && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Utensils className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <span>✨</span>
                <span>Start typing to see restaurant suggestions</span>
              </p>
            </div>

            {/* Restaurant Address (Always Editable) */}
            {formData.restaurant_address && (
              <div>
                <label htmlFor="restaurant_address" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-5 h-5 text-[var(--primary)]" />
                  Address
                </label>
                <input
                  id="restaurant_address"
                  name="restaurant_address"
                  type="text"
                  value={formData.restaurant_address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-green-300 bg-green-50 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  placeholder="e.g., 123 Main St, New York, NY 10001"
                />
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <Navigation className="w-4 h-4" />
                  <span>✓ Location saved - you can edit if needed</span>
                </div>
              </div>
            )}

            {/* Manual Address Entry (if autocomplete didn't work) */}
            {!formData.restaurant_address && formData.restaurant_name && (
              <div>
                <label htmlFor="restaurant_address_manual" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-5 h-5 text-[var(--primary)]" />
                  Restaurant Address (Manual Entry)
                </label>
                <input
                  id="restaurant_address_manual"
                  name="restaurant_address"
                  type="text"
                  value={formData.restaurant_address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  placeholder="e.g., 123 Main St, New York, NY 10001"
                />
                <p className="mt-2 text-sm text-amber-600">
                  ⚠️ Try using the search above for better accuracy
                </p>
              </div>
            )}

            {/* Dining Time */}
            <div>
              <label htmlFor="dining_time" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-5 h-5 text-[var(--primary)]" />
                Dining Time
              </label>
              <input
                id="dining_time"
                name="dining_time"
                type="datetime-local"
                value={formData.dining_time}
                onChange={handleChange}
                required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              />
              <p className="mt-2 text-sm text-gray-500">
                Typically post 1-3 hours before your dining time
              </p>
            </div>

            {/* Seats Available */}
            <div>
              <label htmlFor="seats_available" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-5 h-5 text-[var(--primary)]" />
                How many people do you want to join?
              </label>
              <select
                id="seats_available"
                name="seats_available"
                value={formData.seats_available}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              >
                <option value={1}>1 person</option>
                <option value={2}>2 people</option>
                <option value={3}>3 people</option>
                <option value={4}>4 people</option>
                <option value={5}>5 people</option>
              </select>
            </div>

            {/* NEW: Group Selection */}
            <div>
              <label htmlFor="group_id" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-5 h-5 text-[var(--primary)]" />
                Group (Optional)
              </label>
              <select
                id="group_id"
                name="group_id"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              >
                <option value="">No group - Open to everyone</option>
                {userGroups.map((group: any) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                {selectedGroupId ? (
                  <span className="text-purple-600">🔒 This request will only be visible to group members</span>
                ) : (
                  <span>Group requests are only visible to group members</span>
                )}
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all resize-none"
                placeholder="e.g., I'm craving dim sum and want to try multiple dishes! Looking for friendly people to share the experience."
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-[var(--neutral)] mb-2">✨ Smart Restaurant Search:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Type restaurant name to see suggestions with full addresses</li>
                <li>• Select a suggestion to auto-fill everything</li>
                <li>• Location is saved so others see distance from them</li>
                <li>• Rate each other after the meal!</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.restaurant_name || dailyLimitReached}
              className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                'Create Dining Request'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function CreateRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    }>
      <CreateRequestForm />
    </Suspense>
  )
}
