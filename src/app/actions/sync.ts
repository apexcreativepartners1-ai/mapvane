'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { ReviewSyncEngine } from '@/lib/connectors/sync-engine'

async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
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
}

export async function triggerReviewSync(locationId?: string) {
  const supabase = await getSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get active location IDs to sync
  let targetLocationIds: string[] = []

  if (locationId) {
    targetLocationIds = [locationId]
  } else {
    const { data: locations, error } = await supabase.from('locations').select('id')
    if (error) throw new Error(error.message)
    targetLocationIds = (locations || []).map((l) => l.id)
  }

  if (targetLocationIds.length === 0) {
    return { success: true, syncedCount: 0, message: 'No locations available to sync.' }
  }

  const syncEngine = new ReviewSyncEngine()
  let totalSynced = 0

  for (const locId of targetLocationIds) {
    const { rawReviews } = await syncEngine.fetchRawReviewsForLocation(locId)

    if (rawReviews.length > 0) {
      const dbPayloads = rawReviews.map((r) => ({
        location_id: locId,
        user_id: user.id,
        platform: r.platform,
        external_id: r.externalId,
        author_name: r.authorName,
        rating: r.rating,
        content: r.content,
        review_date: r.reviewDate,
        status: 'unanswered',
      }))

      // Upsert into Supabase to prevent duplicate reviews
      const { error: insertError } = await supabase
        .from('reviews')
        .upsert(dbPayloads, {
          onConflict: 'location_id,platform,external_id',
          ignoreDuplicates: true,
        })

      if (insertError) {
        console.error('Upsert Error:', insertError)
        throw new Error(insertError.message)
      }

      totalSynced += rawReviews.length
    }
  }

  revalidatePath('/dashboard')
  return { success: true, syncedCount: totalSynced }
}