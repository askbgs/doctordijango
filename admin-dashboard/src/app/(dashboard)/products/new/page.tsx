'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES, CATEGORY_LABELS, GENDERS } from '@/types/database';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    brand: '',
    gender: 'unisex',
    base_price: '',
    sale_price: '',
    image_urls: [''],
    tags: '',
    is_active: true,
  });

  function suggestSku() {
    const prefix: Record<string, string> = {
      tshirts: 'TS',
      shirts: 'SH',
      trousers: 'TR',
      jeans: 'JN',
      dresses: 'DR',
      sarees: 'SA',
      kidswear: 'KW',
      sportswear: 'SP',
      accessories: 'AC',
    };
    const p = prefix[form.category] || 'XX';
    const num = String(Math.floor(Math.random() * 900) + 100);
    return `${p}-${num}`;
  }

  async function handleSave() {
    if (!form.name || !form.sku || !form.category || !form.base_price) {
      setMessage('Error: Name, SKU, Category, and Base Price are required.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: form.name,
          sku: form.sku,
          description: form.description || null,
          category: form.category,
          brand: form.brand || null,
          gender: form.gender,
          base_price: parseFloat(form.base_price),
          sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
          image_urls: form.image_urls.filter(Boolean),
          tags: form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          is_active: form.is_active,
        })
        .select()
        .single();
      if (error) throw error;
      if (data) router.push(`/products/${data.id}`);
    } catch (err: unknown) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Failed to save'}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/products')}
          className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold">Add New Product</h1>
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

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              SKU *
            </label>
            <div className="flex gap-2">
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, sku: suggestSku() })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
              >
                Auto
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Brand
            </label>
            <input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Base Price (LKR) *
            </label>
            <input
              type="number"
              value={form.base_price}
              onChange={(e) =>
                setForm({ ...form, base_price: e.target.value })
              }
              min={0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Sale Price (LKR)
            </label>
            <input
              type="number"
              value={form.sale_price}
              onChange={(e) =>
                setForm({ ...form, sale_price: e.target.value })
              }
              placeholder="Leave empty for no sale"
              min={0}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Image URLs
            </label>
            {form.image_urls.map((url, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input
                  value={url}
                  onChange={(e) => {
                    const urls = [...form.image_urls];
                    urls[i] = e.target.value;
                    setForm({ ...form, image_urls: urls });
                  }}
                  placeholder="https://..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />
                {form.image_urls.length > 1 && (
                  <button
                    onClick={() => {
                      const urls = form.image_urls.filter((_, j) => j !== i);
                      setForm({ ...form, image_urls: urls });
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() =>
                setForm({ ...form, image_urls: [...form.image_urls, ''] })
              }
              className="text-sm text-blue-600 hover:underline"
            >
              + Add image URL
            </button>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tags (comma-separated)
            </label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="casual, cotton, summer"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              Active
            </label>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
