'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Utensils, ArrowLeft, Users, Settings, Copy, Check, Crown, LogOut, MapPin, Clock, Plus, Trash2, UserX } from 'lucide-react'
import { supabase, Group, GroupMember, DiningRequest, Profile } from '@/lib/supabase'

export default function GroupDetailPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [requests, setRequests] = useState<DiningRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userMember, setUserMember] = useState<GroupMember | null>(null)

  useEffect(() => {
    checkUser()
    loadGroup()
    loadMembers()
    loadGroupRequests()
  }, [groupId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }
    
    setUser(user)
  }

  const loadGroup = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          creator:profiles!groups_created_by_fkey(*)
        `)
        .eq('id', groupId)
        .single()

      if (error) throw error
      setGroup(data)
    } catch (error) {
      console.error('Error loading group:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true })

      if (error) throw error
      setMembers(data || [])

      // Check if current user is admin
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const currentUserMember = data?.find(m => m.user_id === user.id)
        setUserMember(currentUserMember || null)
        setIsAdmin(currentUserMember?.role === 'admin' || false)
      }
    } catch (error) {
      console.error('Error loading members:', error)
    }
  }

  const loadGroupRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('dining_requests')
        .select(`
          *,
          host:profiles!dining_requests_host_id_fkey(*)
        `)
        .eq('group_id', groupId)
        .order('dining_time', { ascending: true })

      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading group requests:', error)
    }
  }

  const copyJoinCode = () => {
    if (group?.join_code) {
      navigator.clipboard.writeText(group.join_code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handleLeaveGroup = async () => {
    if (!user || !userMember) return

    if (isAdmin && members.length > 1) {
      alert('As the only admin, you must either promote another member to admin or delete the group before leaving.')
      return
    }

    if (!confirm('Are you sure you want to leave this group?')) return

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', userMember.id)

      if (error) throw error

      router.push('/groups')
    } catch (error: any) {
      console.error('Error leaving group:', error)
      alert(`Failed to leave group: ${error.message}`)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      loadMembers()
    } catch (error: any) {
      console.error('Error removing member:', error)
      alert(`Failed to remove member: ${error.message}`)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const isExpired = (dateString: string): boolean => {
    return new Date(dateString) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Group not found</h2>
          <Link href="/groups" className="text-[var(--primary)] hover:underline mt-4 inline-block">
            Back to Groups
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/groups" className="flex items-center gap-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Groups</span>
          </Link>
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <Utensils className="w-7 h-7 text-[var(--primary)]" strokeWidth={2.5} />
            <h1 className="text-xl font-bold text-[var(--neutral)]">DineTogether</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Group Header */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-[var(--neutral)] mb-2">
                    {group.name}
                  </h1>
                  {group.description && (
                    <p className="text-gray-600 text-lg">{group.description}</p>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 text-yellow-500 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200">
                    <Crown className="w-5 h-5" />
                    <span className="font-medium">Admin</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">{group.member_count} members</span>
                </div>

                <button
                  onClick={copyJoinCode}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Share Code: {group.join_code}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Group Dining Requests */}
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--neutral)]">
                  Group Dining Requests
                </h2>
                <Link
                  href={`/create?group=${groupId}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Request
                </Link>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No dining requests yet</p>
                  <Link
                    href={`/create?group=${groupId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Request
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => {
                    const expired = isExpired(request.dining_time)
                    const completed = request.status === 'completed'

                    return (
                      <Link
                        key={request.id}
                        href={`/request/${request.id}`}
                        className={`block p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                          completed
                            ? 'bg-green-50 border-green-200'
                            : expired
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-white border-gray-200 hover:border-[var(--primary)]'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-[var(--neutral)] mb-1">
                              {request.restaurant_name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span className="truncate">{request.restaurant_address}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(request.dining_time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{request.seats_available} seats available</span>
                          </div>
                        </div>

                        {request.description && (
                          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                            {request.description}
                          </p>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Members List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-[var(--neutral)] mb-4">
                Members ({members.length})
              </h3>

              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {member.user?.avatar_url ? (
                        <img
                          src={member.user.avatar_url}
                          alt={member.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {member.user?.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--neutral)] truncate">
                          {member.user?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.role === 'admin' ? '👑 Admin' : 'Member'}
                        </div>
                      </div>
                    </div>

                    {isAdmin && member.user_id !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-3">
              <h3 className="text-xl font-bold text-[var(--neutral)] mb-4">Actions</h3>

              <Link
                href={`/create?group=${groupId}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Group Request
              </Link>

              {userMember && (
                <button
                  onClick={handleLeaveGroup}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium border border-red-200"
                >
                  <LogOut className="w-5 h-5" />
                  Leave Group
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
