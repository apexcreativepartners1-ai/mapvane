import { createClient } from '@/lib/supabase/server'
import { PlatformConnector, RawExternalReview } from '@/types/connector'

async function getMockDataFromDb(platform: string, externalLocationId: string): Promise<RawExternalReview[]> {
  const supabase = await createClient()

  // Query templates strictly matching this location and platform
  const { data: templates, error } = await supabase
    .from('mock_review_templates')
    .select('*')
    .eq('platform', platform)
    .eq('location_id', externalLocationId)

  if (error) {
    console.error(`Error fetching mock templates for ${platform}:`, error)
    return []
  }

  if (!templates || templates.length === 0) {
    return []
  }

  return templates.map((t) => ({
    externalId: t.template_key, // Use static template_key directly as external_id
    authorName: t.author_name,
    authorAvatar: t.author_avatar || `https://i.pravatar.cc/150?u=${t.template_key}`,
    rating: t.rating,
    content: t.content,
    reviewDate: new Date().toISOString(),
    platform: t.platform as 'google' | 'apple' | 'yelp',
  }))
}

export class MockGoogleConnector implements PlatformConnector {
  platform = 'google' as const
  async fetchReviews(externalLocationId: string) {
    return getMockDataFromDb('google', externalLocationId)
  }
}

export class MockAppleConnector implements PlatformConnector {
  platform = 'apple' as const
  async fetchReviews(externalLocationId: string) {
    return getMockDataFromDb('apple', externalLocationId)
  }
}

export class MockYelpConnector implements PlatformConnector {
  platform = 'yelp' as const
  async fetchReviews(externalLocationId: string) {
    return getMockDataFromDb('yelp', externalLocationId)
  }
}