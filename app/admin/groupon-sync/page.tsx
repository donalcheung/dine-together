'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Utensils, RefreshCw, Download, CheckCircle, AlertCircle, Loader, Tag } from 'lucide-react'

export default function AdminGrouponSyncPage() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [location, setLocation] = useState('new-york')
  const [limit, setLimit] = useState(50)

  // Common Groupon division IDs
  const cities = [
    { id: 'new-york', name: 'New York, NY' },
    { id: 'los-angeles', name: 'Los Angeles, CA' },
    { id: 'chicago', name: 'Chicago, IL' },
    { id: 'san-francisco', name: 'San Francisco, CA' },
    { id: 'boston', name: 'Boston, MA' },
    { id: 'washington-dc', name: 'Washington, DC' },
    { id: 'seattle', name: 'Seattle, WA' },
    { id: 'miami', name: 'Miami, FL' },
    { id: 'atlanta', name: 'Atlanta, GA' },
    { id: 'dallas', name: 'Dallas, TX' },
  ]

  const handleSync = async () => {
    setSyncing(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/sync-groupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          limit
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed')
      }

      setResult(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="w-7 h-7 text-[var(--primary)]" strokeWidth={2.5} />
            <h1 className="text-xl font-bold text-[var(--neutral)]">DineTogether</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[var(--neutral)] mb-2">
            Groupon Deals Sync
          </h2>
          <p className="text-gray-600 text-lg">
            Import REAL restaurant deals from Groupon
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Info Banner */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">✅ Groupon Sync Advantages:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Real deals</strong> - Actual discounts (50-90% off!)</li>
                  <li><strong>Verified</strong> - All restaurants are Groupon-verified</li>
                  <li><strong>Earn money</strong> - Get 10-20% commission on purchases</li>
                  <li><strong>No cost</strong> - Completely free API access</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sync Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Select the city to import deals from
              </p>
            </div>

            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
                Max Results
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
              >
                <option value={10}>10 deals</option>
                <option value={25}>25 deals</option>
                <option value={50}>50 deals</option>
                <option value={100}>100 deals</option>
              </select>
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-lg hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {syncing ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Syncing from Groupon...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Start Sync
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800 mb-1">Sync Failed</p>
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="text-sm text-red-600 mt-2">
                    Make sure your GROUPON_API_TOKEN and GROUPON_AFFILIATE_ID are set in environment variables
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-green-800 text-lg mb-1">Sync Complete!</p>
                  <p className="text-sm text-green-700">
                    Successfully imported real deals from Groupon
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {result.imported_restaurants}
                  </div>
                  <div className="text-sm text-gray-600">New Restaurants</div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {result.imported_deals}
                  </div>
                  <div className="text-sm text-gray-600">Real Deals</div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {Math.round(result.imported_deals * 0.15 * 25)}
                  </div>
                  <div className="text-sm text-gray-600">Est. Monthly Earnings*</div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                *Estimated commission at 15% average, assuming $25 average purchase per deal
              </p>

              <div className="mt-4 pt-4 border-t border-green-200">
                <Link
                  href="/restaurants"
                  className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
                >
                  View imported restaurants & deals →
                </Link>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">💡 How This Works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Users see real deals</strong> - 50-90% off vouchers</li>
                  <li><strong>Users click "Get Deal"</strong> - Redirected to Groupon</li>
                  <li><strong>Users purchase</strong> - You earn 10-20% commission</li>
                  <li><strong>Users redeem</strong> - At restaurant with voucher code</li>
                </ul>
                <p className="mt-2 text-xs text-blue-700">
                  Note: Deals link to Groupon (you're an affiliate). Restaurant owners can still add exclusive deals directly on your platform.
                </p>
              </div>
            </div>
          </div>

          {/* Attribution Required */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">⚠️ Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Must display "Deal via Groupon" on imported deals</li>
                  <li>Must link to Groupon for purchase (with your affiliate ID)</li>
                  <li>Groupon handles payment, customer service, refunds</li>
                  <li>You earn commission on completed purchases</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Link
              href="/restaurants"
              className="flex-1 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all text-center"
            >
              View Restaurants
            </Link>
            <Link
              href="/restaurants/manage"
              className="flex-1 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-all text-center"
            >
              Manage Deals
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
