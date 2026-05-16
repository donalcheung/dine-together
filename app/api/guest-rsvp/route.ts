import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { notifyGuest } from '../../lib/guest-notify'
import { GUEST_RSVP_STATUS } from '../../lib/guest-rsvp-status'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { request_id, guest_name, guest_phone, guest_email, message } = body

    if (!request_id || !guest_name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!guest_phone && !guest_email) {
      return NextResponse.json(
        { error: 'Please provide a phone number or email so the host can reach you' },
        { status: 400 }
      )
    }

    // Check the dining request exists and is open
    const { data: diningRequest, error: fetchError } = await supabase
      .from('dining_requests')
      .select('id, status, seats_available, dining_time')
      .eq('id', request_id)
      .single()

    if (fetchError || !diningRequest) {
      return NextResponse.json(
        { error: 'Dining request not found' },
        { status: 404 }
      )
    }

    if (diningRequest.status !== 'open' && diningRequest.status !== 'active') {
      return NextResponse.json(
        { error: 'This dining request is no longer accepting guests' },
        { status: 400 }
      )
    }

    if (diningRequest.seats_available <= 0) {
      return NextResponse.json(
        { error: 'Sorry, this table is full! Download the app to find more dining experiences.' },
        { status: 400 }
      )
    }

    // Check if this guest already RSVP'd (by phone or email)
    let existingQuery = supabase
      .from('guest_rsvps')
      .select('id')
      .eq('request_id', request_id)

    if (guest_email) {
      existingQuery = existingQuery.eq('guest_email', guest_email)
    } else if (guest_phone) {
      existingQuery = existingQuery.eq('guest_phone', guest_phone)
    }

    const { data: existing } = await existingQuery

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'You have already RSVP\'d to this dining request!' },
        { status: 400 }
      )
    }

    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

    // Insert the guest RSVP
    const { data: rsvp, error: insertError } = await supabase
      .from('guest_rsvps')
      .insert({
        request_id,
        guest_name: guest_name.trim(),
        guest_phone: guest_phone?.trim() || null,
        guest_email: guest_email?.trim().toLowerCase() || null,
        message: message?.trim() || null,
        ip_address: ip,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Guest RSVP insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit RSVP. Please try again.' },
        { status: 500 }
      )
    }

    // Confirm receipt via SMS or email (best-effort)
    let notified = { smsSent: false, emailSent: false }
    try {
      const { data: dr } = await supabaseAdmin
        .from('dining_requests')
        .select(`
          id, restaurant_name, restaurant_address, dining_time, timezone,
          host:profiles!dining_requests_host_id_fkey(name)
        `)
        .eq('id', request_id)
        .single()

      if (dr) {
        const hostData = Array.isArray(dr.host) ? dr.host[0] : dr.host
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tablemesh.com'
        notified = await notifyGuest({
          guestName: guest_name.trim(),
          guestPhone: guest_phone?.trim() || null,
          guestEmail: guest_email?.trim().toLowerCase() || null,
          restaurantName: dr.restaurant_name,
          restaurantAddress: dr.restaurant_address ?? '',
          diningTime: dr.dining_time,
          timezone: dr.timezone,
          hostName: hostData?.name || 'Your host',
          shareUrl: `${appUrl}/dine/${dr.id}`,
          type: 'pending',
        })
      }
    } catch (notifyErr) {
      console.error('[guest-rsvp] Pending notification error:', notifyErr)
    }

    return NextResponse.json({
      success: true,
      rsvp_id: rsvp.id,
      status: GUEST_RSVP_STATUS.pending,
      message: 'Your RSVP has been sent to the host!',
      notified,
    })
  } catch (err) {
    console.error('Guest RSVP error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
