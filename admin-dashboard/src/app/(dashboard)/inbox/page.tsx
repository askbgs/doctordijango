'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Conversation, Message, Customer } from '@/types/database'
import { formatRelativeTime } from '@/lib/utils'
import { Send, UserCheck, ArrowLeft } from 'lucide-react'

type ConversationRow = Conversation & { customers: Customer }

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationRow[]>([])
  const [selected, setSelected] = useState<ConversationRow | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const fetchConversations = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('conversations')
        .select('*, customers(*)')
        .in('status', ['active', 'paused_for_handover'])
        .order('last_message_at', { ascending: false })
        .limit(50)
      setConversations((data as ConversationRow[]) || [])
    } catch {
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchConversations() }, [fetchConversations])

  async function loadMessages(conv: ConversationRow) {
    setSelected(conv)
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true })
      .limit(100)
    setMessages(data || [])
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      const supabase = createClient()

      await supabase.from('messages').insert({
        conversation_id: selected.id,
        customer_id: selected.customer_id,
        direction: 'outbound',
        message_type: 'text',
        content: reply,
        status: 'sent',
        metadata: { sent_by: 'staff' },
      })

      if (selected.status === 'active') {
        await supabase
          .from('conversations')
          .update({ status: 'paused_for_handover' })
          .eq('id', selected.id)
      }

      setReply('')
      loadMessages(selected)
    } finally {
      setSending(false)
    }
  }

  async function resumeAutomation(convId: string) {
    const supabase = createClient()
    await supabase.from('conversations').update({ status: 'active' }).eq('id', convId)
    setSelected(null)
    fetchConversations()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Inbox</h1>

      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        <div className={`w-full sm:w-80 shrink-0 overflow-y-auto rounded-xl border border-gray-200 bg-white ${selected ? 'hidden sm:block' : ''}`}>
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No active conversations.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadMessages(conv)}
                  className={`w-full p-4 text-left hover:bg-gray-50 ${selected?.id === conv.id ? 'bg-brand-50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{conv.customers?.display_name || 'Unknown'}</span>
                    {conv.status === 'paused_for_handover' && (
                      <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-xs">Handover</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {conv.last_message_at ? formatRelativeTime(conv.last_message_at) : 'No messages'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`flex-1 flex flex-col rounded-xl border border-gray-200 bg-white ${!selected ? 'hidden sm:flex' : 'flex'}`}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                <button onClick={() => setSelected(null)} className="sm:hidden p-1">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1">
                  <p className="font-medium">{selected.customers?.display_name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">+{selected.customers?.whatsapp_id}</p>
                </div>
                {selected.status === 'paused_for_handover' && (
                  <button
                    onClick={() => resumeAutomation(selected.id)}
                    className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Resume AI
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      msg.direction === 'inbound'
                        ? 'bg-gray-100 self-start mr-auto'
                        : 'bg-brand-600 text-white self-end ml-auto'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.direction === 'inbound' ? 'text-gray-400' : 'text-brand-200'}`}>
                      {formatRelativeTime(msg.created_at)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                    placeholder="Type a reply..."
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
