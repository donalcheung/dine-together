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
  diningRequestCount: number
  lastLocation: string | null
  lastActivity: string | null
}

function extractCity(address: string | null): string | null {
  if (!address) return null
  const parts = address.split(',').map(p => p.trim()).filter(Boolean)
  if (parts.length >= 3) return parts[parts.length - 2]
  if (parts.length === 2) return parts[0]
  return parts[0].length > 25 ? parts[0].substring(0, 25) + '…' : parts[0]
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

export default function AdminUsersPage() {
  const supabase = createSupabaseBrowserClient()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    let query = supabase
      .from('profiles')
      .select('id, name, email, role, verified, created_at')
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

    // Fetch dining requests (for count, last location, last activity as host)
    const { data: diningRequests } = await supabase
      .from('dining_requests')
      .select('host_id, restaurant_address, created_at')
      .in('host_id', userIds)

    // Fetch dining joins (for last activity as guest)
    const { data: diningJoins } = await supabase
      .from('dining_joins')
      .select('user_id, created_at')
      .in('user_id', userIds)

    // Build per-user stats
    const statsMap = new Map<string, { count: number; lastLocation: string | null; lastActivity: string | null }>()

    for (const req of diningRequests || []) {
      const s = statsMap.get(req.host_id) || { count: 0, lastLocation: null, lastActivity: null }
      s.count++
      if (!s.lastLocation) s.lastLocation = req.restaurant_address
      if (!s.lastActivity || req.created_at > s.lastActivity) s.lastActivity = req.created_at
      statsMap.set(req.host_id, s)
    }

    for (const join of diningJoins || []) {
      const s = statsMap.get(join.user_id) || { count: 0, lastLocation: null, lastActivity: null }
      if (!s.lastActivity || join.created_at > s.lastActivity) s.lastActivity = join.created_at
      statsMap.set(join.user_id, s)
    }

    const enriched: User[] = data.map(u => {
      const s = statsMap.get(u.id)
      return {
        ...u,
        diningRequestCount: s?.count ?? 0,
        lastLocation: extractCity(s?.lastLocation ?? null),
        lastActivity: s?.lastActivity ?? null,
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

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } else {
      console.error('Failed to update role:', error.message)
    }
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
          {users.length} real {users.length === 1 ? 'user' : 'users'} — seed accounts excluded.
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dining Reqs</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Active</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
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
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      user.role === 'admin'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {user.lastLocation ? (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <span className="text-sm text-gray-300">{user.lastLocation}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {user.diningRequestCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400">
                        {user.diningRequestCount}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">0</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-gray-400">{timeAgo(user.lastActivity)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-3 text-right">
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
