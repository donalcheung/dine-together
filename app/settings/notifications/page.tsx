'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Utensils, ArrowLeft, Bell, Save, Mail, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface NotificationSettings {
  id?: string
  user_id: string
  email_on_join_request: boolean
  email_on_join_accepted: boolean
  email_on_join_declined: boolean
  email_on_new_comment: boolean
  email_on_meal_reminder: boolean
}

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [settings, setSettings] = useState<NotificationSettings>({
    user_id: '',
    email_on_join_request: true,
    email_on_join_accepted: true,
    email_on_join_declined: true,
    email_on_new_comment: true,
    email_on_meal_reminder: true,
  })

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
    await loadSettings(user.id)
  }

  const loadSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setSettings(data)
      } else {
        // Create default settings if they don't exist
        const defaultSettings = {
          user_id: userId,
          email_on_join_request: true,
          email_on_join_accepted: true,
          email_on_join_declined: true,
          email_on_new_comment: true,
          email_on_meal_reminder: true,
        }
        
        const { data: newSettings, error: createError } = await supabase
          .from('notification_settings')
          .insert([defaultSettings])
          .select()
          .single()

        if (createError) throw createError
        
        setSettings(newSettings)
      }
    } catch (error: any) {
      console.error('Error loading settings:', error)
      setError('Failed to load notification settings')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          email_on_join_request: settings.email_on_join_request,
          email_on_join_accepted: settings.email_on_join_accepted,
          email_on_join_declined: settings.email_on_join_declined,
          email_on_new_comment: settings.email_on_new_comment,
          email_on_meal_reminder: settings.email_on_meal_reminder,
        })
        .eq('user_id', user.id)

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error('Error saving settings:', error)
      setError(error.message || 'Failed to save settings')
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
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-10 h-10 text-[var(--primary)]" />
            <h2 className="text-4xl font-bold text-[var(--neutral)]">
              Notification Settings
            </h2>
          </div>
          <p className="text-gray-600 text-lg">
            Choose when you'd like to receive email notifications
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Settings saved successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          {/* Info Box */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[var(--neutral)] mb-1">Email Notifications</h4>
                <p className="text-sm text-gray-700">
                  We'll send you email notifications based on your preferences below. 
                  You can change these settings at any time.
                </p>
              </div>
            </div>
          </div>

          {/* Notification Toggles */}
          <div className="space-y-6">
            {/* Join Request */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-1 pr-4">
                <h3 className="font-semibold text-[var(--neutral)] mb-1">
                  Someone requests to join your dining request
                </h3>
                <p className="text-sm text-gray-600">
                  Get notified when someone wants to join your meal so you can review and accept them quickly.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_on_join_request}
                  onChange={() => handleToggle('email_on_join_request')}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary)]/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>

            {/* Join Accepted */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-1 pr-4">
                <h3 className="font-semibold text-[var(--neutral)] mb-1">
                  Your join request is accepted
                </h3>
                <p className="text-sm text-gray-600">
                  Get notified when a host accepts your request to join their dining request.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_on_join_accepted}
                  onChange={() => handleToggle('email_on_join_accepted')}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary)]/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>

            {/* Join Declined */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-1 pr-4">
                <h3 className="font-semibold text-[var(--neutral)] mb-1">
                  Your join request is declined
                </h3>
                <p className="text-sm text-gray-600">
                  Get notified if a host declines your request so you can find other dining opportunities.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_on_join_declined}
                  onChange={() => handleToggle('email_on_join_declined')}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary)]/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>

            {/* New Comment */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-1 pr-4">
                <h3 className="font-semibold text-[var(--neutral)] mb-1">
                  New comment on your dining request
                </h3>
                <p className="text-sm text-gray-600">
                  Get notified when someone comments on your dining request to stay engaged with potential diners.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_on_new_comment}
                  onChange={() => handleToggle('email_on_new_comment')}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary)]/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>

            {/* Meal Reminder */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex-1 pr-4">
                <h3 className="font-semibold text-[var(--neutral)] mb-1">
                  Meal reminder (1 hour before)
                </h3>
                <p className="text-sm text-gray-600">
                  Get reminded 1 hour before your scheduled meal so you don't forget!
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_on_meal_reminder}
                  onChange={() => handleToggle('email_on_meal_reminder')}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--primary)]/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
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
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
