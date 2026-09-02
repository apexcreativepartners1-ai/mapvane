import { getLocations } from '@/app/actions/locations'
import { DashboardClient } from '@/components/dashboard-client'

export default async function DashboardPage() {
  const locations = await getLocations()

  return <DashboardClient initialLocations={locations} />
}