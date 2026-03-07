'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '../../lib/supabase-browser'

type PageStatus = 'loading' | 'confirmed' | 'recovery' | 'password-updated' | 'error'

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<PageStatus>('loading')
  const [countdown, setCountdown] = useState(5)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const processAuth = async () => {
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace('#', ''))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      if (type === 'recovery' && accessToken) {
        // Password recovery flow - set session from tokens then show password form
        try {
          const supabase = createSupabaseBrowserClient()
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          })
          if (error) {
            console.error('Failed to set recovery session:', error)
            setErrorMessage('The password reset link has expired or is invalid. Please request a new one from the app.')
            setStatus('error')
          } else {
            setStatus('recovery')
          }
        } catch (err) {
          console.error('Recovery session error:', err)
          setErrorMessage('Something went wrong processing your reset link. Please try again.')
          setStatus('error')
        }
      } else if (accessToken || type === 'signup' || type === 'magiclink') {
        // Email confirmation or magic link
        setStatus('confirmed')
      } else {
        // Fallback - if user landed here from email link, Supabase redirect itself confirms the email
        setStatus('confirmed')
      }
    }

    processAuth()
  }, [])

  // Countdown + auto-redirect for email confirmation
  useEffect(() => {
    if (status !== 'confirmed' && status !== 'password-updated') return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = 'tablemesh://auth'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status])

  const handleOpenApp = () => {
    window.location.href = 'tablemesh://auth'
  }

  const handlePasswordUpdate = useCallback(async () => {
    setPasswordError('')

    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in both password fields.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setUpdating(true)

    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        console.error('Password update error:', error)
        setPasswordError(error.message || 'Failed to update password. Please try again.')
      } else {
        setStatus('password-updated')
        setCountdown(5)
      }
    } catch (err: any) {
      console.error('Password update exception:', err)
      setPasswordError('An unexpected error occurred. Please try again.')
    }

    setUpdating(false)
  }, [newPassword, confirmPassword])

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#faf7f2',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  }

  const navStyle: React.CSSProperties = {
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #f3f4f6',
    backgroundColor: '#ffffff',
  }

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  }

  const cardStyle: React.CSSProperties = {
    maxWidth: '440px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '40px 32px',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  }

  const iconCircleStyle = (bgColor: string): React.CSSProperties => ({
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: bgColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '36px',
  })

  const headingStyle: React.CSSProperties = {
    margin: '0 0 8px',
    fontSize: '26px',
    fontWeight: 700,
    color: '#1f2937',
    letterSpacing: '-0.5px',
  }

  const subtextStyle: React.CSSProperties = {
    margin: '0 0 28px',
    fontSize: '15px',
    lineHeight: 1.6,
    color: '#6b7280',
  }

  const buttonStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '14px 36px',
    backgroundColor: '#f97316',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    letterSpacing: '0.3px',
    width: '100%',
    maxWidth: '280px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    fontSize: '15px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    backgroundColor: '#fafafa',
    color: '#1f2937',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
    textAlign: 'left',
  }

  return (
    <div style={containerStyle}>
      {/* Nav */}
      <nav style={navStyle}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="TableMesh" width={36} height={36} style={{ borderRadius: '8px' }} />
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#f97316', letterSpacing: '-0.5px' }}>TableMesh</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main style={mainStyle}>
        {/* Loading */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #fed7aa',
              borderTopColor: '#f97316',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }} />
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Processing your request...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Email Confirmed */}
        {status === 'confirmed' && (
          <div style={cardStyle}>
            <div style={iconCircleStyle('#f0fdf4')}>&#10003;</div>
            <h1 style={headingStyle}>Email Confirmed!</h1>
            <p style={subtextStyle}>
              Your email has been verified successfully. You can now sign in to TableMesh and start discovering shared dining experiences.
            </p>
            <button onClick={handleOpenApp} style={buttonStyle}>
              Open TableMesh App
            </button>
            {countdown > 0 && (
              <p style={{ margin: '16px 0 0', fontSize: '13px', color: '#9ca3af' }}>
                Redirecting to app in {countdown} seconds...
              </p>
            )}
            <p style={{ margin: '20px 0 0', fontSize: '13px', color: '#9ca3af' }}>
              Don&apos;t have the app yet?{' '}
              <Link href="/" style={{ color: '#f97316', textDecoration: 'underline' }}>
                Download it here
              </Link>
            </p>
          </div>
        )}

        {/* Password Recovery Form */}
        {status === 'recovery' && (
          <div style={cardStyle}>
            <div style={iconCircleStyle('#fff7ed')}>
              <span style={{ fontSize: '32px' }}>&#128274;</span>
            </div>
            <h1 style={headingStyle}>Set New Password</h1>
            <p style={{ ...subtextStyle, marginBottom: '24px' }}>
              Enter your new password below. Make sure it&apos;s at least 8 characters long.
            </p>

            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <label style={labelStyle}>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
                disabled={updating}
                onFocus={(e) => { e.target.style.borderColor = '#f97316' }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb' }}
              />
            </div>

            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                disabled={updating}
                onFocus={(e) => { e.target.style.borderColor = '#f97316' }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb' }}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordUpdate() }}
              />
            </div>

            {passwordError && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                marginBottom: '16px',
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#dc2626' }}>{passwordError}</p>
              </div>
            )}

            <button
              onClick={handlePasswordUpdate}
              disabled={updating}
              style={{
                ...buttonStyle,
                maxWidth: '100%',
                opacity: updating ? 0.7 : 1,
                cursor: updating ? 'not-allowed' : 'pointer',
              }}
            >
              {updating ? 'Updating...' : 'Update Password'}
            </button>

            <p style={{ margin: '20px 0 0', fontSize: '13px', color: '#9ca3af' }}>
              Remember your password?{' '}
              <button
                onClick={handleOpenApp}
                style={{ background: 'none', border: 'none', color: '#f97316', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', padding: 0 }}
              >
                Go back to app
              </button>
            </p>
          </div>
        )}

        {/* Password Updated Successfully */}
        {status === 'password-updated' && (
          <div style={cardStyle}>
            <div style={iconCircleStyle('#f0fdf4')}>&#10003;</div>
            <h1 style={headingStyle}>Password Updated!</h1>
            <p style={subtextStyle}>
              Your password has been changed successfully. You can now sign in with your new password.
            </p>
            <button onClick={handleOpenApp} style={buttonStyle}>
              Open TableMesh App
            </button>
            {countdown > 0 && (
              <p style={{ margin: '16px 0 0', fontSize: '13px', color: '#9ca3af' }}>
                Redirecting to app in {countdown} seconds...
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={cardStyle}>
            <div style={iconCircleStyle('#fef2f2')}>&#10005;</div>
            <h1 style={headingStyle}>Something Went Wrong</h1>
            <p style={subtextStyle}>
              {errorMessage || (
                <>
                  We couldn&apos;t process your request. The link may have expired. Please try again or contact us at{' '}
                  <a href="mailto:contact@tablemesh.com" style={{ color: '#f97316' }}>contact@tablemesh.com</a>.
                </>
              )}
            </p>
            <button onClick={handleOpenApp} style={{ ...buttonStyle, marginBottom: '12px' }}>
              Open TableMesh App
            </button>
            <br />
            <Link
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '8px',
                fontSize: '14px',
                color: '#f97316',
                textDecoration: 'underline',
              }}
            >
              Go to Homepage
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '20px',
        textAlign: 'center',
        borderTop: '1px solid #f3f4f6',
        backgroundColor: '#ffffff',
      }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
          &copy; 2025 Sheep Labs LLC. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
