import { PlatformConnector, RawExternalReview } from '@/types/connector'

export class MockGoogleConnector implements PlatformConnector {
  platform = 'google' as const

  async fetchReviews(externalLocationId: string): Promise<RawExternalReview[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return [
      {
        externalId: `g_rev_${Date.now()}_1`,
        authorName: 'Sarah Jenkins',
        authorAvatar: 'https://i.pravatar.cc/150?u=sarah',
        rating: 5,
        content: 'Absolute top-notch service! The staff was attentive and store was spotless.',
        reviewDate: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
        platform: 'google',
      },
      {
        externalId: `g_rev_${Date.now()}_2`,
        authorName: 'Michael Brown',
        rating: 2,
        content: 'Long wait times during lunch peak. Quality of service has dropped recently.',
        reviewDate: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        platform: 'google',
      },
    ]
  }
}

export class MockAppleConnector implements PlatformConnector {
  platform = 'apple' as const

  async fetchReviews(externalLocationId: string): Promise<RawExternalReview[]> {
    await new Promise((resolve) => setTimeout(resolve, 250))

    return [
      {
        externalId: `a_rev_${Date.now()}_1`,
        authorName: 'David K.',
        rating: 4,
        content: 'Great experience overall. Easy to find location and parking.',
        reviewDate: new Date(Date.now() - 3600000 * 12).toISOString(),
        platform: 'apple',
      },
    ]
  }
}

export class MockYelpConnector implements PlatformConnector {
  platform = 'yelp' as const

  async fetchReviews(externalLocationId: string): Promise<RawExternalReview[]> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    return [
      {
        externalId: `y_rev_${Date.now()}_1`,
        authorName: 'Amanda L.',
        rating: 1,
        content: 'Extremely disappointing customer care. Unfriendly representative.',
        reviewDate: new Date(Date.now() - 3600000 * 48).toISOString(),
        platform: 'yelp',
      },
    ]
  }
}