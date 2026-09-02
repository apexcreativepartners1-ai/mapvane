export type PlatformType = 'google' | 'apple' | 'yelp' | 'facebook' | 'manual'

export interface RawExternalReview {
  externalId: string
  authorName: string
  authorAvatar?: string
  rating: number
  content: string
  reviewDate: string // ISO String
  platform: PlatformType
}

export interface PlatformConnector {
  platform: PlatformType
  fetchReviews(externalLocationId: string): Promise<RawExternalReview[]>
}