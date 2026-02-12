'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, X } from 'lucide-react'
import { supabase, Profile } from '@/lib/supabase'

interface ChatWidgetProps {
  currentUserId: string
  target: Pick<Profile, 'id' | 'name' | 'avatar_url'>
  offsetIndex?: number
  onClose: () => void
}

interface MessageView {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
  sender?: Pick<Profile, 'id' | 'name' | 'avatar_url'>[] | null
}

export function ChatWidget({ currentUserId, target, offsetIndex = 0, onClose }: ChatWidgetProps) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageView[]>([])
  const [messageBody, setMessageBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let isActive = true

    const initConversation = async () => {
      setLoading(true)
      setErrorMessage(null)

      try {
        const pairKey = [currentUserId, target.id].sort().join(':')
        const { data: existing, error: existingError } = await supabase
          .from('conversations')
          .select('id')
          .eq('type', 'direct')
          .eq('direct_pair_key', pairKey)
          .maybeSingle()

        if (existingError) throw existingError

        let convoId = existing?.id

        if (!convoId) {
          const { data: created, error: createError } = await supabase
            .from('conversations')
            .insert([
              { type: 'direct', direct_pair_key: pairKey, created_by: currentUserId }
            ])
            .select('id')
            .single()

          if (createError) throw createError

          convoId = created.id

          const { error: participantError } = await supabase
            .from('conversation_participants')
            .upsert([
              { conversation_id: convoId, user_id: currentUserId },
              { conversation_id: convoId, user_id: target.id }
            ], { onConflict: 'conversation_id,user_id' })

          if (participantError) throw participantError
        }

        if (!isActive) return

        setConversationId(convoId)
        await loadMessages(convoId)
      } catch (error: any) {
        if (!isActive) return
        console.error('Error initializing chat:', error)
        setErrorMessage(error?.message || 'Failed to start chat.')
      } finally {
        if (isActive) setLoading(false)
      }
    }

    initConversation()

    return () => {
      isActive = false
    }
  }, [currentUserId, target.id])

  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        () => {
          loadMessages(conversationId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const loadMessages = async (convoId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, body, created_at, sender:profiles(id, name, avatar_url)')
      .eq('conversation_id', convoId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading messages:', error)
      setErrorMessage(error.message)
      return
    }

    setMessages(data || [])
  }

  const handleSend = async () => {
    if (!messageBody.trim() || !conversationId) return

    const body = messageBody.trim()
    setMessageBody('')

    const { error } = await supabase
      .from('messages')
      .insert([
        { conversation_id: conversationId, sender_id: currentUserId, body }
      ])

    if (error) {
      console.error('Error sending message:', error)
      setMessageBody(body)
      setErrorMessage(error.message)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className="fixed right-6 w-[360px] bg-white rounded-2xl shadow-2xl border border-orange-100 flex flex-col overflow-hidden z-50"
      style={{ bottom: 24 + offsetIndex * 420 }}
    >
      <div className="p-4 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
            {target.avatar_url ? (
              <img src={target.avatar_url} alt={target.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-orange-600">{target.name[0]?.toUpperCase()}</span>
            )}
          </div>
          <div>
            <div className="font-semibold text-[var(--neutral)]">{target.name}</div>
            <div className="text-xs text-gray-500">Direct chat</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading && (
          <div className="text-sm text-gray-500">Loading chat...</div>
        )}

        {!loading && errorMessage && (
          <div className="text-sm text-red-600">{errorMessage}</div>
        )}

        {!loading && !errorMessage && messages.length === 0 && (
          <div className="text-sm text-gray-500">Say hello to start the chat.</div>
        )}

        {messages.map((message) => {
          const isMine = message.sender_id === currentUserId
          const senderProfile = message.sender?.[0]

          return (
            <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                  isMine
                    ? 'bg-[var(--primary)] text-white rounded-br-md'
                    : 'bg-orange-100 text-[var(--neutral)] rounded-bl-md'
                }`}
              >
                <div className="text-xs font-semibold mb-1">
                  {isMine ? 'You' : (senderProfile?.name || 'Member')}
                </div>
                <div className="text-sm leading-relaxed">{message.body}</div>
                <div className={`text-[10px] mt-1 ${isMine ? 'text-white/80' : 'text-gray-500'}`}>
                  {formatTime(message.created_at)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none"
          />
          <button
            onClick={handleSend}
            className="px-3 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
