'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ShopSetting } from '@/types/database'
import { Save } from 'lucide-react'

const SETTING_GROUPS = [
  {
    label: 'Business Info',
    keys: ['shop_name', 'shop_tagline', 'shop_address', 'shop_phone', 'shop_email'],
  },
  {
    label: 'Operating Hours',
    keys: ['business_hours'],
  },
  {
    label: 'Delivery',
    keys: ['delivery_areas', 'delivery_charges'],
  },
  {
    label: 'Payment',
    keys: ['payment_methods', 'bank_details'],
  },
  {
    label: 'Policies',
    keys: ['return_policy', 'exchange_policy'],
  },
  {
    label: 'Notifications',
    keys: ['handover_notification'],
  },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, ShopSetting>>({})
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase.from('shop_settings').select('*')
        const map: Record<string, ShopSetting> = {}
        const vals: Record<string, string> = {}
        for (const s of data || []) {
          map[s.key] = s
          vals[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value, null, 2)
        }
        setSettings(map)
        setEditValues(vals)
      } catch {
        // Supabase not connected
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  async function saveSetting(key: string) {
    setSaving(key)
    try {
      const supabase = createClient()
      let value: unknown
      try {
        value = JSON.parse(editValues[key])
      } catch {
        value = editValues[key]
      }
      await supabase.from('shop_settings').update({ value: value as ShopSetting['value'] }).eq('key', key)
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Shop Settings</h1>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Shop Settings</h1>

      {Object.keys(settings).length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
          No settings found. Run the seed script to initialize shop settings.
        </div>
      ) : (
        SETTING_GROUPS.map((group) => (
          <div key={group.label} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">{group.label}</h2>
            <div className="space-y-4">
              {group.keys.map((key) => {
                if (!settings[key]) return null
                const isJson = typeof settings[key].value === 'object'
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </label>
                    <div className="flex gap-2">
                      {isJson ? (
                        <textarea
                          value={editValues[key] || ''}
                          onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                          rows={4}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={editValues[key] || ''}
                          onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      )}
                      <button
                        onClick={() => saveSetting(key)}
                        disabled={saving === key}
                        className="shrink-0 rounded-lg bg-gray-900 px-3 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                      >
                        {saved === key ? 'Saved!' : <Save className="h-4 w-4" />}
                      </button>
                    </div>
                    {settings[key].description && (
                      <p className="mt-1 text-xs text-gray-400">{settings[key].description}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
