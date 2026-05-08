'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowserClient } from '@/app/lib/supabase-browser'

type User = {
  id: string
  name: string
  email: string
  role: string
  verified: boolean
  created_at: string
  total_likes: number
  // derived stats
  publicRequests: number
  privateRequests: number
  joinAttempts: number
  joinAccepted: number
  likesGiven: number
  topPages: Array<{ page: string; count: number }>
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '—'
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const PAGE_LABELS: Record<string, string> = {
  explore: 'Explore',
  explore_city: 'City Feed',
  dine: 'Dining Request',
  account: 'My Profile',
}

function PageTag({ page }: { page: string }) {
  const colors: Record<string, string> = {
    explore: 'bg-blue-500/15 text-blue-400',
    explore_city: 'bg-cyan-500/15 text-cyan-400',
    dine: 'bg-orange-500/15 text-orange-400',
    account: 'bg-purple-500/15 text-purple-400',
  }
  return (
    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${colors[page] ?? 'bg-gray-600 text-gray-300'}`}>
      {PAGE_LABELS[page] ?? page}
    </span>
  )
}

export default function AdminUsersPage() {
  const supabase = createSupabaseBrowserClient()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('profiles')
      .select('id, name, email, role, verified, created_at, total_likes')
      .not('email', 'ilike', '%@tablemesh.com')
      .not('email', 'ilike', '%@tablemesh.app')
      .order('created_at', { ascending: false })
      .limit(100)

    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data } = await query
    if (!data) {
      setLoading(false)
      return
    }

    const userIds = data.map(u => u.id)

    const [
      { data: diningRequests },
      { data: diningJoins },
      { data: profileLikes },
      { data: pageEvents },
    ] = await Promise.all([
      supabase
        .from('dining_requests')
        .select('host_id, visibility')
        .in('host_id', userIds),
      supabase
        .from('dining_joins')
        .select('user_id, status')
        .in('user_id', userIds),
      supabase
        .from('profile_likes')
        .select('from_user_id')
        .in('from_user_id', userIds),
      supabase
        .from('page_events')
        .select('user_id, page')
        .in('user_id', userIds),
    ])

    // Build per-user stats
    const statsMap = new Map<string, {
      publicRequests: number
      privateRequests: number
      joinAttempts: number
      joinAccepted: number
      likesGiven: number
      pageCounts: Record<string, number>
    }>()

    const defaultStats = () => ({
      publicRequests: 0,
      privateRequests: 0,
      joinAttempts: 0,
      joinAccepted: 0,
      likesGiven: 0,
      pageCounts: {} as Record<string, number>,
    })

    for (const req of diningRequests || []) {
      const s = statsMap.get(req.host_id) || defaultStats()
      if (req.visibility === 'public') s.publicRequests++
      else s.privateRequests++
      statsMap.set(req.host_id, s)
    }

    for (const join of diningJoins || []) {
      const s = statsMap.get(join.user_id) || defaultStats()
      s.joinAttempts++
      if (join.status === 'accepted') s.joinAccepted++
      statsMap.set(join.user_id, s)
    }

    for (const like of profileLikes || []) {
      const s = statsMap.get(like.from_user_id) || defaultStats()
      s.likesGiven++
      statsMap.set(like.from_user_id, s)
    }

    for (const ev of pageEvents || []) {
      const s = statsMap.get(ev.user_id) || defaultStats()
      s.pageCounts[ev.page] = (s.pageCounts[ev.page] || 0) + 1
      statsMap.set(ev.user_id, s)
    }

    const enriched: User[] = data.map(u => {
      const s = statsMap.get(u.id) || defaultStats()
      const topPages = Object.entries(s.pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([page, count]) => ({ page, count }))
      return {
        ...u,
        publicRequests: s.publicRequests,
        privateRequests: s.privateRequests,
        joinAttempts: s.joinAttempts,
        joinAccepted: s.joinAccepted,
        likesGiven: s.likesGiven,
        topPages,
      }
    })

    setUsers(enriched)
    setLoading(false)
  }, [supabase, roleFilter, search])

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadUsers()
    }, 300)
    return () => clearTimeout(debounce)
  }, [loadUsers])

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    setActionLoading(userId)
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    setActionLoading(null)
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
          Users
        </h1>
        <p className="text-gray-400 mt-1">
          {users.length} real {users.length === 1 ? 'user' : 'users'} — seed accounts excluded. Click a row to expand.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-1 focus:ring-orange-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'user', 'admin'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                roleFilter === f
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              {f === 'all' ? 'All Roles' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Requests</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joins</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Likes</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Pages</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {users.map((user) => (
                <>
                  <tr
                    key={user.id}
                    onClick={() => setExpanded(expanded === user.id ? null : user.id)}
                    className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                  >
                    {/* User */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {user.verified && (
                          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                          </svg>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{user.name || 'No name'}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        user.role === 'admin'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Dining Requests: public / private */}
                    <td className="px-5 py-3">
                      {user.publicRequests + user.privateRequests === 0 ? (
                        <span className="text-xs text-gray-600">—</span>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {user.publicRequests > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-400">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
                              </svg>
                              {user.publicRequests} pub
                            </span>
                          )}
                          {user.privateRequests > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                              </svg>
                              {user.privateRequests} priv
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Join attempts */}
                    <td className="px-5 py-3">
                      {user.joinAttempts === 0 ? (
                        <span className="text-xs text-gray-600">—</span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400">
                            {user.joinAttempts} tried
                          </span>
                          {user.joinAccepted > 0 && (
                            <span className="block text-xs text-green-400">{user.joinAccepted} accepted</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Profile likes given / received */}
                    <td className="px-5 py-3">
                      {user.likesGiven === 0 && user.total_likes === 0 ? (
                        <span className="text-xs text-gray-600">—</span>
                      ) : (
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          {user.likesGiven > 0 && (
                            <span className="text-pink-400 font-medium">{user.likesGiven} given</span>
                          )}
                          {user.total_likes > 0 && (
                            <span className="text-amber-400 font-medium">{user.total_likes} received</span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Top pages */}
                    <td className="px-5 py-3">
                      {user.topPages.length === 0 ? (
                        <span className="text-xs text-gray-600">—</span>
                      ) : (
                        <div className="flex items-center gap-1 flex-wrap">
                          {user.topPages.map(p => (
                            <span key={p.page} className="inline-flex items-center gap-0.5">
                              <PageTag page={p.page} />
                              <span className="text-xs text-gray-500">×{p.count}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString()}</p>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleAdmin(user.id, user.role)}
                        disabled={actionLoading === user.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          user.role === 'admin'
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                            : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                        }`}
                      >
                        {actionLoading === user.id ? '...' : user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expanded === user.id && (
                    <tr key={`${user.id}-detail`} className="bg-gray-900/50">
                      <td colSpan={8} className="px-5 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {/* Dining requests breakdown */}
                          <div className="bg-gray-800 rounded-xl p-3 space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Dining Requests</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">Public</span>
                              <span className="text-sm font-bold text-green-400">{user.publicRequests}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">Private</span>
                              <span className="text-sm font-bold text-gray-400">{user.privateRequests}</span>
                            </div>
                          </div>

                          {/* Join attempts */}
                          <div className="bg-gray-800 rounded-xl p-3 space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Join Attempts</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">Total tried</span>
                              <span className="text-sm font-bold text-purple-400">{user.joinAttempts}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">Accepted</span>
                              <span className="text-sm font-bold text-green-400">{user.joinAccepted}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">Rejected</span>
                              <span className="text-sm font-bold text-red-400">{user.joinAttempts - user.joinAccepted}</span>
                            </div>
                          </div>

                          {/* Profile swipes/likes */}
                          <div className="bg-gray-800 rounded-xl p-3 space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Profile Likes</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">Given (swiped)</span>
                              <span className="text-sm font-bold text-pink-400">{user.likesGiven}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-300">Received</span>
                              <span className="text-sm font-bold text-amber-400">{user.total_likes}</span>
                            </div>
                          </div>

                          {/* Page activity */}
                          <div className="bg-gray-800 rounded-xl p-3 space-y-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pages Visited</p>
                            {user.topPages.length === 0 ? (
                              <p className="text-xs text-gray-500 italic">No data yet</p>
                            ) : (
                              user.topPages.map(p => (
                                <div key={p.page} className="flex items-center justify-between">
                                  <span className="text-xs text-gray-300">{PAGE_LABELS[p.page] ?? p.page}</span>
                                  <span className="text-sm font-bold text-blue-400">{p.count}×</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400">No users found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
