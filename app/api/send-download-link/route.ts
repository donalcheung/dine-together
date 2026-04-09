import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import twilio from 'twilio'

const SMART_LINK = 'https://tablemesh.app/download'

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
  let phone = ''
  let source = ''

  try {
    const body = await request.json()
    phone = body.phone
    source = body.source || ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!phone || typeof phone !== 'string') {
    return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
  }

  const e164 = normalisePhone(phone)
  if (!e164) {
    return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 })
  }

  // ── 1. Store in Supabase (non-fatal) ───────────────────────────────────────
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

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
    }
  } catch (dbErr) {
    console.error('[send-download-link] Supabase error (non-fatal):', dbErr)
  }

  // ── 2. Send SMS via Twilio (non-fatal) ─────────────────────────────────────
  let smsSent = false
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (accountSid && authToken && fromNumber) {
      const client = twilio(accountSid, authToken)

      const smsBody =
        `🍽️ Your TableMesh download link:\n` +
        `📱 Download here: ${SMART_LINK}\n\n` +
        `Bring everyone to the table!`

      await client.messages.create({
        body: smsBody,
        from: fromNumber,
        to: e164,
      })
      smsSent = true
    } else {
      console.warn('[send-download-link] Twilio env vars not set — skipping SMS')
    }
  } catch (smsErr: any) {
    // SMS failed (e.g. toll-free number pending verification) — still return success
    console.warn('[send-download-link] Twilio SMS error (non-fatal):', smsErr?.message)
  }

  // Always return success for valid phone numbers — the phone is captured in DB
  // and the user gets the download buttons unlocked regardless of SMS delivery
  return NextResponse.json({ success: true, smsSent })
}
