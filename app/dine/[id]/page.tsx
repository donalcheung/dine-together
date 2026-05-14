'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '../../lib/supabase-browser'
import Navbar from '../../components/Navbar'

interface DiningRequest {
  id: string
  title: string | null
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
  gender_restriction: string | null
  age_min: number | null
  age_max: number | null
  recurring: string | null
  guest_count_flexible: boolean | null
  host_deal_headline: string | null
  host_deal_description: string | null
  visibility: string
  timezone: string | null
  google_place_id: string | null
  host: {
    name: string
    avatar_url: string | null
    bio: string | null
  }
  joinCount: number
  guestCount: number
}

interface PlaceDetails {
  photoUrl: string | null
  photoUrls: string[]
  rating: number | null
  userRatingsTotal: number | null
  website: string | null
  phone: string | null
  reviews: Array<{
    author_name: string
    rating: number
    text: string
    relative_time_description: string
    profile_photo_url: string | null
  }>
}

type PageStatus = 'loading' | 'found' | 'not-found' | 'expired'

/** Matches in-app payment chips + free-text edits from request detail. */
function formatPaymentAppLabel(raw: string | null | undefined): string {
  if (!raw?.trim()) return ''
  const key = raw.trim().toLowerCase()
  if (key === 'venmo') return 'Venmo'
  if (key === 'cashapp' || key === 'cash app') return 'Cash App'
  if (key === 'other') return 'the payment method the host prefers'
  return raw.trim()
}

/**
 * Guest-facing copy for how the bill works (aligned with CreateRequest / RequestDetail).
 * Split calculator tax/tip are session-only in the app — we describe typical expectations here.
 */
function getBillAndPaymentGuestCopy(
  billSplit: string | null | undefined,
  paymentApp: string | null | undefined,
): { headline: string; body: string[] } {
  const mode = (billSplit || '').trim().toLowerCase()
  const app = formatPaymentAppLabel(paymentApp)

  if (mode === 'host_treats') {
    return {
      headline: 'Host is treating',
      body: [
        'The organizer plans to cover the meal for the table. Unless the host tells you otherwise, you should not owe a food split (drinks or extras may still be on your own tab).',
      ],
    }
  }

  if (mode === 'digital' || mode === 'split_evenly') {
    const settle = app
      ? `After the meal, expect to send your share of the bill via ${app}.`
      : 'After the meal, the host will coordinate how everyone sends their share.'
    return {
      headline: 'Split evenly',
      body: [
        'The group usually splits subtotal, tax, and tip evenly across everyone at the table unless the host says otherwise.',
        settle,
        'TableMesh does not charge guests or organizers a fee to join this meal.',
      ],
    }
  }

  return {
    headline: 'Separate checks',
    body: [
      'Everyone typically orders and pays for their own food at the restaurant.',
    ],
  }
}

function formatPriceLevel(level: string | null | undefined): string | null {
  if (!level || level === 'any') return null
  const n = Number.parseInt(level.replace(/\$/g, ''), 10)
  if (Number.isFinite(n) && n >= 1 && n <= 4) return '$'.repeat(n)
  return level
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: '14px' }}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  )
}

export default function DiningSharePage() {
  const params = useParams()
  const requestId = params.id as string

  const [status, setStatus] = useState<PageStatus>('loading')
  const [request, setRequest] = useState<DiningRequest | null>(null)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null)
  const [placeDetailsLoading, setPlaceDetailsLoading] = useState(false)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  // Guest RSVP form
  const [showRsvp, setShowRsvp] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [guestContact, setGuestContact] = useState('')
  const [guestMessage, setGuestMessage] = useState('')
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone')
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [rsvpSuccess, setRsvpSuccess] = useState(false)
  const [rsvpError, setRsvpError] = useState('')

  // Referral tracking
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref')?.toUpperCase() || ''

  useEffect(() => {
    if (refCode) {
      // Store referral code so it persists across app install
      try { localStorage.setItem('tablemesh_referral_code', refCode) } catch {}
      // Auto-copy to clipboard for deferred deep link (app reads on first launch)
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`TABLEMESH_REF:${refCode}`).catch(() => {})
      }
    }
  }, [refCode])

  const storedRef = typeof window !== 'undefined'
    ? (refCode || (() => { try { return localStorage.getItem('tablemesh_referral_code') || '' } catch { return '' } })())
    : refCode

  const playStoreLink = storedRef
    ? `https://play.google.com/store/apps/details?id=com.tablemeshnative&referrer=utm_source%3Dreferral%26utm_content%3D${storedRef}`
    : 'https://play.google.com/store/apps/details?id=com.tablemeshnative'
  const appStoreLink = 'https://apps.apple.com/us/app/tablemesh/id6760209899'

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) setPlatform('ios')
    else if (/android/.test(ua)) setPlatform('android')
    else setPlatform('desktop')
  }, [])

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) { setStatus('not-found'); return }

      setPlaceDetails(null)
      setPlaceDetailsLoading(false)
      setActivePhotoIndex(0)

      const supabase = createSupabaseBrowserClient()

      const { data: dr, error } = await supabase
        .from('dining_requests')
        .select(`
          id, title, restaurant_name, restaurant_address, dining_time,
          seats_available, total_seats, description, status,
          cuisine_type, price_level, bill_split, payment_app,
          gender_restriction, age_min, age_max, recurring, guest_count_flexible,
          host_deal_headline, host_deal_description,
          visibility, timezone, google_place_id,
          host:profiles!dining_requests_host_id_fkey(name, avatar_url, bio)
        `)
        .eq('id', requestId)
        .single()

      if (error || !dr) { setStatus('not-found'); return }

      const { count: joinCount } = await supabase
        .from('dining_joins')
        .select('id', { count: 'exact', head: true })
        .eq('request_id', requestId)
        .in('status', ['pending', 'accepted'])

      const { count: guestCount } = await supabase
        .from('guest_rsvps')
        .select('id', { count: 'exact', head: true })
        .eq('request_id', requestId)
        .eq('status', 'approved')

      const hostData = Array.isArray(dr.host) ? dr.host[0] : dr.host

      const diningRequest: DiningRequest = {
        ...dr,
        host: hostData || { name: 'TableMesh User', avatar_url: null, bio: null },
        joinCount: joinCount || 0,
        guestCount: guestCount || 0,
      }

      const loadPlaceDetails = async () => {
        const pid = diningRequest.google_place_id?.trim()
        const nm = diningRequest.restaurant_name?.trim()
        const addr = diningRequest.restaurant_address?.trim()
        if (!pid && (!nm || !addr)) {
          return
        }
        setPlaceDetailsLoading(true)
        try {
          const qs = pid
            ? `place_id=${encodeURIComponent(pid)}`
            : `name=${encodeURIComponent(nm!)}&address=${encodeURIComponent(addr!)}`
          const res = await fetch(`/api/places-photo?${qs}`)
          const data = (await res.json()) as PlaceDetails
          setPlaceDetails(data)
        } catch {
          setPlaceDetails(null)
        } finally {
          setPlaceDetailsLoading(false)
        }
      }

      const eventTime = new Date(dr.dining_time)
      if (eventTime < new Date() && dr.status !== 'open' && dr.status !== 'active') {
        setStatus('expired')
        setRequest(diningRequest)
        void loadPlaceDetails()
        return
      }

      setRequest(diningRequest)
      setStatus('found')

      void loadPlaceDetails()
    }

    fetchRequest()
  }, [requestId])

  const formatDateTime = (isoString: string, tz?: string | null) => {
    const date = new Date(isoString)
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', month: 'long', day: 'numeric',
      year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    }
    if (tz) options.timeZone = tz
    return date.toLocaleDateString('en-US', options)
  }

  const getTimeUntil = (isoString: string) => {
    const diff = new Date(isoString).getTime() - Date.now()
    if (diff < 0) return 'Already started'
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`
    return 'Starting soon'
  }

  const handleRsvp = async () => {
    setRsvpError('')
    if (!guestName.trim()) { setRsvpError('Please enter your name'); return }
    if (!guestContact.trim()) { setRsvpError(`Please enter your ${contactType === 'phone' ? 'phone number' : 'email'}`); return }

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
      if (!res.ok) setRsvpError(data.error || 'Failed to RSVP')
      else setRsvpSuccess(true)
    } catch {
      setRsvpError('Network error. Please try again.')
    }
    setRsvpLoading(false)
  }

  const handleOpenApp = () => {
    // Try to open the app via universal link first (passes referral code)
    if (storedRef) {
      // Try universal link which the app can intercept
      const universalLink = `https://tablemesh.com/ref/${storedRef}`
      window.location.href = universalLink
      // Fallback to store after a delay
      setTimeout(() => {
        window.location.href = platform === 'android' ? playStoreLink : appStoreLink
      }, 2000)
    } else {
      window.location.href = platform === 'android' ? playStoreLink : appStoreLink
    }
  }

  // Host counts as 1, plus app joins and approved guest RSVPs
  const attendeeCount = request ? 1 + request.joinCount + request.guestCount : 0
  const isFull = request ? request.seats_available <= 0 : false

  const s = {
    page: { minHeight: '100vh', backgroundColor: '#faf7f2', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' } as React.CSSProperties,
    main: { maxWidth: '480px', margin: '0 auto', padding: '12px', paddingTop: platform !== 'desktop' ? '12px' : '80px' } as React.CSSProperties,
    card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '12px' } as React.CSSProperties,
    cardPad: { padding: '16px' } as React.CSSProperties,
    sectionTitle: { fontSize: '15px', fontWeight: 700, color: '#1f2937', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' } as React.CSSProperties,
    row: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#faf7f2', borderRadius: '10px', marginBottom: '10px' } as React.CSSProperties,
    rowIcon: { fontSize: '22px', flexShrink: 0 } as React.CSSProperties,
    rowTitle: { fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: 0 } as React.CSSProperties,
    rowSub: { fontSize: '12px', color: '#6b7280', margin: '2px 0 0' } as React.CSSProperties,
    btn: { width: '100%', padding: '15px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginBottom: '8px' } as React.CSSProperties,
    btnOutline: { width: '100%', padding: '15px', backgroundColor: '#fff', color: '#f97316', border: '2px solid #f97316', borderRadius: '12px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
    input: { width: '100%', padding: '12px 14px', fontSize: '16px', border: '1.5px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#fafafa', boxSizing: 'border-box' as const, outline: 'none', WebkitAppearance: 'none' as const },
    label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' } as React.CSSProperties,
  }

  return (
    <div style={s.page}>
      <Navbar />

      {/* Mobile App Banner */}
      {platform !== 'desktop' && (
        <div style={{
          background: 'linear-gradient(135deg, #ea580c, #f97316)',
          padding: '10px 16px', marginTop: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
        }}>
          <div>
            <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, margin: 0 }}>Get the full TableMesh experience</p>
            <p style={{ color: '#fed7aa', fontSize: '11px', margin: '1px 0 0' }}>Message hosts, join tables, discover dining events</p>
          </div>
          <a href={platform === 'ios' ? appStoreLink : playStoreLink} style={{
            backgroundColor: '#fff', color: '#ea580c', padding: '8px 14px',
            borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap',
          }}>Get App</a>
        </div>
      )}

      <main style={s.main}>
        {/* Loading */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #fed7aa', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading dining details...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Not Found */}
        {status === 'not-found' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '56px', marginBottom: '12px' }}>🍽️</div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>Dining Request Not Found</h1>
            <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>This dining request may have been removed or the link is invalid.</p>
            <button onClick={handleOpenApp} style={s.btn}>Explore TableMesh</button>
          </div>
        )}

        {/* Main Content */}
        {(status === 'found' || status === 'expired') && request && (
          <>
            {/* Hero Photo Carousel */}
            {placeDetails && placeDetails.photoUrls.length > 0 && (
              <div style={{ ...s.card, marginBottom: '12px' }}>
                <div style={{ position: 'relative', height: '200px', overflow: 'hidden', borderRadius: '16px' }}>
                  <img
                    src={placeDetails.photoUrls[activePhotoIndex]}
                    alt={request.restaurant_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.4))' }} />
                  {placeDetails.photoUrls.length > 1 && (
                    <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                      {placeDetails.photoUrls.map((_, i) => (
                        <button key={i} onClick={() => setActivePhotoIndex(i)} style={{
                          width: i === activePhotoIndex ? '20px' : '6px', height: '6px',
                          borderRadius: '3px', backgroundColor: i === activePhotoIndex ? '#fff' : 'rgba(255,255,255,0.6)',
                          border: 'none', cursor: 'pointer', padding: 0, transition: 'width 0.2s',
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Restaurant Header Card */}
            <div style={s.card}>
              <div style={{ background: placeDetails?.photoUrl ? '#fff' : 'linear-gradient(135deg, #fff7ed, #fef3c7)', padding: '20px 16px 4px' }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  {request.cuisine_type && (
                    <span style={{ backgroundColor: '#f97316', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                      {request.cuisine_type}
                    </span>
                  )}
                  {status === 'expired' && (
                    <span style={{ backgroundColor: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>Past Event</span>
                  )}
                </div>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1f2937', margin: '0 0 6px', lineHeight: 1.25 }}>
                  {request.title?.trim() ? request.title.trim() : request.restaurant_name}
                </h1>
                {request.title?.trim() ? (
                  <p style={{ fontSize: '17px', fontWeight: 700, color: '#374151', margin: '0 0 6px', lineHeight: 1.3 }}>
                    {request.restaurant_name}
                  </p>
                ) : null}
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px', lineHeight: 1.45 }}>{request.restaurant_address}</p>

                {/* Rating (from Google when available) */}
                {placeDetails?.rating != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <StarRating rating={placeDetails.rating} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1f2937' }}>{placeDetails.rating}</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>({placeDetails.userRatingsTotal?.toLocaleString()} reviews)</span>
                  </div>
                )}
              </div>

              <div style={s.cardPad}>
                {/* Restaurant: contact + directions (phone/website from Google when we can match the venue) */}
                <div style={{ marginBottom: '14px' }}>
                  <p style={{ ...s.sectionTitle, marginBottom: '8px' }}>📍 Restaurant</p>
                  <div style={{ padding: '12px', backgroundColor: '#faf7f2', borderRadius: '10px' }}>
                    <p style={{ ...s.rowTitle, marginBottom: '4px' }}>{request.restaurant_name}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 10px', lineHeight: 1.45 }}>{request.restaurant_address}</p>
                    {placeDetailsLoading ? (
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>Looking up phone and website from Google Maps…</p>
                    ) : null}
                    {placeDetails?.phone ? (
                      <div style={{ marginBottom: '8px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Phone</p>
                        <a href={`tel:${placeDetails.phone.replace(/[^\d+]/g, '')}`} style={{ fontSize: '15px', fontWeight: 600, color: '#15803d', textDecoration: 'none' }}>
                          {placeDetails.phone}
                        </a>
                      </div>
                    ) : null}
                    {placeDetails?.website ? (
                      <div style={{ marginBottom: '10px' }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Website</p>
                        <a href={placeDetails.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', fontWeight: 600, color: '#f97316', textDecoration: 'none', wordBreak: 'break-all' as const }}>
                          {placeDetails.website.replace(/^https?:\/\//i, '')}
                        </a>
                      </div>
                    ) : null}
                    {!placeDetailsLoading && placeDetails && !placeDetails.phone && !placeDetails.website ? (
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 8px' }}>
                        Phone and website were not found for this listing. Check Google Maps below.
                      </p>
                    ) : null}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${request.restaurant_name} ${request.restaurant_address}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        fontSize: '13px', fontWeight: 600, color: '#1f2937',
                        backgroundColor: '#fff', padding: '8px 12px', borderRadius: '8px',
                        textDecoration: 'none', border: '1px solid #e5e7eb',
                      }}>
                      🗺️ Open in Google Maps
                    </a>
                  </div>
                </div>

                {/* Date/Time */}
                <div style={s.row}>
                  <span style={s.rowIcon}>📅</span>
                  <div>
                    <p style={s.rowTitle}>{formatDateTime(request.dining_time, request.timezone)}</p>
                    <p style={{ ...s.rowSub, color: '#f97316', fontWeight: 600 }}>{getTimeUntil(request.dining_time)}</p>
                  </div>
                </div>

                {/* Seats */}
                <div style={{ ...s.row, backgroundColor: isFull ? '#fef2f2' : '#f0fdf4' }}>
                  <span style={s.rowIcon}>👥</span>
                  <div>
                    <p style={s.rowTitle}>{attendeeCount}/{request.total_seats} going</p>
                    <p style={{ ...s.rowSub, color: isFull ? '#dc2626' : '#15803d', fontWeight: 600 }}>
                      {isFull ? 'Table is full' : `${request.seats_available} seat${request.seats_available !== 1 ? 's' : ''} left`}
                      {request.guest_count_flexible === false ? ' · Exact headcount' : ''}
                    </p>
                  </div>
                </div>

                {/* Price range */}
                {formatPriceLevel(request.price_level) ? (
                  <div style={s.row}>
                    <span style={s.rowIcon}>💵</span>
                    <div>
                      <p style={s.rowTitle}>Rough price band</p>
                      <p style={s.rowSub}>{formatPriceLevel(request.price_level)} (set by the host)</p>
                    </div>
                  </div>
                ) : null}

                {/* Table expectations: gender, ages, recurring */}
                {(() => {
                  const bullets: string[] = []
                  if (request.gender_restriction === 'women') bullets.push('This table is women-only.')
                  if (request.gender_restriction === 'men') bullets.push('This table is men-only.')
                  if (request.age_min != null && request.age_max != null) {
                    bullets.push(`Ages on this invite: ${request.age_min}–${request.age_max}.`)
                  }
                  if (request.recurring && request.recurring !== 'none') {
                    const r = request.recurring
                    const recurringLabel =
                      r === 'weekly'
                        ? 'Weekly'
                        : r === 'biweekly'
                          ? 'Every two weeks'
                          : r === 'monthly'
                            ? 'Monthly'
                            : r.charAt(0).toUpperCase() + r.slice(1)
                    bullets.push(
                      `${recurringLabel} table — confirm with the host if you only plan to join once.`,
                    )
                  }
                  if (bullets.length === 0) return null
                  return (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ ...s.sectionTitle, marginBottom: '6px' }}>📋 Table expectations</p>
                      <div style={{ padding: '12px', backgroundColor: '#faf7f2', borderRadius: '10px' }}>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#374151', lineHeight: 1.55 }}>
                          {bullets.map(line => (
                            <li key={line} style={{ marginBottom: '4px' }}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )
                })()}

                {/* Bill & payment — always show so guests know how money works */}
                {(() => {
                  const bill = getBillAndPaymentGuestCopy(request.bill_split, request.payment_app)
                  return (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ ...s.sectionTitle, marginBottom: '6px' }}>💳 Bill & payment</p>
                      <div style={{ padding: '12px', backgroundColor: '#faf7f2', borderRadius: '10px' }}>
                        <p style={{ ...s.rowTitle, margin: '0 0 8px' }}>{bill.headline}</p>
                        {bill.body.map((line, i) => (
                          <p
                            key={i}
                            style={{
                              fontSize: '13px',
                              color: '#374151',
                              lineHeight: 1.55,
                              margin: i === 0 ? 0 : '8px 0 0',
                            }}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Host-offered deal / perk (distinct from long description) */}
                {(request.host_deal_headline || request.host_deal_description) ? (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ ...s.sectionTitle, marginBottom: '6px' }}>🏷️ From the host</p>
                    <div style={{ padding: '12px', backgroundColor: '#fff7ed', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                      {request.host_deal_headline ? (
                        <p style={{ ...s.rowTitle, margin: '0 0 6px' }}>{request.host_deal_headline}</p>
                      ) : null}
                      {request.host_deal_description ? (
                        <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.55, margin: 0 }}>
                          {request.host_deal_description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* About this table */}
                {request.description && (
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ ...s.sectionTitle, marginBottom: '6px' }}>💬 About this table</p>
                    <div style={{ padding: '12px', backgroundColor: '#faf7f2', borderRadius: '10px' }}>
                      <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>
                        &ldquo;{request.description}&rdquo;
                      </p>
                    </div>
                  </div>
                )}

                {/* Host Info */}
                <div>
                  <p style={{ ...s.sectionTitle, marginBottom: '6px' }}>🧑‍🍳 Your host</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#faf7f2', borderRadius: '10px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {request.host.avatar_url
                        ? <img src={request.host.avatar_url} alt={request.host.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '20px' }}>👤</span>}
                    </div>
                    <div>
                      <p style={s.rowTitle}>{request.host.name}</p>
                      <p style={s.rowSub}>TableMesh member</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Who's Going */}
            <div style={s.card}>
              <div style={s.cardPad}>
                <p style={s.sectionTitle}>👥 Who&apos;s going ({attendeeCount}/{request.total_seats})</p>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {attendeeCount === 0 ? (
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Be the first to join!</p>
                  ) : (
                    Array.from({ length: Math.min(attendeeCount, 5) }).map((_, i) => (
                      <div key={i} style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: `hsl(${20 + i * 35}, 80%, 70%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', filter: 'blur(3px)', border: '2px solid #fff', flexShrink: 0,
                      }}>👤</div>
                    ))
                  )}
                </div>
                <div style={{ backgroundColor: '#faf7f2', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #fed7aa' }}>
                  <span style={{ fontSize: '20px' }}>🔒</span>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', margin: 0 }}>See who&apos;s going on the app</p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0' }}>View profiles, shared interests, and chat with the group</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {status === 'found' && !isFull && (
              <div style={s.card}>
                <div style={s.cardPad}>
                  {!showRsvp && !rsvpSuccess ? (
                    <>
                      <button onClick={handleOpenApp} style={s.btn}>Join on TableMesh App</button>
                      <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '0 0 14px' }}>
                        Message the host, see who else is going, and more
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 14px' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>or</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }} />
                      </div>
                      <button onClick={() => setShowRsvp(true)} style={s.btnOutline}>RSVP as Guest</button>
                      <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '8px 0 0' }}>
                        No app needed — the host will get your info
                      </p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '12px 0 0' }}>
                        Already have an account?{' '}
                        <a href={`/login?next=/dine/${requestId}`} style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
                      </p>
                    </>
                  ) : rsvpSuccess ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '26px' }}>✓</div>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: '0 0 6px' }}>You&apos;re on the list!</h3>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 6px', lineHeight: 1.5 }}>
                        {request.host.name} will reach out to confirm.
                      </p>
                      <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 20px', lineHeight: 1.5 }}>
                        You&apos;ll get a text or email when you&apos;re approved, and a reminder before the meal.
                      </p>
                      <button onClick={handleOpenApp} style={s.btn}>Download TableMesh</button>
                      <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '4px 0 0' }}>
                        Chat with the host, discover more dining events, and build your foodie profile
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1f2937', margin: 0 }}>RSVP as Guest</h3>
                        <button onClick={() => { setShowRsvp(false); setRsvpError('') }} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', padding: '4px 8px' }}>Cancel</button>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={s.label}>Your Name *</label>
                        <input type="text" placeholder="Enter your name" value={guestName} onChange={e => setGuestName(e.target.value)} style={s.input} />
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <label style={s.label}>Contact Info *</label>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          {(['phone', 'email'] as const).map(type => (
                            <button key={type} onClick={() => setContactType(type)} style={{
                              flex: 1, padding: '10px', fontSize: '14px', fontWeight: 600,
                              border: `1.5px solid ${contactType === type ? '#f97316' : '#e5e7eb'}`,
                              backgroundColor: contactType === type ? '#fff7ed' : '#fff',
                              color: contactType === type ? '#f97316' : '#6b7280',
                              borderRadius: '8px', cursor: 'pointer',
                            }}>{type.charAt(0).toUpperCase() + type.slice(1)}</button>
                          ))}
                        </div>
                        <input
                          type={contactType === 'phone' ? 'tel' : 'email'}
                          placeholder={contactType === 'phone' ? 'Your phone number' : 'Your email address'}
                          value={guestContact}
                          onChange={e => setGuestContact(e.target.value)}
                          style={s.input}
                        />
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={s.label}>Message to host (optional)</label>
                        <textarea
                          placeholder="Say hi or share any dietary preferences..."
                          value={guestMessage}
                          onChange={e => setGuestMessage(e.target.value)}
                          rows={2}
                          style={{ ...s.input, resize: 'vertical', fontFamily: 'inherit' }}
                        />
                      </div>

                      {rsvpError && (
                        <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', marginBottom: '12px' }}>
                          <p style={{ margin: 0, fontSize: '14px', color: '#dc2626' }}>{rsvpError}</p>
                        </div>
                      )}

                      <button onClick={handleRsvp} disabled={rsvpLoading} style={{ ...s.btn, opacity: rsvpLoading ? 0.7 : 1, cursor: rsvpLoading ? 'not-allowed' : 'pointer' }}>
                        {rsvpLoading ? 'Sending...' : 'Send RSVP'}
                      </button>
                      <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', margin: '8px 0 0', lineHeight: 1.4 }}>
                        Your contact info will only be shared with the host.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full table */}
            {status === 'found' && isFull && (
              <div style={{ ...s.card, textAlign: 'center' }}>
                <div style={s.cardPad}>
                  <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: '0 0 8px' }}>This table is full!</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 16px' }}>Download TableMesh to discover more dining experiences near you.</p>
                  <button onClick={handleOpenApp} style={s.btn}>Get TableMesh</button>
                </div>
              </div>
            )}

            {/* Google Reviews */}
            {placeDetails?.reviews && placeDetails.reviews.length > 0 && (
              <div style={s.card}>
                <div style={s.cardPad}>
                  <p style={s.sectionTitle}>⭐ What people say about {request.restaurant_name}</p>
                  {placeDetails.reviews.map((review, i) => (
                    <div key={i} style={{ marginBottom: i < placeDetails.reviews.length - 1 ? '14px' : 0, paddingBottom: i < placeDetails.reviews.length - 1 ? '14px' : 0, borderBottom: i < placeDetails.reviews.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        {review.profile_photo_url
                          ? <img src={review.profile_photo_url} alt={review.author_name} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                          : <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>👤</div>
                        }
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', margin: 0 }}>{review.author_name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <StarRating rating={review.rating} />
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{review.relative_time_description}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5, margin: 0 }}>
                        {review.text.length > 200 ? review.text.slice(0, 200) + '…' : review.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Why TableMesh */}
            <div style={s.card}>
              <div style={s.cardPad}>
                <h3 style={s.sectionTitle}>Why join TableMesh?</h3>
                {[
                  { icon: '💬', title: 'Message hosts directly', desc: 'Chat before you meet and coordinate details' },
                  { icon: '👥', title: 'See who\'s going', desc: 'View profiles and find people with shared interests' },
                  { icon: '🍜', title: 'Discover dining events', desc: 'Browse hundreds of dining requests near you' },
                  { icon: '⭐', title: 'Build your foodie reputation', desc: 'Earn XP, unlock achievements, and level up' },
                  { icon: '🎁', title: 'Exclusive restaurant deals', desc: 'Access special offers from partner restaurants' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: i < 4 ? '12px' : 0 }}>
                    <span style={{ fontSize: '20px', flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', margin: 0 }}>{item.title}</p>
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <a href={playStoreLink} style={{ flex: 1, display: 'block', textAlign: 'center', backgroundColor: '#111827', color: '#fff', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Google Play</a>
                  <a href={appStoreLink} style={{ flex: 1, display: 'block', textAlign: 'center', backgroundColor: '#111827', color: '#fff', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>App Store</a>
                </div>
              </div>
            </div>

            {/* Google Maps Link */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(request.restaurant_name + ' ' + request.restaurant_address)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', ...s.card, padding: '14px 16px', textDecoration: 'none', textAlign: 'center', marginBottom: '12px' }}
            >
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>📍 View {request.restaurant_name} on Google Maps</span>
            </a>

            {/* Explore More */}
            <div style={{ backgroundColor: '#fff7ed', borderRadius: '16px', padding: '18px 16px', marginBottom: '12px', border: '1px solid #fed7aa', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>🍽 More tables near you</p>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 12px' }}>Browse all upcoming group dining experiences on TableMesh.</p>
              <Link href="/explore" style={{ display: 'inline-block', backgroundColor: '#f97316', color: '#fff', padding: '10px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
                Explore Tables →
              </Link>
            </div>
          </>
        )}
      </main>

      <footer style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid #f3f4f6', backgroundColor: '#fff' }}>
        <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#6b7280' }}>
          <Link href="/" style={{ color: '#f97316', textDecoration: 'none' }}>TableMesh</Link>
          {' '}— Coordinate meals with friends, coworkers &amp; food lovers
        </p>
        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>© 2025 Sheep Labs LLC. All rights reserved.</p>
      </footer>
    </div>
  )
}
