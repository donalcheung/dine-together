import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// This should be a Supabase SERVICE ROLE key (not anon key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Add this to your env vars
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    // Get all unsent notifications
    const { data: notifications, error } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('sent', false)
      .order('created_at', { ascending: true })
      .limit(10) // Process 10 at a time

    if (error) throw error

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ message: 'No notifications to send', count: 0 })
    }

    const results = []

    // Send each notification
    for (const notification of notifications) {
      try {
        const { data, error: sendError } = await resend.emails.send({
          from: 'TableMesh <info@tablemesh.com>',
          to: [notification.recipient_email],
          subject: notification.subject,
          html: notification.html_content,
        })

        if (sendError) {
          console.error('Error sending email:', sendError)
          results.push({ id: notification.id, success: false, error: sendError })
          continue
        }

        // Mark as sent
        await supabase
          .from('notification_queue')
          .update({ 
            sent: true, 
            sent_at: new Date().toISOString() 
          })
          .eq('id', notification.id)

        results.push({ id: notification.id, success: true })
      } catch (err) {
        console.error('Error processing notification:', err)
        results.push({ id: notification.id, success: false, error: err })
      }
    }

    return NextResponse.json({ 
      message: 'Notifications processed', 
      total: notifications.length,
      results 
    })
  } catch (error) {
    console.error('Error processing notifications:', error)
    return NextResponse.json(
      { error: 'Failed to process notifications' },
      { status: 500 }
    )
  }
}
