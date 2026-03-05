'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowserClient } from '@/app/lib/supabase-browser'

type Report = {
  id: string
  reporter_id: string
  reported_user_id: string | null
  reported_content_id: string | null
  content_type: string
  reason: string
  description: string | null
  status: string
  admin_notes: string | null
  created_at: string
  resolved_at: string | null
  reporter_name?: string
  reporter_email?: string
  reported_name?: string
  reported_email?: string
}

export default function AdminReportsPage() {
  const supabase = createSupabaseBrowserClient()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'resolved' | 'dismissed'>('all')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadReports = useCallback(async () => {
    let query = supabase
      .from('user_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query

    if (data) {
      // Collect all user IDs
      const userIds = new Set<string>()
      data.forEach(r => {
        if (r.reporter_id) userIds.add(r.reporter_id)
        if (r.reported_user_id) userIds.add(r.reported_user_id)
      })

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', Array.from(userIds))

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

      const enriched = data.map(r => ({
        ...r,
        reporter_name: profileMap.get(r.reporter_id)?.name || 'Unknown',
        reporter_email: profileMap.get(r.reporter_id)?.email || 'Unknown',
        reported_name: r.reported_user_id ? (profileMap.get(r.reported_user_id)?.name || 'Unknown') : 'N/A',
        reported_email: r.reported_user_id ? (profileMap.get(r.reported_user_id)?.email || 'Unknown') : 'N/A',
      }))

      setReports(enriched)
    }
    setLoading(false)
  }, [supabase, filter])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleAction = async (reportId: string, newStatus: string) => {
    setActionLoading(true)

    await supabase
      .from('user_reports')
      .update({
        status: newStatus,
        admin_notes: adminNotes || null,
        resolved_at: ['resolved', 'dismissed'].includes(newStatus) ? new Date().toISOString() : null,
      })
      .eq('id', reportId)

    setAdminNotes('')
    await loadReports()

    // Update selected report
    if (selectedReport?.id === reportId) {
      setSelectedReport(prev => prev ? { ...prev, status: newStatus, admin_notes: adminNotes || null } : null)
    }
    setActionLoading(false)
  }

  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
      reviewing: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      resolved: { bg: 'bg-green-500/20', text: 'text-green-400' },
      dismissed: { bg: 'bg-gray-600', text: 'text-gray-300' },
    }
    const c = config[status] || config.pending
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text} capitalize`}>
        {status}
      </span>
    )
  }

  const reasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      harassment: 'Harassment',
      spam: 'Spam',
      inappropriate_content: 'Inappropriate Content',
      fake_profile: 'Fake Profile',
      safety_concern: 'Safety Concern',
      other: 'Other',
    }
    return labels[reason] || reason
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
          User Reports
        </h1>
        <p className="text-gray-400 mt-1">
          Review and manage reports submitted by users.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'reviewing', 'resolved', 'dismissed'] as const).map((f) => (
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
        {/* Reports List */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Reports ({reports.length})
          </h2>
          {reports.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 text-center">
              <p className="text-gray-400">No reports found for this filter.</p>
            </div>
          ) : (
            reports.map((report) => (
              <button
                key={report.id}
                onClick={() => { setSelectedReport(report); setAdminNotes(report.admin_notes || '') }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedReport?.id === report.id
                    ? 'bg-gray-700 border-orange-500/50'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-white text-sm">{reasonLabel(report.reason)}</p>
                  {statusBadge(report.status)}
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {report.content_type} &middot; Reported by {report.reporter_name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(report.created_at).toLocaleDateString()} {new Date(report.created_at).toLocaleTimeString()}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Report Detail */}
        <div>
          {selectedReport ? (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{reasonLabel(selectedReport.reason)}</h2>
                {statusBadge(selectedReport.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Reporter</p>
                  <p className="text-white font-medium">{selectedReport.reporter_name}</p>
                  <p className="text-gray-400 text-xs">{selectedReport.reporter_email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Reported User</p>
                  <p className="text-white font-medium">{selectedReport.reported_name}</p>
                  <p className="text-gray-400 text-xs">{selectedReport.reported_email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Content Type</p>
                  <p className="text-white capitalize">{selectedReport.content_type}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Date Reported</p>
                  <p className="text-white">{new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedReport.description && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Description</p>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-gray-300 text-sm">{selectedReport.description}</p>
                  </div>
                </div>
              )}

              {selectedReport.resolved_at && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Resolved At</p>
                  <p className="text-white text-sm">{new Date(selectedReport.resolved_at).toLocaleString()}</p>
                </div>
              )}

              {/* Admin Notes & Actions */}
              <div className="border-t border-gray-700 pt-4">
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-2 block">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:ring-1 focus:ring-orange-500 focus:border-transparent resize-none mb-3"
                />

                <div className="flex flex-wrap gap-2">
                  {selectedReport.status === 'pending' && (
                    <button
                      onClick={() => handleAction(selectedReport.id, 'reviewing')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Mark as Reviewing
                    </button>
                  )}
                  {(selectedReport.status === 'pending' || selectedReport.status === 'reviewing') && (
                    <>
                      <button
                        onClick={() => handleAction(selectedReport.id, 'resolved')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleAction(selectedReport.id, 'dismissed')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </>
                  )}
                  {(selectedReport.status === 'resolved' || selectedReport.status === 'dismissed') && (
                    <button
                      onClick={() => handleAction(selectedReport.id, 'pending')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-12 text-center">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
              <p className="text-gray-400">Select a report to view details and take action</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
