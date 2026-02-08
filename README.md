# 🍽️ DineTogether - Share Meals, Split Bills, Make Memories

A modern web application that helps food lovers find dining companions to share dishes and split bills. Perfect for solo travelers, foodies who want to try multiple menu items, or anyone who wants to make dining more social!

## ✨ Features

- **Spontaneous Dining**: Post a dining request 1-3 hours before your meal
- **Smart Matching**: Browse nearby requests and connect with fellow diners
- **Reputation System**: Rate and review dining companions
- **Real-time Updates**: Get instant notifications when someone joins
- **User Profiles**: View ratings, dietary restrictions, and food preferences
- **Secure & Safe**: Public restaurant settings with verified profiles

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great!)
- A code editor (VS Code recommended)

### Step 1: Clone the Project

Download the `dine-together` folder to your computer.

### Step 2: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

### Step 3: Set Up Supabase

1. **Create a Supabase account** at https://supabase.com
2. **Create a new project**:
   - Click "New Project"
   - Choose a name (e.g., "dine-together")
   - Set a strong database password
   - Select a region close to you
   - Wait 2-3 minutes for setup

3. **Run the database schema**:
   - In your Supabase dashboard, go to "SQL Editor"
   - Click "New Query"
   - Copy the entire contents of `supabase-schema.sql`
   - Paste it into the editor
   - Click "Run" at the bottom

4. **Get your API keys**:
   - Go to "Project Settings" (gear icon in sidebar)
   - Click "API" in the left menu
   - Copy your `Project URL` and `anon public` key

### Step 4: Configure Environment Variables

1. In your project folder, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Step 5: Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser. You should see the DineTogether landing page!

## 🌐 Deploying to Vercel (FREE)

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. In your project folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com and sign up (use your GitHub account)
2. Click "Add New Project"
3. Import your `dine-together` repository
4. Add environment variables:
   - Click "Environment Variables"
   - Add `NEXT_PUBLIC_SUPABASE_URL` with your URL
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your key
5. Click "Deploy"
6. Wait 2-3 minutes for deployment to complete
7. Your app is now live! 🎉

Vercel will give you a URL like `dine-together.vercel.app`

### Optional: Add Custom Domain

1. Buy a domain from Namecheap, GoDaddy, etc.
2. In Vercel project settings, go to "Domains"
3. Add your domain and follow DNS instructions
4. Within an hour, your custom domain will work!

## 📱 Using the App

### For Diners Looking to Join:

1. Sign up/Sign in
2. Browse available dining requests on the dashboard
3. Click on a request to see details
4. Send a request to join with an optional message
5. Wait for the host to accept
6. Show up at the restaurant at the scheduled time!
7. Rate your dining companions after the meal

### For Hosts Creating Requests:

1. Sign up/Sign in
2. Click "Create Request"
3. Fill in:
   - Restaurant name and address
   - Dining time (typically 1-3 hours from now)
   - How many people you want to join
   - Optional description
4. Review and approve join requests
5. Meet your dining companions at the restaurant!
6. Rate each other after the meal

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 + React 18
- **Styling**: Tailwind CSS + Custom Design
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Hosting**: Vercel
- **Language**: TypeScript

## 📊 Database Schema

The app uses 4 main tables:

1. **profiles** - User information and ratings
2. **dining_requests** - Posted dining opportunities
3. **dining_joins** - Join requests and acceptances
4. **ratings** - Post-meal reviews

All tables have Row Level Security (RLS) enabled for data privacy.

## 🔒 Security Features

- Email-based authentication with Supabase Auth
- Row Level Security (RLS) on all database tables
- Server-side validation
- Secure API routes
- HTTPS encryption (automatic with Vercel)

## 🎨 Customization

### Change Colors

Edit `app/globals.css` and modify CSS variables:

```css
:root {
  --primary: #e8512d;      /* Main brand color */
  --accent: #f4a261;       /* Secondary accent */
  --neutral: #264653;      /* Dark text color */
}
```

### Change Fonts

Edit `tailwind.config.ts` to modify font families.

## 🐛 Troubleshooting

### "Error connecting to Supabase"
- Check that your `.env.local` file exists and has correct credentials
- Verify your Supabase project is active
- Make sure you ran the schema SQL in Supabase

### "Authentication error"
- Confirm email authentication is enabled in Supabase
- Go to Authentication → Providers → Email → Enable

### "Database error"
- Check that all tables were created successfully
- Verify RLS policies are enabled
- Look at Supabase logs for specific errors

### Build errors on Vercel
- Ensure all environment variables are set in Vercel
- Check build logs for specific error messages
- Make sure Node.js version matches (18+)

## 📈 Future Enhancements

Potential features to add:

- [ ] Google Maps integration for restaurant location
- [ ] Push notifications for join requests
- [ ] Bill splitting calculator
- [ ] Dietary restriction filters
- [ ] Distance-based sorting
- [ ] Photo uploads
- [ ] Chat messaging between diners
- [ ] Calendar integration
- [ ] Restaurant recommendations
- [ ] Group size preferences

## 🤝 Contributing

This is a prototype/MVP. Feel free to fork and customize for your needs!

## 📄 License

MIT License - feel free to use this code for your own projects!

## 💬 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs in your dashboard
3. Check browser console for client-side errors
4. Review Vercel deployment logs

## 🎉 Success!

If you've made it this far, congratulations! You now have a fully functional dining companion app. Share it with friends, post on social media, and start making meals more social!

Remember:
- Start with friends to build initial user base
- Focus on food-friendly cities (NYC, SF, Austin, Portland)
- Consider partnering with restaurants
- Gather user feedback early and often

Happy dining! 🍽️  
