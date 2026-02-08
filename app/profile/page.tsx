'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Utensils, ArrowLeft, User, Mail, FileText, UtensilsCrossed, AlertCircle, Save, Heart, Camera, Upload } from 'lucide-react'
import { supabase, Profile } from '@/lib/supabase'
import { validateProfanity } from '@/lib/profanity-filter'

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    dietary_restrictions: '',
    food_preferences: '',
    avatar_url: '',
  })

  const [profile, setProfile] = useState<Profile | null>(null)

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
    
    // Load profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profile) {
      setProfile(profile)
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        bio: profile.bio || '',
        dietary_restrictions: profile.dietary_restrictions || '',
        food_preferences: profile.food_preferences || '',
        avatar_url: profile.avatar_url || '',
      })
    }
    
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Delete old avatar if exists
      if (formData.avatar_url) {
        const oldPath = formData.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`])
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      setError(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      // Validate profanity in bio
      if (formData.bio) {
        validateProfanity(formData.bio, 'Bio')
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          bio: formData.bio,
          dietary_restrictions: formData.dietary_restrictions,
          food_preferences: formData.food_preferences,
        })
        .eq('id', user.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
      // Refresh profile data
      checkUser()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
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
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[var(--neutral)] mb-2">
            Your Profile
          </h2>
          <p className="text-gray-600 text-lg">
            Update your information so others can get to know you better
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Profile Header with Avatar Upload */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
            <div className="relative">
              {/* Avatar Display */}
              {formData.avatar_url ? (
                <img
                  src={formData.avatar_url}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {formData.name[0]?.toUpperCase() || 'U'}
                </div>
              )}
              
              {/* Upload Button Overlay */}
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--primary)] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[var(--primary-dark)] transition-all disabled:opacity-50"
                title="Change profile picture"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[var(--neutral)] mb-1">{formData.name}</h3>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                <span className="font-medium">{profile?.total_likes || 0} likes</span>
              </div>
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{formData.avatar_url ? 'Change photo' : 'Upload photo'}</span>
              </button>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
              <Save className="w-5 h-5" />
              <span className="font-medium">Profile updated successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User className="w-5 h-5 text-[var(--primary)]" />
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                placeholder="Your full name"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-5 h-5 text-[var(--primary)]" />
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-5 h-5 text-[var(--primary)]" />
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all resize-none"
                placeholder="Tell others a bit about yourself... Love trying new cuisines? Foodie? Travel enthusiast?"
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Dietary Restrictions */}
            <div>
              <label htmlFor="dietary_restrictions" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="w-5 h-5 text-[var(--primary)]" />
                Dietary Restrictions
              </label>
              <input
                id="dietary_restrictions"
                name="dietary_restrictions"
                type="text"
                value={formData.dietary_restrictions}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                placeholder="e.g., Vegetarian, Vegan, Gluten-free, No shellfish"
              />
              <p className="mt-1 text-sm text-gray-500">
                Help others know what you can/can't eat
              </p>
            </div>

            {/* Food Preferences */}
            <div>
              <label htmlFor="food_preferences" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <UtensilsCrossed className="w-5 h-5 text-[var(--primary)]" />
                Food Preferences
              </label>
              <input
                id="food_preferences"
                name="food_preferences"
                type="text"
                value={formData.food_preferences}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                placeholder="e.g., Italian, Sushi, Tacos, Dim Sum, Thai food"
              />
              <p className="mt-1 text-sm text-gray-500">
                What types of food do you love?
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h4 className="font-semibold text-[var(--neutral)] mb-3">📸 Profile Picture Tips:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">•</span>
                <span>Use a clear photo of yourself (max 2MB)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">•</span>
                <span>Square photos work best - your photo will be cropped to a circle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">•</span>
                <span>Your photo shows on all dining requests you create or join</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--primary)] mt-0.5">•</span>
                <span>A friendly photo helps build trust with other diners!</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
