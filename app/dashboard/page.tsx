'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Utensils, MapPin, Clock, Users, ArrowRight, Plus, LogOut, Star, Store } from 'lucide-react'
import { supabase, DiningRequest, Profile } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [requests, setRequests] = useState<DiningRequest[]>([])
  const [loading, setLoading] = useState(true)

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
    loadProfile(user.id)
    loadRequests()
  }

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
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
        .eq('status', 'active')
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
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

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
            {/* Browse Deals Link */}
            <Link
              href="/restaurants"
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-all font-medium border border-purple-200"
            >
              <Store className="w-5 h-5" />
              Browse Deals
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
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{(profile.total_likes || 0).toFixed(1)}</span>
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
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[var(--neutral)] mb-2">Browse Dining Requests</h2>
          <p className="text-gray-600">Find and join dining events in your area</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Active Requests</h3>
            <p className="text-gray-600 mb-6">Check back soon or create your own dining request!</p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Request
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/request/${request.id}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group"
              >
                <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] p-6 text-white">
                  <h3 className="text-xl font-bold group-hover:underline">{request.restaurant_name}</h3>
                  <div className="flex items-center gap-2 mt-2 text-white/90">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm line-clamp-1">{request.restaurant_address}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="w-5 h-5 text-[var(--primary)]" />
                      <span className="font-medium">{formatTime(request.dining_time)}</span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-700">
                      <Users className="w-5 h-5 text-[var(--accent)]" />
                      <span className="font-medium">
                        {request.seats_available} of {request.total_seats} seats available
                      </span>
                    </div>
                  </div>

                  {request.host && (
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                      {request.host.avatar_url ? (
                        <img
                          src={request.host.avatar_url}
                          alt={request.host.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {request.host.name[0]}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700">{request.host.name}</div>
                        <div className="text-xs text-gray-500">Host</div>
                      </div>
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-[var(--primary)] group-hover:translate-x-1 transition-transform">
                    <span className="font-medium">View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

<Link
  href="/restaurants"
  className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-all font-medium border border-purple-200"
>
  <Store className="w-5 h-5" />
  Browse Deals
</Link>
