'use client'

import React, { useState } from 'react'
import { Location } from '@/types/location'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AddLocationModal } from '@/components/add-location-modal'
import { deleteLocation } from '@/app/actions/locations'

interface DashboardClientProps {
  initialLocations: Location[]
}

export function DashboardClient({ initialLocations }: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return
    setDeletingId(id)
    try {
      await deleteLocation(id)
    } catch (err: any) {
      alert(err.message || 'Failed to delete location')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Store Locations</h1>
          <p className="text-sm text-slate-400">
            Manage your physical business locations and monitoring targets.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Add Location
        </Button>
      </div>

      {/* Locations List / Empty State */}
      {initialLocations.length === 0 ? (
        <Card className="p-12 text-center border-[#1e2d3d] bg-[#111c26]">
          <h3 className="text-lg font-medium text-white mb-1">No locations added yet</h3>
          <p className="text-sm text-slate-400 mb-6">
            Get started by adding your first store location to monitor reviews.
          </p>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Add Your First Location
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialLocations.map((loc) => (
            <Card key={loc.id} className="p-5 border-[#1e2d3d] bg-[#111c26] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-white truncate max-w-[200px]">
                    {loc.name}
                  </h3>
                  <Badge variant={loc.status === 'active' ? 'teal' : 'slate'}>
                    {loc.status}
                  </Badge>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p>{loc.address}</p>
                  <p>{loc.city}, {loc.state} {loc.zip_code}</p>
                  {loc.phone && <p className="text-slate-500">{loc.phone}</p>}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#1e2d3d] flex items-center justify-between text-xs">
                {loc.website ? (
                  <a
                    href={loc.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-400 hover:underline truncate max-w-[150px]"
                  >
                    Visit website
                  </a>
                ) : <span />}
                
                <button
                  onClick={() => handleDelete(loc.id)}
                  disabled={deletingId === loc.id}
                  className="text-rose-400 hover:text-rose-300 font-medium"
                >
                  {deletingId === loc.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}