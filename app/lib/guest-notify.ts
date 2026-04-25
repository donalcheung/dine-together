import twilio from 'twilio'
import { Resend } from 'resend'

function formatDate(isoString: string, tz?: string | null): string {
  const date = new Date(isoString)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }
  if (tz) options.timeZone = tz
  return date.toLocaleDateString('en-US', options)
}

interface NotifyParams {
  guestName: string
  guestPhone: string | null
  guestEmail: string | null
  restaurantName: string
  restaurantAddress: string
  diningTime: string
  timezone: string | null
  hostName: string
  shareUrl: string
  type: 'approved' | 'rejected' | 'reminder'
}

export async function notifyGuest(params: NotifyParams): Promise<{ smsSent: boolean; emailSent: boolean }> {
  const { guestName, guestPhone, guestEmail, restaurantName, restaurantAddress, diningTime, timezone, hostName, shareUrl, type } = params
  const dateStr = formatDate(diningTime, timezone)
  let smsSent = false
  let emailSent = false

  let smsBody = ''
  let emailSubject = ''
  let emailHtml = ''

  if (type === 'approved') {
    smsBody = `You're confirmed, ${guestName}!\n\n${hostName} approved your RSVP for:\n${restaurantName}\n${dateStr}\n\nSee you there! Download TableMesh for the full experience:\nhttps://tablemesh.com/download`
    emailSubject = `You're confirmed for ${restaurantName}!`
    emailHtml = buildEmailHtml({
      title: `You're confirmed, ${guestName}!`,
      body: `<strong>${hostName}</strong> has approved your RSVP for the group dining at <strong>${restaurantName}</strong>.`,
      details: [
        { label: 'Restaurant', value: restaurantName },
        { label: 'Address', value: restaurantAddress },
        { label: 'Date & Time', value: dateStr },
        { label: 'Host', value: hostName },
      ],
      ctaText: 'View Dining Details',
      ctaUrl: shareUrl,
      footer: 'Download TableMesh to chat with the host and see who else is going.',
    })
  } else if (type === 'rejected') {
    smsBody = `Hi ${guestName}, unfortunately ${hostName} was unable to accommodate your RSVP for ${restaurantName} on ${dateStr}.\n\nFind more dining experiences on TableMesh:\nhttps://tablemesh.com/explore`
    emailSubject = `Update on your RSVP for ${restaurantName}`
    emailHtml = buildEmailHtml({
      title: 'RSVP Update',
      body: `Hi <strong>${guestName}</strong>, unfortunately <strong>${hostName}</strong> was unable to accommodate your RSVP for the group dining at <strong>${restaurantName}</strong>.`,
      details: [
        { label: 'Restaurant', value: restaurantName },
        { label: 'Date & Time', value: dateStr },
      ],
      ctaText: 'Find More Tables',
      ctaUrl: 'https://tablemesh.com/explore',
      footer: 'Download TableMesh to discover hundreds of dining experiences near you.',
    })
  } else if (type === 'reminder') {
    smsBody = `Reminder, ${guestName}! Your table at ${restaurantName} is tomorrow:\n${dateStr}\n${restaurantAddress}\n\nSee you there!`
    emailSubject = `Reminder: Your table at ${restaurantName} is tomorrow!`
    emailHtml = buildEmailHtml({
      title: `See you tomorrow, ${guestName}!`,
      body: `Just a reminder that your group dining experience is coming up tomorrow!`,
      details: [
        { label: 'Restaurant', value: restaurantName },
        { label: 'Address', value: restaurantAddress },
        { label: 'Date & Time', value: dateStr },
        { label: 'Host', value: hostName },
      ],
      ctaText: 'View Dining Details',
      ctaUrl: shareUrl,
      footer: 'Download TableMesh to chat with the host and see who else is going.',
    })
  }

  // Send SMS via Twilio
  if (guestPhone) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID
      const authToken = process.env.TWILIO_AUTH_TOKEN
      const fromNumber = process.env.TWILIO_PHONE_NUMBER
      if (accountSid && authToken && fromNumber) {
        const client = twilio(accountSid, authToken)
        const normalised = normalisePhone(guestPhone)
        if (normalised) {
          await client.messages.create({ body: smsBody, from: fromNumber, to: normalised })
          smsSent = true
        }
      }
    } catch (err: any) {
      console.error('[guest-notify] Twilio error:', err?.message)
    }
  }

  // Send email via Resend
  if (guestEmail) {
    try {
      const apiKey = process.env.RESEND_API_KEY
      if (apiKey) {
        const resend = new Resend(apiKey)
        const { error } = await resend.emails.send({
          from: 'TableMesh <notifications@tablemesh.app>',
          to: [guestEmail],
          subject: emailSubject,
          html: emailHtml,
        })
        if (!error) emailSent = true
        else console.error('[guest-notify] Resend error:', error)
      }
    } catch (err: any) {
      console.error('[guest-notify] Resend error:', err?.message)
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

interface EmailOptions {
  title: string
  body: string
  details: Array<{ label: string; value: string }>
  ctaText: string
  ctaUrl: string
  footer: string
}

function buildEmailHtml(opts: EmailOptions): string {
  const rows = opts.details.map(d => `
    <tr>
      <td style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;color:#374151;width:120px;">${d.label}</td>
      <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111827;">${d.value}</td>
    </tr>`).join('')

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:24px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">${opts.title}</h1>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 16px 16px;">
        <p style="color:#374151;font-size:15px;line-height:1.6;margin-top:0;">${opts.body}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>
        <a href="${opts.ctaUrl}" style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;">${opts.ctaText} &rarr;</a>
        <p style="color:#6b7280;font-size:13px;margin-top:20px;line-height:1.5;">${opts.footer}</p>
        <p style="color:#9ca3af;font-size:11px;margin-top:16px;margin-bottom:0;">This message was sent by TableMesh on behalf of the host. &copy; 2025 Sheep Labs LLC.</p>
      </div>
    </div>`
}
