/**
 * Helper function to send email notifications
 * Uses the /api/send-notification endpoint with Resend
 */

export async function sendJoinNotification(
  hostEmail: string,
  guestName: string,
  restaurantName: string,
  requestId: string
) {
  try {
    const subject = `New Join Request for Your ${restaurantName} Dinner`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea6d0d;">New Join Request! 🎉</h2>
        <p>Hi there!</p>
        <p><strong>${guestName}</strong> has requested to join your dining request at <strong>${restaurantName}</strong>.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/request/${requestId}" 
             style="display: inline-block; padding: 10px 20px; background-color: #ea6d0d; color: white; text-decoration: none; border-radius: 5px;">
            View Request
          </a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          © TableMesh - Where Great Dinners Happen
        </p>
      </div>
    `

    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: hostEmail,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to send notification: ${error.error?.message || 'Unknown error'}`)
    }

    console.log('Notification sent successfully')
    return await response.json()
  } catch (error: any) {
    console.error('Error sending notification:', error)
    // Don't throw - notifications are non-critical
    // The join request should still succeed even if notification fails
  }
}

export async function sendAcceptanceNotification(
  guestEmail: string,
  guestName: string,
  hostName: string,
  restaurantName: string,
  diningTime: string,
  requestId: string
) {
  try {
    const subject = `Your Join Request Was Accepted! 🎉`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea6d0d;">You're In! 🎉</h2>
        <p>Hi ${guestName}!</p>
        <p><strong>${hostName}</strong> has accepted your join request for their dinner at <strong>${restaurantName}</strong>.</p>
        <p><strong>Dining Time:</strong> ${new Date(diningTime).toLocaleString()}</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/request/${requestId}" 
             style="display: inline-block; padding: 10px 20px; background-color: #ea6d0d; color: white; text-decoration: none; border-radius: 5px;">
            View Details
          </a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          © TableMesh - Where Great Dinners Happen
        </p>
      </div>
    `

    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: guestEmail,
        subject,
        html,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Failed to send notification: ${error.error?.message || 'Unknown error'}`)
    }

    console.log('Acceptance notification sent successfully')
    return await response.json()
  } catch (error: any) {
    console.error('Error sending acceptance notification:', error)
  }
}
