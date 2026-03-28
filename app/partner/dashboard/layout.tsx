'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { createSupabaseBrowserClient } from '../../lib/supabase-browser'
import { PreviewProvider, usePreview } from '@/app/lib/preview-context'
import PreviewBanner from '@/app/components/PreviewBanner'

interface Restaurant {
  id: string
  name: string
  is_verified: boolean
}

interface Subscription {
  plan: string
  status: string
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isPreviewMode, previewRestaurantId, exitPreview } = usePreview()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    const loadData = async () => {
      // In preview mode, load the specified restaurant
      if (isPreviewMode && previewRestaurantId) {
        const { data: rest } = await supabase
          .from('restaurants')
          .select('id, name, is_verified')
          .eq('id', previewRestaurantId)
          .single()

        if (rest) {
          setRestaurant(rest)

          const { data: sub } = await supabase
            .from('restaurant_subscriptions')
            .select('plan, status')
            .eq('restaurant_id', rest.id)
            .single()

          setSubscription(sub)
        }
        setLoading(false)
        return
      }

      // Normal mode - check auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/partner/login')
        return
      }

      const { data: rest } = await supabase
        .from('restaurants')
        .select('id, name, is_verified')
        .eq('owner_id', user.id)
        .single()

      if (!rest) {
        router.push('/partner/signup')
        return
      }

      setRestaurant(rest)

      const { data: sub } = await supabase
        .from('restaurant_subscriptions')
        .select('plan, status')
        .eq('restaurant_id', rest.id)
        .single()

      setSubscription(sub)

      // Verification gate: redirect unverified partners to verification page
      // Allow access to: overview, profile, verification itself
      const ALLOWED_UNVERIFIED = [
        '/partner/dashboard',
        '/partner/dashboard/profile',
        '/partner/dashboard/verification',
      ]
      const currentPath = window.location.pathname
      if (!rest.is_verified && !ALLOWED_UNVERIFIED.includes(currentPath)) {
        router.push('/partner/dashboard/verification')
        return
      }

      setLoading(false)
    }

    loadData()
  }, [supabase, router, isPreviewMode, previewRestaurantId])

  const handleSignOut = async () => {
    if (isPreviewMode) {
      exitPreview()
      return
    }
    await supabase.auth.signOut()
    router.push('/partner/login')
  }

  // Build nav hrefs with preview params preserved
  const buildHref = (base: string) => {
    if (isPreviewMode && previewRestaurantId) {
      return `${base}?preview=true&restaurant_id=${previewRestaurantId}`
    }
    return base
  }

  const navItems = [
    { href: '/partner/dashboard', label: 'Overview', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    )},
    { href: '/partner/dashboard/profile', label: 'Restaurant Profile', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
      </svg>
    )},
    { href: '/partner/dashboard/deals', label: 'Deals', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
      </svg>
    )},
    { href: '/partner/dashboard/analytics', label: 'Analytics', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    )},
    { href: '/partner/dashboard/verification', label: 'Verification', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    )},
    { href: '/partner/dashboard/billing', label: 'Billing & Plan', icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      </svg>
    )},
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Banner */}
      <PreviewBanner />

      {/* Mobile header */}
      <div className={`lg:hidden fixed ${isPreviewMode ? 'top-[44px]' : 'top-0'} w-full bg-white z-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between`}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="TableMesh" width={28} height={28} className="rounded-lg" />
          <span className="font-bold text-[var(--neutral)]">TableMesh</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed ${isPreviewMode ? 'top-[44px]' : 'top-0'} left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <Link href="/partner" className="flex items-center gap-3 mb-8">
            <Image src="/logo.png" alt="TableMesh" width={36} height={36} className="rounded-xl" />
            <div>
              <span className="text-lg font-bold text-[var(--neutral)] block" style={{ fontFamily: 'Fraunces, serif' }}>TableMesh</span>
              <span className="text-xs text-[var(--primary)] font-semibold">Partner Portal</span>
            </div>
          </Link>

          {/* Restaurant info */}
          <div className={`rounded-xl p-3 mb-6 ${isPreviewMode ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
            <p className="font-semibold text-sm text-[var(--neutral)] truncate">{restaurant?.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 capitalize">{subscription?.plan || 'free'} plan</span>
            </div>
            {isPreviewMode && (
              <p className="text-xs text-purple-500 font-medium mt-1">Preview Mode</p>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const GATED_PATHS = ['/partner/dashboard/deals', '/partner/dashboard/analytics', '/partner/dashboard/billing']
              const isLocked = !restaurant?.is_verified && !isPreviewMode && GATED_PATHS.includes(item.href)
              return (
                <Link
                  key={item.href}
                  href={isLocked ? buildHref('/partner/dashboard/verification') : buildHref(item.href)}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-50 text-[var(--primary)]'
                      : isLocked
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--neutral)]'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {isLocked && (
                    <svg className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
          {!isPreviewMode && subscription?.plan === 'free' && (
            <Link
              href="/partner/dashboard/billing"
              className="block w-full py-2.5 px-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl text-sm font-semibold text-center mb-3 hover:shadow-lg transition-all"
            >
              Upgrade to Pro
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors w-full px-3 py-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            {isPreviewMode ? 'Exit Preview' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`lg:ml-64 ${isPreviewMode ? 'pt-[60px] lg:pt-[44px]' : 'pt-16 lg:pt-0'} min-h-screen`}>
        <div className="p-6 lg:p-8">
          {/* Verification banner for unverified partners */}
          {!restaurant?.is_verified && !isPreviewMode && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">Verification required</p>
                <p className="text-xs text-amber-700 mt-0.5">Your restaurant must be verified before you can post deals, view analytics, or upgrade your plan. Deals, Analytics, and Billing are locked until verification is complete.</p>
              </div>
              <Link href="/partner/dashboard/verification" className="flex-shrink-0 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                Get Verified
              </Link>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PreviewProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      }>
        <DashboardContent>{children}</DashboardContent>
      </Suspense>
    </PreviewProvider>
  )
}
