'use client'

import { useState } from 'react'
import { LocationWithStats, ReviewRecord } from '@/app/dashboard/page'
import LocationKpiCards from './location-kpi-cards'
import ReviewTableSection from './review-table-section'

interface Props {
  locationsWithStats: LocationWithStats[]
  locations: Array<{ id: string; name: string }>
  reviews: ReviewRecord[]
}

export default function InteractiveDashboard({
  locationsWithStats,
  locations,
  reviews,
}: Props) {
  // Shared state connecting Card Clicks to Table Filtering
  const [selectedLocationId, setSelectedLocationId] = useState<string>('ALL')

  // Handler for clicking a card
  const handleSelectLocation = (locationId: string) => {
    // If clicking the already selected location, toggle back to 'ALL'
    setSelectedLocationId((prev) => (prev === locationId ? 'ALL' : locationId))
  }

  return (
    <div className="space-y-8">
      {/* 1. Interactive Location KPI Cards */}
      <LocationKpiCards
        locations={locationsWithStats}
        selectedLocationId={selectedLocationId}
        onSelectLocation={handleSelectLocation}
      />

      {/* 2. Review Table Section with Linked Filter State */}
      <ReviewTableSection
        locations={locations}
        reviews={reviews}
        selectedLocationId={selectedLocationId}
        onLocationChange={setSelectedLocationId}
      />
    </div>
  )
}