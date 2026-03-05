'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowserClient } from '@/app/lib/supabase-browser'

type Restaurant = {
  id: string
  name: string
  address: string
  city: string
  verification_status: string
  is_demo: boolean
  created_at: string
}

export default function AdminPreviewPage() {
  const supabase = createSupabaseBrowserClient()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  const loadRestaurants = useCallback(async () => {
    const { data } = await supabase
      .from('restaurants')
      .select('id, name, address, city, verification_status, is_demo, created_at')
      .order('is_demo', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) setRestaurants(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadRestaurants()
  }, [loadRestaurants])

  const launchPreview = (restaurantId: string) => {
    window.open(`/partner/dashboard?preview=true&restaurant_id=${restaurantId}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const demoRestaurants = restaurants.filter(r => r.is_demo)
  const realRestaurants = restaurants.filter(r => !r.is_demo)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Fraunces, serif' }}>
          Preview Restaurant Portal
        </h1>
        <p className="text-gray-400 mt-1">
          View the partner dashboard exactly as a restaurant owner would see it. Preview mode is read-only and sandboxed.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
          </svg>
          <div>
            <p className="font-medium text-indigo-300">How Preview Mode Works</p>
            <p className="text-sm text-indigo-300/70 mt-1">
              Select a restaurant below to open its partner dashboard in a new tab. A purple banner will appear at the top indicating you are in preview mode. The dashboard loads real data from that restaurant but any write operations (creating deals, updating profile, etc.) will be blocked in preview mode to protect production data.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Restaurants */}
      {demoRestaurants.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full" />
            Demo Restaurants (Safe to Test)
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {demoRestaurants.map((r) => (
              <div key={r.id} className="bg-gray-800 border border-purple-500/30 rounded-2xl p-5 hover:border-purple-500/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">{r.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.city || r.address}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                    Demo
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  This is a sandbox restaurant with sample data. Perfect for testing the portal experience.
                </p>
                <button
                  onClick={() => launchPreview(r.id)}
                  className="w-full py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  Launch Preview
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real Restaurants */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-400 rounded-full" />
          Real Restaurants (View Only)
        </h2>
        {realRestaurants.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
            <p className="text-gray-400">No real restaurants registered yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {realRestaurants.map((r) => (
              <div key={r.id} className="bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-gray-600 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-white">{r.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.city || r.address}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    r.verification_status === 'verified'
                      ? 'bg-green-500/20 text-green-400'
                      : r.verification_status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {r.verification_status}
                  </span>
                </div>
                <button
                  onClick={() => launchPreview(r.id)}
                  className="w-full py-2.5 bg-gray-700 text-white rounded-xl text-sm font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  Preview as Owner
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
