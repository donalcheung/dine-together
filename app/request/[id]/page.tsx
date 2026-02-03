'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Utensils, MapPin, Clock, Users, Star, ArrowLeft, MessageSquare, Check, X, Trash2, Edit2, Send, Phone, Globe, ExternalLink } from 'lucide-react'
import { supabase, DiningRequest, DiningJoin, Profile } from '@/lib/supabase'

interface Comment {
  id: string
  request_id: string
  user_id: string
  comment: string
  created_at: string
  user: Profile
}

interface RestaurantInfo {
  phone?: string
  website?: string
  hours?: string
  rating?: number
  priceLevel?: string
}

export default function RequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [request, setRequest] = useState<DiningRequest | null>(null)
  const [joins, setJoins] = useState<DiningJoin[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [joinMessage, setJoinMessage] = useState('')
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [userJoin, setUserJoin] = useState<DiningJoin | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editingTime, setEditingTime] = useState(false)
  const [editingSeats, setEditingSeats] = useState(false)
  const [editedDescription, setEditedDescription] = useState('')
  const [editedTime, setEditedTime] = useState('')
  const [editedSeats, setEditedSeats] = useState(1)
  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)

  useEffect(() => {
    checkUser()
    loadRequest()
    loadJoins()
    loadComments()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`request_${requestId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'dining_joins', filter: `request_id=eq.${requestId}` },
        () => {
          loadJoins()
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'request_comments', filter: `request_id=eq.${requestId}` },
        () => {
          loadComments()
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
      setEditedDescription(data.description || '')
      setEditedTime(data.dining_time)
      setEditedSeats(data.seats_available)
      
      // Load restaurant info from Google Places
      if (data.restaurant_name) {
        loadRestaurantInfo(data.restaurant_name, data.restaurant_address)
      }
    } catch (error) {
      console.error('Error loading request:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRestaurantInfo = async (name: string, address: string) => {
    setLoadingInfo(true)
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) return

      // Search for place
      const searchResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(name + ' ' + address)}&inputtype=textquery&fields=place_id&key=${apiKey}`
      )
      const searchData = await searchResponse.json()
      
      if (searchData.candidates && searchData.candidates[0]) {
        const placeId = searchData.candidates[0].place_id
        
        // Get place details
        const detailsResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,opening_hours,rating,price_level&key=${apiKey}`
        )
        const detailsData = await detailsResponse.json()
        
        if (detailsData.result) {
          setRestaurantInfo({
            phone: detailsData.result.formatted_phone_number,
            website: detailsData.result.website,
            hours: detailsData.result.opening_hours?.weekday_text?.join('\n'),
            rating: detailsData.result.rating,
            priceLevel: '€'.repeat(detailsData.result.price_level || 0)
          })
        }
      }
    } catch (error) {
      console.error('Error loading restaurant info:', error)
    } finally {
      setLoadingInfo(false)
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

      if (user) {
        const myJoin = data?.find(j => j.user_id === user.id)
        setUserJoin(myJoin || null)
      }
    } catch (error) {
      console.error('Error loading joins:', error)
    }
  }

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('request_comments')
        .select(`
          *,
          user:profiles!request_comments_user_id_fkey(*)
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const handleDeleteRequest = async () => {
    if (!confirm('Are you sure you want to delete this dining request? This action cannot be undone.')) {
      return
    }

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('dining_requests')
        .delete()
        .eq('id', requestId)

      if (error) throw error

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error deleting request:', error)
      alert(`Failed to delete request: ${error.message}`)
      setDeleting(false)
    }
  }

  const handleUpdateDescription = async () => {
    try {
      const { error } = await supabase
        .from('dining_requests')
        .update({ description: editedDescription })
        .eq('id', requestId)

      if (error) throw error

      setEditing(false)
      loadRequest()
    } catch (error: any) {
      console.error('Error updating description:', error)
      alert(`Failed to update description: ${error.message}`)
    }
  }

  const handleUpdateTime = async () => {
    try {
      const { error } = await supabase
        .from('dining_requests')
        .update({ dining_time: editedTime })
        .eq('id', requestId)

      if (error) throw error

      setEditingTime(false)
      loadRequest()
    } catch (error: any) {
      console.error('Error updating time:', error)
      alert(`Failed to update time: ${error.message}`)
    }
  }

  const handleUpdateSeats = async () => {
    try {
      const { error } = await supabase
        .from('dining_requests')
        .update({ 
          seats_available: editedSeats,
          total_seats: editedSeats
        })
        .eq('id', requestId)

      if (error) throw error

      setEditingSeats(false)
      loadRequest()
    } catch (error: any) {
      console.error('Error updating seats:', error)
      alert(`Failed to update seats: ${error.message}`)
    }
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) return

    setPostingComment(true)

    try {
      const { error } = await supabase
        .from('request_comments')
        .insert([
          {
            request_id: requestId,
            user_id: user.id,
            comment: newComment.trim(),
          }
        ])

      if (error) throw error

      setNewComment('')
      loadComments()
    } catch (error: any) {
      console.error('Error posting comment:', error)
      alert(`Failed to post comment: ${error.message}`)
    } finally {
      setPostingComment(false)
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

  const formatCommentTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
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

  const mapUrl = request.latitude && request.longitude
    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${request.latitude},${request.longitude}&zoom=15`
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {isHost && (
              <button
                onClick={handleDeleteRequest}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            )}
            
            <Link href="/" className="flex items-center gap-2">
              <Utensils className="w-7 h-7 text-[var(--primary)]" strokeWidth={2.5} />
              <h1 className="text-xl font-bold text-[var(--neutral)]">DineTogether</h1>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
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
                  {/* Dining Time */}
                  <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
                    <Clock className="w-8 h-8 text-[var(--primary)]" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 flex items-center justify-between">
                        <span>Dining Time</span>
                        {isHost && !editingTime && (
                          <button
                            onClick={() => setEditingTime(true)}
                            className="text-[var(--primary)] hover:text-[var(--primary-dark)]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {!editingTime ? (
                        <div className="font-semibold text-[var(--neutral)]">{formatTime(request.dining_time)}</div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="datetime-local"
                            value={editedTime.slice(0, 16)}
                            onChange={(e) => setEditedTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateTime}
                              className="px-3 py-1 bg-[var(--primary)] text-white rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingTime(false)
                                setEditedTime(request.dining_time)
                              }}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seats Available */}
                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                    <Users className="w-8 h-8 text-[var(--accent)]" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 flex items-center justify-between">
                        <span>Seats Available</span>
                        {isHost && !editingSeats && (
                          <button
                            onClick={() => setEditingSeats(true)}
                            className="text-[var(--primary)] hover:text-[var(--primary-dark)]"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {!editingSeats ? (
                        <div className="font-semibold text-[var(--neutral)]">
                          {request.seats_available} of {request.total_seats}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <select
                            value={editedSeats}
                            onChange={(e) => setEditedSeats(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            {[1, 2, 3, 4, 5].map(n => (
                              <option key={n} value={n}>{n} seat{n !== 1 ? 's' : ''}</option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateSeats}
                              className="px-3 py-1 bg-[var(--primary)] text-white rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingSeats(false)
                                setEditedSeats(request.seats_available)
                              }}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Host Info with Description */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-[var(--neutral)]">Hosted by</h3>
                    {isHost && !editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1 text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    {request.host?.avatar_url ? (
                      <img
                        src={request.host.avatar_url}
                        alt={request.host.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {request.host?.name[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-[var(--neutral)]">{request.host?.name}</div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{request.host?.rating.toFixed(1)} rating</span>
                        <span className="text-sm">({request.host?.total_ratings} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  {!editing ? (
                    request.description && (
                      <p className="text-gray-700 leading-relaxed">{request.description}</p>
                    )
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Add a description..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateDescription}
                          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditing(false)
                            setEditedDescription(request.description || '')
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accepted Diners */}
                {acceptedJoins.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[var(--neutral)] mb-3">Confirmed Diners</h3>
                    <div className="space-y-3">
                      {acceptedJoins.map((join) => (
                        <div key={join.id} className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                          {join.user?.avatar_url ? (
                            <img
                              src={join.user.avatar_url}
                              alt={join.user.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                              {join.user?.name[0]}
                            </div>
                          )}
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

                {/* Pending Requests */}
                {isHost && pendingJoins.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[var(--neutral)] mb-3">Pending Requests</h3>
                    <div className="space-y-3">
                      {pendingJoins.map((join) => (
                        <div key={join.id} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                          <div className="flex items-center gap-4 mb-3">
                            {join.user?.avatar_url ? (
                              <img
                                src={join.user.avatar_url}
                                alt={join.user.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-[var(--accent)] rounded-full flex items-center justify-center text-white text-xl font-bold">
                                {join.user?.name[0]}
                              </div>
                            )}
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

                {/* Comments Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[var(--neutral)] mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Comments ({comments.length})
                  </h3>
                  
                  <form onSubmit={handlePostComment} className="mb-6">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={postingComment || !newComment.trim()}
                        className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[var(--primary-dark)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {postingComment ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Post
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
                          {comment.user?.avatar_url ? (
                            <img
                              src={comment.user.avatar_url}
                              alt={comment.user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {comment.user?.name[0]}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-[var(--neutral)]">{comment.user?.name}</span>
                              <span className="text-xs text-gray-500">{formatCommentTime(comment.created_at)}</span>
                            </div>
                            <p className="text-gray-700">{comment.comment}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Join Button */}
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

                {!isHost && request.seats_available === 0 && !userJoin && (
                  <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-600 font-medium">
                    This dining request is full
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Google Maps */}
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

            {/* Restaurant Info */}
            {(restaurantInfo || loadingInfo) && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-lg text-[var(--neutral)] mb-4">Restaurant Info</h3>
                
                {loadingInfo ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
                  </div>
                ) : restaurantInfo && (
                  <div className="space-y-3">
                    {restaurantInfo.phone && (
                      <a 
                        href={`tel:${restaurantInfo.phone}`}
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Phone className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">{restaurantInfo.phone}</span>
                      </a>
                    )}
                    
                    {restaurantInfo.website && (
                      <a 
                        href={restaurantInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        <Globe className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium flex-1">Website</span>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                    )}
                    
                    {restaurantInfo.rating && (
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">
                          {restaurantInfo.rating} Google Rating {restaurantInfo.priceLevel && `• ${restaurantInfo.priceLevel}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
