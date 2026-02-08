'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Utensils, RefreshCw, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react'

export default function AdminYelpSyncPage() {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [location, setLocation] = useState('New York, NY')
  const [radius, setRadius] = useState(10000)
  const [limit, setLimit] = useState(50)

  const handleSync = async () => {
    setSyncing(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/sync-yelp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          radius,
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
            Yelp Data Sync
          </h2>
          <p className="text-gray-600 text-lg">
            Automatically import restaurants from Yelp
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">How Yelp Sync Works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Searches Yelp for restaurants in specified location</li>
                  <li>Imports restaurant data (name, address, cuisine, etc.)</li>
                  <li>Creates a sample "Lunch Special" deal for each</li>
                  <li>Restaurant owners can later claim and customize</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sync Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                placeholder="e.g., New York, NY or 10001"
              />
              <p className="mt-1 text-sm text-gray-500">
                City, state, or zip code
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-2">
                  Radius (meters)
                </label>
                <input
                  id="radius"
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  min="1000"
                  max="40000"
                  step="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {(radius / 1609.34).toFixed(1)} miles
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
                  <option value={10}>10 restaurants</option>
                  <option value={25}>25 restaurants</option>
                  <option value={50}>50 restaurants</option>
                </select>
              </div>
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
                Syncing from Yelp...
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
                    Make sure your YELP_API_KEY is set in .env.local
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
                    Successfully synced data from Yelp
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {result.imported}
                  </div>
                  <div className="text-sm text-gray-600">New Restaurants</div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {result.updated}
                  </div>
                  <div className="text-sm text-gray-600">Updated</div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-3xl font-bold text-gray-600 mb-1">
                    {result.total_scanned}
                  </div>
                  <div className="text-sm text-gray-600">Total Scanned</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-green-200">
                <Link
                  href="/restaurants"
                  className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
                >
                  View imported restaurants →
                </Link>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">⚠️ Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Yelp API allows 5,000 free calls per day</li>
                  <li>Each sync uses 1 API call</li>
                  <li>Imported restaurants are marked as "unverified"</li>
                  <li>Sample deals are created automatically</li>
                  <li>Restaurant owners can claim and customize later</li>
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
