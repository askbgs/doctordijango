'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Product, ProductVariant } from '@/types/database';
import { CATEGORIES, CATEGORY_LABELS, GENDERS } from '@/types/database';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
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

  const [newVariant, setNewVariant] = useState({
    size: '',
    colour: '',
    sku: '',
    available_quantity: '0',
  });

  useEffect(() => {
    async function fetchProduct() {
      try {
        const supabase = createClient();
        const { data: p } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        if (p) {
          setProduct(p);
          setForm({
            name: p.name,
            sku: p.sku,
            description: p.description || '',
            category: p.category,
            brand: p.brand || '',
            gender: p.gender,
            base_price: String(p.base_price),
            sale_price: p.sale_price ? String(p.sale_price) : '',
            image_urls: p.image_urls?.length ? p.image_urls : [''],
            tags: (p.tags || []).join(', '),
            is_active: p.is_active,
          });
        }

        const { data: v } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productId)
          .order('size')
          .order('colour');
        setVariants(v || []);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .update({
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
        .eq('id', productId);
      if (error) throw error;
      setMessage('Product saved successfully.');
    } catch (err: unknown) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Failed to save'}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddVariant() {
    if (!newVariant.size || !newVariant.colour || !newVariant.sku) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: productId,
          size: newVariant.size,
          colour: newVariant.colour,
          sku: newVariant.sku,
          available_quantity: parseInt(newVariant.available_quantity) || 0,
        })
        .select()
        .single();
      if (error) throw error;
      if (data) setVariants((prev) => [...prev, data]);
      setNewVariant({ size: '', colour: '', sku: '', available_quantity: '0' });
    } catch (err: unknown) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Failed to add variant'}`);
    }
  }

  async function handleUpdateVariantQty(variantId: string, qty: number) {
    try {
      const supabase = createClient();
      await supabase
        .from('product_variants')
        .update({ available_quantity: qty })
        .eq('id', variantId);
      setVariants((prev) =>
        prev.map((v) =>
          v.id === variantId ? { ...v, available_quantity: qty } : v
        )
      );
    } catch {
      // handle error
    }
  }

  async function handleDeleteProduct() {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.'))
      return;
    try {
      const supabase = createClient();
      await supabase.from('product_variants').delete().eq('product_id', productId);
      await supabase.from('products').delete().eq('id', productId);
      router.push('/products');
    } catch (err: unknown) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Failed to delete'}`);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center">
        <p className="text-gray-500">Product not found.</p>
        <button
          onClick={() => router.push('/products')}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Back to Products
        </button>
      </div>
    );
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
        <h1 className="text-2xl font-bold">Edit Product</h1>
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
        <h2 className="mb-4 text-lg font-semibold">Product Details</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            />
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
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            >
              <option value="">Select...</option>
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
              Base Price (LKR)
            </label>
            <input
              type="number"
              value={form.base_price}
              onChange={(e) =>
                setForm({ ...form, base_price: e.target.value })
              }
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

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Product'}
          </button>
          <button
            onClick={handleDeleteProduct}
            className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Variants</h2>
        {variants.length > 0 && (
          <table className="mb-4 w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-2 font-medium text-gray-500">Size</th>
                <th className="px-4 py-2 font-medium text-gray-500">Colour</th>
                <th className="px-4 py-2 font-medium text-gray-500">SKU</th>
                <th className="px-4 py-2 font-medium text-gray-500">Available</th>
                <th className="px-4 py-2 font-medium text-gray-500">Reserved</th>
                <th className="px-4 py-2 font-medium text-gray-500">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variants.map((v) => (
                <tr key={v.id}>
                  <td className="px-4 py-2">{v.size}</td>
                  <td className="px-4 py-2">{v.colour}</td>
                  <td className="px-4 py-2 text-gray-500">{v.sku}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={v.available_quantity}
                      onChange={(e) =>
                        handleUpdateVariantQty(
                          v.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                      min={0}
                    />
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {v.reserved_quantity}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        v.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {v.is_active ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="rounded-lg border border-dashed border-gray-300 p-4">
          <h3 className="mb-3 text-sm font-medium">Add Variant</h3>
          <div className="flex flex-wrap gap-3">
            <input
              placeholder="Size (e.g. M, L, XL)"
              value={newVariant.size}
              onChange={(e) =>
                setNewVariant({ ...newVariant, size: e.target.value })
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Colour"
              value={newVariant.colour}
              onChange={(e) =>
                setNewVariant({ ...newVariant, colour: e.target.value })
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Variant SKU"
              value={newVariant.sku}
              onChange={(e) =>
                setNewVariant({ ...newVariant, sku: e.target.value })
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Qty"
              value={newVariant.available_quantity}
              onChange={(e) =>
                setNewVariant({
                  ...newVariant,
                  available_quantity: e.target.value,
                })
              }
              className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              min={0}
            />
            <button
              onClick={handleAddVariant}
              className="flex items-center gap-1 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
