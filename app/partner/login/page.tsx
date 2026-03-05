'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createSupabaseBrowserClient } from '../../lib/supabase-browser'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/partner/dashboard'

  const supabase = createSupabaseBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Check if user owns a restaurant
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Authentication failed')

      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!restaurant) {
        setError('No restaurant found for this account. Please sign up as a restaurant partner first.')
        await supabase.auth.signOut()
        return
      }

      window.location.href = redirect
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h1 className="text-2xl font-bold text-[var(--neutral)] mb-2" style={{ fontFamily: 'Fraunces, serif' }}>
        Welcome Back
      </h1>
      <p className="text-gray-600 mb-6">Sign in to your restaurant dashboard.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
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
          disabled={loading}
          className="w-full py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all font-semibold text-sm disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/partner/signup" className="text-[var(--primary)] font-semibold hover:text-[var(--primary-dark)]">
            Sign up as a restaurant
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function PartnerLoginPage() {
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
            <span className="text-sm text-gray-500">New restaurant?</span>
            <Link href="/partner/signup" className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)]">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-md mx-auto">
          <Suspense fallback={
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center text-gray-500">Loading...</div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
