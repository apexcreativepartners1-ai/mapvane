'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface DashboardStats {
  totalLocations: number
  activeLocations: number
  totalReviews: number
  averageRating: number
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

  // Fetch count of locations (RLS automatically scopes to user)
  const { data: locations, error } = await supabase
    .from('locations')
    .select('status')

  if (error || !locations) {
    return {
      totalLocations: 0,
      activeLocations: 0,
      totalReviews: 0,
      averageRating: 0,
    }
  }

  const totalLocations = locations.length
  const activeLocations = locations.filter((l) => l.status === 'active').length

  // Placeholder review aggregates until Day 5 schema integration
  return {
    totalLocations,
    activeLocations,
    totalReviews: 0,
    averageRating: 0.0,
  }
}