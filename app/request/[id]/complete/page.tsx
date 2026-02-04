'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Utensils, ArrowLeft, Check, X, Upload, Star, MessageSquare, Camera } from 'lucide-react'
import { supabase, DiningRequest, DiningJoin, Profile } from '@/lib/supabase'

interface AttendanceStatus {
  user_id: string
  user: Profile
  attended: boolean
  paid_share: boolean
}

export default function CompleteMealPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [request, setRequest] = useState<DiningRequest | null>(null)
  const [acceptedGuests, setAcceptedGuests] = useState<DiningJoin[]>([])
  const [attendance, setAttendance] = useState<AttendanceStatus[]>([])
  const [reviews, setReviews] = useState<Map<string, { rating: number; text: string }>>(new Map())
  const [photos, setPhotos] = useState<File[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)

  useEffect(() => {
    checkUser()
    loadRequest()
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
      const { data: requestData, error: requestError } = await supabase
        .from('dining_requests')
        .select(`
          *,
          host:profiles!dining_requests_host_id_fkey(*)
        `)
        .eq('id', requestId)
        .single()

      if (requestError) throw requestError
      setRequest(requestData)

      // Check if user is the host
      const { data: { user } } = await supabase.auth.getUser()
      if (requestData.host_id !== user?.id) {
        router.push(`/request/${requestId}`)
        return
      }

      // Load accepted guests
      const { data: joinsData, error: joinsError } = await supabase
        .from('dining_joins')
        .select(`
          *,
          user:profiles!dining_joins_user_id_fkey(*)
        `)
        .eq('request_id', requestId)
        .eq('status', 'accepted')

      if (joinsError) throw joinsError
      
      setAcceptedGuests(joinsData || [])
      
      // Initialize attendance status
      const initialAttendance = (joinsData || []).map(join => ({
        user_id: join.user_id,
        user: join.user,
        attended: true, // Default to true
        paid_share: true // Default to true
      }))
      setAttendance(initialAttendance)

      // Initialize reviews with 5 stars
      const initialReviews = new Map()
      ;(joinsData || []).forEach(join => {
        initialReviews.set(join.user_id, { rating: 5, text: '' })
      })
      setReviews(initialReviews)

    } catch (error) {
      console.error('Error loading request:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (userId: string, field: 'attended' | 'paid_share', value: boolean) => {
    setAttendance(prev =>
      prev.map(a =>
        a.user_id === userId ? { ...a, [field]: value } : a
      )
    )
  }

  const handleRatingChange = (userId: string, rating: number) => {
    setReviews(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(userId) || { rating: 5, text: '' }
      newMap.set(userId, { ...existing, rating })
      return newMap
    })
  }

  const handleReviewTextChange = (userId: string, text: string) => {
    setReviews(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(userId) || { rating: 5, text: '' }
      newMap.set(userId, { ...existing, text })
      return newMap
    })
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setPhotos(prev => [...prev, ...newFiles])
      
      // Create preview URLs
      newFiles.forEach(file => {
        const url = URL.createObjectURL(file)
        setPhotoUrls(prev => [...prev, url])
      })
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoUrls(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) return []

    const uploadedUrls: string[] = []

    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('meal-photos')
        .upload(fileName, photo)

      if (uploadError) {
        console.error('Error uploading photo:', uploadError)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('meal-photos')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
    }

    return uploadedUrls
  }

  const handleSubmit = async () => {
    if (!request || !user) return

    setSubmitting(true)
    setUploadingPhotos(true)

    try {
      // Upload photos first
      const uploadedPhotoUrls = await uploadPhotos()
      setUploadingPhotos(false)

      // Save photo records
      if (uploadedPhotoUrls.length > 0) {
        const photoRecords = uploadedPhotoUrls.map(url => ({
          request_id: requestId,
          user_id: user.id,
          photo_url: url
        }))

        await supabase.from('meal_photos').insert(photoRecords)
      }

      // Save attendance records
      const attendanceRecords = attendance.map(a => ({
        request_id: requestId,
        user_id: a.user_id,
        attended: a.attended,
        paid_share: a.paid_share,
        marked_by: user.id
      }))

      await supabase.from('meal_attendance').upsert(attendanceRecords)

      // Save reviews for guests who attended
      const reviewRecords = attendance
        .filter(a => a.attended)
        .map(a => {
          const review = reviews.get(a.user_id)
          return {
            request_id: requestId,
            reviewer_id: user.id,
            reviewee_id: a.user_id,
            rating: review?.rating || 5,
            review_text: review?.text || '',
            attended: a.attended,
            paid_share: a.paid_share,
            would_dine_again: a.paid_share // Simple logic: if they paid, would dine again
          }
        })

      if (reviewRecords.length > 0) {
        await supabase.from('meal_reviews').upsert(reviewRecords)
      }

      // Mark meal as completed
      await supabase.from('meal_completions').upsert({
        request_id: requestId,
        host_id: user.id,
        notes
      })

      // Update request status
      await supabase
        .from('dining_requests')
        .update({ status: 'completed' })
        .eq('id', requestId)

      // Redirect to request page
      router.push(`/request/${requestId}`)
    } catch (error: any) {
      console.error('Error completing meal:', error)
      alert(`Failed to complete meal: ${error.message}`)
    } finally {
      setSubmitting(false)
      setUploadingPhotos(false)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href={`/request/${requestId}`} className="flex items-center gap-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Request</span>
          </Link>
          
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="w-7 h-7 text-[var(--primary)]" strokeWidth={2.5} />
            <h1 className="text-xl font-bold text-[var(--neutral)]">DineTogether</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[var(--neutral)] mb-2">
            Complete Meal Summary
          </h2>
          <p className="text-gray-600 text-lg">
            {request.restaurant_name} • {new Date(request.dining_time).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8">
          {/* Guest Attendance */}
          <div>
            <h3 className="text-2xl font-bold text-[var(--neutral)] mb-4">Guest Attendance</h3>
            <p className="text-gray-600 mb-6">Mark who showed up and paid their share</p>
            
            <div className="space-y-4">
              {attendance.map((guest) => (
                <div key={guest.user_id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {guest.user.avatar_url ? (
                      <img
                        src={guest.user.avatar_url}
                        alt={guest.user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {guest.user.name[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-lg text-[var(--neutral)]">{guest.user.name}</div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{guest.user.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={guest.attended}
                        onChange={(e) => handleAttendanceChange(guest.user_id, 'attended', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <span className="text-gray-700">Did they show up?</span>
                    </label>

                    {guest.attended && (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={guest.paid_share}
                          onChange={(e) => handleAttendanceChange(guest.user_id, 'paid_share', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <span className="text-gray-700">Did they pay their share?</span>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="text-2xl font-bold text-[var(--neutral)] mb-4">Rate Your Guests</h3>
            <p className="text-gray-600 mb-6">Help the community by sharing your experience</p>
            
            <div className="space-y-6">
              {attendance.filter(g => g.attended).map((guest) => {
                const review = reviews.get(guest.user_id) || { rating: 5, text: '' }
                
                return (
                  <div key={guest.user_id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {guest.user.avatar_url ? (
                        <img
                          src={guest.user.avatar_url}
                          alt={guest.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {guest.user.name[0]}
                        </div>
                      )}
                      <div className="font-bold text-lg text-[var(--neutral)]">{guest.user.name}</div>
                    </div>

                    {/* Star Rating */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(guest.user_id, star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= review.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Review (Optional)</label>
                      <textarea
                        value={review.text}
                        onChange={(e) => handleReviewTextChange(guest.user_id, e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none resize-none"
                        placeholder="Share your experience with this diner..."
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <h3 className="text-2xl font-bold text-[var(--neutral)] mb-4">Upload Photos</h3>
            <p className="text-gray-600 mb-6">Share memories from your meal (optional)</p>
            
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[var(--primary)] transition-colors">
                <Camera className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>

              {photoUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none resize-none"
              placeholder="Any other thoughts about the meal?"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploadingPhotos ? (
              <>
                <Upload className="w-5 h-5 animate-bounce" />
                Uploading Photos...
              </>
            ) : submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Complete Meal
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
