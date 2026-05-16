import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') ?? ''
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') ?? ''
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER') ?? ''
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://tablemesh.com'
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''

Deno.serve(async (req) => {
  const secret = req.headers.get('x-cron-secret')
  if (CRON_SECRET && secret !== CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const now = new Date()
  const windowStart = new Date(now.getTime() + 20 * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 28 * 60 * 60 * 1000)

  const { data: rsvps, error } = await supabase
    .from('guest_rsvps')
    .select(`
      id, guest_name, guest_phone, guest_email,
      dining_request:dining_requests!guest_rsvps_request_id_fkey(
        id, restaurant_name, restaurant_address, dining_time, timezone,
        host:profiles!dining_requests_host_id_fkey(name)
      )
    `)
    .in('status', ['accepted', 'approved'])
    .is('reminder_sent_at', null)

  if (error) {
    console.error('[send-reminders] Query error:', error)
    return new Response(JSON.stringify({ error: 'Query failed' }), { status: 500 })
  }

  let sent = 0
  const results: unknown[] = []

  for (const rsvp of (rsvps ?? [])) {
    const dr = Array.isArray(rsvp.dining_request) ? rsvp.dining_request[0] : rsvp.dining_request
    if (!dr) continue

    const mealTime = new Date(dr.dining_time)
    if (mealTime < windowStart || mealTime > windowEnd) continue

    const hostData = Array.isArray(dr.host) ? dr.host[0] : dr.host
    const hostName = hostData?.name ?? 'Your host'
    const shareUrl = `${APP_URL}/dine/${dr.id}`
    const dateStr = formatDate(dr.dining_time, dr.timezone)

    const { smsSent, emailSent } = await notifyGuest({
      guestName: rsvp.guest_name,
      guestPhone: rsvp.guest_phone,
      guestEmail: rsvp.guest_email,
      restaurantName: dr.restaurant_name,
      restaurantAddress: dr.restaurant_address,
      dateStr,
      hostName,
      shareUrl,
    })

    await supabase
      .from('guest_rsvps')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', rsvp.id)

    sent++
    results.push({ rsvp_id: rsvp.id, guest: rsvp.guest_name, smsSent, emailSent })
  }

  return new Response(JSON.stringify({ success: true, reminders_sent: sent, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

function formatDate(isoString: string, tz?: string | null): string {
  const date = new Date(isoString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }
  if (tz) options.timeZone = tz
  return date.toLocaleDateString('en-US', options)
}

async function notifyGuest(params: {
  guestName: string
  guestPhone: string | null
  guestEmail: string | null
  restaurantName: string
  restaurantAddress: string
  dateStr: string
  hostName: string
  shareUrl: string
}): Promise<{ smsSent: boolean; emailSent: boolean }> {
  const { guestName, guestPhone, guestEmail, restaurantName, restaurantAddress, dateStr, hostName, shareUrl } = params
  let smsSent = false
  let emailSent = false

  const smsBody = `Reminder, ${guestName}! Your table at ${restaurantName} is tomorrow:\n${dateStr}\n${restaurantAddress}\n\nSee you there!`

  if (guestPhone && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
    try {
      const to = normalisePhone(guestPhone)
      if (to) {
        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ Body: smsBody, From: TWILIO_PHONE_NUMBER, To: to }),
          }
        )
        smsSent = res.ok
        if (!res.ok) console.error('[send-reminders] Twilio error:', await res.text())
      }
    } catch (err) {
      console.error('[send-reminders] Twilio error:', err)
    }
  }

  if (guestEmail && RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'TableMesh <notifications@tablemesh.app>',
          to: [guestEmail],
          subject: `Reminder: Your table at ${restaurantName} is tomorrow!`,
          html: buildEmailHtml({ guestName, restaurantName, restaurantAddress, dateStr, hostName, shareUrl }),
        }),
      })
      emailSent = res.ok
      if (!res.ok) console.error('[send-reminders] Resend error:', await res.text())
    } catch (err) {
      console.error('[send-reminders] Resend error:', err)
    }
  }

  return { smsSent, emailSent }
}

function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (digits.length > 10) return `+${digits}`
  return null
}

function buildEmailHtml(opts: {
  guestName: string
  restaurantName: string
  restaurantAddress: string
  dateStr: string
  hostName: string
  shareUrl: string
}): string {
  const rows = [
    { label: 'Restaurant', value: opts.restaurantName },
    { label: 'Address', value: opts.restaurantAddress },
    { label: 'Date & Time', value: opts.dateStr },
    { label: 'Host', value: opts.hostName },
  ].map(d => `
    <tr>
      <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;color:#374151;width:120px;">${d.label}</td>
      <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">${d.value}</td>
    </tr>`).join('')

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:24px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">See you tomorrow, ${opts.guestName}!</h1>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 16px 16px;">
        <p style="color:#374151;font-size:15px;line-height:1.6;margin-top:0;">Just a reminder that your group dining experience is coming up tomorrow!</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>
        <a href="${opts.shareUrl}" style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;">View Dining Details &rarr;</a>
        <p style="color:#6b7280;font-size:13px;margin-top:20px;line-height:1.5;">Download TableMesh to chat with the host and see who else is going.</p>
        <p style="color:#9ca3af;font-size:11px;margin-top:16px;margin-bottom:0;">This message was sent by TableMesh on behalf of the host. &copy; 2025 Sheep Labs LLC.</p>
      </div>
    </div>`
}
