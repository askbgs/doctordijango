'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Smartphone, CheckCircle, XCircle, Clock } from 'lucide-react'

interface StatusInfo {
  totalMessages: number
  sentToday: number
  failedToday: number
  lastMessageAt: string | null
  webhookEventsToday: number
}

export default function WhatsAppStatusPage() {
  const [status, setStatus] = useState<StatusInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true)
      try {
        const supabase = createClient()
        const today = new Date().toISOString().split('T')[0]

        const [totalRes, sentRes, failedRes, lastRes, webhookRes] = await Promise.all([
          supabase.from('messages').select('id', { count: 'exact', head: true }),
          supabase.from('messages').select('id', { count: 'exact', head: true })
            .eq('direction', 'outbound').gte('created_at', today),
          supabase.from('messages').select('id', { count: 'exact', head: true })
            .eq('status', 'failed').gte('created_at', today),
          supabase.from('messages').select('created_at')
            .order('created_at', { ascending: false }).limit(1),
          supabase.from('processed_webhook_events').select('id', { count: 'exact', head: true })
            .gte('processed_at', today),
        ])

        setStatus({
          totalMessages: totalRes.count || 0,
          sentToday: sentRes.count || 0,
          failedToday: failedRes.count || 0,
          lastMessageAt: lastRes.data?.[0]?.created_at || null,
          webhookEventsToday: webhookRes.count || 0,
        })
      } catch {
        setStatus(null)
      } finally {
        setLoading(false)
      }
    }
    fetchStatus()
  }, [])

  const configItems = [
    { label: 'WhatsApp API Version', env: 'WHATSAPP_API_VERSION', status: 'Set in n8n env' },
    { label: 'Phone Number ID', env: 'META_PHONE_NUMBER_ID', status: 'Set in n8n env' },
    { label: 'Access Token', env: 'META_WHATSAPP_ACCESS_TOKEN', status: 'Set in n8n env' },
    { label: 'Webhook Verify Token', env: 'META_WEBHOOK_VERIFY_TOKEN', status: 'Set in n8n env' },
    { label: 'App Secret', env: 'META_APP_SECRET', status: 'Set in n8n env' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Smartphone className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold">WhatsApp Integration</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : status ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Messages</p>
            <p className="mt-1 text-2xl font-bold">{status.totalMessages}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm text-gray-500">Sent Today</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{status.sentToday}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm text-gray-500">Failed Today</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{status.failedToday}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-gray-500">Webhook Events Today</p>
            </div>
            <p className="mt-1 text-2xl font-bold">{status.webhookEventsToday}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Connect Supabase to view WhatsApp integration status.
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Configuration</h2>
        <p className="mb-4 text-sm text-gray-500">
          WhatsApp API credentials are configured as environment variables in n8n.
          They are never exposed in this dashboard.
        </p>
        <div className="space-y-3">
          {configItems.map((item) => (
            <div key={item.env} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-gray-400 font-mono">{item.env}</p>
              </div>
              <span className="rounded-full bg-blue-50 text-blue-600 px-2.5 py-1 text-xs font-medium">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
