'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Utensils, MapPin, Clock, Users, Plus, LogOut, User, Star, Heart, Navigation, Filter, Check } from 'lucide-react'
import { supabase, DiningRequest, Profile } from '@/lib/supabase'

interface UserLocation {
  latitude: number
  longitude: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [requests, setRequests] = useState<DiningRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationError, setLocationError] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'completed'>('active')

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
          host:profiles!dining_requests_host_id_fkey(*)
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

  const sortedRequests = [...requests].sort((a, b) => {
    if (!userLocation) return 0
    
    const distanceA = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      a.latitude,
      a.longitude
    )
    const distanceB = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      b.latitude,
      b.longitude
    )
    
    return distanceA - distanceB
  })

  const filteredRequests = sortedRequests.filter(r => {
    const expired = isExpired(r.dining_time)
    const completed = r.status === 'completed'
    
    if (filterStatus === 'all') return true
    if (filterStatus === 'active') return !expired && !completed
    if (filterStatus === 'expired') return expired && !completed
    if (filterStatus === 'completed') return completed
    return true
  })

  const activeCount = sortedRequests.filter(r => !isExpired(r.dining_time) && r.status !== 'completed').length
  const expiredCount = sortedRequests.filter(r => isExpired(r.dining_time) && r.status !== 'completed').length
  const completedCount = sortedRequests.filter(r => r.status === 'completed').length

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
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  filterStatus === 'active'
                    ? 'bg-[var(--primary)] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[var(--primary)]'
                }`}
              >
                Active ({activeCount})
              </button>
              <button
                onClick={() => setFilterStatus('expired')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  filterStatus === 'expired'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-500'
                }`}
              >
                Expired ({expiredCount})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  filterStatus === 'completed'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-green-500'
                }`}
              >
                Completed ({completedCount})
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  filterStatus === 'all'
                    ? 'bg-gray-700 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-700'
                }`}
              >
                All ({sortedRequests.length})
              </button>
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
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No Requests Found
            </h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'active' && 'No active requests right now. Create one!'}
              {filterStatus === 'expired' && 'No expired requests to complete.'}
              {filterStatus === 'completed' && 'No completed meals yet.'}
              {filterStatus === 'all' && 'Be the first to create a dining request!'}
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Create First Request
            </Link>
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

                    <div className="space-y-3 mb-4 flex-1">
                      <div className={`flex items-center gap-2 ${expired ? 'text-gray-500' : 'text-gray-700'}`}>
                        <Clock className={`w-5 h-5 ${expired ? 'text-gray-400' : 'text-[var(--primary)]'}`} />
                        <span className="font-medium">{formatTime(request.dining_time)}</span>
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
