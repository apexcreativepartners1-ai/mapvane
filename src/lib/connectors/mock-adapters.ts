import { createClient } from '@/lib/supabase/server'
import { PlatformConnector, RawExternalReview } from '@/types/connector'

async function getMockDataFromDb(platform: string, externalLocationId: string): Promise<RawExternalReview[]> {
  const supabase = await createClient()

  // Fetch templates assigned specifically to this location ID, OR unassigned generic templates
  const { data: templates, error } = await supabase
    .from('mock_review_templates')
    .select('*')
    .eq('platform', platform)
    .or(`location_id.eq.${externalLocationId},location_id.is.null`)

  if (error || !templates) {
    console.error(`Error fetching mock templates for ${platform}:`, error)
    return []
  }

  return templates.map((t) => ({
    externalId: `${t.template_key}_${externalLocationId.slice(0, 8)}`,
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