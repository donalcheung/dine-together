'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Utensils, MapPin, Clock, Users, Plus, LogOut, User, Star, Heart, Navigation, Filter, Check, Store } from 'lucide-react'
import { supabase, DiningRequest, Profile } from '@/lib/supabase'

interface UserLocation {
  latitude: number
  longitude: number
}

interface FilterState {
  active: boolean
  expired: boolean
  completed: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [requests, setRequests] = useState<DiningRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<FilterState>({
    active: true,
    expired: false,
    completed: false,
  })
  const [selectedCity, setSelectedCity] = useState<string>('current')
  const [cityInput, setCityInput] = useState<string>('')
  const [showCitySuggestions, setShowCitySuggestions] = useState<boolean>(false)
  const [maxRange, setMaxRange] = useState<number>(50)
  const [sortOption, setSortOption] = useState<'nearest' | 'upcoming'>('nearest')
  const [dateRangeOption, setDateRangeOption] = useState<'all' | 'today' | 'thisWeek' | 'range'>('all')
  const [rangeEndDate, setRangeEndDate] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [cityCenters, setCityCenters] = useState<Record<string, { lat: number; lng: number }>>({})

  useEffect(() => {
    checkUser()
    loadRequests()
    getUserLocation()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('dining_requests')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dining_requests' },
        () => {
          loadRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setLocationError('')
        },
        (error) => {
          console.error('Location error:', error)
          setLocationError('Unable to get your location. Distance sorting disabled.')
        }
      )
    } else {
      setLocationError('Location not supported by your browser.')
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2?: number, lon2?: number): number => {
    if (!lat2 || !lon2) return Infinity
    
    const R = 3959
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const formatDistance = (distance: number): string => {
    if (distance === Infinity) return ''
    if (distance < 0.1) return 'Very nearby'
    if (distance < 1) return `${(distance * 5280).toFixed(0)} ft away`
    return `${distance.toFixed(1)} mi away`
  }

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }
    
    setUser(user)
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profile) {
      setProfile(profile)
    }
  }

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('dining_requests')
        .select(`
          *,
          host:profiles!dining_requests_host_id_fkey(*),
          group:groups(*)
        `)
        .order('dining_time', { ascending: true })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isExpired = (dateString: string): boolean => {
    return new Date(dateString) < new Date()
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60))
    
    if (diffMinutes < 0) {
      const hours = Math.abs(Math.floor(diffMinutes / 60))
      if (hours < 1) return 'Just passed'
      if (hours === 1) return '1 hour ago'
      if (hours < 24) return `${hours} hours ago`
      const days = Math.floor(hours / 24)
      return days === 1 ? '1 day ago' : `${days} days ago`
    }
    
    if (diffMinutes < 60) {
      return `in ${diffMinutes} minutes`
    } else if (diffMinutes < 120) {
      return 'in 1 hour'
    } else {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const isInDateRange = (dateString: string) => {
    if (dateRangeOption === 'all') return true
    const dt = new Date(dateString)
    const today = new Date()
    today.setHours(0,0,0,0)

    if (dateRangeOption === 'today') {
      const d = new Date(dt)
      d.setHours(0,0,0,0)
      return d.getTime() === today.getTime()
    }

    if (dateRangeOption === 'thisWeek') {
      const end = new Date()
      end.setHours(23,59,59,999)
      end.setDate(end.getDate() + 7)
      return dt >= today && dt <= end
    }

    if (dateRangeOption === 'range') {
      if (!rangeEndDate) return true
      const end = new Date(rangeEndDate)
      end.setHours(23,59,59,999)
      return dt >= today && dt <= end
    }

    return true
  }

  const getUniqueCities = (): string[] => {
    const cities = new Set<string>()
    requests.forEach(r => {
      if (r.restaurant_address) {
        const parts = r.restaurant_address.split(',')
        if (parts.length >= 3) {
          const city = parts[parts.length - 3].trim()
          const state = parts[parts.length - 2].trim()
          cities.add(`${city}, ${state}`)
        }
      }
    })
    return Array.from(cities).sort()
  }

  const loadCachedCityCenters = () => {
    try {
      const raw = localStorage.getItem('dt_city_centers')
      if (!raw) return {}
      return JSON.parse(raw)
    } catch (e) {
      return {}
    }
  }

  const saveCachedCityCenters = (centers: Record<string, { lat: number; lng: number }>) => {
    try {
      localStorage.setItem('dt_city_centers', JSON.stringify(centers))
    } catch (e) {
      // ignore
    }
  }

  const fetchCityGeocode = async (city: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!key) return null
      const q = encodeURIComponent(city)
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=${key}`
      const res = await fetch(url)
      if (!res.ok) return null
      const data = await res.json()
      const result = data.results && data.results[0]
      if (!result) return null
      const { lat, lng } = result.geometry.location
      return { lat, lng }
    } catch (e) {
      console.error('Geocode error', e)
      return null
    }
  }

  const populateCentersFromRequests = () => {
    const centers: Record<string, { lat: number; lng: number }> = loadCachedCityCenters()
    const cities = getUniqueCities()
    cities.forEach(city => {
      if (centers[city]) return
      const restaurantsInCity = requests.filter(r => {
        if (!r.restaurant_address) return false
        const parts = r.restaurant_address.split(',')
        const rCity = parts.length >= 3 ? parts[parts.length - 3].trim() : ''
        const rState = parts.length >= 2 ? parts[parts.length - 2].trim() : ''
        const cityState = `${rCity}, ${rState}`
        return cityState === city
      })
      if (restaurantsInCity.length > 0) {
        const avgLat = restaurantsInCity.reduce((sum, r) => sum + (r.latitude || 0), 0) / restaurantsInCity.length
        const avgLng = restaurantsInCity.reduce((sum, r) => sum + (r.longitude || 0), 0) / restaurantsInCity.length
        centers[city] = { lat: avgLat, lng: avgLng }
      }
    })
    setCityCenters(centers)
    saveCachedCityCenters(centers)
  }

  useEffect(() => {
    // populate centers from requests and cached storage
    try {
      const cached = loadCachedCityCenters()
      setCityCenters(prev => ({ ...cached, ...prev }))
    } catch (e) {}
    populateCentersFromRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests])

  useEffect(() => {
    // when user selects a city make sure we have a center (try cached, requests-average, then geocode)
    const ensureCenter = async () => {
      if (selectedCity === 'current') return
      if (cityCenters[selectedCity]) return
      // try to compute from requests
      const restaurantsInCity = requests.filter(r => {
        if (!r.restaurant_address) return false
        const parts = r.restaurant_address.split(',')
        const rCity = parts.length >= 3 ? parts[parts.length - 3].trim() : ''
        const rState = parts.length >= 2 ? parts[parts.length - 2].trim() : ''
        const cityState = `${rCity}, ${rState}`
        return cityState === selectedCity
      })
      if (restaurantsInCity.length > 0) {
        const avgLat = restaurantsInCity.reduce((sum, r) => sum + (r.latitude || 0), 0) / restaurantsInCity.length
        const avgLng = restaurantsInCity.reduce((sum, r) => sum + (r.longitude || 0), 0) / restaurantsInCity.length
        const updated = { ...cityCenters, [selectedCity]: { lat: avgLat, lng: avgLng } }
        setCityCenters(updated)
        saveCachedCityCenters(updated)
        return
      }

      // fallback to Google Geocoding
      const geo = await fetchCityGeocode(selectedCity)
      if (geo) {
        const updated = { ...cityCenters, [selectedCity]: geo }
        setCityCenters(updated)
        saveCachedCityCenters(updated)
      }
    }
    ensureCenter()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity])

  const getFilteredCitySuggestions = (): string[] => {
    const allCities = getUniqueCities()
    if (!cityInput.trim()) return allCities
    return allCities.filter(city => 
      city.toLowerCase().includes(cityInput.toLowerCase())
    )
  }

  const getCityCenterCoordinates = (city: string): { lat: number; lng: number } | null => {
    // prefer cached / computed centers
    if (cityCenters[city]) return cityCenters[city]

    // fallback to computing average from requests (synchronous)
    const restaurantsInCity = requests.filter(r => {
      if (!r.restaurant_address) return false
      const parts = r.restaurant_address.split(',')
      const rCity = parts.length >= 3 ? parts[parts.length - 3].trim() : ''
      const rState = parts.length >= 2 ? parts[parts.length - 2].trim() : ''
      const cityState = `${rCity}, ${rState}`
      return cityState === city
    })

    if (restaurantsInCity.length === 0) return null

    const avgLat = restaurantsInCity.reduce((sum, r) => sum + (r.latitude || 0), 0) / restaurantsInCity.length
    const avgLng = restaurantsInCity.reduce((sum, r) => sum + (r.longitude || 0), 0) / restaurantsInCity.length

    return { lat: avgLat, lng: avgLng }
  }

  const sortedRequests = [...requests].sort((a, b) => {
    // If user chose 'nearest', sort by distance (from user or selected city center)
    if (sortOption === 'nearest') {
      // Determine reference point
      let refLat: number | null = null
      let refLng: number | null = null

      if (selectedCity !== 'current') {
        const cityCenter = getCityCenterCoordinates(selectedCity)
        if (cityCenter) {
          refLat = cityCenter.lat
          refLng = cityCenter.lng
        }
      }

      if ((refLat === null || refLng === null) && userLocation) {
        refLat = userLocation.latitude
        refLng = userLocation.longitude
      }

      if (refLat !== null && refLng !== null) {
        const distA = calculateDistance(refLat, refLng, a.latitude, a.longitude)
        const distB = calculateDistance(refLat, refLng, b.latitude, b.longitude)
        return distA - distB
      }
    }

    // Fallback or 'upcoming' sorting: earliest dining_time first
    const timeA = new Date(a.dining_time).getTime()
    const timeB = new Date(b.dining_time).getTime()
    return timeA - timeB
  })

  const filteredRequests = sortedRequests.filter(r => {
    const expired = isExpired(r.dining_time)
    const completed = r.status === 'completed'
    
    // Status filter - check if at least one status filter is selected
    let statusMatches = false
    if (filterStatus.active && !expired && !completed) statusMatches = true
    if (filterStatus.expired && expired && !completed) statusMatches = true
    if (filterStatus.completed && completed) statusMatches = true
    
    if (!statusMatches) return false

    // Date range filter
    if (!isInDateRange(r.dining_time)) return false
    
    // City filter
    if (selectedCity !== 'current' && r.restaurant_address) {
      const parts = r.restaurant_address.split(',')
      const city = parts.length >= 3 ? parts[parts.length - 3].trim() : ''
      const state = parts.length >= 2 ? parts[parts.length - 2].trim() : ''
      const cityState = `${city}, ${state}`
      if (cityState !== selectedCity) return false
    }
    
    // Distance filter
    if (selectedCity === 'current' && userLocation) {
      // For current location, filter by distance from user's location
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        r.latitude,
        r.longitude
      )
      if (distance > maxRange) return false
    } else if (selectedCity !== 'current') {
      // For selected city, filter by distance from city center
      const cityCenter = getCityCenterCoordinates(selectedCity)
      if (cityCenter) {
        const distance = calculateDistance(
          cityCenter.lat,
          cityCenter.lng,
          r.latitude,
          r.longitude
        )
        if (distance > maxRange) return false
      }
    }
    
    // Search filter - search in restaurant name, address, and description
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchesRestaurantName = r.restaurant_name?.toLowerCase().includes(query)
      const matchesAddress = r.restaurant_address?.toLowerCase().includes(query)
      const matchesDescription = r.description?.toLowerCase().includes(query)
      const matchesHostName = r.host?.name?.toLowerCase().includes(query)
      
      if (!matchesRestaurantName && !matchesAddress && !matchesDescription && !matchesHostName) {
        return false
      }
    }
    
    return true
  })

  const activeCount = sortedRequests.filter(r => !isExpired(r.dining_time) && r.status !== 'completed').length
  const expiredCount = sortedRequests.filter(r => isExpired(r.dining_time) && r.status !== 'completed').length
  const completedCount = sortedRequests.filter(r => r.status === 'completed').length
  const uniqueCities = getUniqueCities()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Utensils className="w-8 h-8 text-[var(--primary)]" strokeWidth={2.5} />
            <h1 className="text-2xl font-bold text-[var(--neutral)]">DineTogether</h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link
              href="/restaurants"
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-all font-medium border border-purple-200"
            >
              <Store className="w-5 h-5" />
              Browse Deals
            </Link>

            <Link
              href="/groups"
              className="flex items-center gap-2 px-5 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-50 transition-all border border-gray-200 hover:border-[var(--primary)] font-medium"
            >
              <Users className="w-5 h-5" />
              Groups
            </Link>
            
            <Link
              href="/create"
              className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Request
            </Link>
            
            {profile && (
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-[var(--primary)] transition-all group"
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {profile.name[0]?.toUpperCase()}
                  </div>
                )}
                <span className="font-medium text-[var(--neutral)] group-hover:text-[var(--primary)]">{profile.name}</span>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                  <span className="text-sm font-medium">{profile.total_likes}</span>
                </div>
              </Link>
            )}
            
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-[var(--primary)] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-4xl font-bold text-[var(--neutral)] mb-2">
                Available Dining Requests
              </h2>
              <p className="text-gray-600 text-lg">
                Join someone for a meal and share the experience!
              </p>
            </div>
            {userLocation && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <Navigation className="w-4 h-4" />
                <span className="text-sm font-medium">Showing nearest first</span>
              </div>
            )}
          </div>

          {/* Filter Controls */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex">
              <input
                type="text"
                placeholder="Search by restaurant, location, host name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 rounded-l-full border-2 border-gray-300 focus:border-[var(--primary)] focus:outline-none transition-colors"
              />
              <button className="px-6 py-3 bg-[var(--primary)] text-white rounded-r-full hover:bg-[var(--primary-dark)] transition-colors font-medium">
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm font-semibold text-gray-700">Sort:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortOption('nearest')}
                  className={`px-3 py-2 rounded-full font-medium transition-all ${
                    sortOption === 'nearest' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500'
                  }`}
                >
                  Nearest
                </button>
                <button
                  onClick={() => setSortOption('upcoming')}
                  className={`px-3 py-2 rounded-full font-medium transition-all ${
                    sortOption === 'upcoming' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500'
                  }`}
                >
                  Upcoming
                </button>
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm font-semibold text-gray-700">When:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setDateRangeOption('all'); setRangeEndDate('') }}
                  className={`px-3 py-2 rounded-full font-medium transition-all ${
                    dateRangeOption === 'all' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => { setDateRangeOption('today'); setRangeEndDate('') }}
                  className={`px-3 py-2 rounded-full font-medium transition-all ${
                    dateRangeOption === 'today' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => { setDateRangeOption('thisWeek'); setRangeEndDate('') }}
                  className={`px-3 py-2 rounded-full font-medium transition-all ${
                    dateRangeOption === 'thisWeek' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500'
                  }`}
                >
                  This Week
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDateRangeOption('range')}
                    className={`px-3 py-2 rounded-full font-medium transition-all ${
                      dateRangeOption === 'range' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500'
                    }`}
                  >
                    Range
                  </button>
                  {dateRangeOption === 'range' && (
                    <input
                      type="date"
                      value={rangeEndDate}
                      onChange={(e) => setRangeEndDate(e.target.value)}
                      className="px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-[var(--primary)] focus:outline-none transition-colors"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm font-semibold text-gray-700">Status:</span>
              <div className="flex gap-2 flex-wrap">
                <label className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
                  filterStatus.active
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500'
                }`}>
                  <input
                    type="checkbox"
                    checked={filterStatus.active}
                    onChange={(e) => setFilterStatus({...filterStatus, active: e.target.checked})}
                    className="w-4 h-4 cursor-pointer hidden"
                  />
                  <span>Active ({activeCount})</span>
                </label>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
                  filterStatus.expired
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500'
                }`}>
                  <input
                    type="checkbox"
                    checked={filterStatus.expired}
                    onChange={(e) => setFilterStatus({...filterStatus, expired: e.target.checked})}
                    className="w-4 h-4 cursor-pointer hidden"
                  />
                  <span>Expired ({expiredCount})</span>
                </label>
                <label className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
                  filterStatus.completed
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-500'
                }`}>
                  <input
                    type="checkbox"
                    checked={filterStatus.completed}
                    onChange={(e) => setFilterStatus({...filterStatus, completed: e.target.checked})}
                    className="w-4 h-4 cursor-pointer hidden"
                  />
                  <span>Completed ({completedCount})</span>
                </label>
              </div>
            </div>

            {/* Location and Distance Filters */}
            <div className="flex flex-wrap gap-4 items-end">
              {/* City Filter - Autocomplete */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-semibold text-gray-700">Location:</label>
                <input
                  type="text"
                  placeholder="Type city name or use current location..."
                  value={selectedCity === 'current' ? '' : cityInput}
                  onChange={(e) => {
                    setCityInput(e.target.value)
                    setSelectedCity(e.target.value || 'current')
                    setShowCitySuggestions(true)
                  }}
                  onFocus={() => setShowCitySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
                  className="px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-[var(--primary)] focus:outline-none transition-colors font-medium text-gray-700 bg-white w-64"
                />
                {showCitySuggestions && (
                  <div className="absolute top-full mt-1 w-64 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCity('current')
                        setCityInput('')
                        setShowCitySuggestions(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                        selectedCity === 'current' ? 'bg-blue-100 text-[var(--primary)] font-medium' : 'text-gray-700'
                      }`}
                    >
                      📍 Use Current Location
                    </button>
                    <div className="border-t border-gray-200" />
                    {getFilteredCitySuggestions().length > 0 ? (
                      getFilteredCitySuggestions().map(city => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city)
                            setCityInput(city)
                            setShowCitySuggestions(false)
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                            selectedCity === city ? 'bg-blue-50 text-[var(--primary)] font-medium' : 'text-gray-700'
                          }`}
                        >
                          {city}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-gray-500 text-sm">No cities match your search</div>
                    )}
                  </div>
                )}
              </div>

              {/* Max Range Filter - Always visible */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Max Range:</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={maxRange}
                    onChange={(e) => setMaxRange(parseInt(e.target.value))}
                    className="w-40 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(maxRange/100)*100}%, #d1d5db ${(maxRange/100)*100}%, #d1d5db 100%)`
                    }}
                  />
                  <span className="text-lg font-bold text-[var(--primary)] min-w-12">{maxRange} mi</span>
                </div>
              </div>

              {/* Clear Filters */}
              {(searchQuery || !filterStatus.active || filterStatus.expired || filterStatus.completed || selectedCity !== 'current' || maxRange !== 50 || dateRangeOption !== 'all' || rangeEndDate) && (
                <button
                  onClick={() => {
                    setFilterStatus({ active: true, expired: false, completed: false })
                    setSelectedCity('current')
                    setCityInput('')
                    setMaxRange(50)
                    setSearchQuery('')
                    setDateRangeOption('all')
                    setRangeEndDate('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border-2 border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {locationError && (
            <div className="mt-4 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
              {locationError}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dining requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
              <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No Requests Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery && 'No requests match your search. '}
                {!filterStatus.active && !filterStatus.expired && !filterStatus.completed && 'Please select at least one status filter.'}
                {(filterStatus.active || filterStatus.expired || filterStatus.completed) && selectedCity === 'current' && maxRange < 100 && !searchQuery && 'No requests within your distance range. Try increasing the range.'}
                {(filterStatus.active || filterStatus.expired || filterStatus.completed) && selectedCity !== 'current' && !searchQuery && `No requests found in ${selectedCity}.`}
                {!searchQuery && !selectedCity && 'Be the first to create a dining request!'}
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                Create First Request
              </Link>
            </div>

            {/* Groups Promotion */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl shadow-lg p-8 border-2 border-purple-200">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    ✨ New: Create or Join Groups!
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Connect with friends, coworkers, or communities. Create group-specific dining requests and build your foodie circle!
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href="/groups"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all font-medium shadow-md"
                    >
                      <Users className="w-5 h-5" />
                      Explore Groups
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => {
              const distance = userLocation
                ? calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    request.latitude,
                    request.longitude
                  )
                : Infinity
              
              const expired = isExpired(request.dining_time)
              const completed = request.status === 'completed'
              const isMyRequest = user && request.host_id === user.id

              return (
                <div
                  key={request.id}
                  className={`rounded-2xl shadow-lg transition-all p-6 relative flex flex-col ${
                    completed
                      ? 'bg-green-50 border-2 border-green-200'
                      : expired 
                      ? 'bg-gray-100 opacity-75' 
                      : 'bg-white hover:shadow-2xl card-hover'
                  }`}
                >
                  {/* Distance Badge */}
                  {distance !== Infinity && !expired && !completed && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {formatDistance(distance)}
                    </div>
                  )}

                  {/* Completed Badge */}
                  {completed && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      COMPLETED
                    </div>
                  )}

                  {/* Expired Badge */}
                  {expired && !completed && (
                    <div className="absolute top-4 right-4 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      EXPIRED
                    </div>
                  )}

                  <Link href={`/request/${request.id}`} className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4 pr-20">
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-1 ${expired ? 'text-gray-600' : 'text-[var(--neutral)]'}`}>
                          {request.restaurant_name}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{request.restaurant_address}</span>
                        </div>
                      </div>
                    </div>

                    {/* NEW: Group Badge */}
                    {request.group && (
                      <div className="mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                          {request.group.cover_image_url ? (
                            <img
                              src={request.group.cover_image_url}
                              alt={request.group.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-4 h-4" />
                          )}
                          <span className="text-sm font-medium">{request.group.name}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3 mb-4 flex-1">
                      <div className={`flex items-center gap-2 ${expired ? 'text-gray-500' : 'text-gray-700'}`}>
                        <Clock className={`w-5 h-5 ${expired ? 'text-gray-400' : 'text-[var(--primary)]'}`} />
                        <div className="font-medium text-sm leading-tight">
                          <div className={`${expired ? 'text-gray-500' : 'text-gray-700'}`}>{formatDate(request.dining_time)}</div>
                          <div className={`text-sm ${expired ? 'text-gray-400' : 'text-[var(--primary)]'}`}>{formatTime(request.dining_time)}</div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 ${expired ? 'text-gray-500' : 'text-gray-700'}`}>
                        <Users className={`w-5 h-5 ${expired ? 'text-gray-400' : 'text-[var(--accent)]'}`} />
                        <span className="font-medium">
                          {request.seats_available} seat{request.seats_available !== 1 ? 's' : ''} available
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {request.host?.avatar_url ? (
                            <img
                              src={request.host.avatar_url}
                              alt={request.host.name}
                              className={`w-8 h-8 rounded-full object-cover border-2 flex-shrink-0 ${
                                expired ? 'border-gray-300 opacity-75' : 'border-gray-200'
                              }`}
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                              expired ? 'bg-gray-400' : 'bg-[var(--neutral)]'
                            }`}>
                              {request.host?.name[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className={`font-medium truncate ${expired ? 'text-gray-500' : 'text-gray-700'}`}>
                            {request.host?.name}
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full flex-shrink-0 ${
                          expired ? 'bg-gray-200' : 'bg-pink-100'
                        }`}>
                          <Heart className={`w-4 h-4 ${expired ? 'text-gray-400' : 'text-pink-500 fill-pink-500'}`} />
                          <span className={`text-sm font-bold ${expired ? 'text-gray-600' : 'text-[var(--neutral)]'}`}>
                            {request.host?.total_likes}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fixed height description area */}
                    <div className="h-10 mb-4">
                      {request.description && (
                        <p className={`text-sm line-clamp-2 ${expired ? 'text-gray-500' : 'text-gray-600'}`}>
                          {request.description}
                        </p>
                      )}
                    </div>

                    {/* Buttons - Always at bottom */}
                    {completed ? (
                      <button className="w-full py-2 rounded-lg font-medium transition-colors bg-green-100 text-green-700 border border-green-300">
                        ✓ View Completed Meal
                      </button>
                    ) : expired && isMyRequest ? (
                      <div className="space-y-2">
                        <Link
                          href={`/request/${request.id}/complete`}
                          className="w-full py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-center block shadow-md"
                        >
                          ✓ Complete Meal
                        </Link>
                        <button className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center block text-sm">
                          View Details
                        </button>
                      </div>
                    ) : (
                      <button className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        expired
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                      }`}>
                        {expired ? (request.status === 'completed' ? 'Meal Completed' : 'Request Expired') : 'View Details'}
                      </button>
                    )}
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}