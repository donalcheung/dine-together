# 🚀 Quick Start - Get Your App Running in 10 Minutes

## What You Have

A complete, production-ready dining companion app with:
- Beautiful, modern UI
- User authentication
- Real-time updates
- Database backend
- Ready to deploy

## Three Simple Steps

### 1️⃣ Install Dependencies (2 minutes)

Open terminal in the `dine-together` folder and run:

```bash
npm install
```

### 2️⃣ Set Up Supabase (5 minutes)

1. Go to https://supabase.com and create a free account
2. Click "New Project" and create one
3. Go to SQL Editor → New Query
4. Copy ALL contents from `supabase-schema.sql` and paste it
5. Click "Run"
6. Go to Settings → API and copy:
   - Project URL
   - anon public key

### 3️⃣ Configure & Run (3 minutes)

1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials to `.env.local`
3. **Optional: Set up Email Notifications**
   - Go to https://resend.com and sign up (free)
   - Get your API key from the dashboard
   - Add to `.env.local`: `RESEND_API_KEY=your_key_here`
   - Notifications will now be sent when users join requests!
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Open http://localhost:3000

**That's it!** 🎉

## To Deploy to Production

Follow the detailed guide in `DEPLOYMENT.md` - takes about 20-30 minutes total.

The entire stack is FREE:
- Supabase free tier: 500MB database
- Vercel free tier: Unlimited deployments
- Resend free tier: 100 emails/day (perfect for testing!)
- Custom domain: Optional (~$12/year)

## Need Help?

1. Check `README.md` for full documentation
2. Check `DEPLOYMENT.md` for deployment guide
3. Check troubleshooting sections in both guides

## File Structure

```
dine-together/
├── app/                    # Next.js pages
│   ├── page.tsx           # Landing page
│   ├── auth/              # Login/signup
│   ├── dashboard/         # Browse requests
│   ├── create/            # Create request
│   └── request/[id]/      # Request details
├── lib/                   # Utilities
│   └── supabase.ts        # Database config
├── supabase-schema.sql    # Database setup
├── README.md              # Full documentation
├── DEPLOYMENT.md          # Deployment guide
└── package.json           # Dependencies

```

## What This App Does

**For Users:**
- Browse nearby dining requests
- Join others for meals
- Share dishes, split bills
- Rate dining companions

**For Hosts:**
- Post dining plans 1-3 hours ahead
- Specify restaurant and group size
- Accept/decline join requests
- Build reputation through ratings

Perfect for:
- Solo travelers wanting company
- Foodies wanting to try more dishes
- People looking to make friends over food
- Anyone who loves dining but hates eating alone

---

**Built with:** Next.js, React, TypeScript, Tailwind CSS, Supabase

**Deployment:** Vercel (free tier works!)

**Time to deploy:** ~30 minutes total

Good luck! 🍽️
