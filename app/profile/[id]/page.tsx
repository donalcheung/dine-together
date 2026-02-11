'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ArrowLeft, Heart, AlertCircle } from 'lucide-react'
import { getProfileWithProgression, Profile } from '@/lib/supabase'
import { ACHIEVEMENTS } from '@/lib/achievements'

export default function PublicProfilePage() {
  const params = useParams()
  const profileId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const data = await getProfileWithProgression(profileId)
        if (!data) {
          setError('Profile not found')
          setProfile(null)
          return
        }
        setProfile(data)
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
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                <span className="font-medium">{profile.total_likes || 0} likes</span>
              </div>
              <div className="text-sm text-gray-500">
                Rating: {profile.rating?.toFixed(1) || '0.0'} ({profile.total_ratings || 0} ratings)
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
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
