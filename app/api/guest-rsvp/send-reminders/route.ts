import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { notifyGuest } from '../../../lib/guest-notify'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/guest-rsvp/send-reminders
// Called by a cron job (e.g. Vercel Cron) once per hour
// Sends reminders to approved guests whose meal is 20-28 hours away and haven't been reminded yet
export async function GET(request: NextRequest) {
  // Simple auth check via secret header
  const cronSecret = request.headers.get('x-cron-secret')
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000) // 20h from now
    const windowEnd = new Date(now.getTime() + 28 * 60 * 60 * 1000)   // 28h from now

    // Find approved guest RSVPs for meals happening in the reminder window
    const { data: rsvps, error } = await supabase
      .from('guest_rsvps')
      .select(`
        id, guest_name, guest_phone, guest_email,
        dining_request:dining_requests!guest_rsvps_request_id_fkey(
          id, restaurant_name, restaurant_address, dining_time, timezone,
          host:profiles!dining_requests_host_id_fkey(name)
        )
      `)
      .eq('status', 'approved')
      .is('reminder_sent_at', null)

    if (error) {
      console.error('[send-reminders] Query error:', error)
      return NextResponse.json({ error: 'Query failed' }, { status: 500 })
    }

    let sent = 0
    const results: any[] = []

    for (const rsvp of (rsvps || [])) {
      const dr = Array.isArray(rsvp.dining_request) ? rsvp.dining_request[0] : rsvp.dining_request
      if (!dr) continue

      const mealTime = new Date(dr.dining_time)
      if (mealTime < windowStart || mealTime > windowEnd) continue

      const hostData = Array.isArray(dr.host) ? dr.host[0] : dr.host
      const hostName = hostData?.name || 'Your host'
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tablemesh.com'
      const shareUrl = `${appUrl}/dine/${dr.id}`

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
        type: 'reminder',
      })

      // Mark reminder as sent
      await supabase
        .from('guest_rsvps')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', rsvp.id)

      sent++
      results.push({ rsvp_id: rsvp.id, guest: rsvp.guest_name, smsSent, emailSent })
    }

    return NextResponse.json({ success: true, reminders_sent: sent, results })
  } catch (err) {
    console.error('[send-reminders] Error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
