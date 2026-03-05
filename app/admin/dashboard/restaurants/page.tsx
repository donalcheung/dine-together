'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowserClient } from '@/app/lib/supabase-browser'

type Restaurant = {
  id: string
  name: string
  address: string
  cuisine_type: string
  verification_status: string
  is_verified: boolean
  created_at: string
  owner_id: string
  owner_name?: string
  owner_email?: string
}

type VerificationDoc = {
  id: string
  restaurant_id: string
  document_type: string
  document_url: string
  file_name: string
  notes: string | null
  status: string
  review_notes: string | null
  created_at: string
}

export default function AdminRestaurantsPage() {
  const supabase = createSupabaseBrowserClient()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [documents, setDocuments] = useState<VerificationDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'unverified' | 'rejected'>('all')
  const [reviewNotes, setReviewNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadRestaurants = useCallback(async () => {
    let query = supabase
      .from('restaurants')
      .select('id, name, address, cuisine_type, verification_status, is_verified, created_at, owner_id')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('verification_status', filter)
    }

    const { data } = await query

    if (data) {
      // Fetch owner info for each restaurant
      const ownerIds = [...new Set(data.map(r => r.owner_id))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', ownerIds)

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

      const enriched = data.map(r => ({
        ...r,
        owner_name: profileMap.get(r.owner_id)?.name || 'Unknown',
        owner_email: profileMap.get(r.owner_id)?.email || 'Unknown',
      }))

      setRestaurants(enriched)
    }
    setLoading(false)
  }, [supabase, filter])

  useEffect(() => {
    loadRestaurants()
  }, [loadRestaurants])

  const loadDocuments = async (restaurantId: string) => {
    const { data } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })

    if (data) setDocuments(data)
  }

  const handleSelectRestaurant = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
    setReviewNotes('')
    await loadDocuments(restaurant.id)
  }

  const handleDocAction = async (docId: string, action: 'approved' | 'rejected') => {
    setActionLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    await supabase
      .from('verification_documents')
      .update({
        status: action,
        review_notes: reviewNotes || null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', docId)

    // Reload documents
    if (selectedRestaurant) {
      await loadDocuments(selectedRestaurant.id)
    }
    setReviewNotes('')
    setActionLoading(false)
  }

  const handleVerifyRestaurant = async (restaurantId: string, status: 'verified' | 'rejected') => {
    setActionLoading(true)

    await supabase
      .from('restaurants')
      .update({
        verification_status: status,
        is_verified: status === 'verified',
      })
      .eq('id', restaurantId)

    // Refresh
    await loadRestaurants()
    if (selectedRestaurant?.id === restaurantId) {
      setSelectedRestaurant(prev => prev ? { ...prev, verification_status: status, is_verified: status === 'verified' } : null)
    }
    setActionLoading(false)
  }

  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      unverified: { bg: 'bg-gray-600', text: 'text-gray-200' },
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
      verified: { bg: 'bg-green-500/20', text: 'text-green-400' },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-400' },
      approved: { bg: 'bg-green-500/20', text: 'text-green-400' },
    }
    const c = config[status] || config.unverified
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text} capitalize`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Fraunces, serif' }}>
          Restaurant Management
        </h1>
        <p className="text-gray-400 mt-1">
          Review restaurant registrations and manage verification documents.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'unverified', 'verified', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Restaurant List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Restaurants ({restaurants.length})
          </h2>
          {restaurants.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
              <p className="text-gray-400">No restaurants found for this filter.</p>
            </div>
          ) : (
            restaurants.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectRestaurant(r)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedRestaurant?.id === r.id
                    ? 'bg-gray-700 border-orange-500/50'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-white text-sm truncate">{r.name}</p>
                  {statusBadge(r.verification_status)}
                </div>
                <p className="text-xs text-gray-400 truncate">{r.address || 'No address'}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span>{r.owner_name}</span>
                  <span>&middot;</span>
                  <span>{r.cuisine_type || 'N/A'}</span>
                  <span>&middot;</span>
                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Restaurant Detail / Documents */}
        <div>
          {selectedRestaurant ? (
            <div className="space-y-4">
              {/* Restaurant Info */}
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">{selectedRestaurant.name}</h2>
                  {statusBadge(selectedRestaurant.verification_status)}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Owner</p>
                    <p className="text-white">{selectedRestaurant.owner_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="text-white text-xs">{selectedRestaurant.owner_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Address</p>
                    <p className="text-white">{selectedRestaurant.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cuisine</p>
                    <p className="text-white">{selectedRestaurant.cuisine_type || 'N/A'}</p>
                  </div>
                </div>

                {/* Verification Actions */}
                {selectedRestaurant.verification_status !== 'verified' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleVerifyRestaurant(selectedRestaurant.id, 'verified')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Approve Restaurant
                    </button>
                    <button
                      onClick={() => handleVerifyRestaurant(selectedRestaurant.id, 'rejected')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Reject Restaurant
                    </button>
                  </div>
                )}
                {selectedRestaurant.verification_status === 'verified' && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleVerifyRestaurant(selectedRestaurant.id, 'rejected')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors disabled:opacity-50"
                    >
                      Revoke Verification
                    </button>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Verification Documents ({documents.length})
                </h3>

                {documents.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">No documents submitted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="bg-gray-700/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-white capitalize">
                              {doc.document_type.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-gray-400">
                              {doc.file_name} &middot; {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {statusBadge(doc.status)}
                        </div>

                        {doc.notes && (
                          <p className="text-xs text-gray-400 mb-2 italic">
                            Note from owner: {doc.notes}
                          </p>
                        )}

                        {doc.review_notes && (
                          <p className="text-xs text-yellow-400 mb-2">
                            Review note: {doc.review_notes}
                          </p>
                        )}

                        {/* View document link */}
                        <a
                          href={doc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors mb-3"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                          View Document
                        </a>

                        {/* Actions for pending docs */}
                        {doc.status === 'pending' && (
                          <div className="border-t border-gray-600 pt-3 mt-2">
                            <textarea
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              placeholder="Review notes (optional)..."
                              rows={2}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-xs placeholder-gray-500 focus:ring-1 focus:ring-orange-500 focus:border-transparent resize-none mb-2"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDocAction(doc.id, 'approved')}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                Approve Doc
                              </button>
                              <button
                                onClick={() => handleDocAction(doc.id, 'rejected')}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                Reject Doc
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
              <p className="text-gray-400">Select a restaurant to view details and documents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
