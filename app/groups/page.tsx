'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Utensils, Users, Plus, LogOut, Search, Lock, Globe, Crown, Settings, Copy, Check, UserPlus } from 'lucide-react'
import { supabase, Group, GroupMember, Profile } from '@/lib/supabase'

export default function GroupsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myGroups, setMyGroups] = useState<Group[]>([])
  const [publicGroups, setPublicGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover'>('my-groups')

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    is_public: true
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth')
      return
    }
    
    setUser(user)
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profile) {
      setProfile(profile)
    }

    await loadGroups(user.id)
  }

  const loadGroups = async (userId: string) => {
    try {
      // Load user's groups
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups (
            *,
            creator:profiles!groups_created_by_fkey(*)
          )
        `)
        .eq('user_id', userId)

      if (memberError) throw memberError

      const userGroups = memberData?.map(m => m.groups).filter(Boolean) as any[] || []
      setMyGroups(userGroups)

      // Load public groups (that user hasn't joined)
      const { data: publicData, error: publicError } = await supabase
        .from('groups')
        .select(`
          *,
          creator:profiles!groups_created_by_fkey(*)
        `)
        .eq('is_public', true)
        .order('member_count', { ascending: false })
        .limit(20)

      if (publicError) throw publicError

      // Filter out groups user has already joined
      const joinedGroupIds = new Set(userGroups.map(g => g.id))
      const availablePublicGroups = publicData?.filter(g => !joinedGroupIds.has(g.id)) || []
      setPublicGroups(availablePublicGroups)

    } catch (error) {
      console.error('Error loading groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([
          {
            name: newGroup.name,
            description: newGroup.description,
            is_public: newGroup.is_public,
            created_by: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error

      setShowCreateModal(false)
      setNewGroup({ name: '', description: '', is_public: true })
      await loadGroups(user.id)
      
      // Navigate to the new group
      router.push(`/groups/${data.id}`)
    } catch (error: any) {
      console.error('Error creating group:', error)
      alert(`Failed to create group: ${error.message}`)
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: groupId,
            user_id: user.id,
            role: 'member'
          }
        ])

      if (error) throw error

      await loadGroups(user.id)
    } catch (error: any) {
      console.error('Error joining group:', error)
      alert(`Failed to join group: ${error.message}`)
    }
  }

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !joinCode.trim()) return

    try {
      // Find group by join code
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('join_code', joinCode.trim().toUpperCase())
        .single()

      if (groupError || !group) {
        alert('Invalid join code. Please check and try again.')
        return
      }

      // Join the group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: group.id,
            user_id: user.id,
            role: 'member'
          }
        ])

      if (joinError) throw joinError

      setShowJoinModal(false)
      setJoinCode('')
      await loadGroups(user.id)
      
      // Navigate to the group
      router.push(`/groups/${group.id}`)
    } catch (error: any) {
      console.error('Error joining by code:', error)
      alert(`Failed to join group: ${error.message}`)
    }
  }

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Utensils className="w-8 h-8 text-[var(--primary)]" strokeWidth={2.5} />
            <h1 className="text-2xl font-bold text-[var(--neutral)]">DineTogether</h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-[var(--primary)] font-medium transition-colors"
            >
              Requests
            </Link>
            
            <Link
              href="/groups"
              className="px-4 py-2 text-[var(--primary)] font-medium border-b-2 border-[var(--primary)]"
            >
              Groups
            </Link>

            {profile && (
              <Link
                href="/profile"
                className="flex items-center gap-2"
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {profile.name[0]?.toUpperCase()}
                  </div>
                )}
              </Link>
            )}
            
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-[var(--primary)] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-[var(--neutral)] mb-2">
            Groups
          </h2>
          <p className="text-gray-600 text-lg">
            Join or create groups to dine with your friends, coworkers, or community
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all hover:shadow-lg font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Group
          </button>
          
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-full hover:border-[var(--primary)] transition-all border border-gray-300 font-medium"
          >
            <UserPlus className="w-5 h-5" />
            Join with Code
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('my-groups')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'my-groups'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-gray-600 hover:text-[var(--primary)]'
            }`}
          >
            My Groups ({myGroups.length})
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'discover'
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-gray-600 hover:text-[var(--primary)]'
            }`}
          >
            Discover ({publicGroups.length})
          </button>
        </div>

        {/* My Groups Tab */}
        {activeTab === 'my-groups' && (
          <div>
            {myGroups.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No Groups Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create or join a group to start dining with your community
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Group
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((group) => (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 block"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[var(--neutral)] mb-1">
                          {group.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {group.is_public ? (
                            <><Globe className="w-4 h-4" /> Public</>
                          ) : (
                            <><Lock className="w-4 h-4" /> Private</>
                          )}
                        </div>
                      </div>
                      {group.created_by === user?.id && (
                        <div title="Admin">
                          <Crown className="w-5 h-5 text-yellow-500" />
                        </div>
                      )}
                    </div>

                    {group.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {group.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{group.member_count} members</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          copyJoinCode(group.join_code)
                        }}
                        className="flex items-center gap-1 text-xs text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors"
                      >
                        {copiedCode === group.join_code ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            {group.join_code}
                          </>
                        )}
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div>
            {publicGroups.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No Groups to Discover
                </h3>
                <p className="text-gray-600">
                  Check back later or create your own group!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicGroups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[var(--neutral)] mb-1">
                          {group.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Globe className="w-4 h-4" /> Public
                        </div>
                      </div>
                    </div>

                    {group.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {group.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{group.member_count} members</span>
                      </div>

                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-[var(--neutral)] mb-6">Create New Group</h3>
            
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                  placeholder="e.g., Foodie Friends"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none resize-none"
                  placeholder="What's this group about?"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={newGroup.is_public}
                  onChange={(e) => setNewGroup({ ...newGroup, is_public: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <label htmlFor="is_public" className="text-sm text-gray-700">
                  Make this group public (anyone can discover and join)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-[var(--primary-dark)] transition-all"
                >
                  Create Group
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewGroup({ name: '', description: '', is_public: true })
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join by Code Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-[var(--neutral)] mb-6">Join Group</h3>
            
            <form onSubmit={handleJoinByCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Join Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  maxLength={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none text-center text-2xl font-mono tracking-wider"
                  placeholder="ABC12345"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Ask a group admin for the join code
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl font-bold hover:bg-[var(--primary-dark)] transition-all"
                >
                  Join Group
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false)
                    setJoinCode('')
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
