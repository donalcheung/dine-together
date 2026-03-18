'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseBrowserClient } from '../../lib/supabase-browser'

interface DiningRequest {
  id: string
  restaurant_name: string
  restaurant_address: string
  dining_time: string
  seats_available: number
  total_seats: number
  description: string | null
  status: string
  cuisine_type: string | null
  price_level: string | null
  bill_split: string | null
  payment_app: string | null
  visibility: string
  timezone: string | null
  host: {
    name: string
    avatar_url: string | null
    bio: string | null
  }
  joinCount: number
  guestCount: number
}

type PageStatus = 'loading' | 'found' | 'not-found' | 'expired'

export default function DiningSharePage() {
  const params = useParams()
  const requestId = params.id as string

  const [status, setStatus] = useState<PageStatus>('loading')
  const [request, setRequest] = useState<DiningRequest | null>(null)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')

  // Guest RSVP form
  const [showRsvp, setShowRsvp] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestContact, setGuestContact] = useState('')
  const [guestMessage, setGuestMessage] = useState('')
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone')
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [rsvpSuccess, setRsvpSuccess] = useState(false)
  const [rsvpError, setRsvpError] = useState('')

  const playStoreLink = 'https://play.google.com/store/apps/details?id=com.tablemeshnative'
  const appStoreLink = 'https://apps.apple.com/us/app/tablemesh/id6760209899'

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) setPlatform('ios')
    else if (/android/.test(ua)) setPlatform('android')
    else setPlatform('desktop')
  }, [])

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) {
        setStatus('not-found')
        return
      }

      const supabase = createSupabaseBrowserClient()

      // Fetch dining request with host info
      const { data: dr, error } = await supabase
        .from('dining_requests')
        .select(`
          id, restaurant_name, restaurant_address, dining_time,
          seats_available, total_seats, description, status,
          cuisine_type, price_level, bill_split, payment_app,
          visibility, timezone,
          host:profiles!dining_requests_host_id_fkey(name, avatar_url, bio)
        `)
        .eq('id', requestId)
        .single()

      if (error || !dr) {
        setStatus('not-found')
        return
      }

      // Get join count
      const { count: joinCount } = await supabase
        .from('dining_joins')
        .select('id', { count: 'exact', head: true })
        .eq('request_id', requestId)
        .in('status', ['pending', 'accepted'])

      // Get guest RSVP count
      const { count: guestCount } = await supabase
        .from('guest_rsvps')
        .select('id', { count: 'exact', head: true })
        .eq('request_id', requestId)

      const hostData = Array.isArray(dr.host) ? dr.host[0] : dr.host

      const diningRequest: DiningRequest = {
        ...dr,
        host: hostData || { name: 'TableMesh User', avatar_url: null, bio: null },
        joinCount: joinCount || 0,
        guestCount: guestCount || 0,
      }

      // Check if event is in the past
      const eventTime = new Date(dr.dining_time)
      if (eventTime < new Date() && dr.status !== 'open') {
        setStatus('expired')
        setRequest(diningRequest)
        return
      }

      setRequest(diningRequest)
      setStatus('found')
    }

    fetchRequest()
  }, [requestId])

  const formatDateTime = (isoString: string, tz?: string | null) => {
    const date = new Date(isoString)
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }
    if (tz) options.timeZone = tz
    return date.toLocaleDateString('en-US', options)
  }

  const getTimeUntil = (isoString: string) => {
    const now = new Date()
    const event = new Date(isoString)
    const diff = event.getTime() - now.getTime()
    if (diff < 0) return 'Already started'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`
    return 'Starting soon'
  }

  const handleRsvp = async () => {
    setRsvpError('')
    if (!guestName.trim()) {
      setRsvpError('Please enter your name')
      return
    }
    if (!guestContact.trim()) {
      setRsvpError(`Please enter your ${contactType === 'phone' ? 'phone number' : 'email'}`)
      return
    }

    setRsvpLoading(true)
    try {
      const res = await fetch('/api/guest-rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          guest_name: guestName,
          guest_phone: contactType === 'phone' ? guestContact : undefined,
          guest_email: contactType === 'email' ? guestContact : undefined,
          message: guestMessage || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setRsvpError(data.error || 'Failed to RSVP')
      } else {
        setRsvpSuccess(true)
      }
    } catch {
      setRsvpError('Network error. Please try again.')
    }
    setRsvpLoading(false)
  }

  const handleOpenApp = () => {
    // Try deep link first, then fall back to store
    window.location.href = `tablemesh://request/${requestId}`
    setTimeout(() => {
      if (platform === 'android') window.location.href = playStoreLink
      else if (platform === 'ios') window.location.href = appStoreLink
    }, 1500)
  }

  const seatsText = request
    ? `${request.total_seats - request.seats_available + request.guestCount}/${request.total_seats} joined`
    : ''
  const isFull = request ? request.seats_available <= 0 : false

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#faf7f2',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      {/* Nav */}
      <nav style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f3f4f6',
        backgroundColor: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="TableMesh" width={32} height={32} style={{ borderRadius: '8px' }} />
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#f97316' }}>TableMesh</span>
        </Link>
        <button
          onClick={handleOpenApp}
          style={{
            backgroundColor: '#f97316',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Open App
        </button>
      </nav>

      {/* Mobile App Banner */}
      {platform !== 'desktop' && (
        <div style={{
          background: 'linear-gradient(135deg, #ea580c, #f97316)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div>
            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: 0 }}>
              Get the full TableMesh experience
            </p>
            <p style={{ color: '#fed7aa', fontSize: '12px', margin: '2px 0 0' }}>
              Message hosts, join tables, and discover dining events
            </p>
          </div>
          <a
            href={platform === 'ios' ? appStoreLink : playStoreLink}
            style={{
              backgroundColor: '#fff',
              color: '#ea580c',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Get App
          </a>
        </div>
      )}

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        {/* Loading */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{
              width: '40px', height: '40px',
              border: '3px solid #fed7aa', borderTopColor: '#f97316',
              borderRadius: '50%', animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }} />
            <p style={{ color: '#6b7280' }}>Loading dining details...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Not Found */}
        {status === 'not-found' && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍽️</div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
              Dining Request Not Found
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              This dining request may have been removed or the link is invalid.
            </p>
            <button onClick={handleOpenApp} style={{
              backgroundColor: '#f97316', color: '#fff', border: 'none',
              borderRadius: '12px', padding: '14px 32px', fontSize: '16px',
              fontWeight: 600, cursor: 'pointer',
            }}>
              Explore TableMesh
            </button>
          </div>
        )}

        {/* Found - Main Content */}
        {(status === 'found' || status === 'expired') && request && (
          <>
            {/* Hero Card */}
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              marginBottom: '16px',
            }}>
              {/* Restaurant Header */}
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed, #fef3c7)',
                padding: '24px 20px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                  {request.cuisine_type && (
                    <span style={{
                      backgroundColor: '#f97316', color: '#fff',
                      fontSize: '11px', fontWeight: 700,
                      padding: '3px 8px', borderRadius: '6px',
                    }}>
                      {request.cuisine_type}
                    </span>
                  )}
                  {request.price_level && (
                    <span style={{
                      backgroundColor: '#15803d', color: '#fff',
                      fontSize: '11px', fontWeight: 700,
                      padding: '3px 8px', borderRadius: '6px',
                    }}>
                      {request.price_level}
                    </span>
                  )}
                  {status === 'expired' && (
                    <span style={{
                      backgroundColor: '#dc2626', color: '#fff',
                      fontSize: '11px', fontWeight: 700,
                      padding: '3px 8px', borderRadius: '6px',
                    }}>
                      Past Event
                    </span>
                  )}
                </div>
                <h1 style={{
                  fontSize: '24px', fontWeight: 800, color: '#1f2937',
                  margin: '8px 0 4px', lineHeight: 1.2,
                }}>
                  {request.restaurant_name}
                </h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  {request.restaurant_address}
                </p>
              </div>

              {/* Details Grid */}
              <div style={{ padding: '20px' }}>
                {/* Date/Time */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  marginBottom: '16px', padding: '14px',
                  backgroundColor: '#faf7f2', borderRadius: '12px',
                }}>
                  <span style={{ fontSize: '28px' }}>📅</span>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                      {formatDateTime(request.dining_time, request.timezone)}
                    </p>
                    <p style={{ fontSize: '13px', color: '#f97316', fontWeight: 600, margin: '2px 0 0' }}>
                      {getTimeUntil(request.dining_time)}
                    </p>
                  </div>
                </div>

                {/* Seats */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  marginBottom: '16px', padding: '14px',
                  backgroundColor: isFull ? '#fef2f2' : '#f0fdf4', borderRadius: '12px',
                }}>
                  <span style={{ fontSize: '28px' }}>👥</span>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                      {seatsText}
                    </p>
                    <p style={{
                      fontSize: '13px', margin: '2px 0 0',
                      color: isFull ? '#dc2626' : '#15803d', fontWeight: 600,
                    }}>
                      {isFull ? 'Table is full' : `${request.seats_available} seat${request.seats_available !== 1 ? 's' : ''} left`}
                    </p>
                  </div>
                </div>

                {/* Bill Split */}
                {request.bill_split && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    marginBottom: '16px', padding: '14px',
                    backgroundColor: '#faf7f2', borderRadius: '12px',
                  }}>
                    <span style={{ fontSize: '28px' }}>💳</span>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                        {request.bill_split}
                      </p>
                      {request.payment_app && (
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0' }}>
                          via {request.payment_app}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {request.description && (
                  <div style={{
                    padding: '14px', backgroundColor: '#faf7f2',
                    borderRadius: '12px', marginBottom: '16px',
                  }}>
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>
                      &ldquo;{request.description}&rdquo;
                    </p>
                  </div>
                )}

                {/* Host Info */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px', backgroundColor: '#faf7f2', borderRadius: '12px',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    backgroundColor: '#fed7aa', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0,
                  }}>
                    {request.host.avatar_url ? (
                      <img
                        src={request.host.avatar_url}
                        alt={request.host.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '20px' }}>👤</span>
                    )}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                      Hosted by {request.host.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>
                      TableMesh member
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {status === 'found' && !isFull && (
              <div style={{
                backgroundColor: '#fff', borderRadius: '16px',
                padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                marginBottom: '16px',
              }}>
                {!showRsvp && !rsvpSuccess ? (
                  <>
                    {/* Primary: Open in App */}
                    <button
                      onClick={handleOpenApp}
                      style={{
                        width: '100%', padding: '14px',
                        backgroundColor: '#f97316', color: '#fff',
                        border: 'none', borderRadius: '12px',
                        fontSize: '16px', fontWeight: 700,
                        cursor: 'pointer', marginBottom: '10px',
                      }}
                    >
                      Join on TableMesh App
                    </button>
                    <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '0 0 16px' }}>
                      Message the host, see who else is going, and more
                    </p>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      margin: '0 0 16px',
                    }}>
                      <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>or</span>
                      <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
                    </div>

                    {/* Secondary: Guest RSVP */}
                    <button
                      onClick={() => setShowRsvp(true)}
                      style={{
                        width: '100%', padding: '14px',
                        backgroundColor: '#fff', color: '#f97316',
                        border: '2px solid #f97316', borderRadius: '12px',
                        fontSize: '15px', fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      RSVP as Guest
                    </button>
                    <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '8px 0 0' }}>
                      No app needed &mdash; the host will get your info
                    </p>
                  </>
                ) : rsvpSuccess ? (
                  /* RSVP Success */
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      backgroundColor: '#f0fdf4', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px', fontSize: '28px',
                    }}>
                      &#10003;
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: '0 0 6px' }}>
                      You&apos;re on the list!
                    </h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px', lineHeight: 1.5 }}>
                      {request.host.name} will reach out to confirm. In the meantime, why not join TableMesh for the full experience?
                    </p>
                    <button
                      onClick={handleOpenApp}
                      style={{
                        width: '100%', padding: '14px',
                        backgroundColor: '#f97316', color: '#fff',
                        border: 'none', borderRadius: '12px',
                        fontSize: '16px', fontWeight: 700,
                        cursor: 'pointer', marginBottom: '8px',
                      }}
                    >
                      Download TableMesh
                    </button>
                    <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '4px 0 0' }}>
                      Chat with the host, discover more dining events, and build your foodie profile
                    </p>
                  </div>
                ) : (
                  /* RSVP Form */
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                        RSVP as Guest
                      </h3>
                      <button
                        onClick={() => { setShowRsvp(false); setRsvpError('') }}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}
                      >
                        Cancel
                      </button>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Your Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 14px', fontSize: '15px',
                          border: '1.5px solid #e5e7eb', borderRadius: '10px',
                          backgroundColor: '#fafafa', boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Contact type toggle */}
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Contact Info *
                      </label>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <button
                          onClick={() => setContactType('phone')}
                          style={{
                            flex: 1, padding: '8px', fontSize: '13px', fontWeight: 600,
                            border: `1.5px solid ${contactType === 'phone' ? '#f97316' : '#e5e7eb'}`,
                            backgroundColor: contactType === 'phone' ? '#fff7ed' : '#fff',
                            color: contactType === 'phone' ? '#f97316' : '#6b7280',
                            borderRadius: '8px', cursor: 'pointer',
                          }}
                        >
                          Phone
                        </button>
                        <button
                          onClick={() => setContactType('email')}
                          style={{
                            flex: 1, padding: '8px', fontSize: '13px', fontWeight: 600,
                            border: `1.5px solid ${contactType === 'email' ? '#f97316' : '#e5e7eb'}`,
                            backgroundColor: contactType === 'email' ? '#fff7ed' : '#fff',
                            color: contactType === 'email' ? '#f97316' : '#6b7280',
                            borderRadius: '8px', cursor: 'pointer',
                          }}
                        >
                          Email
                        </button>
                      </div>
                      <input
                        type={contactType === 'phone' ? 'tel' : 'email'}
                        placeholder={contactType === 'phone' ? 'Your phone number' : 'Your email address'}
                        value={guestContact}
                        onChange={(e) => setGuestContact(e.target.value)}
                        style={{
                          width: '100%', padding: '12px 14px', fontSize: '15px',
                          border: '1.5px solid #e5e7eb', borderRadius: '10px',
                          backgroundColor: '#fafafa', boxSizing: 'border-box',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                        Message to host (optional)
                      </label>
                      <textarea
                        placeholder="Say hi or share any dietary preferences..."
                        value={guestMessage}
                        onChange={(e) => setGuestMessage(e.target.value)}
                        rows={2}
                        style={{
                          width: '100%', padding: '12px 14px', fontSize: '15px',
                          border: '1.5px solid #e5e7eb', borderRadius: '10px',
                          backgroundColor: '#fafafa', boxSizing: 'border-box',
                          outline: 'none', resize: 'vertical',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>

                    {rsvpError && (
                      <div style={{
                        padding: '10px 14px', backgroundColor: '#fef2f2',
                        borderRadius: '8px', marginBottom: '12px',
                      }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#dc2626' }}>{rsvpError}</p>
                      </div>
                    )}

                    <button
                      onClick={handleRsvp}
                      disabled={rsvpLoading}
                      style={{
                        width: '100%', padding: '14px',
                        backgroundColor: '#f97316', color: '#fff',
                        border: 'none', borderRadius: '12px',
                        fontSize: '16px', fontWeight: 700,
                        cursor: rsvpLoading ? 'not-allowed' : 'pointer',
                        opacity: rsvpLoading ? 0.7 : 1,
                      }}
                    >
                      {rsvpLoading ? 'Sending...' : 'Send RSVP'}
                    </button>

                    <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', margin: '8px 0 0', lineHeight: 1.4 }}>
                      Your contact info will only be shared with the host of this dining request.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Full table message */}
            {status === 'found' && isFull && (
              <div style={{
                backgroundColor: '#fff', borderRadius: '16px',
                padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                marginBottom: '16px', textAlign: 'center',
              }}>
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: '0 0 8px' }}>
                  This table is full!
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px' }}>
                  Download TableMesh to discover more dining experiences near you.
                </p>
                <button
                  onClick={handleOpenApp}
                  style={{
                    width: '100%', padding: '14px',
                    backgroundColor: '#f97316', color: '#fff',
                    border: 'none', borderRadius: '12px',
                    fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Get TableMesh
                </button>
              </div>
            )}

            {/* Why TableMesh - Conversion */}
            <div style={{
              backgroundColor: '#fff', borderRadius: '16px',
              padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              marginBottom: '16px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', margin: '0 0 16px' }}>
                Why join TableMesh?
              </h3>
              {[
                { icon: '💬', title: 'Message hosts directly', desc: 'Chat before you meet and coordinate details' },
                { icon: '👥', title: 'See who\'s going', desc: 'View profiles and find people with shared interests' },
                { icon: '🍜', title: 'Discover dining events', desc: 'Browse hundreds of dining requests near you' },
                { icon: '⭐', title: 'Build your foodie reputation', desc: 'Earn XP, unlock achievements, and level up' },
                { icon: '🎁', title: 'Exclusive restaurant deals', desc: 'Access special offers from partner restaurants' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  marginBottom: i < 4 ? '14px' : '0',
                }}>
                  <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <a
                  href={playStoreLink}
                  style={{
                    flex: 1, display: 'block', textAlign: 'center',
                    backgroundColor: '#111827', color: '#fff',
                    padding: '12px', borderRadius: '10px',
                    fontSize: '13px', fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  Google Play
                </a>
                <a
                  href={appStoreLink}
                  style={{
                    flex: 1, display: 'block', textAlign: 'center',
                    backgroundColor: '#111827', color: '#fff',
                    padding: '12px', borderRadius: '10px',
                    fontSize: '13px', fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  App Store
                </a>
              </div>
            </div>

            {/* Google Maps Link */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.restaurant_name + ' ' + request.restaurant_address)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', backgroundColor: '#fff', borderRadius: '16px',
                padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                marginBottom: '16px', textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                📍 View {request.restaurant_name} on Google Maps
              </span>
            </a>
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px 20px', textAlign: 'center',
        borderTop: '1px solid #f3f4f6', backgroundColor: '#fff',
      }}>
        <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#6b7280' }}>
          <Link href="/" style={{ color: '#f97316', textDecoration: 'none' }}>TableMesh</Link>
          {' '}&mdash; Coordinate meals with friends, coworkers &amp; food lovers
        </p>
        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>
          &copy; 2025 Sheep Labs LLC. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
