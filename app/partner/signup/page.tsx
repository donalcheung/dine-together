'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createSupabaseBrowserClient } from '../../lib/supabase-browser'

function SignupForm() {
  const searchParams = useSearchParams()
  const isExistingUser = searchParams.get('existing') === 'true'
  const initialStep = searchParams.get('step') === 'restaurant' ? 'restaurant' : 'account'

  const [step, setStep] = useState<'account' | 'restaurant'>(initialStep)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Account fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  // Restaurant fields
  const [restaurantName, setRestaurantName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [phone, setPhone] = useState('')
  const [cuisineType, setCuisineType] = useState('')
  const [priceLevel, setPriceLevel] = useState('$$')
  const [description, setDescription] = useState('')

  const supabase = createSupabaseBrowserClient()

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !fullName) {
      setError('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setError('')
    setStep('restaurant')
  }

  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurantName || !address || !city || !state) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      let userId: string

      if (isExistingUser) {
        // User is already authenticated (came from login page) — skip account creation
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('Session expired. Please log in again.')
        userId = user.id
      } else {
        // 1. Sign up the new user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              is_restaurant_owner: true,
            },
          },
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('Failed to create account')
        userId = authData.user.id

        // 2. Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: email,
            name: fullName,
          }, { onConflict: 'id' })

        if (profileError) {
          console.error('Profile error:', profileError)
          // Non-fatal - profile may be created by trigger
        }
      }

      // 3. Create the restaurant
      const fullAddress = `${address}, ${city}, ${state} ${zipCode}`
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          owner_id: userId,
          name: restaurantName,
          address: fullAddress,
          city: city,
          state: state,
          zip_code: zipCode,
          phone: phone,
          cuisine_type: cuisineType,
          price_level: priceLevel,
          description: description,
          is_verified: false,
          is_active: true,
          accepts_deals: true,
        })

      if (restaurantError) throw restaurantError

      // 4. Create free subscription
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', userId)
        .single()

      if (restaurant) {
        await supabase
          .from('restaurant_subscriptions')
          .insert({
            restaurant_id: restaurant.id,
            owner_id: userId,
            plan: 'free',
            status: 'active',
            price_cents: 0,
            currency: 'usd',
            billing_period: 'monthly',
          })
      }

      // Redirect to dashboard
      window.location.href = '/partner/dashboard'
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-orange-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/partner" className="flex items-center gap-3">
            <Image src="/logo.png" alt="TableMesh Logo" width={40} height={40} className="w-10 h-10 rounded-xl" />
            <span className="text-2xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
              TableMesh
            </span>
            <span className="text-xs font-semibold bg-[var(--primary)] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
              Partners
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Already have an account?</span>
            <Link href="/partner/login" className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)]">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-xl mx-auto">
          {/* Progress indicator — hidden for existing users who skip account step */}
          {!isExistingUser && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className={`flex items-center gap-2 ${step === 'account' ? 'text-[var(--primary)]' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'account' ? 'bg-[var(--primary)] text-white' : 'bg-green-100 text-green-600'}`}>
                  {step === 'restaurant' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : '1'}
                </div>
                <span className="text-sm font-medium">Account</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-200" />
              <div className={`flex items-center gap-2 ${step === 'restaurant' ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'restaurant' ? 'bg-[var(--primary)] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  2
                </div>
                <span className="text-sm font-medium">Restaurant</span>
              </div>
            </div>
          )}

          {/* Context banner for existing users */}
          {isExistingUser && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
              You&apos;re signed in. Just add your restaurant details below to get started.
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {step === 'account' ? (
              <>
                <h1 className="text-2xl font-bold text-[var(--neutral)] mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
                  Create Your Account
                </h1>
                <p className="text-gray-600 mb-6">First, set up your login credentials.</p>

                <form onSubmit={handleAccountSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Smith"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@restaurant.com"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all font-semibold text-sm"
                  >
                    Continue
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  {!isExistingUser && (
                    <button onClick={() => { setStep('account'); setError('') }} className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                      </svg>
                    </button>
                  )}
                  <h1 className="text-2xl font-bold text-[var(--neutral)]" style={{ fontFamily: 'Fraunces, serif' }}>
                    {isExistingUser ? 'Register Your Restaurant' : 'Restaurant Details'}
                  </h1>
                </div>
                <p className="text-gray-600 mb-6">
                  {isExistingUser
                    ? 'Add your restaurant to start posting deals and reaching diners.'
                    : 'Tell us about your restaurant.'}
                </p>

                <form onSubmit={handleRestaurantSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name *</label>
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="Mario's Italian Kitchen"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main Street"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Chicago"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="IL"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="60601"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(312) 555-0123"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                      <select
                        value={cuisineType}
                        onChange={(e) => setCuisineType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm bg-white"
                      >
                        <option value="">Select...</option>
                        <option value="American">American</option>
                        <option value="Italian">Italian</option>
                        <option value="Mexican">Mexican</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Korean">Korean</option>
                        <option value="Thai">Thai</option>
                        <option value="Indian">Indian</option>
                        <option value="Mediterranean">Mediterranean</option>
                        <option value="French">French</option>
                        <option value="BBQ">BBQ</option>
                        <option value="Seafood">Seafood</option>
                        <option value="Pizza">Pizza</option>
                        <option value="Sushi">Sushi</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price Level</label>
                      <select
                        value={priceLevel}
                        onChange={(e) => setPriceLevel(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm bg-white"
                      >
                        <option value="$">$ - Budget</option>
                        <option value="$$">$$ - Moderate</option>
                        <option value="$$$">$$$ - Upscale</option>
                        <option value="$$$$">$$$$ - Fine Dining</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell diners what makes your restaurant special..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm resize-none"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all font-semibold text-sm disabled:opacity-50"
                  >
                    {loading ? 'Creating your restaurant...' : 'Create Restaurant & Continue'}
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 text-center text-xs text-gray-400">
              By signing up, you agree to our{' '}
              <Link href="/terms-of-service" className="underline hover:text-gray-600">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy-policy" className="underline hover:text-gray-600">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PartnerSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
