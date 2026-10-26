'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HandoverRequest, Customer } from '@/types/database'
import { formatRelativeTime } from '@/lib/utils'

type HandoverRow = HandoverRequest & { customers: Customer }

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-600',
}

export default function HandoverPage() {
  const [requests, setRequests] = useState<HandoverRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('handover_requests')
        .select('*, customers(*)')
        .in('status', ['pending', 'assigned'])
        .order('created_at', { ascending: false })
        .limit(50)
      setRequests((data as HandoverRow[]) || [])
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  async function resolveRequest(id: string) {
    const supabase = createClient()
    await supabase
      .from('handover_requests')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', id)
    fetchRequests()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Handover Queue</h1>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            No pending handover requests. The AI is handling all conversations.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((req) => (
              <div key={req.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{req.customers?.display_name || 'Unknown'}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[req.priority]}`}>
                        {req.priority}
                      </span>
                      <span className="text-xs text-gray-400">{formatRelativeTime(req.created_at)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{req.reason}</p>
                    {req.notes && <p className="mt-1 text-xs text-gray-400">{req.notes}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={`/inbox`}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                    >
                      View Chat
                    </a>
                    <button
                      onClick={() => resolveRequest(req.id)}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
