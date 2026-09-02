import { PlatformConnector, RawExternalReview } from '@/types/connector'

export class MockGoogleConnector implements PlatformConnector {
  platform = 'google' as const

  async fetchReviews(externalLocationId: string): Promise<RawExternalReview[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return [
      {
        externalId: 'g_rev_101',
        authorName: 'Sarah Jenkins',
        authorAvatar: 'https://i.pravatar.cc/150?u=sarah',
        rating: 5,
        content: 'Absolute top-notch service! The staff was attentive and store was spotless.',
        reviewDate: '2026-03-01T10:00:00Z',
        platform: 'google',
      },
      {
        externalId: 'g_rev_102',
        authorName: 'Michael Brown',
        rating: 2,
        content: 'Long wait times during lunch peak. Quality of service has dropped recently.',
        reviewDate: '2026-03-01T11:30:00Z',
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
        externalId: 'a_rev_201',
        authorName: 'David K.',
        rating: 4,
        content: 'Great experience overall. Easy to find location and parking.',
        reviewDate: '2026-03-01T14:15:00Z',
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
        externalId: 'y_rev_301',
        authorName: 'Amanda L.',
        rating: 1,
        content: 'Extremely disappointing customer care. Unfriendly representative.',
        reviewDate: '2026-03-01T16:45:00Z',
        platform: 'yelp',
      },
    ]
  }
}