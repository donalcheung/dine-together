# Profile Editing Feature - Installation Instructions

## What's New

You can now:
- ✅ Click on your name in the dashboard to edit your profile
- ✅ Update your name, bio, dietary restrictions, and food preferences
- ✅ See your rating and review count
- ✅ Profile info shows to other users when they view your dining requests

## Files to Update

### 1. Create New Profile Page

**Create this new folder and file:**
- `app/profile/page.tsx`

**Copy the contents from:** `profile/page.tsx` (in the attached files)

### 2. Update Dashboard Navigation

**Replace this existing file:**
- `app/dashboard/page.tsx`

**With the updated version from:** `dashboard/page.tsx` (in the attached files)

## How to Install

### Option 1: Manual Copy/Paste (Easiest)

1. **Create the profile page:**
   - In VS Code, right-click on `app` folder → New Folder → name it `profile`
   - Right-click on `profile` folder → New File → name it `page.tsx`
   - Open the new file
   - Copy all the code from `profile/page.tsx` (provided below)
   - Paste it into your new file
   - Save (Ctrl+S)

2. **Update the dashboard:**
   - Open `app/dashboard/page.tsx` in VS Code
   - Select all (Ctrl+A)
   - Delete
   - Copy all the code from the updated `dashboard/page.tsx` (provided below)
   - Paste it
   - Save (Ctrl+S)

### Option 2: Using Git (If Running Locally)

If your local app is still running:

1. Stop the server (Ctrl+C in terminal)
2. Create the files as described above
3. Run `npm run dev` to restart
4. Test locally at http://localhost:3000

### Option 3: Deploy to Production

After making the changes locally:

1. Open terminal in VS Code
2. Run these commands:
   ```bash
   git add .
   git commit -m "Add profile editing feature"
   git push
   ```
3. Vercel will automatically deploy (wait 2-3 minutes)
4. Your live site will be updated!

## Testing the New Feature

1. Go to your dashboard
2. You should see your name is now clickable (with a hover effect)
3. Click on your name
4. You'll be taken to the profile editing page
5. Fill in your information:
   - **Name**: Your display name
   - **Bio**: Tell people about yourself (optional)
   - **Dietary Restrictions**: e.g., "Vegetarian, No shellfish"
   - **Food Preferences**: e.g., "Italian, Sushi, Thai"
6. Click "Save Changes"
7. Success message will appear
8. Go back to dashboard - your updated name will show

## What Users See

When someone views your dining request or wants to join your table, they'll see:
- Your name
- Your rating (with star)
- Your bio
- Your dietary restrictions
- Your food preferences

This helps people decide if you're a good match for dining together!

## Next Steps

After this is working, we can add:
1. Google Places API for restaurant autocomplete
2. Profile photo upload
3. View past dining history
4. Favorite restaurants

Let me know when you've got this working! 🎉
