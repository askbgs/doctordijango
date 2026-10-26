'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import { CATEGORY_LABELS } from '@/types/database'

interface SalesData {
  totalRevenue: number
  totalOrders: number
  averageOrder: number
  categorySales: { category: string; revenue: number; orders: number }[]
}

export default function ReportsPage() {
  const [data, setData] = useState<SalesData | null>(null)
  const [period, setPeriod] = useState('30')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      setLoading(true)
      try {
        const supabase = createClient()
        const since = new Date()
        since.setDate(since.getDate() - parseInt(period))

        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, status, created_at')
          .gte('created_at', since.toISOString())
          .neq('status', 'cancelled')

        const { data: items } = await supabase
          .from('order_items')
          .select('product_name, total_price, quantity, order_id')

        const orderList = orders || []
        const totalRevenue = orderList.reduce((s, o) => s + Number(o.total_amount), 0)
        const totalOrders = orderList.length

        const catMap: Record<string, { revenue: number; orders: number }> = {}
        for (const item of items || []) {
          const cat = 'general'
          if (!catMap[cat]) catMap[cat] = { revenue: 0, orders: 0 }
          catMap[cat].revenue += Number(item.total_price)
          catMap[cat].orders += item.quantity
        }

        setData({
          totalRevenue,
          totalOrders,
          averageOrder: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          categorySales: Object.entries(catMap).map(([category, d]) => ({
            category: CATEGORY_LABELS[category] || category,
            ...d,
          })),
        })
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [period])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Reports</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : !data ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          No data available. Connect Supabase to see reports.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="mt-1 text-2xl font-bold">{data.totalOrders}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Average Order Value</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(data.averageOrder)}</p>
            </div>
          </div>

          {data.categorySales.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Sales by Category</h2>
              <div className="space-y-3">
                {data.categorySales.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <span className="font-medium">{cat.category}</span>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(cat.revenue)}</p>
                      <p className="text-xs text-gray-500">{cat.orders} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
