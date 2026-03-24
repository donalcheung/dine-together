'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '../lib/supabase-browser'

// ── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string
  name: string
  email: string
  bio: string | null
  avatar_url: string | null
  job_title: string | null
  company: string | null
  hobbies: string | null
  instagram: string | null
  vibe_tags: string[] | null
  dietary_type: string | null
  food_allergies: string | null
  food_preferences: string | null
}

interface ProfilePhoto {
  id: string
  photo_url: string
  created_at: string
}

interface Subscription {
  plan: string
  status: string
  trial_start: string | null
  trial_end: string | null
  expires_at: string | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function planLabel(plan: string) {
  if (plan === 'plus') return 'TableMesh Plus'
  if (plan === 'free') return 'Free'
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700' },
    trialing: { label: 'Trial', color: 'bg-blue-100 text-blue-700' },
    canceled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
    past_due: { label: 'Past Due', color: 'bg-red-100 text-red-600' },
    free: { label: 'Free', color: 'bg-gray-100 text-gray-500' },
  }
  const s = map[status] || { label: status, color: 'bg-gray-100 text-gray-500' }
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type Tab = 'profile' | 'gallery' | 'subscription'

export default function AccountPage() {
  const [tab, setTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [photos, setPhotos] = useState<ProfilePhoto[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Form state mirrors profile fields
  const [form, setForm] = useState({
    name: '', bio: '', job_title: '', company: '',
    hobbies: '', instagram: '', dietary_type: '',
    food_allergies: '', food_preferences: '',
  })

  const supabase = createSupabaseBrowserClient()

  const loadData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }

    const userId = session.user.id

    // Load profile
    const { data: prof } = await supabase
      .from('profiles')
      .select('id,name,email,bio,avatar_url,job_title,company,hobbies,instagram,vibe_tags,dietary_type,food_allergies,food_preferences')
      .eq('id', userId)
      .single()

    if (prof) {
      setProfile(prof)
      setForm({
        name: prof.name || '',
        bio: prof.bio || '',
        job_title: prof.job_title || '',
        company: prof.company || '',
        hobbies: prof.hobbies || '',
        instagram: prof.instagram || '',
        dietary_type: prof.dietary_type || '',
        food_allergies: prof.food_allergies || '',
        food_preferences: prof.food_preferences || '',
      })
    }

    // Load gallery photos
    const { data: photoData } = await supabase
      .from('profile_photos')
      .select('id,photo_url,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setPhotos(photoData || [])

    // Load subscription
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('plan,status,trial_start,trial_end,expires_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    setSubscription(sub || null)

    setLoading(false)
  }, [supabase])

  useEffect(() => { loadData() }, [loadData])

  // ── Save profile ────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setSaveMsg('')
    const { error } = await supabase
      .from('profiles')
      .update({
        name: form.name.trim(),
        bio: form.bio.trim() || null,
        job_title: form.job_title.trim() || null,
        company: form.company.trim() || null,
        hobbies: form.hobbies.trim() || null,
        instagram: form.instagram.trim() || null,
        dietary_type: form.dietary_type || null,
        food_allergies: form.food_allergies.trim() || null,
        food_preferences: form.food_preferences.trim() || null,
      })
      .eq('id', profile.id)
    setSaving(false)
    setSaveMsg(error ? 'Failed to save. Please try again.' : 'Profile saved!')
    setTimeout(() => setSaveMsg(''), 3000)
  }

  // ── Avatar upload ───────────────────────────────────────────────────────────

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${publicUrl}?t=${Date.now()}`
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
      setProfile(p => p ? { ...p, avatar_url: url } : p)
    }
    setUploadingAvatar(false)
    if (avatarInputRef.current) avatarInputRef.current.value = ''
  }

  // ── Gallery upload ──────────────────────────────────────────────────────────

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const path = `${profile.id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('profile-photos').upload(path, file)
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(path)
      const { data: newPhoto } = await supabase
        .from('profile_photos')
        .insert({ user_id: profile.id, photo_url: publicUrl })
        .select('id,photo_url,created_at')
        .single()
      if (newPhoto) setPhotos(prev => [newPhoto, ...prev])
    }
    setUploadingPhoto(false)
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  // ── Delete gallery photo ────────────────────────────────────────────────────

  const handleDeletePhoto = async (photo: ProfilePhoto) => {
    setDeletingPhotoId(photo.id)
    await supabase.from('profile_photos').delete().eq('id', photo.id)
    // Try to remove from storage too
    const urlPath = photo.photo_url.split('/profile-photos/')[1]
    if (urlPath) await supabase.storage.from('profile-photos').remove([urlPath])
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
    setDeletingPhotoId(null)
  }

  // ── Cancel subscription ─────────────────────────────────────────────────────

  const handleCancelSubscription = async () => {
    if (!profile) return
    setCancelling(true)
    // Update subscription status to canceled in DB
    await supabase
      .from('user_subscriptions')
      .update({ status: 'canceled' })
      .eq('user_id', profile.id)
    setSubscription(s => s ? { ...s, status: 'canceled' } : s)
    setCancelling(false)
    setCancelConfirm(false)
  }

  // ── Sign out ────────────────────────────────────────────────────────────────

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  // ── Render ──────────────────────────────────────────────────────────────────

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'gallery', label: 'Gallery', icon: '📷' },
    { id: 'subscription', label: 'Subscription', icon: '⭐' },
  ]

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-40 border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="TableMesh" width={30} height={30} className="rounded-xl" />
            <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>TableMesh</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/explore" className="text-sm text-gray-500 hover:text-orange-500 hidden sm:block">Explore</Link>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        {/* Profile header */}
        <div className="flex items-center gap-5 py-8">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden bg-orange-100 flex items-center justify-center cursor-pointer ring-2 ring-orange-200 hover:ring-orange-400 transition-all"
              onClick={() => avatarInputRef.current?.click()}
              title="Click to change avatar"
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-orange-400">{profile.name?.[0]?.toUpperCase()}</span>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              ✏️
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>{profile.name}</h1>
            <p className="text-sm text-gray-400">{profile.email}</p>
            {subscription && (
              <div className="flex items-center gap-2 mt-1">
                {statusBadge(subscription.status)}
                <span className="text-xs text-gray-400">{planLabel(subscription.plan)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-orange-500'
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {tab === 'profile' && (
          <form onSubmit={handleSave} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-5" style={{ fontFamily: 'Fraunces, serif' }}>Edit Profile</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Display Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3}
                  placeholder="Tell other diners a bit about yourself…"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Job Title</label>
                <input
                  type="text"
                  value={form.job_title}
                  onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Hobbies & Interests</label>
                <input
                  type="text"
                  value={form.hobbies}
                  onChange={e => setForm(f => ({ ...f, hobbies: e.target.value }))}
                  placeholder="e.g. hiking, photography, cooking"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Instagram</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input
                    type="text"
                    value={form.instagram}
                    onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Dietary Type</label>
                <select
                  value={form.dietary_type}
                  onChange={e => setForm(f => ({ ...f, dietary_type: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors"
                >
                  <option value="">Not specified</option>
                  {['Omnivore', 'Vegetarian', 'Vegan', 'Pescatarian', 'Halal', 'Kosher', 'Gluten-free', 'Keto', 'Other'].map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Food Allergies</label>
                <input
                  type="text"
                  value={form.food_allergies}
                  onChange={e => setForm(f => ({ ...f, food_allergies: e.target.value }))}
                  placeholder="e.g. nuts, shellfish"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Food Preferences</label>
                <input
                  type="text"
                  value={form.food_preferences}
                  onChange={e => setForm(f => ({ ...f, food_preferences: e.target.value }))}
                  placeholder="e.g. spicy food, no cilantro"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6 pt-5 border-t border-gray-50">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-60 shadow-sm shadow-orange-100"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              {saveMsg && (
                <span className={`text-sm font-medium ${saveMsg.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
                  {saveMsg.includes('Failed') ? '✗' : '✓'} {saveMsg}
                </span>
              )}
            </div>
          </form>
        )}

        {/* ── Gallery Tab ── */}
        {tab === 'gallery' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>Photo Gallery</h2>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
              >
                {uploadingPhoto ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading…</>
                ) : (
                  <><span>+</span> Add Photo</>
                )}
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            <p className="text-xs text-gray-400 mb-5">
              These photos appear on your profile in the app. Other diners can see them when viewing your profile.
            </p>

            {photos.length === 0 ? (
              <div
                className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-orange-300 transition-colors"
                onClick={() => photoInputRef.current?.click()}
              >
                <div className="text-4xl mb-3">📷</div>
                <p className="text-gray-400 text-sm font-medium">No photos yet</p>
                <p className="text-gray-300 text-xs mt-1">Click to add your first photo</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-gray-100">
                    <img
                      src={photo.photo_url}
                      alt="Gallery photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <button
                        onClick={() => handleDeletePhoto(photo)}
                        disabled={deletingPhotoId === photo.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-red-600"
                      >
                        {deletingPhotoId === photo.id ? '…' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))}
                {/* Add more tile */}
                <div
                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 transition-colors"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <span className="text-2xl text-gray-300">+</span>
                  <span className="text-xs text-gray-300 mt-1">Add photo</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Subscription Tab ── */}
        {tab === 'subscription' && (
          <div className="space-y-4">
            {/* Current plan card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-5" style={{ fontFamily: 'Fraunces, serif' }}>Your Plan</h2>

              {!subscription || subscription.plan === 'free' ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">🆓</div>
                    <div>
                      <p className="font-bold text-gray-900">Free Plan</p>
                      <p className="text-xs text-gray-400">Limited access to TableMesh features</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100 mb-4">
                    <p className="text-sm font-bold text-orange-700 mb-3">Upgrade to Plus</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        { icon: '💬', text: 'Message hosts' },
                        { icon: '👥', text: 'See who\'s going' },
                        { icon: '🍽', text: 'Join any table' },
                        { icon: '⭐', text: 'Priority seating' },
                        { icon: '🎁', text: 'Restaurant deals' },
                        { icon: '🔔', text: 'Instant alerts' },
                      ].map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                          <span>{p.icon}</span> {p.text}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-3">$9.99 / month</p>
                    <a
                      href="https://apps.apple.com/us/app/tablemesh/id6760209899"
                      className="block w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm text-center hover:from-orange-600 hover:to-amber-600 transition-all"
                    >
                      Upgrade on the App →
                    </a>
                    <p className="text-center text-xs text-gray-400 mt-2">Manage subscriptions through the iOS App Store</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">⭐</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{planLabel(subscription.plan)}</p>
                        {statusBadge(subscription.status)}
                      </div>
                      <p className="text-xs text-gray-400">
                        {subscription.status === 'trialing'
                          ? `Trial ends ${formatDate(subscription.trial_end)}`
                          : subscription.expires_at
                            ? `Renews ${formatDate(subscription.expires_at)}`
                            : 'Active subscription'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {subscription.trial_start && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5">Trial started</p>
                        <p className="text-sm font-semibold text-gray-700">{formatDate(subscription.trial_start)}</p>
                      </div>
                    )}
                    {subscription.trial_end && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5">Trial ends</p>
                        <p className="text-sm font-semibold text-gray-700">{formatDate(subscription.trial_end)}</p>
                      </div>
                    )}
                    {subscription.expires_at && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5">Next renewal</p>
                        <p className="text-sm font-semibold text-gray-700">{formatDate(subscription.expires_at)}</p>
                      </div>
                    )}
                  </div>

                  {subscription.status !== 'canceled' && (
                    <div className="border-t border-gray-50 pt-4">
                      {!cancelConfirm ? (
                        <button
                          onClick={() => setCancelConfirm(true)}
                          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Cancel subscription
                        </button>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                          <p className="text-sm font-semibold text-red-700 mb-1">Cancel your subscription?</p>
                          <p className="text-xs text-red-500 mb-3">
                            You&apos;ll keep access until the end of your current period. This cannot be undone here — to resubscribe, use the app.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleCancelSubscription}
                              disabled={cancelling}
                              className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-60"
                            >
                              {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                            </button>
                            <button
                              onClick={() => setCancelConfirm(false)}
                              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                            >
                              Keep subscription
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {subscription.status === 'canceled' && (
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                      <p className="text-sm text-gray-500 mb-3">Your subscription has been cancelled.</p>
                      <a
                        href="https://apps.apple.com/us/app/tablemesh/id6760209899"
                        className="inline-block px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors"
                      >
                        Resubscribe on the App
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Billing note */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-600">
              <strong>Note:</strong> TableMesh subscriptions are managed through the iOS App Store or Google Play. To change your plan, update payment details, or resubscribe, please use the app.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
