'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Utensils, Mail, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ConfirmEmailPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkingEmail, setCheckingEmail] = useState(false)

  useEffect(() => {
    // Get email from localStorage (set during signup)
    const storedEmail = localStorage.getItem('signup_email')
    if (storedEmail) {
      setEmail(storedEmail)
    }
    setLoading(false)

    // Start checking for email confirmation
    const interval = setInterval(async () => {
      if (storedEmail) {
        setCheckingEmail(true)
        try {
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user && user.email_confirmed_at) {
            // Email is confirmed!
            setConfirmed(true)
            localStorage.removeItem('signup_email')
            localStorage.removeItem('signup_password')
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } catch (error) {
          console.error('Error checking email confirmation:', error)
        }
        setCheckingEmail(false)
      }
    }, 2000) // Check every 2 seconds

    return () => clearInterval(interval)
  }, [router])

  const handleResendEmail = async () => {
    if (!email) return

    try {
      // Use signUp again with the same credentials to resend the confirmation email
      // This is the standard way with Supabase
      const password = localStorage.getItem('signup_password')
      
      if (!password) {
        alert('Please go back and sign up again to resend the confirmation email.')
        return
      }

      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (error && error.message.includes('already registered')) {
        // Expected error - account already exists, confirmation email will be resent
        alert('Confirmation email sent! Check your inbox.')
      } else if (error) {
        alert(`Failed to resend email: ${error.message}`)
      } else {
        alert('Confirmation email sent! Check your inbox.')
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleBackToLogin = () => {
    localStorage.removeItem('signup_email')
    localStorage.removeItem('signup_password')
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Image
            src="/logo.png"
            alt="TableMesh Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <h1 className="text-3xl font-bold text-[var(--neutral)]">TableMesh</h1>
        </Link>

        {/* Confirmation Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {confirmed ? (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-bold text-[var(--neutral)] mb-2">
                  Email Confirmed!
                </h2>
                <p className="text-gray-600 mb-8">
                  Your account has been verified. Redirecting you to the dashboard...
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Waiting State */}
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-[var(--primary)]" strokeWidth={2} />
                    </div>
                    <div className="absolute top-0 right-0 animate-bounce">
                      <Clock className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-[var(--neutral)] mb-2">
                  Confirm Your Email
                </h2>
                <p className="text-gray-600 mb-6">
                  We've sent a confirmation link to:
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-8 break-all">
                  <p className="text-[var(--primary)] font-semibold">{email}</p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Click the link in your email to verify your account. We're waiting...
                  </p>
                  
                  {checkingEmail && (
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary)]"></div>
                      <span className="text-sm">Checking for confirmation...</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={handleResendEmail}
                    className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg"
                  >
                    Resend Confirmation Email
                  </button>
                  
                  <button
                    onClick={handleBackToLogin}
                    className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Back to Login
                  </button>
                </div>

                <p className="text-gray-500 text-xs mt-6">
                  Didn't receive the email? Check your spam folder or click "Resend" above.
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
