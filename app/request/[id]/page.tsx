'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Utensils, MapPin, Clock, Users, Star, ArrowLeft, MessageSquare, Check, X } from 'lucide-react'
import { supabase, DiningRequest, DiningJoin, Profile } from '@/lib/supabase'

export default function RequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [request, setRequest] = useState<DiningRequest | null>(null)
  const [joins, setJoins] = useState<DiningJoin[]>([])
  const [loading, setLoading] = useState(true)
  const [joinMessage, setJoinMessage] = useState('')
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [userJoin, setUserJoin] = useState<DiningJoin | null>(null)

  useEffect(() => {
    checkUser()
    loadRequest()
    loadJoins()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`request_${requestId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'dining_joins', filter: `request_id=eq.${requestId}` },
        () => {
          loadJoins()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [requestId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }
    
    setUser(user)
  }

  const loadRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('dining_requests')
        .select(`
          *,
          host:profiles!dining_requests_host_id_fkey(*)
        `)
        .eq('id', requestId)
        .single()

      if (error) throw error
      setRequest(data)
    } catch (error) {
      console.error('Error loading request:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadJoins = async () => {
    try {
      const { data, error } = await supabase
        .from('dining_joins')
        .select(`
          *,
          user:profiles!dining_joins_user_id_fkey(*)
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setJoins(data || [])

      // Check if current user has already joined
      if (user) {
        const myJoin = data?.find(j => j.user_id === user.id)
        setUserJoin(myJoin || null)
      }
    } catch (error) {
      console.error('Error loading joins:', error)
    }
  }

  const handleJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { error } = await supabase
        .from('dining_joins')
        .insert([
          {
            request_id: requestId,
            user_id: user.id,
            status: 'pending',
            message: joinMessage,
          }
        ])

      if (error) throw error

      setShowJoinForm(false)
      setJoinMessage('')
      loadJoins()
    } catch (error: any) {
      console.error('Error joining request:', error)
      alert('Failed to join request. Please try again.')
    }
  }

  const handleJoinResponse = async (joinId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('dining_joins')
        .update({ status })
        .eq('id', joinId)

      if (error) throw error

      // Update seats available if accepted
      if (status === 'accepted' && request) {
        await supabase
          .from('dining_requests')
          .update({ seats_available: request.seats_available - 1 })
          .eq('id', requestId)
      }

      loadRequest()
      loadJoins()
    } catch (error) {
      console.error('Error updating join:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
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

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Request not found</h2>
          <Link href="/dashboard" className="text-[var(--primary)] hover:underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const isHost = user?.id === request.host_id
  const acceptedJoins = joins.filter(j => j.status === 'accepted')
  const pendingJoins = joins.filter(j => j.status === 'pending')

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
            <h1 className="text-xl font-bold text-[var(--neutral)]">DineTogether</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">{request.restaurant_name}</h1>
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5" />
              <span>{request.restaurant_address}</span>
            </div>
          </div>

          {/* Details */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                <Clock className="w-8 h-8 text-[var(--primary)]" />
                <div>
                  <div className="text-sm text-gray-600">Dining Time</div>
                  <div className="font-semibold text-[var(--neutral)]">{formatTime(request.dining_time)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                <Users className="w-8 h-8 text-[var(--accent)]" />
                <div>
                  <div className="text-sm text-gray-600">Seats Available</div>
                  <div className="font-semibold text-[var(--neutral)]">
                    {request.seats_available} of {request.total_seats}
                  </div>
                </div>
              </div>
            </div>

            {/* Host Info */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <h3 className="text-lg font-bold text-[var(--neutral)] mb-3">Hosted by</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {request.host?.name[0]}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg text-[var(--neutral)]">{request.host?.name}</div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{request.host?.rating.toFixed(1)} rating</span>
                    <span className="text-sm">({request.host?.total_ratings} reviews)</span>
                  </div>
                </div>
              </div>
              {request.description && (
                <p className="mt-4 text-gray-700 leading-relaxed">{request.description}</p>
              )}
            </div>

            {/* Accepted Diners */}
            {acceptedJoins.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[var(--neutral)] mb-3">Confirmed Diners</h3>
                <div className="space-y-3">
                  {acceptedJoins.map((join) => (
                    <div key={join.id} className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {join.user?.name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[var(--neutral)]">{join.user?.name}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{join.user?.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Requests (Only visible to host) */}
            {isHost && pendingJoins.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[var(--neutral)] mb-3">Pending Requests</h3>
                <div className="space-y-3">
                  {pendingJoins.map((join) => (
                    <div key={join.id} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 bg-[var(--accent)] rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {join.user?.name[0]}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-[var(--neutral)]">{join.user?.name}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{join.user?.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      {join.message && (
                        <div className="mb-3 p-3 bg-white rounded-lg text-sm text-gray-700">
                          <MessageSquare className="w-4 h-4 inline mr-1" />
                          {join.message}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleJoinResponse(join.id, 'accepted')}
                          className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <Check className="w-5 h-5" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleJoinResponse(join.id, 'declined')}
                          className="flex-1 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-5 h-5" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Join Button (Only visible to non-hosts who haven't joined) */}
            {!isHost && !userJoin && request.seats_available > 0 && (
              <div>
                {!showJoinForm ? (
                  <button
                    onClick={() => setShowJoinForm(true)}
                    className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg"
                  >
                    Request to Join
                  </button>
                ) : (
                  <form onSubmit={handleJoinRequest} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message to Host (Optional)
                      </label>
                      <textarea
                        value={joinMessage}
                        onChange={(e) => setJoinMessage(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Introduce yourself or share why you'd like to join..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-[var(--primary-dark)] transition-all"
                      >
                        Send Request
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowJoinForm(false)}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* User Join Status */}
            {userJoin && (
              <div className={`p-4 rounded-xl border ${
                userJoin.status === 'accepted' 
                  ? 'bg-green-50 border-green-200' 
                  : userJoin.status === 'pending'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="font-semibold text-[var(--neutral)]">
                  {userJoin.status === 'accepted' && '✓ Your request has been accepted!'}
                  {userJoin.status === 'pending' && '⏳ Your request is pending approval'}
                  {userJoin.status === 'declined' && '✗ Your request was declined'}
                </div>
              </div>
            )}

            {/* Full Message */}
            {!isHost && request.seats_available === 0 && !userJoin && (
              <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-600 font-medium">
                This dining request is full
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
