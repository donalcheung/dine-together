'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function RequestRedirect() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.requestId as string

  useEffect(() => {
    if (requestId) {
      router.replace(`/dine/${requestId}`)
    }
  }, [requestId, router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#faf7f2',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <p style={{ color: '#6b7280' }}>Redirecting...</p>
    </div>
  )
}
