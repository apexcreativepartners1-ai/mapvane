import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InteractiveDashboard from '@/components/dashboard/interactive-dashboard'
import { Sparkles, BarChart3, RefreshCw } from 'lucide-react'

export interface LocationWithStats {
  id: string
  name: string
  address: string
  city: string
  totalReviews: number
  avgRating: number
  unansweredCount: number
}

export interface ReviewRecord {
  id: string
  location_id: string
  location_name: string
  platform: 'google' | 'apple' | 'yelp'
  author_name: string
  author_avatar?: string
  rating: number
  content: string
  review_date: string
  is_answered: boolean
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, address, city')
    .eq('user_id', user.id)

  const locationIds = locations?.map((l) => l.id) || []

  const { data: rawReviews } = await supabase
    .from('reviews')
    .select(`
      id,
      location_id,
      platform,
      author_name,
      author_avatar,
      rating,
      content,
      review_date,
      is_answered,
      locations ( name )
    `)
    .in('location_id', locationIds)
    .order('review_date', { ascending: false })

  const locationStats: LocationWithStats[] = (locations || []).map((loc) => {
    const storeReviews = (rawReviews || []).filter((r) => r.location_id === loc.id)
    const totalReviews = storeReviews.length
    const avgRating =
      totalReviews > 0
        ? Number((storeReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
        : 0
    const unansweredCount = storeReviews.filter((r) => !r.is_answered).length

    return {
      ...loc,
      totalReviews,
      avgRating,
      unansweredCount,
    }
  })

  const formattedReviews: ReviewRecord[] = (rawReviews || []).map((r: any) => ({
    id: r.id,
    location_id: r.location_id,
    location_name: r.locations?.name || 'Unknown Location',
    platform: r.platform,
    author_name: r.author_name,
    author_avatar: r.author_avatar,
    rating: r.rating,
    content: r.content,
    review_date: r.review_date,
    is_answered: r.is_answered ?? false,
  }))

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 border border-slate-800 shadow-xl mb-8">
      {/* Background glow effect */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MapVane Intelligence Hub</span>
          </div>

          {/* Main Title with High-Contrast Gradient */}
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Store Analytics & <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">Reviews</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-slate-400 max-w-xl">
            Real-time performance metrics and sentiment-aware management across your entire store network.
          </p>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">Live Sync Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}