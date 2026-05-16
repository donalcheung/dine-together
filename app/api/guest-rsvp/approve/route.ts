import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { notifyGuest } from '../../../lib/guest-notify'
import { GUEST_RSVP_STATUS } from '../../../lib/guest-rsvp-status'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/guest-rsvp/approve
// Body: { rsvp_id: string, action: 'approve' | 'reject', host_user_id: string, notify_only?: boolean }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rsvp_id, action, host_user_id, notify_only } = body

    if (!rsvp_id || !action || !host_user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Fetch the RSVP with dining request and host info
    const { data: rsvp, error: rsvpError } = await supabase
      .from('guest_rsvps')
      .select(`
        id, guest_name, guest_phone, guest_email, status, request_id,
        dining_request:dining_requests!guest_rsvps_request_id_fkey(
          id, restaurant_name, restaurant_address, dining_time, timezone, host_id,
          host:profiles!dining_requests_host_id_fkey(name)
        )
      `)
      .eq('id', rsvp_id)
      .single()

    if (rsvpError || !rsvp) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 })
    }

    // Verify the requesting user is the host
    const dr = Array.isArray(rsvp.dining_request) ? rsvp.dining_request[0] : rsvp.dining_request
    if (!dr || dr.host_id !== host_user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const hostData = Array.isArray(dr.host) ? dr.host[0] : dr.host
    const hostName = hostData?.name || 'Your host'

    const newStatus =
      action === 'approve' ? GUEST_RSVP_STATUS.accepted : GUEST_RSVP_STATUS.declined

    if (!notify_only) {
      const { error: updateError } = await supabase
        .from('guest_rsvps')
        .update({ status: newStatus })
        .eq('id', rsvp_id)

      if (updateError) {
        console.error('[guest-rsvp/approve] Update error:', updateError)
        return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 })
      }
    }

    // Send notification to guest
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tablemesh.com'
    const shareUrl = `${appUrl}/dine/${dr.id}`

    // For approved email guests, generate a one-click account claim link
    let claimUrl: string | undefined
    if (action === 'approve' && rsvp.guest_email) {
      try {
        const { data: inviteData } = await supabase.auth.admin.generateLink({
          type: 'invite',
          email: rsvp.guest_email,
          options: {
            data: { name: rsvp.guest_name },
            redirectTo: shareUrl,
          },
        })
        claimUrl = inviteData?.properties?.action_link ?? undefined
      } catch {
        // User may already exist — fall back to magic link
        try {
          const { data: otpData } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: rsvp.guest_email,
            options: { redirectTo: shareUrl },
          })
          claimUrl = otpData?.properties?.action_link ?? undefined
        } catch {}
      }
    }

    const { smsSent, emailSent } = await notifyGuest({
      guestName: rsvp.guest_name,
      guestPhone: rsvp.guest_phone,
      guestEmail: rsvp.guest_email,
      restaurantName: dr.restaurant_name,
      restaurantAddress: dr.restaurant_address,
      diningTime: dr.dining_time,
      timezone: dr.timezone,
      hostName,
      shareUrl,
      claimUrl,
      type: action === 'approve' ? 'approved' : 'rejected',
    })

    return NextResponse.json({
      success: true,
      status: newStatus,
      notified: { smsSent, emailSent },
    })
  } catch (err) {
    console.error('[guest-rsvp/approve] Error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
