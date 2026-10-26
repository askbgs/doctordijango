'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ShopSetting } from '@/types/database'
import { Save, Bot } from 'lucide-react'

const AI_KEYS = [
  { key: 'ai_tone', label: 'AI Personality Tone', help: 'Controls how the AI agent communicates. Options: friendly_professional, formal, casual' },
  { key: 'supported_languages', label: 'Supported Languages', help: 'Languages the AI can respond in. JSON array, e.g. ["en","ta","si"]' },
  { key: 'default_language', label: 'Default Language', help: 'Fallback language if detection fails' },
]

export default function AISettingsPage() {
  const [, setSettings] = useState<Record<string, ShopSetting>>({})
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('shop_settings')
          .select('*')
          .in('key', AI_KEYS.map((k) => k.key))
        const map: Record<string, ShopSetting> = {}
        const vals: Record<string, string> = {}
        for (const s of data || []) {
          map[s.key] = s
          vals[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value, null, 2)
        }
        setSettings(map)
        setEditValues(vals)
      } catch {
        // not connected
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  async function saveSetting(key: string) {
    setSaving(key)
    try {
      const supabase = createClient()
      let value: unknown
      try { value = JSON.parse(editValues[key]) } catch { value = editValues[key] }
      await supabase.from('shop_settings').update({ value: value as ShopSetting['value'] }).eq('key', key)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-bold">AI Settings</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">AI Model Configuration</h2>
        <p className="mb-4 text-sm text-gray-500">
          The AI model and API key are configured via environment variables in n8n.
          These settings control the agent&apos;s behavior.
        </p>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {AI_KEYS.map(({ key, label, help }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editValues[key] || ''}
                    onChange={(e) => setEditValues({ ...editValues, [key]: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    onClick={() => saveSetting(key)}
                    disabled={saving === key}
                    className="shrink-0 rounded-lg bg-gray-900 px-3 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">{help}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">AI Safety Rules</h2>
        <p className="mb-4 text-sm text-gray-500">
          These rules are enforced in the AI system prompt and cannot be modified from the dashboard for security reasons.
        </p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>- Never invent products, prices, or stock levels</li>
          <li>- Never confirm orders without backend verification</li>
          <li>- Never ask for credit card numbers or passwords</li>
          <li>- Never share customer data between customers</li>
          <li>- Escalate complaints and refunds to human staff</li>
          <li>- Maximum 5 tool calls per conversation turn</li>
          <li>- 30-second timeout with fallback response</li>
        </ul>
      </div>
    </div>
  )
}
