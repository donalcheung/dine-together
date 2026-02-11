'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ArrowLeft, Heart, AlertCircle, Calendar, Users, CheckCircle } from 'lucide-react'
import { getProfileWithProgression, Profile } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { ACHIEVEMENTS } from '@/lib/achievements'

interface DiningRequest {
  id: string
  restaurant_name: string
  dining_time: string
  status: string
  seats_available: number
  total_seats: number
}

interface Stats {
  totalCreated: number
  totalCompleted: number
  totalJoined: number
}

export default function PublicProfilePage() {
  const params = useParams()
  const profileId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [hasLiked, setHasLiked] = useState<boolean>(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [likesCount, setLikesCount] = useState<number>(0)
  const [recentRequests, setRecentRequests] = useState<DiningRequest[]>([])
  const [stats, setStats] = useState<Stats>({ totalCreated: 0, totalCompleted: 0, totalJoined: 0 })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)

        const data = await getProfileWithProgression(profileId)
        if (!data) {
          setError('Profile not found')
          setProfile(null)
          return
        }
        setProfile(data)
        setLikesCount(data.total_likes || 0)

        // Check if current user has liked this profile
        if (user?.id && user.id !== profileId) {
          const { data: likeData, error: likeError } = await supabase
            .from('profile_likes')
            .select('id')
            .eq('from_user_id', user.id)
            .eq('to_user_id', profileId)
            .single()

          if (!likeError && likeData) {
            setHasLiked(true)
          }
        }

        // Fetch recent requests (both as host and guest)
        const { data: hostedRequests } = await supabase
          .from('dining_requests')
          .select('id, restaurant_name, dining_time, status, seats_available, total_seats')
          .eq('host_id', profileId)
          .order('dining_time', { ascending: false })
          .limit(3)

        const { data: joinedRequestIds } = await supabase
          .from('dining_joins')
          .select('request_id')
          .eq('user_id', profileId)
          .eq('status', 'accepted')

        let joinedRequests: DiningRequest[] = []
        if (joinedRequestIds && joinedRequestIds.length > 0) {
          const { data } = await supabase
            .from('dining_requests')
            .select('id, restaurant_name, dining_time, status, seats_available, total_seats')
            .in('id', joinedRequestIds.map(j => j.request_id))
            .order('dining_time', { ascending: false })
            .limit(3)
          joinedRequests = data || []
        }

        // Combine and sort by dining_time
        const allRequests = [...(hostedRequests || []), ...joinedRequests]
          .sort((a, b) => new Date(b.dining_time).getTime() - new Date(a.dining_time).getTime())
          .slice(0, 3)
        setRecentRequests(allRequests)

        // Calculate stats
        const { count: createdCount } = await supabase
          .from('dining_requests')
          .select('*', { count: 'exact', head: true })
          .eq('host_id', profileId)

        const { count: completedAsHostCount } = await supabase
          .from('dining_requests')
          .select('*', { count: 'exact', head: true })
          .eq('host_id', profileId)
          .eq('status', 'completed')

        const { count: joinedCount } = await supabase
          .from('dining_joins')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profileId)
          .eq('status', 'accepted')

        // Get completed requests they joined
        const { data: completedJoinedIds } = await supabase
          .from('dining_joins')
          .select('request_id')
          .eq('user_id', profileId)
          .eq('status', 'accepted')

        let completedAsGuestCount = 0
        if (completedJoinedIds && completedJoinedIds.length > 0) {
          const { count } = await supabase
            .from('dining_requests')
            .select('*', { count: 'exact', head: true })
            .in('id', completedJoinedIds.map(j => j.request_id))
            .eq('status', 'completed')
          completedAsGuestCount = count || 0
        }

        setStats({
          totalCreated: createdCount || 0,
          totalCompleted: (completedAsHostCount || 0) + completedAsGuestCount,
          totalJoined: joinedCount || 0
        })
      } catch (err: any) {
        setError(err?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (profileId) {
      loadProfile()
    }
  }, [profileId])

  const toggleLike = async () => {
    if (!currentUserId) {
      setError('You must be logged in to like profiles')
      return
    }

    if (currentUserId === profileId) {
      setError("You can't like your own profile")
      return
    }

    try {
      setLikeLoading(true)
      setError('')

      if (hasLiked) {
        // Unlike
        console.log('Attempting to unlike profile:', profileId)
        const { error: deleteError, data: deleteData } = await supabase
          .from('profile_likes')
          .delete()
          .eq('from_user_id', currentUserId)
          .eq('to_user_id', profileId)
          .select()

        console.log('Delete result:', { deleteError, deleteData })

        if (deleteError) {
          console.error('Delete error:', deleteError)
          throw deleteError
        }

        setHasLiked(false)
        setLikesCount(prev => Math.max(0, prev - 1))
      } else {
        // Like
        console.log('Attempting to like profile:', profileId)
        const { error: insertError, data: insertData } = await supabase
          .from('profile_likes')
          .insert({
            from_user_id: currentUserId,
            to_user_id: profileId
          })
          .select()

        console.log('Insert result:', { insertError, insertData })

        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }

        setHasLiked(true)
        setLikesCount(prev => prev + 1)
      }

      // Wait a moment for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 500))

      // Refresh profile to sync with database
      console.log('Refreshing profile data...')
      const refreshedProfile = await getProfileWithProgression(profileId)
      console.log('Refreshed profile total_likes:', refreshedProfile?.total_likes)
      if (refreshedProfile) {
        setLikesCount(refreshedProfile.total_likes || 0)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update like')
      console.error('Like error:', err)
      // Revert optimistic update on error
      setHasLiked(!hasLiked)
    } finally {
      setLikeLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">{error || 'Profile not found'}</h2>
          <Link href="/dashboard" className="text-[var(--primary)] hover:underline mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.png" alt="TableMesh Logo" width={28} height={28} className="w-7 h-7" />
            <h1 className="text-xl font-bold text-[var(--neutral)]">TableMesh</h1>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[var(--neutral)] mb-2">Public Profile</h2>
          <p className="text-gray-600 text-lg">See public info about this diner</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {profile.name[0]?.toUpperCase() || 'U'}
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[var(--neutral)] mb-1">{profile.name}</h3>
              {profile.progression && (
                <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold">
                    Lv {profile.progression.current_level}
                  </span>
                  <span className="text-gray-500">•</span>
                  {profile.displayed_achievement && ACHIEVEMENTS[profile.displayed_achievement.achievement_key] ? (
                    <span className="flex items-center gap-1 text-amber-700 font-medium">
                      <span>{ACHIEVEMENTS[profile.displayed_achievement.achievement_key].icon}</span>
                      <span>{ACHIEVEMENTS[profile.displayed_achievement.achievement_key].name}</span>
                    </span>
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {profile.progression.current_level >= 20 ? '👑 Legend' :
                       profile.progression.current_level >= 15 ? '💎 Elite' :
                       profile.progression.current_level >= 10 ? '🏆 Veteran' :
                       profile.progression.current_level >= 5 ? '🍽️ Regular' :
                       '🌱 Newcomer'}
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3 mt-2">
                {currentUserId && currentUserId !== profileId ? (
                  <button
                    onClick={toggleLike}
                    disabled={likeLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                      hasLiked
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${likeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} />
                    <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700">
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                    <span className="font-medium">{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-2xl font-bold text-[var(--neutral)]">{stats.totalCreated}</span>
              </div>
              <p className="text-sm text-gray-600">Created</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-2xl font-bold text-[var(--neutral)]">{stats.totalCompleted}</span>
              </div>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-2xl font-bold text-[var(--neutral)]">{stats.totalJoined}</span>
              </div>
              <p className="text-sm text-gray-600">Joined</p>
            </div>
          </div>

          {/* Recent Requests Section */}
          {recentRequests.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Recent Dining Requests</h4>
              <div className="space-y-3">
                {recentRequests.map((request) => (
                  <Link
                    key={request.id}
                    href={`/request/${request.id}`}
                    className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-[var(--neutral)] mb-1">{request.restaurant_name}</h5>
                        <p className="text-sm text-gray-600">
                          {new Date(request.dining_time).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.status === 'completed' ? 'bg-green-100 text-green-700' :
                          request.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {request.seats_available}/{request.total_seats} seats
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Bio</h4>
              <p className="text-gray-700">
                {profile.bio && profile.bio.trim().length > 0 ? profile.bio : 'No bio yet.'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Dietary Restrictions</h4>
              <p className="text-gray-700">
                {profile.dietary_restrictions && profile.dietary_restrictions.trim().length > 0
                  ? profile.dietary_restrictions
                  : 'None listed.'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Food Preferences</h4>
              <p className="text-gray-700">
                {profile.food_preferences && profile.food_preferences.trim().length > 0
                  ? profile.food_preferences
                  : 'None listed.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}