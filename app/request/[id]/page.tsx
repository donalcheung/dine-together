'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { Utensils, MapPin, Clock, Users, Star, ArrowLeft, MessageSquare, Check, X, Trash2, Edit2, Send, Phone, Globe, ExternalLink, Camera, Heart, Lock } from 'lucide-react'
import { supabase, DiningRequest, DiningJoin, Profile } from '@/lib/supabase'
import { isImageSafe } from '@/lib/image-moderation'
import { validateProfanity } from '@/lib/profanity-filter'
import { sendJoinNotification, sendAcceptanceNotification } from '@/lib/send-notification'

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
  const [mealPhotos, setMealPhotos] = useState<any[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Share link helpers (must be after request is defined)
  const requestUrl = typeof window !== 'undefined'
    ? window.location.href
    : `${process.env.NEXT_PUBLIC_APP_URL || 'https://tablemesh.com'}/request/${requestId}`;

  const shareText = request && request.restaurant_name
    ? `Join my TableMesh meal at ${request.restaurant_name} on ${request.dining_time ? request.dining_time : ''}!\n${requestUrl}`
    : `Join my TableMesh meal!\n${requestUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(requestUrl)
      alert('Link copied!')
    } catch {
      alert('Failed to copy link')
    }
  }

  const handleShareSMS = () => {
    window.open(`sms:?body=${encodeURIComponent(shareText)}`)
  }
  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`)
  }
  const handleShareSlack = () => {
    window.open(`https://slack.com/app_redirect?channel=&message=${encodeURIComponent(shareText)}`)
  }

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
  const [mealPhotos, setMealPhotos] = useState<any[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    const init = async () => {
      await checkUser()
      loadRequest()
      loadComments()
      loadMealPhotos()
    }
    init()

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

  // Load joins after user is set
  useEffect(() => {
    if (user && requestId) {
      loadJoins()
    }
  }, [user, requestId])

  const checkUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      router.push('/auth')
      return
    }
    setUser(authUser)
  }

  const loadRequest = async () => {
    try {
      const { data, error } = await supabase
        .from('dining_requests')
          .select(`
            *,
            host:profiles!dining_requests_host_id_fkey(*),
            group:groups(*)
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
    console.log('🍽️ Loading restaurant info for:', { name, address })
    setLoadingInfo(true)

    try {
      const url = `/api/places?name=${encodeURIComponent(name)}&address=${encodeURIComponent(address)}`
      console.log('📍 Fetching from:', url)
      
      const response = await fetch(url)
      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response not ok:', errorText)
        throw new Error('Failed to fetch restaurant info')
      }

      const placeData = await response.json()
      console.log('✅ Place data received:', placeData)

      if (!placeData) {
        console.warn('⚠️ No place data returned')
        setRestaurantInfo(null)
        return
      }

      setRestaurantInfo({
        phone: placeData.formatted_phone_number,
        website: placeData.website,
        hours: placeData.opening_hours?.weekday_text?.join('\n'),
        rating: placeData.rating,
        priceLevel: placeData.price_level ? '$'.repeat(placeData.price_level) : undefined
      })
      
      console.log('💾 Restaurant info saved:', {
        hasPhone: !!placeData.formatted_phone_number,
        hasWebsite: !!placeData.website,
        hasRating: !!placeData.rating
      })
    } catch (error) {
      console.error('❌ Error loading restaurant info:', error)
      setRestaurantInfo(null)
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

      // Always update userJoin based on current user
      if (user && data) {
        const myJoin = data.find(j => j.user_id === user.id)
        setUserJoin(myJoin || null)
      } else {
        setUserJoin(null)
      }
    } catch (error) {
      console.error('Error loading joins:', error)
      setUserJoin(null)
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

  const loadMealPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_photos')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMealPhotos(data || [])
    } catch (error) {
      console.error('Error loading meal photos:', error)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    setUploadingPhoto(true)

    try {
      const file = e.target.files[0]
      // Moderate image before upload
      const safe = await isImageSafe(file)
      if (!safe) {
        alert('This image appears to contain inappropriate content and cannot be uploaded.')
        setUploadingPhoto(false)
        return
      }
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('meal-photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('meal-photos')
        .getPublicUrl(fileName)

      // Save to database
      const { error: dbError } = await supabase
        .from('meal_photos')
        .insert([
          {
            request_id: requestId,
            user_id: user.id,
            photo_url: publicUrl
          }
        ])

      if (dbError) throw dbError

      // Reload photos
      loadMealPhotos()
    } catch (error: any) {
      console.error('Error uploading photo:', error)
      alert(`Failed to upload photo: ${error.message}`)
    } finally {
      setUploadingPhoto(false)
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
      // Validate profanity in description
      if (editedDescription) {
        validateProfanity(editedDescription, 'Request description')
      }

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

  const isExpired = (dateString: string): boolean => {
    return new Date(dateString) < new Date()
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
      // Validate profanity in join message
      if (joinMessage) {
        validateProfanity(joinMessage, 'Join message')
      }

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

      // Send notification to host
      if (request?.host?.email && user?.email) {
        await sendJoinNotification(
          request.host.email,
          user.user_metadata?.full_name || 'A user',
          request.restaurant_name,
          requestId
        )
      }

      setShowJoinForm(false)
      setJoinMessage('')
      loadJoins()
    } catch (error: any) {
      console.error('Error joining request:', error)
      alert(`Failed to join request: ${error?.message || error?.toString() || 'Unknown error'}`)
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

        // Find the accepted join to get guest info
        const acceptedJoin = joins.find(j => j.id === joinId)
        if (acceptedJoin?.user?.email) {
          await sendAcceptanceNotification(
            acceptedJoin.user.email,
            acceptedJoin.user.name,
            user?.user_metadata?.full_name || 'The host',
            request.restaurant_name,
            request.dining_time,
            requestId
          )
        }
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
          
          <Link href="/dashboard" className="flex items-center gap-2">
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
                        {isHost && !editingTime && !isExpired(request.dining_time) && (
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
                        {isHost && !editingSeats && !isExpired(request.dining_time) && (
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
                {/* Share Button */}
                <div className="mb-6 flex gap-3 items-center">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Copy Link
                  </button>
                  <button
                    onClick={handleShareSMS}
                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200 font-medium"
                  >
                    <Phone className="w-4 h-4" />
                    SMS
                  </button>
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-200 font-medium"
                  >
                    <MessageSquare className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button
                    onClick={handleShareSlack}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 border border-purple-200 font-medium"
                  >
                    <Users className="w-4 h-4" />
                    Slack
                  </button>
                </div>
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-[var(--neutral)]">Hosted by</h3>
                    {isHost && !editing && !isExpired(request.dining_time) && (
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
                        <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                        <span className="font-medium">{request.host?.total_likes} likes</span>
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
                              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                              <span>{join.user?.total_likes}</span>
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
                                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                                <span>{join.user?.total_likes}</span>
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

                {/* Meal Photos Gallery */}
                {(mealPhotos.length > 0 || (isHost || userJoin?.status === 'accepted')) && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-[var(--neutral)] mb-3 flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Meal Photos ({mealPhotos.length})
                    </h3>

                    {/* Upload Button (for host and accepted guests) */}
                    {(isHost || userJoin?.status === 'accepted') && (
                      <div className="mb-4">
                        <label className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors border-2 border-dashed border-blue-300">
                          {uploadingPhoto ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Camera className="w-5 h-5" />
                              Upload Photo
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {/* Photo Grid */}
                    {mealPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {mealPhotos.map((photo) => (
                          <div key={photo.id} className="group relative">
                            <img
                              src={photo.photo_url}
                              alt="Meal photo"
                              className="w-full h-48 object-cover rounded-xl"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-xl">
                              <div className="flex items-center gap-2">
                                {photo.user?.avatar_url ? (
                                  <img
                                    src={photo.user.avatar_url}
                                    alt={photo.user.name}
                                    className="w-6 h-6 rounded-full object-cover border-2 border-white"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700">
                                    {photo.user?.name[0]}
                                  </div>
                                )}
                                <span className="text-white text-sm font-medium">{photo.user?.name}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No photos yet. Be the first to share!</p>
                    )}
                  </div>
                )}

                {/* Join Button */}
                {/* Join Button or Status */}
                {!isHost && request.seats_available > 0 && (
                  <div>
                    {!userJoin ? (
                      !showJoinForm ? (
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
                      )
                    ) : (
                      <div className={`p-4 rounded-xl border text-center font-semibold ${
                        userJoin.status === 'accepted'
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : userJoin.status === 'pending'
                          ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {userJoin.status === 'accepted' && '✓ Your request has been accepted!'}
                        {userJoin.status === 'pending' && '⏳ Your request is pending approval'}
                        {userJoin.status === 'declined' && '✗ Your request was declined'}
                      </div>
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

                {/* Complete Meal Button (Host only, after meal time) */}
                {isHost && isExpired(request.dining_time) && request.status !== 'completed' && acceptedJoins.length > 0 && (
                  <Link
                    href={`/request/${request.id}/complete`}
                    className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Complete Meal
                  </Link>
                )}

                {/* Meal Completed Status */}
                {request.status === 'completed' && (
                  <div className="p-4 bg-green-50 rounded-xl text-center border border-green-200">
                    <div className="font-semibold text-green-700 flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      Meal Completed
                    </div>
                  </div>
                )}

                {/* Delete Button (Host only, for non-expired requests) */}
                {isHost && !isExpired(request.dining_time) && (
                  <button
                    onClick={handleDeleteRequest}
                    disabled={deleting}
                    className="w-full py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-semibold hover:bg-red-100 hover:border-red-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        Deleting Request...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        Delete Request
                      </>
                    )}
                  </button>
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

            {request.group && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {request.group.cover_image_url ? (
                  <div className="h-24 overflow-hidden">
                    <img
                      src={request.group.cover_image_url}
                      alt={request.group.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <Users className="w-12 h-12 text-white opacity-50" />
                  </div>
                )}

                <div className="p-6">
                  <h3 className="font-bold text-lg text-[var(--neutral)] mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Group Request
                  </h3>

                  <Link
                    href={`/groups/${request.group.id}`}
                    className="block mb-3 group"
                  >
                    <div className="text-xl font-bold text-[var(--neutral)] group-hover:text-[var(--primary)] transition-colors">
                      {request.group.name}
                    </div>
                  </Link>

                  {request.group.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {request.group.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{request.group.member_count} members</span>
                    </div>
                    {request.group.is_public ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Globe className="w-4 h-4" />
                        <span>Public</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Lock className="w-4 h-4" />
                        <span>Private</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/groups/${request.group.id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors font-medium border border-purple-200"
                  >
                    View Group
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  {isHost && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Only visible to group members
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Restaurant Info - ALWAYS VISIBLE NOW */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg text-[var(--neutral)] mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[var(--primary)]" />
                Restaurant Info
              </h3>
              
              {loadingInfo ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading restaurant details...</p>
                </div>
              ) : restaurantInfo ? (
                <div className="space-y-3">
                  {restaurantInfo.phone && (
                    <a 
                      href={`tel:${restaurantInfo.phone}`}
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                    >
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-0.5">Phone</div>
                        <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                          {restaurantInfo.phone}
                        </div>
                      </div>
                    </a>
                  )}
                  
                  {restaurantInfo.website && (
                    <a 
                      href={restaurantInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                    >
                      <Globe className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-0.5">Website</div>
                        <div className="text-sm font-medium text-green-600 group-hover:text-green-700 flex items-center gap-1">
                          Visit Website
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </a>
                  )}
                  
                  {restaurantInfo.rating && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-0.5">Google Rating</div>
                        <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <span>{restaurantInfo.rating} ★</span>
                          {restaurantInfo.priceLevel && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-green-600 font-semibold">{restaurantInfo.priceLevel}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!restaurantInfo.phone && !restaurantInfo.website && !restaurantInfo.rating && (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      <p>No additional info available</p>
                      <p className="text-xs mt-1 text-gray-400">Restaurant data not found in Google Places</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-500 text-sm mb-2">
                    <p>Unable to load restaurant details</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Check if the restaurant name and address are correct
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
