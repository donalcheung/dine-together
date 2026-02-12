'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MessageCircle, Users, Send, Search, Plus, ArrowLeft } from 'lucide-react'
import { supabase, Profile, Group } from '@/lib/supabase'

interface ConversationParticipantView {
  user_id: string
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url'>[] | null
}

type SearchProfile = Pick<Profile, 'id' | 'name' | 'avatar_url'>

interface ConversationView {
  id: string
  type: 'direct' | 'group'
  group_id?: string | null
  direct_pair_key?: string | null
  last_message_at?: string | null
  created_at: string
  participants?: ConversationParticipantView[]
  group?: Group[] | null
}

interface MessageView {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
  sender?: Pick<Profile, 'id' | 'name' | 'avatar_url'>[] | null
}

interface LastMessageView {
  body: string
  created_at: string
  sender_id: string
}

export default function MessagesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [conversations, setConversations] = useState<ConversationView[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageView[]>([])
  const [lastMessages, setLastMessages] = useState<Record<string, LastMessageView>>({})
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [messageBody, setMessageBody] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchProfile[]>([])
  const [searching, setSearching] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user?.id) {
      loadConversations(user.id)
    }
  }, [user?.id])

  useEffect(() => {
    if (!selectedConversationId) return

    const channel = supabase
      .channel(`messages:${selectedConversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConversationId}` },
        () => {
          loadMessages(selectedConversationId)
          refreshLastMessage(selectedConversationId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversationId])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

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
  }

  const loadConversations = async (userId: string) => {
    try {
      setLoading(true)

      const { data: participantRows, error: participantError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId)

      if (participantError) throw participantError

      const directIds = (participantRows || []).map(row => row.conversation_id)

      let directConversationData: ConversationView[] = []

      if (directIds.length > 0) {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            id,
            type,
            group_id,
            direct_pair_key,
            last_message_at,
            created_at,
            participants:conversation_participants(
              user_id,
              profiles:profiles(id, name, avatar_url)
            )
          `)
          .eq('type', 'direct')
          .in('id', directIds)

        if (error) throw error
        directConversationData = data || []
      }

      const { data: groupMemberships, error: groupMemberError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups(
            id,
            name,
            description,
            cover_image_url,
            is_public,
            member_count,
            created_by,
            created_at,
            join_code
          )
        `)
        .eq('user_id', userId)

      if (groupMemberError) throw groupMemberError

      const groupIds = (groupMemberships || []).map(row => row.group_id)

      let groupConversations: ConversationView[] = []

      if (groupIds.length > 0) {
        const groupConvosResponse = await supabase
          .from('conversations')
          .select(`
            id,
            type,
            group_id,
            last_message_at,
            created_at,
            group:groups(
              id,
              name,
              description,
              cover_image_url,
              is_public,
              member_count,
              created_by,
              created_at,
              join_code
            )
          `)
          .eq('type', 'group')
          .in('group_id', groupIds)

        if (groupConvosResponse.error) throw groupConvosResponse.error

        groupConversations = groupConvosResponse.data || []
        const existingGroupIds = new Set(groupConversations.map(conv => conv.group_id))
        const missingGroupIds = groupIds.filter(id => id && !existingGroupIds.has(id))

        if (missingGroupIds.length > 0) {
          await supabase
            .from('conversations')
            .insert(missingGroupIds.map(groupId => ({
              type: 'group',
              group_id: groupId,
              created_by: userId
            })))

          const refreshed = await supabase
            .from('conversations')
            .select(`
              id,
              type,
              group_id,
              last_message_at,
              created_at,
              group:groups(
                id,
                name,
                description,
                cover_image_url,
                is_public,
                member_count,
                created_by,
                created_at,
                join_code
              )
            `)
            .eq('type', 'group')
            .in('group_id', groupIds)

          if (!refreshed.error) {
            groupConversations = refreshed.data || []
          }
        }
      }

      const combinedConversations = [
        ...directConversationData,
        ...groupConversations,
      ].sort((a, b) => {
        const aTime = a.last_message_at || a.created_at
        const bTime = b.last_message_at || b.created_at
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })

      setConversations(combinedConversations)

      const conversationIds = combinedConversations.map(conv => conv.id)
      if (conversationIds.length > 0) {
        const { data: latestMessages, error: latestError } = await supabase
          .from('messages')
          .select('conversation_id, body, created_at, sender_id')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false })

        if (latestError) throw latestError

        const latestMap: Record<string, LastMessageView> = {}
        ;(latestMessages || []).forEach(message => {
          if (!latestMap[message.conversation_id]) {
            latestMap[message.conversation_id] = {
              body: message.body,
              created_at: message.created_at,
              sender_id: message.sender_id
            }
          }
        })

        setLastMessages(latestMap)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true)
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          body,
          created_at,
          sender:profiles(id, name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const refreshLastMessage = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('conversation_id, body, created_at, sender_id')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (data && data.length > 0) {
      const message = data[0]
      setLastMessages(prev => ({
        ...prev,
        [conversationId]: {
          body: message.body,
          created_at: message.created_at,
          sender_id: message.sender_id
        }
      }))
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
    loadMessages(conversationId)
  }

  const handleSendMessage = async () => {
    if (!messageBody.trim() || !selectedConversationId || !user?.id) return

    const body = messageBody.trim()
    setMessageBody('')

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: selectedConversationId,
          sender_id: user.id,
          body
        }
      ])

    if (error) {
      console.error('Error sending message:', error)
      setMessageBody(body)
    }
  }

  const handleSearchProfiles = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .ilike('name', `%${searchQuery.trim()}%`)
        .limit(10)

      if (error) throw error

      const filtered = (data || []).filter(p => p.id !== user?.id)
      setSearchResults(filtered)
    } catch (error) {
      console.error('Error searching profiles:', error)
    } finally {
      setSearching(false)
    }
  }

  const buildDirectPairKey = (firstId: string, secondId: string) => {
    return [firstId, secondId].sort().join(':')
  }

  const startDirectConversation = async (target: SearchProfile) => {
    if (!user?.id) return

    const pairKey = buildDirectPairKey(user.id, target.id)

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('type', 'direct')
      .eq('direct_pair_key', pairKey)
      .maybeSingle()

    let conversationId = existing?.id

    if (!conversationId) {
      const { data: created, error: createError } = await supabase
        .from('conversations')
        .insert([
          {
            type: 'direct',
            direct_pair_key: pairKey,
            created_by: user.id
          }
        ])
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating conversation:', createError)
        return
      }

      conversationId = created.id

      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: user.id },
          { conversation_id: conversationId, user_id: target.id }
        ])

      if (participantError) {
        console.error('Error adding participants:', participantError)
      }
    }

    await loadConversations(user.id)
    setShowNewChat(false)
    setSearchQuery('')
    setSearchResults([])

    if (conversationId) {
      handleSelectConversation(conversationId)
    }
  }

  const getConversationTitle = (conversation: ConversationView) => {
    if (conversation.type === 'group') {
      return conversation.group?.[0]?.name || 'Group chat'
    }

    const otherParticipant = conversation.participants?.find(p => p.user_id !== user?.id)
    const profile = otherParticipant?.profiles?.[0]
    return profile?.name || 'Direct chat'
  }

  const getConversationAvatar = (conversation: ConversationView) => {
    if (conversation.type === 'group') {
      return conversation.group?.[0]?.cover_image_url || ''
    }

    const otherParticipant = conversation.participants?.find(p => p.user_id !== user?.id)
    const profile = otherParticipant?.profiles?.[0]
    return profile?.avatar_url || ''
  }

  const formatTime = (timestamp?: string | null) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--neutral)] hover:text-[var(--primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="TableMesh Logo"
              width={28}
              height={28}
              className="w-7 h-7"
            />
            <h1 className="text-xl font-bold text-[var(--neutral)]">TableMesh</h1>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-[var(--neutral)]">Messages</h2>
            <p className="text-gray-600">Chat 1:1 or with your groups</p>
          </div>
          <button
            onClick={() => setShowNewChat(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-all font-semibold"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl shadow-lg border border-orange-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span className="font-semibold">Conversations</span>
              </div>
            </div>

            <div className="max-h-[640px] overflow-y-auto">
              {loading && (
                <div className="p-6 text-center text-gray-500">Loading conversations...</div>
              )}

              {!loading && conversations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  No conversations yet.
                </div>
              )}

              {!loading && conversations.map(conversation => {
                const lastMessage = lastMessages[conversation.id]
                const isSelected = selectedConversationId === conversation.id
                const avatarUrl = getConversationAvatar(conversation)

                return (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`w-full text-left px-5 py-4 border-b border-gray-100 hover:bg-orange-50 transition-all ${
                      isSelected ? 'bg-orange-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-6 h-6 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-[var(--neutral)] truncate">
                            {getConversationTitle(conversation)}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {formatTime(lastMessage?.created_at || conversation.last_message_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {lastMessage?.body || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg border border-orange-100 flex flex-col min-h-[640px]">
            {!selectedConversation && (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a conversation to start chatting.</p>
                </div>
              </div>
            )}

            {selectedConversation && (
              <>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                      {getConversationAvatar(selectedConversation) ? (
                        <img src={getConversationAvatar(selectedConversation)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--neutral)]">
                        {getConversationTitle(selectedConversation)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.type === 'group' ? 'Group chat' : 'Direct message'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  {loadingMessages && (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  )}

                  {!loadingMessages && messages.length === 0 && (
                    <div className="text-center text-gray-500">No messages yet.</div>
                  )}

                  {messages.map(message => {
                    const isMine = message.sender_id === user?.id
                    const senderProfile = message.sender?.[0]
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          isMine
                            ? 'bg-[var(--primary)] text-white rounded-br-md'
                            : 'bg-orange-100 text-[var(--neutral)] rounded-bl-md'
                        }`}
                        >
                          <div className="text-sm font-semibold mb-1">
                            {isMine ? 'You' : (senderProfile?.name || 'Member')}
                          </div>
                          <div className="text-sm leading-relaxed">{message.body}</div>
                          <div className={`text-xs mt-2 ${isMine ? 'text-white/80' : 'text-gray-500'}`}>
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-5 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <input
                      value={messageBody}
                      onChange={(e) => setMessageBody(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-dark)] transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {showNewChat && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--neutral)]">Start a new chat</h3>
              <button
                onClick={() => setShowNewChat(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
                />
              </div>
              <button
                onClick={handleSearchProfiles}
                disabled={searching || !searchQuery.trim()}
                className="px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-all disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {searchResults.length === 0 && !searching && (
                <div className="text-sm text-gray-500 text-center py-6">No results yet.</div>
              )}
              {searchResults.map(result => (
                <button
                  key={result.id}
                  onClick={() => startDirectConversation(result)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[var(--primary)] hover:bg-orange-50 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                    {result.avatar_url ? (
                      <img src={result.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-semibold text-orange-600">{result.name[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--neutral)]">{result.name}</div>
                    <div className="text-xs text-gray-500">Start a direct chat</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
