import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Overview
        </h1>
        <Button variant="primary">Add Location</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm font-medium text-slate-400">Total Locations</p>
          <p className="text-3xl font-bold text-white mt-2">0</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-400">Average Rating</p>
          <p className="text-3xl font-bold text-teal-400 mt-2">--</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-400">Pending Reviews</p>
          <p className="text-3xl font-bold text-white mt-2">0</p>
        </Card>
      </div>
    </div>
  )
}