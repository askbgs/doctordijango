'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

interface DashboardStats {
  ordersToday: number;
  salesToday: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentEnquiries: number;
  awaitingStaff: number;
}

interface PopularProduct {
  name: string;
  category: string;
  order_count: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    ordersToday: 0,
    salesToday: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    recentEnquiries: 0,
    awaitingStaff: 0,
  });
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];

        const [ordersRes, pendingRes, lowStockRes, handoverRes, conversationsRes] =
          await Promise.all([
            supabase
              .from('orders')
              .select('total_amount')
              .gte('created_at', today),
            supabase
              .from('orders')
              .select('id', { count: 'exact', head: true })
              .eq('status', 'pending_confirmation'),
            supabase
              .from('product_variants')
              .select('id', { count: 'exact', head: true })
              .lt('available_quantity', 5)
              .eq('is_active', true),
            supabase
              .from('handover_requests')
              .select('id', { count: 'exact', head: true })
              .eq('status', 'pending'),
            supabase
              .from('conversations')
              .select('id', { count: 'exact', head: true })
              .eq('status', 'active'),
          ]);

        const ordersData = ordersRes.data || [];
        setStats({
          ordersToday: ordersData.length,
          salesToday: ordersData.reduce(
            (sum, o) => sum + Number(o.total_amount),
            0
          ),
          pendingOrders: pendingRes.count || 0,
          lowStockProducts: lowStockRes.count || 0,
          recentEnquiries: conversationsRes.count || 0,
          awaitingStaff: handoverRes.count || 0,
        });

        const { data: popular } = await supabase
          .from('order_items')
          .select('product_name')
          .limit(50);
        if (popular) {
          const counts: Record<string, number> = {};
          popular.forEach((item) => {
            counts[item.product_name] = (counts[item.product_name] || 0) + 1;
          });
          const sorted = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({
              name,
              category: '',
              order_count: count,
            }));
          setPopularProducts(sorted);
        }
      } catch {
        // Supabase not connected — show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const statCards = [
    {
      label: 'Orders Today',
      value: stats.ordersToday,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Sales Today',
      value: formatCurrency(stats.salesToday),
      icon: DollarSign,
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-700',
    },
    {
      label: 'Low Stock Items',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-700',
    },
    {
      label: 'Active Enquiries',
      value: stats.recentEnquiries,
      icon: MessageSquare,
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Awaiting Staff',
      value: stats.awaitingStaff,
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-700',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-bold">{card.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Popular Products</h2>
        {popularProducts.length === 0 ? (
          <p className="text-sm text-gray-500">
            No order data yet. Products will appear here as orders come in.
          </p>
        ) : (
          <div className="space-y-3">
            {popularProducts.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="font-medium">{p.name}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {p.order_count} orders
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
