'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowserClient } from '@/app/lib/supabase-browser'

type VerificationDoc = {
  id: string
  document_type: string
  file_name: string
  status: string
  review_notes: string | null
  created_at: string
  reviewed_at: string | null
}

type Restaurant = {
  id: string
  name: string
  verification_status: string
}

const DOCUMENT_TYPES = [
  { value: 'business_license', label: 'Business License', description: 'Official business license or permit issued by your city or state' },
  { value: 'tax_certificate', label: 'Tax Certificate / EIN', description: 'Tax registration certificate or EIN documentation' },
  { value: 'utility_bill', label: 'Utility Bill', description: 'Recent utility bill showing the restaurant name and address' },
  { value: 'lease_agreement', label: 'Lease Agreement', description: 'Commercial lease showing the restaurant at the listed address' },
  { value: 'food_permit', label: 'Food Service Permit', description: 'Health department food service or food handler permit' },
  { value: 'other', label: 'Other Document', description: 'Any other document proving restaurant ownership' },
]

export default function VerificationPage() {
  const supabase = createSupabaseBrowserClient()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [documents, setDocuments] = useState<VerificationDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState('business_license')
  const [notes, setNotes] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: rest } = await supabase
      .from('restaurants')
      .select('id, name, verification_status')
      .eq('owner_id', user.id)
      .single()

    if (rest) {
      setRestaurant(rest)

      const { data: docs } = await supabase
        .from('verification_documents')
        .select('id, document_type, file_name, status, review_notes, created_at, reviewed_at')
        .eq('restaurant_id', rest.id)
        .order('created_at', { ascending: false })

      if (docs) setDocuments(docs)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setErrorMessage('')
    setSuccessMessage('')

    const formData = new FormData(e.currentTarget)
    const file = formData.get('document') as File

    if (!file || !file.name) {
      setErrorMessage('Please select a file to upload.')
      setUploading(false)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be under 10MB.')
      setUploading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !restaurant) throw new Error('Not authenticated')

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${restaurant.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get the URL
      const { data: urlData } = supabase.storage
        .from('verification-docs')
        .getPublicUrl(filePath)

      // Create verification document record
      const { error: insertError } = await supabase
        .from('verification_documents')
        .insert({
          restaurant_id: restaurant.id,
          uploaded_by: user.id,
          document_type: selectedType,
          document_url: urlData.publicUrl || filePath,
          file_name: file.name,
          notes: notes || null,
          status: 'pending',
        })

      if (insertError) throw insertError

      // Update restaurant verification status to pending if unverified
      if (restaurant.verification_status === 'unverified') {
        await supabase
          .from('restaurants')
          .update({ verification_status: 'pending' })
          .eq('id', restaurant.id)
        setRestaurant({ ...restaurant, verification_status: 'pending' })
      }

      // Notify admin via email (non-blocking)
      fetch('/api/notify-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: restaurant.name || 'Unknown',
          documentType: selectedType,
          fileName: file.name,
          notes: notes || undefined,
        }),
      }).catch(() => {}) // Non-fatal — don't block the UI

      setSuccessMessage('Document uploaded successfully! Our team will review it shortly.')
      setNotes('')
      // Reset file input
      ;(e.target as HTMLFormElement).reset()
      loadData()
    } catch (err) {
      console.error(err)
      setErrorMessage('Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    unverified: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Unverified' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Under Review' },
    verified: { bg: 'bg-green-100', text: 'text-green-700', label: 'Verified' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  }

  const docStatusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Review' },
    approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  const verStatus = statusConfig[restaurant?.verification_status || 'unverified']

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Fraunces, serif' }}>
          Verification
        </h1>
        <p className="text-gray-500 mt-1">
          Verify your restaurant ownership to build trust with diners and unlock features.
        </p>
      </div>

      {/* Verification Status Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${verStatus.bg} ${verStatus.text}`}>
            {verStatus.label}
          </span>
        </div>

        {restaurant?.verification_status === 'unverified' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div>
                <p className="font-medium text-amber-800">Your restaurant is not yet verified</p>
                <p className="text-sm text-amber-700 mt-1">
                  Upload at least one document below to start the verification process. Verified restaurants get a badge, higher visibility, and more trust from diners.
                </p>
              </div>
            </div>
          </div>
        )}

        {restaurant?.verification_status === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <div>
                <p className="font-medium text-blue-800">Your documents are being reviewed</p>
                <p className="text-sm text-blue-700 mt-1">
                  Our team is reviewing your submitted documents. This usually takes 1-2 business days. You can upload additional documents if needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {restaurant?.verification_status === 'verified' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
              <div>
                <p className="font-medium text-green-800">Your restaurant is verified!</p>
                <p className="text-sm text-green-700 mt-1">
                  Your restaurant displays a verified badge to all diners. This helps build trust and can increase deal engagement.
                </p>
              </div>
            </div>
          </div>
        )}

        {restaurant?.verification_status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <div>
                <p className="font-medium text-red-800">Verification was not approved</p>
                <p className="text-sm text-red-700 mt-1">
                  Please review the feedback on your documents below and upload new documents to try again.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Verification Document</h2>
        <p className="text-sm text-gray-500 mb-6">
          Upload a document that proves you own or manage this restaurant. Accepted formats: PDF, JPG, PNG (max 10MB).
        </p>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-5">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              {DOCUMENT_TYPES.find((t) => t.value === selectedType)?.description}
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document File</label>
            <input
              type="file"
              name="document"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional context about this document..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload Document'
            )}
          </button>
        </form>
      </div>

      {/* Submitted Documents */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Submitted Documents</h2>

        {documents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <p>No documents uploaded yet</p>
            <p className="text-sm mt-1">Upload your first document above to start verification.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const docStatus = docStatusConfig[doc.status] || docStatusConfig.pending
              const typeLabel = DOCUMENT_TYPES.find((t) => t.value === doc.document_type)?.label || doc.document_type
              return (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{typeLabel}</p>
                      <p className="text-xs text-gray-500">{doc.file_name} &middot; {new Date(doc.created_at).toLocaleDateString()}</p>
                      {doc.review_notes && (
                        <p className="text-xs text-red-600 mt-1">
                          <span className="font-medium">Feedback:</span> {doc.review_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${docStatus.bg} ${docStatus.text}`}>
                    {docStatus.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Benefits of Verification */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border border-orange-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Benefits of Verification</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
            <p className="font-medium text-sm text-gray-900">Verified Badge</p>
            <p className="text-xs text-gray-500 mt-1">A trust badge displayed on your profile and deals</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <p className="font-medium text-sm text-gray-900">Higher Visibility</p>
            <p className="text-xs text-gray-500 mt-1">Verified restaurants rank higher in search results</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <p className="font-medium text-sm text-gray-900">Diner Trust</p>
            <p className="text-xs text-gray-500 mt-1">Groups are more likely to redeem deals from verified restaurants</p>
          </div>
        </div>
      </div>
    </div>
  )
}
