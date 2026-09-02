'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Review, CreateReviewInput } from '@/types/review'

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

export async function getReviews(locationId?: string): Promise<Review[]> {
  const supabase = await getSupabaseServerClient()
  
  let query = supabase.from('reviews').select('*').order('review_date', { ascending: false })
  
  if (locationId) {
    query = query.eq('location_id', locationId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching reviews:', error.message)
    return []
  }

  return data as Review[]
}

export async function addReview(formData: CreateReviewInput) {
  const supabase = await getSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('reviews')
    .insert([
      {
        ...formData,
        user_id: user.id,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  return data
}