'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addLocation } from '@/app/actions/locations'

interface AddLocationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddLocationModal({ isOpen, onClose }: AddLocationModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    website: '',
    status: 'active' as const,
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await addLocation(form)
      onClose()
      setForm({
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        phone: '',
        website: '',
        status: 'active',
      })
    } catch (err: any) {
      setError(err.message || 'Failed to create location')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-[#1e2d3d] bg-[#111c26] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1e2d3d] pb-4 mb-4">
          <h2 className="text-lg font-bold text-white">Add New Location</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {error && (
          <div className="mb-4 p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Location Name"
            placeholder="e.g. Downtown Flagship"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Street Address"
            placeholder="123 Main St"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              placeholder="Austin"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
            <Input
              label="State"
              placeholder="TX"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              required
            />
            <Input
              label="Zip Code"
              placeholder="78701"
              value={form.zip_code}
              onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone (Optional)"
              placeholder="(512) 555-0199"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Website (Optional)"
              placeholder="https://example.com"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#1e2d3d]">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Location'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}