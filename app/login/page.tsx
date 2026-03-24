'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '../lib/supabase-browser'
import Navbar from '../components/Navbar'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    // If already logged in, redirect to account
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/account'
    })
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Incorrect email or password. Please try again.'
        : authError.message)
      setLoading(false)
      return
    }
    window.location.href = '/account'
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setLoading(true)
    setError('')
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`,
    })
    setLoading(false)
    setResetSent(true)
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-orange-400 to-amber-400" />
            <div className="p-8">
              {mode === 'login' && (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
                    Welcome back
                  </h1>
                  <p className="text-sm text-gray-400 mb-6">Sign in to manage your profile and subscription.</p>

                  <form onSubmit={handleLogin} className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors"
                      />
                    </div>
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">{error}</div>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm mt-1 hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-60 shadow-sm shadow-orange-200"
                    >
                      {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                  </form>

                  <button
                    onClick={() => { setMode('forgot'); setError('') }}
                    className="w-full text-center text-xs text-gray-400 hover:text-orange-500 mt-4 transition-colors"
                  >
                    Forgot password?
                  </button>

                  <div className="relative flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-300">or</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  <p className="text-center text-xs text-gray-400">
                    Don&apos;t have an account?{' '}
                    <Link href="/explore" className="text-orange-500 font-semibold hover:underline">
                      Sign up free
                    </Link>
                  </p>

                  <div className="mt-5 pt-5 border-t border-gray-50">
                    <p className="text-center text-xs text-gray-400 mb-3">Prefer the app?</p>
                    <div className="flex gap-2">
                      <a
                        href="https://apps.apple.com/us/app/tablemesh/id6760209899"
                        className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-xs text-center hover:bg-gray-800 transition-colors"
                      >
                        🍎 App Store
                      </a>
                      <a
                        href="https://play.google.com/store/apps/details?id=com.tablemeshnative"
                        className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl font-semibold text-xs text-center hover:bg-gray-800 transition-colors"
                      >
                        ▶ Google Play
                      </a>
                    </div>
                  </div>
                </>
              )}

              {mode === 'forgot' && !resetSent && (
                <>
                  <button onClick={() => setMode('login')} className="flex items-center gap-1 text-sm text-gray-400 mb-4 hover:text-gray-600">
                    ← Back
                  </button>
                  <h1 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Fraunces, serif' }}>
                    Reset your password
                  </h1>
                  <p className="text-sm text-gray-400 mb-6">Enter your email and we&apos;ll send a reset link.</p>
                  <form onSubmit={handleForgot} className="flex flex-col gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:border-orange-400 focus:bg-white transition-colors"
                    />
                    {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">{error}</div>}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-60"
                    >
                      {loading ? 'Sending…' : 'Send Reset Link'}
                    </button>
                  </form>
                </>
              )}

              {mode === 'forgot' && resetSent && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-3">📬</div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2" style={{ fontFamily: 'Fraunces, serif' }}>Check your email</h2>
                  <p className="text-sm text-gray-400 mb-5">
                    We sent a password reset link to <strong>{email}</strong>.
                  </p>
                  <button onClick={() => { setMode('login'); setResetSent(false) }} className="text-sm text-orange-500 hover:underline">
                    Back to sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
