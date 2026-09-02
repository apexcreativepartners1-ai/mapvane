export type PlatformType = 'google' | 'apple' | 'yelp' | 'facebook' | 'manual'
export type ReviewStatus = 'unanswered' | 'responded' | 'flagged'

export interface Review {
  id: string
  location_id: string
  user_id: string
  platform: PlatformType
  author_name: string
  author_avatar?: string | null
  rating: number
  content?: string | null
  review_date: string
  response_text?: string | null
  response_date?: string | null
  status: ReviewStatus
  created_at: string
}

export type CreateReviewInput = Omit<Review, 'id' | 'user_id' | 'created_at'>