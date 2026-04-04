import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const ADMIN_EMAIL = 'donal.cheung@gmail.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantName, documentType, fileName, notes } = body as {
      restaurantName?: string
      documentType?: string
      fileName?: string
      notes?: string
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('[notify-verification] RESEND_API_KEY not set — skipping email')
      return NextResponse.json({ success: true, emailSent: false })
    }

    const resend = new Resend(apiKey)

    const docLabel = documentType
      ? documentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : 'Unknown'

    const { error } = await resend.emails.send({
      from: 'TableMesh <notifications@tablemesh.app>',
      to: [ADMIN_EMAIL],
      subject: `🔔 New Verification Request: ${restaurantName || 'Unknown Restaurant'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 24px; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Verification Request</h1>
          </div>
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 16px 16px;">
            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-top: 0;">
              A restaurant has submitted a new verification document for review.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 140px;">Restaurant</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #111827;">${restaurantName || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Document Type</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #111827;">${docLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">File Name</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #111827;">${fileName || 'N/A'}</td>
              </tr>
              ${notes ? `
              <tr>
                <td style="padding: 8px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Notes</td>
                <td style="padding: 8px 12px; border: 1px solid #e5e7eb; color: #111827;">${notes}</td>
              </tr>
              ` : ''}
            </table>
            <a href="https://tablemesh.app/admin/dashboard/restaurants" 
               style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 8px;">
              Review in Admin Dashboard →
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; margin-bottom: 0;">
              This is an automated notification from TableMesh.
            </p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error('[notify-verification] Resend error:', error)
      return NextResponse.json({ success: true, emailSent: false })
    }

    return NextResponse.json({ success: true, emailSent: true })
  } catch (err) {
    console.error('[notify-verification] Error:', err)
    // Non-fatal — don't block the verification submission
    return NextResponse.json({ success: true, emailSent: false })
  }
}
