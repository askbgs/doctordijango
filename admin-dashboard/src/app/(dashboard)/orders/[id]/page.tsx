'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Order, OrderItem, OrderStatus } from '@/types/database';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  VALID_STATUS_TRANSITIONS,
} from '@/types/database';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const supabase = createClient();
        const { data: o } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        if (o) setOrder(o);

        const { data: oi } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
        setItems(oi || []);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  async function handleStatusUpdate() {
    if (!newStatus || !order) return;
    setSaving(true);
    setMessage('');
    try {
      const supabase = createClient();
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === 'confirmed') updateData.confirmed_at = new Date().toISOString();
      if (newStatus === 'cancelled') updateData.cancelled_at = new Date().toISOString();
      if (newStatus === 'delivered') updateData.delivered_at = new Date().toISOString();

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);
      if (error) throw error;
      setOrder({ ...order, status: newStatus, ...updateData } as Order);
      setNewStatus('');
      setMessage('Status updated successfully.');
    } catch (err: unknown) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Failed to update'}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Order not found.</p>
        <button
          onClick={() => router.push('/orders')}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const validTransitions = VALID_STATUS_TRANSITIONS[order.status] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/orders')}
          className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{order.order_ref}</h1>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${
              ORDER_STATUS_COLORS[order.status]
            }`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.startsWith('Error')
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Order Items</h2>
            {items.length === 0 ? (
              <p className="text-sm text-gray-500">No items found.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="pb-2 font-medium text-gray-500">Product</th>
                    <th className="pb-2 font-medium text-gray-500">Size</th>
                    <th className="pb-2 font-medium text-gray-500">Colour</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Qty</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Price</th>
                    <th className="pb-2 font-medium text-gray-500 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium">{item.product_name}</td>
                      <td className="py-3">{item.size}</td>
                      <td className="py-3">{item.colour}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 text-right font-medium">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="mt-4 border-t border-gray-200 pt-4 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Delivery</span>
                <span>{formatCurrency(order.delivery_charge)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">
                    -{formatCurrency(order.discount_amount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {validTransitions.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Update Status</h2>
              <div className="flex gap-3">
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as OrderStatus)
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                >
                  <option value="">Select new status...</option>
                  {validTransitions.map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || saving}
                  className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Customer</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Name</dt>
                <dd className="font-medium">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Contact</dt>
                <dd>{order.contact_number || '-'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Delivery Address</dt>
                <dd>{order.delivery_address}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Payment</dt>
                <dd>{order.payment_method?.replace('_', ' ') || '-'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span>{formatDateTime(order.created_at)}</span>
              </div>
              {order.confirmed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Confirmed</span>
                  <span>{formatDateTime(order.confirmed_at)}</span>
                </div>
              )}
              {order.delivered_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivered</span>
                  <span>{formatDateTime(order.delivered_at)}</span>
                </div>
              )}
              {order.cancelled_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Cancelled</span>
                  <span>{formatDateTime(order.cancelled_at)}</span>
                </div>
              )}
            </div>
          </div>

          {order.notes && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold">Notes</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
