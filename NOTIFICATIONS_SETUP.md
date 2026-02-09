# 📧 Email Notifications Setup Guide

TableMesh sends email notifications to users when important events happen in their dining requests. This guide walks you through setting up the email notification system.

## What Gets Notified?

1. **Host gets notified** when a user joins their request
2. **Guest gets notified** when the host accepts their join request

## Setup Steps

### Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Click "Sign Up"
3. Use your email and create an account
4. Verify your email (check your inbox)

### Step 2: Get Your API Key

1. After sign-up, go to the [API Keys dashboard](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it something like "TableMesh"
4. Copy the generated key

### Step 3: Add to Environment Variables

1. Open `.env.local` in your project root
2. Add this line:
   ```
   RESEND_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with the key you copied
4. Save the file

### Step 4: Restart Your Dev Server

1. If the dev server is running, stop it (Ctrl+C)
2. Run it again:
   ```bash
   npm run dev
   ```

### Step 5: Test It!

1. Go to http://localhost:3000
2. Create a dining request as one user
3. Log in as a different user
4. Join that request
5. Check the first user's email inbox - they should get a notification!

## Free Tier Limits

The Resend free tier includes:
- **100 emails per day** (perfect for testing and small apps)
- No credit card required
- Full feature access

Once you deploy to production with real users, you can upgrade to a paid plan.

## Production Deployment

When deploying to Vercel (or any hosting provider):

1. Add `RESEND_API_KEY` to your environment variables in the hosting dashboard
   - **Vercel**: Settings → Environment Variables
   - **Other platforms**: Check their docs for env var setup

2. The email domain will be `info@tablemesh.com` (Resend domain)
   - To use your own domain, configure it in Resend dashboard
   - This is optional - emails work fine with Resend domain

## Email Templates

Notifications are sent for:

### Join Request Notification (to host)
```
Subject: New Join Request for Your [Restaurant] Dinner 🎉
Shows: Guest name, restaurant name, link to view request
```

### Acceptance Notification (to guest)
```
Subject: Your Join Request Was Accepted! 🎉
Shows: Host name, restaurant name, dining time, link to view request
```

## Troubleshooting

### "RESEND_API_KEY not found"
- Add the key to `.env.local`
- Restart the dev server
- The key must start with `re_`

### Emails not sending
1. Check `.env.local` has the correct key
2. In Resend dashboard, verify your domain is verified
3. Check email spam folder
4. Look at browser console for error messages

### Getting "Cannot find module 'resend'"
- Run `npm install resend`
- The package is already in `package.json`, but might need reinstall

## API Endpoint Details

The email sending is handled by `/api/send-notification`:

**Location:** `app/api/send-notification/route.ts`

**Endpoint:** `POST /api/send-notification`

**Request body:**
```json
{
  "to": "user@example.com",
  "subject": "Your subject line",
  "html": "<html>Your email content</html>"
}
```

**Response:**
```json
{
  "id": "email_123",
  "from": "TableMesh <info@tablemesh.com>",
  "created_at": "2024-01-01T12:00:00.000Z"
}
```

## Custom Email Branding

To use your own domain instead of `info@tablemesh.com`:

1. In Resend dashboard, go to Senders
2. Add your domain
3. Follow DNS verification steps
4. Update the email sender in `app/api/send-notification/route.ts`:
   ```typescript
   from: 'TableMesh <noreply@yourdomain.com>',
   ```

## Customizing Email Templates

Email templates are in `lib/send-notification.ts`:
- `sendJoinNotification()` - Send when user joins
- `sendAcceptanceNotification()` - Send when host accepts

Edit the `html` variable to customize the email design.

## Next Steps

- ✅ Test emails in development
- ✅ Deploy to production
- ✅ Monitor email delivery in Resend dashboard
- ✅ Customize email templates to match your brand
- ✅ Add more email notifications (e.g., request completed, ratings)

---

**Questions?** Check the main README.md for more help!
