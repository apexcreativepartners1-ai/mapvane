import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InteractiveDashboard from '@/components/dashboard/interactive-dashboard'

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
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Store Analytics & Reviews
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Real-time performance metrics across your store network.
          </p>
        </div>
      </div>

      <InteractiveDashboard
        locationsWithStats={locationStats}
        locations={locations || []}
        reviews={formattedReviews}
      />
    </div>
  )
}