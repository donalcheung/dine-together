'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Utensils, Mail, Lock, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSignUp = searchParams.get('signup') === 'true'
  
  const [mode, setMode] = useState<'signin' | 'signup'>(isSignUp ? 'signup' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ensureProfileExists = async (userId: string, userEmail: string, userName: string, retries = 3): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
      try {
        // Wait longer on each retry
        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)))
        
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single()
        
        if (existingProfile) {
          console.log('Profile already exists')
          return true
        }
        
        // Try to create profile
        const { data, error } = await supabase
          .from('profiles')
          .upsert([
            {
              id: userId,
              email: userEmail,
              name: userName,
              total_likes: 0,
            }
          ], {
            onConflict: 'id'
          })
          .select()
        
        if (!error) {
          console.log('Profile created successfully')
          return true
        }
        
        console.error(`Profile creation attempt ${i + 1} failed:`, error)
        
        // If it's the last retry, continue anyway
        if (i === retries - 1) {
          console.warn('Profile creation failed after all retries, but allowing user to continue')
          return false
        }
      } catch (err) {
        console.error(`Profile creation error on attempt ${i + 1}:`, err)
        if (i === retries - 1) {
          return false
        }
      }
    }
    
    return false
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        // Sign up the user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            }
          }
        })
        
        if (signUpError) throw signUpError
        
        if (authData.user) {
          console.log('User signed up:', authData.user.id)
          
          // Ensure profile is created with retries
          await ensureProfileExists(authData.user.id, email, name)
          
          // Always redirect to dashboard
          router.push('/dashboard')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        
        // On sign in, check if profile exists and create if missing
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single()
          
          if (!profile) {
            console.log('Profile missing on sign in, creating...')
            await ensureProfileExists(data.user.id, data.user.email!, data.user.user_metadata?.name || 'User')
          }
        }
        
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Utensils className="w-10 h-10 text-[var(--primary)]" strokeWidth={2.5} />
          <h1 className="text-3xl font-bold text-[var(--neutral)]">DineTogether</h1>
        </Link>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <h2 className="text-3xl font-bold text-[var(--neutral)] mb-2 text-center">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600 text-center mb-8">
            {mode === 'signup' 
              ? 'Start sharing meals with fellow food lovers' 
              : 'Sign in to continue your dining adventures'
            }
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
              className="text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium transition-colors"
            >
              {mode === 'signup' 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}
