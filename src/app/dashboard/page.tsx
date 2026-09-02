import { getLocations } from '@/app/actions/locations'
import { getDashboardStats } from '@/app/actions/stats'
import { getReviews } from '@/app/actions/reviews'
import { DashboardClient } from '@/components/dashboard-client'

export default async function DashboardPage() {
  const [locations, stats, reviews] = await Promise.all([
    getLocations(),
    getDashboardStats(),
    getReviews(),
  ])

  return (
    <DashboardClient
      initialLocations={locations}
      initialStats={stats}
      initialReviews={reviews}
    />
  )
}