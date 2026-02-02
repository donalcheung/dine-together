'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Utensils, MapPin, Clock, Users, Plus, LogOut, User, Star } from 'lucide-react'
import { supabase, DiningRequest, Profile } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [requests, setRequests] = useState<DiningRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    loadRequests()
    
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

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }
    
    setUser(user)
    
    // Load profile
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
        .eq('status', 'open')
        .gt('dining_time', new Date().toISOString())
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60))
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
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
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-gray-200">
                <User className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-[var(--neutral)]">{profile.name}</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{profile.rating.toFixed(1)}</span>
                </div>
              </div>
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
          <h2 className="text-4xl font-bold text-[var(--neutral)] mb-2">
            Available Dining Requests
          </h2>
          <p className="text-gray-600 text-lg">
            Join someone for a meal and share the experience!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dining requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No active requests</h3>
            <p className="text-gray-600 mb-6">Be the first to create a dining request!</p>
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
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/request/${request.id}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[var(--neutral)] mb-1">
                      {request.restaurant_name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{request.restaurant_address}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-[var(--neutral)]">
                      {request.host?.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-5 h-5 text-[var(--primary)]" />
                    <span className="font-medium">{formatTime(request.dining_time)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-5 h-5 text-[var(--accent)]" />
                    <span className="font-medium">
                      {request.seats_available} seat{request.seats_available !== 1 ? 's' : ''} available
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-5 h-5 text-[var(--neutral)]" />
                    <span className="font-medium">
                      Hosted by {request.host?.name}
                    </span>
                  </div>
                </div>

                {request.description && (
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {request.description}
                  </p>
                )}

                <button className="w-full py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors">
                  View Details
                </button>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
