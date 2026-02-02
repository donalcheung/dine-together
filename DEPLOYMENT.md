# 🚀 Deployment Guide - Step by Step

This guide will walk you through deploying DineTogether to production. The entire process takes about 30 minutes and costs $0 (using free tiers).

## Part 1: Setting Up Supabase (Database & Auth)

### 1.1 Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (easiest) or email
4. Verify your email if required

### 1.2 Create New Project

1. After signing in, click "New Project"
2. Fill in the details:
   - **Name**: `dine-together` (or your choice)
   - **Database Password**: Use a strong password (save this!)
   - **Region**: Choose closest to your target users
   - **Pricing Plan**: Free (included with account)
3. Click "Create new project"
4. Wait 2-3 minutes while Supabase sets up your database

### 1.3 Set Up Database Schema

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click the "+ New query" button
3. Open the `supabase-schema.sql` file from your project
4. Copy ALL the contents (Ctrl+A, Ctrl+C)
5. Paste into the SQL Editor
6. Click "Run" button at the bottom right
7. You should see "Success. No rows returned"

### 1.4 Verify Tables Created

1. Click "Table Editor" in the left sidebar
2. You should see 4 tables:
   - profiles
   - dining_requests
   - dining_joins
   - ratings
3. If you see all 4, you're good! ✅

### 1.5 Get Your API Credentials

1. Click the "Settings" gear icon (bottom left)
2. Click "API" in the settings menu
3. You'll see two important values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...` (long string)
4. Keep this tab open - you'll need these values soon!

## Part 2: Preparing Your Code

### 2.1 Install Git (if not already installed)

**Windows:**
- Download from https://git-scm.com/download/win
- Run installer with default settings

**Mac:**
- Open Terminal
- Run: `git --version`
- If not installed, it will prompt you to install Xcode Command Line Tools

**Linux:**
```bash
sudo apt-get install git
```

### 2.2 Create GitHub Repository

1. Go to https://github.com and sign in (or create account)
2. Click the "+" icon in top right → "New repository"
3. Name it `dine-together` (or your choice)
4. Set to **Public** (required for free Vercel hosting)
5. Do NOT initialize with README (we have our own)
6. Click "Create repository"
7. Copy the repository URL (looks like: `https://github.com/username/dine-together.git`)

### 2.3 Set Up Environment Variables Locally

1. In your `dine-together` project folder, find `.env.local.example`
2. Create a copy and name it `.env.local`:
   - **Windows**: Right-click → Copy → Paste → Rename to `.env.local`
   - **Mac/Linux**: In terminal, run: `cp .env.local.example .env.local`
3. Open `.env.local` in a text editor
4. Paste your Supabase credentials from earlier:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your_actual_key_here
   ```
5. Save the file

### 2.4 Test Locally (Optional but Recommended)

1. Open terminal in your project folder
2. Run:
   ```bash
   npm install
   npm run dev
   ```
3. Open http://localhost:3000
4. Try creating an account and signing in
5. If it works, you're ready to deploy! 🎉
6. Press Ctrl+C in terminal to stop the dev server

### 2.5 Push Code to GitHub

1. Open terminal in your project folder
2. Run these commands one by one:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - DineTogether app"

# Set main branch
git branch -M main

# Add your GitHub repository (replace with your actual URL!)
git remote add origin https://github.com/YOUR_USERNAME/dine-together.git

# Push to GitHub
git push -u origin main
```

3. Refresh your GitHub repository page - you should see all your code! ✅

## Part 3: Deploying to Vercel

### 3.1 Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub" (easiest)
4. Authorize Vercel to access your GitHub

### 3.2 Import Your Project

1. After signing in, click "Add New..." → "Project"
2. You'll see a list of your GitHub repositories
3. Find `dine-together` and click "Import"
4. Vercel will detect it's a Next.js project automatically

### 3.3 Configure Environment Variables

**This is the most important step!**

1. Scroll down to "Environment Variables"
2. Add your first variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase project URL (from earlier)
   - Click "Add"
3. Add your second variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key (from earlier)
   - Click "Add"
4. Make sure both show "Production, Preview, and Development" selected

### 3.4 Deploy!

1. Click "Deploy" button
2. Wait 2-3 minutes while Vercel builds your app
3. You'll see a celebration animation when done! 🎊
4. Click "Continue to Dashboard"

### 3.5 Get Your Live URL

1. You'll see a big preview of your site
2. Your app URL will be something like:
   - `dine-together.vercel.app`
   - Or `dine-together-username.vercel.app`
3. Click the URL to visit your live app!
4. **Test it**: Create an account, sign in, create a dining request

## Part 4: Custom Domain (Optional)

If you want `www.yourdomain.com` instead of `yourapp.vercel.app`:

### 4.1 Buy a Domain

Popular domain registrars:
- **Namecheap**: ~$10-15/year
- **GoDaddy**: ~$12-20/year  
- **Google Domains**: ~$12/year
- **Cloudflare**: ~$10/year

### 4.2 Add Domain to Vercel

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Enter your domain (e.g., `dinetogether.com`)
4. Click "Add"
5. Vercel will show you DNS records to add

### 4.3 Configure DNS

1. Log in to your domain registrar
2. Find DNS settings (usually under "DNS Management" or "Nameservers")
3. Add the records Vercel provided:
   - **Type**: A or CNAME
   - **Name**: @ (for root domain) or www
   - **Value**: The value Vercel gave you
4. Save DNS records
5. Wait 10-60 minutes for DNS to propagate
6. Your custom domain will be live!

## Part 5: Post-Deployment Tasks

### 5.1 Enable Email Confirmations (Optional)

1. In Supabase dashboard, go to "Authentication" → "Providers"
2. Click on "Email"
3. Toggle "Confirm email" on/off based on preference
4. If on, users must verify email before signing in

### 5.2 Set Up Production URL in Supabase

1. In Supabase dashboard, go to "Authentication" → "URL Configuration"
2. Add your Vercel URL to "Site URL":
   - `https://dine-together.vercel.app`
3. Add to "Redirect URLs":
   - `https://dine-together.vercel.app/**`
4. Click "Save"

### 5.3 Test Everything

Go through the full user flow:
1. ✅ Visit your live site
2. ✅ Create a new account
3. ✅ Sign in
4. ✅ Create a dining request
5. ✅ View the dashboard
6. ✅ View a request detail page
7. ✅ Sign out and sign back in

## Troubleshooting Common Issues

### Issue: "Error connecting to database"
**Solution**: 
- Double-check environment variables in Vercel
- Make sure there are no extra spaces in the values
- Verify your Supabase project is active

### Issue: "Authentication error"
**Solution**:
- In Supabase, go to Authentication → Providers → Email
- Make sure "Email" provider is enabled
- Check "Site URL" matches your Vercel URL

### Issue: Build fails on Vercel
**Solution**:
- Check the build logs in Vercel for specific error
- Common fix: Make sure all environment variables are set
- Try redeploying: Deployments → Click "..." → "Redeploy"

### Issue: "Database doesn't exist" error
**Solution**:
- You probably forgot to run the schema SQL
- Go back to Supabase SQL Editor
- Run the `supabase-schema.sql` file again

### Issue: Pages are blank after deployment
**Solution**:
- Check browser console (F12) for errors
- Verify environment variables are set correctly
- Make sure Supabase project URL uses `https://` not `http://`

## Updating Your App

When you make changes to your code:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

2. **Vercel automatically redeploys!** 
   - No manual action needed
   - Takes 2-3 minutes
   - Check deployment status in Vercel dashboard

## Monitoring Your App

### View Logs in Vercel:
1. Go to your project in Vercel
2. Click "Logs" tab
3. See real-time logs of errors and requests

### View Database in Supabase:
1. Go to Table Editor
2. Click on any table to see data
3. Manually edit data if needed (useful for testing)

### Check Usage:
- **Supabase**: Dashboard → Settings → Usage
- **Vercel**: Project → Settings → Usage

Both have generous free tiers that should handle hundreds of users!

## Cost Breakdown

**Free tier includes:**
- Supabase: 500MB database, 50k monthly users
- Vercel: Unlimited deployments, 100GB bandwidth
- Total cost: **$0/month** until you scale significantly!

**When you might need to upgrade:**
- Supabase Pro ($25/mo): 8GB database, more users
- Vercel Pro ($20/mo): More bandwidth, advanced features
- Custom domain: $10-20/year (one-time annual fee)

## Success Checklist

Before sharing your app, verify:

- [ ] Live URL works
- [ ] Can create account
- [ ] Can sign in/out
- [ ] Can create dining request
- [ ] Real-time updates work
- [ ] Mobile-responsive (test on phone)
- [ ] Environment variables set in Vercel
- [ ] Database tables created in Supabase
- [ ] SSL certificate active (URL shows lock icon)

## 🎉 You're Live!

Congratulations! Your app is now:
- ✅ Deployed to production
- ✅ Running on fast global infrastructure
- ✅ Secured with HTTPS
- ✅ Backed by a professional database
- ✅ Ready for real users!

**Next steps:**
1. Share with friends to test
2. Post on social media
3. Gather feedback
4. Iterate and improve
5. Build your user base!

Happy dining! 🍽️
