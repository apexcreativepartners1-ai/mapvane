import { getLocations } from '@/app/actions/locations'
import { getDashboardStats } from '@/app/actions/stats'
import { DashboardClient } from '@/components/dashboard-client'

export default async function DashboardPage() {
  const [locations, stats] = await Promise.all([
    getLocations(),
    getDashboardStats(),
  ])

  return <DashboardClient initialLocations={locations} initialStats={stats} />
}