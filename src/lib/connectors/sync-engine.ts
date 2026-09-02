import { PlatformConnector, RawExternalReview } from '@/types/connector'
import { MockGoogleConnector, MockAppleConnector, MockYelpConnector } from './mock-adapters'

export class ReviewSyncEngine {
  private connectors: PlatformConnector[] = []

  constructor() {
    this.connectors = [
      new MockGoogleConnector(),
      new MockAppleConnector(),
      new MockYelpConnector(),
    ]
  }

  async fetchRawReviewsForLocation(locationId: string): Promise<{ rawReviews: RawExternalReview[]; errors: string[] }> {
    const rawReviews: RawExternalReview[] = []
    const errors: string[] = []

    for (const connector of this.connectors) {
      try {
        const fetched = await connector.fetchReviews(locationId)
        rawReviews.push(...fetched)
      } catch (err: any) {
        errors.push(`Failed to sync ${connector.platform}: ${err.message}`)
      }
    }

    return { rawReviews, errors }
  }
}