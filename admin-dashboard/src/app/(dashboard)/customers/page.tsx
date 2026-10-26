'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Customer } from '@/types/database'
import { formatDateTime, formatRelativeTime } from '@/lib/utils'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 20

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('last_active_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (search) {
        query = query.or(`display_name.ilike.%${search}%,phone_number.ilike.%${search}%,whatsapp_id.ilike.%${search}%`)
      }

      const { data, count } = await query
      setCustomers(data || [])
      setTotal(count || 0)
    } catch {
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const langLabel: Record<string, string> = { en: 'English', ta: 'Tamil', si: 'Sinhala' }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">No customers found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 font-medium text-gray-500">WhatsApp</th>
                <th className="px-4 py-3 font-medium text-gray-500">Language</th>
                <th className="px-4 py-3 font-medium text-gray-500">First Seen</th>
                <th className="px-4 py-3 font-medium text-gray-500">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.display_name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-gray-500">+{c.whatsapp_id}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs">
                      {langLabel[c.preferred_language] || c.preferred_language}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDateTime(c.first_seen_at)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatRelativeTime(c.last_active_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="rounded-lg border border-gray-300 p-2 text-sm hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="rounded-lg border border-gray-300 p-2 text-sm hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
