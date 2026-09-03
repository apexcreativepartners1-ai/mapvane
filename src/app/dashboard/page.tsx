import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InteractiveDashboard from '@/components/dashboard/interactive-dashboard'
import { DashboardHeader } from '@/components/dashboard-header'

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

  const storeId = locations?.[0]?.id

  const { data: googleCredential } = storeId
    ? await supabase
        .from('platform_credentials')
        .select('id')
        .eq('store_id', storeId)
        .eq('platform', 'google')
        .maybeSingle()
    : { data: null }

  const locationIds = locations?.map((l) => l.id) || []

  const { data: rawReviews } = locationIds.length > 0
    ? await supabase
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
    : { data: [] }

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
  <div className="min-h-screen bg-slate-950 p-6 md:p-10 space-y-8">
    <DashboardHeader
      storeId={storeId}
      isGoogleConnected={Boolean(googleCredential)}
    />
    
    <InteractiveDashboard 
      locations={locations || []}
      locationsWithStats={locationStats} 
      reviews={formattedReviews} 
    />
  </div>
)
}