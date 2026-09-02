'use client'

import React, { useState } from 'react'
import { Location } from '@/types/location'
import { Review } from '@/types/review'
import { DashboardStats } from '@/app/actions/stats'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/ui/metric-card'
import { AddLocationModal } from '@/components/add-location-modal'
import { ReviewsFeed } from '@/components/reviews-feed'
import { deleteLocation } from '@/app/actions/locations'
import { triggerReviewSync } from '@/app/actions/sync'

interface DashboardClientProps {
  initialLocations: Location[]
  initialStats: DashboardStats
  initialReviews: Review[]
}

export function DashboardClient({
  initialLocations,
  initialStats,
  initialReviews,
}: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const res = await triggerReviewSync()
      alert(`Sync completed! ${res.syncedCount} review items processed across active channels.`)
    } catch (err: any) {
      alert(err.message || 'Failed to sync platform channels')
    } finally {
      setIsSyncing(false)
    }
  }

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
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Overview of store metrics, performance, and customer feedback.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? 'Syncing...' : '↻ Sync Data'}
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Add Location
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Locations"
          value={initialStats.totalLocations}
          subtitle={`${initialStats.activeLocations} active`}
        />
        <MetricCard
          title="Total Reviews"
          value={initialStats.totalReviews}
          subtitle="Across all channels"
        />
        <MetricCard
          title="Average Rating"
          value={initialStats.averageRating > 0 ? `${initialStats.averageRating} ★` : 'N/A'}
          subtitle="Target: 4.5+"
        />
        <MetricCard
          title="Pending Responses"
          value={initialStats.pendingResponses}
          subtitle="Requires attention"
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Left Column: Locations */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-white">Locations</h2>

          {initialLocations.length === 0 ? (
            <Card className="p-12 text-center border-[#1e2d3d] bg-[#111c26]">
              <h3 className="text-lg font-medium text-white mb-1">No locations added yet</h3>
              <p className="text-sm text-slate-400 mb-6">
                Get started by adding your first store location.
              </p>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Add Your First Location
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialLocations.map((loc) => (
                <Card key={loc.id} className="p-5 border-[#1e2d3d] bg-[#111c26] flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-semibold text-white truncate max-w-[180px]">
                        {loc.name}
                      </h3>
                      <Badge variant={loc.status === 'active' ? 'teal' : 'slate'}>
                        {loc.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <p>{loc.address}</p>
                      <p>{loc.city}, {loc.state} {loc.zip_code}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#1e2d3d] flex items-center justify-between text-xs">
                    {loc.website ? (
                      <a
                        href={loc.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 hover:underline truncate max-w-[120px]"
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
        </div>

        {/* Right Column: Recent Reviews Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Recent Reviews</h2>
          <ReviewsFeed reviews={initialReviews} />
        </div>
      </div>

      <AddLocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}