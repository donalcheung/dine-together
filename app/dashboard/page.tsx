// =====================================================
// DASHBOARD NAVIGATION UPDATE
// =====================================================
// Add this to your dashboard page navigation section

// 1. ADD IMPORT at the top of your dashboard page.tsx:
import { Store } from 'lucide-react'

// 2. REPLACE your navigation section with this updated version:

{/* Navigation */}
<nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    <Link href="/dashboard" className="flex items-center gap-2">
      <Utensils className="w-8 h-8 text-[var(--primary)]" strokeWidth={2.5} />
      <h1 className="text-2xl font-bold text-[var(--neutral)]">DineTogether</h1>
    </Link>
    
    <div className="flex items-center gap-4">
      {/* NEW: Browse Restaurants Link */}
      <Link
        href="/restaurants"
        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-all font-medium border border-purple-200"
      >
        <Store className="w-5 h-5" />
        Browse Deals
      </Link>

      <Link
        href="/create"
        className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg font-medium"
      >
        <Plus className="w-5 h-5" />
        Create Request
      </Link>
      
      {profile && (
        <Link
          href="/profile"
          className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-gray-200 hover:border-[var(--primary)] transition-all group"
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center text-white text-sm font-bold">
              {profile.name[0]?.toUpperCase()}
            </div>
          )}
          <span className="font-medium text-[var(--neutral)] group-hover:text-[var(--primary)]">{profile.name}</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">{profile.rating.toFixed(1)}</span>
          </div>
        </Link>
      )}
      
      <button
        onClick={handleSignOut}
        className="p-2 text-gray-600 hover:text-[var(--primary)] transition-colors"
        title="Sign Out"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  </div>
</nav>

// =====================================================
// ALTERNATIVE: Add to existing nav (if you prefer)
// =====================================================
// If you want to keep your current nav and just add the restaurant link,
// add this button right before your "Create Request" button:

<Link
  href="/restaurants"
  className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-all font-medium border border-purple-200"
>
  <Store className="w-5 h-5" />
  Browse Deals
</Link>
