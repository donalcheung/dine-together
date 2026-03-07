import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    if (diningRequest.status !== 'open') {
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

    return NextResponse.json({
      success: true,
      rsvp_id: rsvp.id,
      message: 'Your RSVP has been sent to the host!'
    })
  } catch (err) {
    console.error('Guest RSVP error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
