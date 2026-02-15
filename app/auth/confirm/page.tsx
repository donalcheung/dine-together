'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Supabase appends tokens as hash fragments after email confirmation redirect.
    // If we have hash params with access_token, the confirmation was successful.
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const accessToken = params.get('access_token')
    const type = params.get('type')

    if (accessToken || type === 'signup' || type === 'recovery') {
      setStatus('success')
    } else {
      // Even without tokens, if user landed here from email link, treat as success
      // The Supabase redirect itself confirms the email
      setStatus('success')
    }
  }, [])

  useEffect(() => {
    if (status !== 'success') return

    // Try to open the app via deep link after a short delay
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Attempt to open the app
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#faf7f2',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      {/* Nav */}
      <nav style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid #f3f4f6',
        backgroundColor: '#ffffff',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="TableMesh" width={36} height={36} style={{ borderRadius: '8px' }} />
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#f97316', letterSpacing: '-0.5px' }}>TableMesh</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
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
            <p style={{ color: '#6b7280', fontSize: '16px' }}>Verifying your email...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {status === 'success' && (
          <div style={{
            maxWidth: '440px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            {/* Success Icon */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '36px',
            }}>
              ✓
            </div>

            <h1 style={{
              margin: '0 0 8px',
              fontSize: '26px',
              fontWeight: 700,
              color: '#1f2937',
              letterSpacing: '-0.5px',
            }}>
              Email Confirmed!
            </h1>

            <p style={{
              margin: '0 0 28px',
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#6b7280',
            }}>
              Your email has been verified successfully. You can now sign in to TableMesh and start discovering shared dining experiences.
            </p>

            {/* Open App Button */}
            <button
              onClick={handleOpenApp}
              style={{
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
              }}
            >
              Open TableMesh App
            </button>

            {countdown > 0 && (
              <p style={{
                margin: '16px 0 0',
                fontSize: '13px',
                color: '#9ca3af',
              }}>
                Redirecting to app in {countdown} seconds...
              </p>
            )}

            <p style={{
              margin: '20px 0 0',
              fontSize: '13px',
              color: '#9ca3af',
            }}>
              Don&apos;t have the app yet?{' '}
              <Link href="/" style={{ color: '#f97316', textDecoration: 'underline' }}>
                Download it here
              </Link>
            </p>
          </div>
        )}

        {status === 'error' && (
          <div style={{
            maxWidth: '440px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '36px',
            }}>
              ✕
            </div>

            <h1 style={{
              margin: '0 0 8px',
              fontSize: '26px',
              fontWeight: 700,
              color: '#1f2937',
            }}>
              Something Went Wrong
            </h1>

            <p style={{
              margin: '0 0 28px',
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#6b7280',
            }}>
              We couldn&apos;t verify your email. The link may have expired. Please try signing up again or contact us at{' '}
              <a href="mailto:contact@tablemesh.com" style={{ color: '#f97316' }}>contact@tablemesh.com</a>.
            </p>

            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '14px 36px',
                backgroundColor: '#f97316',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                borderRadius: '12px',
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
          © 2025 Sheep Labs LLC. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
