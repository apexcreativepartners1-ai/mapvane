import { MessageSquare, MapPin, Star, Clock } from 'lucide-react'
import { DashboardStats } from '@/app/actions/stats'
import { MetricCard } from '@/components/ui/metric-card'

interface StatsHeaderProps {
  stats: DashboardStats
}

export default function StatsHeader({ stats }: StatsHeaderProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Locations"
        value={stats.totalLocations}
        subtitle={`${stats.activeLocations} active`}
        icon={<MapPin className="h-5 w-5" />}
      />
      <MetricCard
        title="Total Reviews"
        value={stats.totalReviews}
        subtitle="Across all channels"
        icon={<MessageSquare className="h-5 w-5" />}
      />
      <MetricCard
        title="Average Rating"
        value={stats.averageRating > 0 ? `${stats.averageRating} ★` : 'N/A'}
        subtitle="Target: 4.5+"
        icon={<Star className="h-5 w-5" />}
      />
      <MetricCard
        title="Pending Responses"
        value={stats.pendingResponses}
        subtitle="Requires attention"
        icon={<Clock className="h-5 w-5" />}
      />
    </div>
  )
}
