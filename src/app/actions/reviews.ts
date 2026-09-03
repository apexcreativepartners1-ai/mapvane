'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// 1. Reply to a single review
export async function replyToReview(reviewId: string, replyText: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('reviews')
    .update({
      is_answered: true,
      reply_content: replyText,
    })
    .eq('id', reviewId)

  if (error) {
    console.error('Error replying to review:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

// 2. Reply to multiple reviews in bulk
export async function bulkReplyToReviews(reviewIds: string[], replyText: string) {
  if (!reviewIds || reviewIds.length === 0) {
    return { success: false, error: 'No review IDs provided' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('reviews')
    .update({ is_answered: true, reply_content: replyText })
    .in('id', reviewIds)

  if (error) {
    console.error('Error in bulk review reply:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}