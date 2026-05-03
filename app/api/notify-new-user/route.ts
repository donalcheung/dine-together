import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const ADMIN_EMAIL = 'donal.cheung@gmail.com'

export async function POST(request: NextRequest) {
  try {
    // Validate webhook secret
    const secret = request.headers.get('x-webhook-secret')
    if (process.env.NEW_USER_WEBHOOK_SECRET && secret !== process.env.NEW_USER_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // Supabase Database Webhook payload shape
    const record = body?.record as Record<string, string | null> | undefined

    const name = record?.name || null
    const email = record?.email || null
    const createdAt = record?.created_at
      ? new Date(record.created_at).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : 'Unknown'

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('[notify-new-user] RESEND_API_KEY not set — skipping email')
      return NextResponse.json({ success: true, emailSent: false })
    }

    const resend = new Resend(apiKey)

    const { error } = await resend.emails.send({
      from: 'TableMesh <notifications@tablemesh.app>',
      to: [ADMIN_EMAIL],
      subject: `👤 New User Signed Up${name ? `: ${name}` : ''}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 24px; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New User Signed Up</h1>
          </div>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 16px 16px;">
            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-top: 0;">
              A new user has created an account on TableMesh.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 140px;">Name</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #111827;">${name || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Email</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #111827;">${email || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Signed Up</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #111827;">${createdAt}</td>
              </tr>
            </table>
            <a href="https://tablemesh.app/admin/dashboard/users"
               style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 8px;">
              View Users in Admin Dashboard →
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; margin-bottom: 0;">
              This is an automated notification from TableMesh.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('[notify-new-user] Resend error:', error)
      return NextResponse.json({ success: true, emailSent: false })
    }

    return NextResponse.json({ success: true, emailSent: true })
  } catch (err) {
    console.error('[notify-new-user] Error:', err)
    return NextResponse.json({ success: true, emailSent: false })
  }
}
