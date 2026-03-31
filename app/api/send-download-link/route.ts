import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const APP_STORE_URL = 'https://apps.apple.com/us/app/tablemesh/id6760209899'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.tablemeshnative'

// Normalise a phone number to E.164 format (+1XXXXXXXXXX for US/CA)
function normalisePhone(raw: string): string | null {
  // Strip everything except digits and leading +
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  // International: already has country code (11+ digits)
  if (digits.length > 10) return `+${digits}`
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, source } = body as { phone: string; source?: string }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
    }

    const e164 = normalisePhone(phone)
    if (!e164) {
      return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 })
    }

    // ── 1. Store in Supabase ──────────────────────────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Upsert so duplicate numbers don't cause an error — just update the timestamp
    const { error: dbError } = await supabase
      .from('phone_leads')
      .upsert(
        {
          phone: e164,
          source: source || request.headers.get('referer') || 'direct',
          last_requested_at: new Date().toISOString(),
        },
        { onConflict: 'phone' },
      )

    if (dbError) {
      console.error('[send-download-link] Supabase upsert error:', dbError)
      // Non-fatal — still try to send the SMS
    }

    // ── 2. Send SMS via Twilio ────────────────────────────────────────────────
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      // Twilio not configured — still return success so the UI unlocks
      console.warn('[send-download-link] Twilio env vars not set — skipping SMS')
      return NextResponse.json({ success: true, smsSent: false })
    }

    const twilio = require('twilio')(accountSid, authToken)

    const smsBody =
      `🍽️ Your TableMesh download link:\n` +
      `📱 iOS: ${APP_STORE_URL}\n` +
      `🤖 Android: ${PLAY_STORE_URL}\n\n` +
      `Bring everyone to the table!`

    await twilio.messages.create({
      body: smsBody,
      from: fromNumber,
      to: e164,
    })

    return NextResponse.json({ success: true, smsSent: true })
  } catch (err: any) {
    console.error('[send-download-link] Error:', err)
    // Surface a friendlier message for Twilio errors (e.g. invalid number)
    const msg =
      err?.code === 21211 || err?.code === 21614
        ? 'That phone number doesn\'t look right. Please double-check and try again.'
        : 'Something went wrong. Please try again.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
