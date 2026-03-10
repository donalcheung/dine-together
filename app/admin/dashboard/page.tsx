'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/app/lib/supabase-browser'

type Stats = {
  totalUsers: number
  totalRestaurants: number
  pendingVerifications: number
  openReports: number
  totalDeals: number
  totalDiningRequests: number
  proSubscriptions: number
  recentSignups: number
}

type RecentUser = {
  id: string
  name: string
  email: string
  avatar_url: string | null
  verified: boolean
  gender: string | null
  age_range: string | null
  job_title: string | null
  company: string | null
  bio: string | null
  created_at: string
}

export default function AdminDashboardPage() {
  const supabase = createSupabaseBrowserClient()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRestaurants: 0,
    pendingVerifications: 0,
    openReports: 0,
    totalDeals: 0,
    totalDiningRequests: 0,
    proSubscriptions: 0,
    recentSignups: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])

  const loadStats = useCallback(async () => {
    const [
      { count: totalUsers },
      { count: totalRestaurants },
      { count: pendingVerifications },
      { count: openReports },
      { count: totalDeals },
      { count: totalDiningRequests },
      { count: proSubscriptions },
      { count: recentSignups },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('restaurants').select('*', { count: 'exact', head: true }),
      supabase.from('verification_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('user_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('restaurant_deals').select('*', { count: 'exact', head: true }),
      supabase.from('dining_requests').select('*', { count: 'exact', head: true }),
      supabase.from('restaurant_subscriptions').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ])

    setStats({
      totalUsers: totalUsers || 0,
      totalRestaurants: totalRestaurants || 0,
      pendingVerifications: pendingVerifications || 0,
      openReports: openReports || 0,
      totalDeals: totalDeals || 0,
      totalDiningRequests: totalDiningRequests || 0,
      proSubscriptions: proSubscriptions || 0,
      recentSignups: recentSignups || 0,
    })

    // Fetch recent signups list
    const { data: newUsers } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url, verified, gender, age_range, job_title, company, bio, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    if (newUsers) setRecentUsers(newUsers)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👤', color: 'from-blue-500 to-blue-600' },
    { label: 'Restaurants', value: stats.totalRestaurants, icon: '🍽️', color: 'from-orange-500 to-orange-600' },
    { label: 'Active Deals', value: stats.totalDeals, icon: '🏷️', color: 'from-green-500 to-green-600' },
    { label: 'Dining Requests', value: stats.totalDiningRequests, icon: '📋', color: 'from-purple-500 to-purple-600' },
    { label: 'Pro Subscriptions', value: stats.proSubscriptions, icon: '⭐', color: 'from-amber-500 to-amber-600' },
    { label: 'New Users (7d)', value: stats.recentSignups, icon: '📈', color: 'from-teal-500 to-teal-600' },
  ]

  const actionItems = [
    {
      label: 'Pending Verifications',
      count: stats.pendingVerifications,
      href: '/admin/dashboard/restaurants',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      description: 'Restaurant documents awaiting review',
    },
    {
      label: 'Open Reports',
      count: stats.openReports,
      href: '/admin/dashboard/reports',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      description: 'User reports requiring attention',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Fraunces, serif' }}>
          Admin Dashboard
        </h1>
        <p className="text-gray-400 mt-1">
          Overview of TableMesh platform activity.
        </p>
      </div>

      {/* Action Items */}
      {(stats.pendingVerifications > 0 || stats.openReports > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {actionItems.filter(item => item.count > 0).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`${item.bgColor} border border-gray-700 rounded-2xl p-5 hover:border-gray-600 transition-all group`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-3xl font-bold ${item.color}`}>{item.count}</span>
                <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <p className="font-semibold text-white text-sm">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-gray-800 border border-gray-700 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/admin/dashboard/restaurants"
            className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Review Restaurants</p>
              <p className="text-xs text-gray-400">Approve or reject verifications</p>
            </div>
          </Link>
          <Link
            href="/admin/dashboard/reports"
            className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Manage Reports</p>
              <p className="text-xs text-gray-400">Review user reports</p>
            </div>
          </Link>
          <Link
            href="/admin/dashboard/users"
            className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">View Users</p>
              <p className="text-xs text-gray-400">Browse all platform users</p>
            </div>
          </Link>
          <Link
            href="/partner"
            className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Partner Portal</p>
              <p className="text-xs text-gray-400">View restaurant-facing portal</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Signups */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Signups</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest users who joined the platform</p>
          </div>
          <Link
            href="/admin/dashboard/users"
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Profile</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {recentUsers.map((user) => {
                const profileFields = [user.name, user.bio, user.gender, user.age_range, user.job_title, user.company, user.avatar_url]
                const filledFields = profileFields.filter(Boolean).length
                const completeness = Math.round((filledFields / profileFields.length) * 100)
                const now = new Date()
                const created = new Date(user.created_at)
                const diffMs = now.getTime() - created.getTime()
                const diffMins = Math.floor(diffMs / 60000)
                const diffHours = Math.floor(diffMs / 3600000)
                const diffDays = Math.floor(diffMs / 86400000)
                let timeAgo = ''
                if (diffMins < 1) timeAgo = 'Just now'
                else if (diffMins < 60) timeAgo = `${diffMins}m ago`
                else if (diffHours < 24) timeAgo = `${diffHours}h ago`
                else if (diffDays < 7) timeAgo = `${diffDays}d ago`
                else timeAgo = created.toLocaleDateString()

                return (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm text-gray-400">{(user.name || '?')[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name || 'No name'}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {user.gender && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/15 text-purple-400">{user.gender}</span>
                        )}
                        {user.age_range && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/15 text-blue-400">{user.age_range}</span>
                        )}
                        {user.job_title && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/15 text-green-400 max-w-[120px] truncate">{user.job_title}</span>
                        )}
                        {!user.gender && !user.age_range && !user.job_title && (
                          <span className="text-xs text-gray-500 italic">No details yet</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${completeness}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{completeness}%</span>
                        {user.verified && (
                          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-400">{timeAgo}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {recentUsers.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400">No users found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
