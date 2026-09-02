'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface DashboardStats {
  totalLocations: number
  activeLocations: number
  totalReviews: number
  averageRating: number
  pendingResponses: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handled in middleware
          }
        },
      },
    }
  )

  const [locationsRes, reviewsRes] = await Promise.all([
    supabase.from('locations').select('status'),
    supabase.from('reviews').select('rating, status'),
  ])

  const locations = locationsRes.data || []
  const reviews = reviewsRes.data || []

  const totalLocations = locations.length
  const activeLocations = locations.filter((l) => l.status === 'active').length
  const totalReviews = reviews.length

  const sumRating = reviews.reduce((acc, r) => acc + r.rating, 0)
  const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0
  const pendingResponses = reviews.filter((r) => r.status === 'unanswered').length

  return {
    totalLocations,
    activeLocations,
    totalReviews,
    averageRating,
    pendingResponses,
  }
}