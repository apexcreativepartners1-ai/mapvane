import { createClient } from '@/lib/supabase/server'
import { ReviewRecord } from '@/app/dashboard/page'

export async function getValidGoogleAccessToken(storeId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data: creds } = await supabase
    .from('platform_credentials')
    .select('*')
    .eq('store_id', storeId)
    .eq('platform', 'google')
    .single()

  if (!creds) return null

  const isExpired = new Date(creds.token_expires_at).getTime() - Date.now() < 5 * 60 * 1000

  if (!isExpired) {
    return creds.access_token
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: creds.refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    const data = await response.json()
    if (!response.ok || !data.access_token) {
      throw new Error(data.error_description || 'Failed to refresh Google token')
    }

    const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

    await supabase
      .from('platform_credentials')
      .update({
        access_token: data.access_token,
        token_expires_at: newExpiresAt,
      })
      .eq('id', creds.id)

    return data.access_token
  } catch (error) {
    console.error('Failed to refresh Google token:', error)
    return null
  }
}

export interface PlatformConnector {
  fetchReviews(locationId: string, externalAccountId: string): Promise<Partial<ReviewRecord>[]>
  sendReply(reviewExternalId: string, replyText: string, accessToken: string): Promise<boolean>
}

export class LiveGoogleConnector implements PlatformConnector {
  async fetchReviews(locationId: string, googleLocationName: string): Promise<Partial<ReviewRecord>[]> {
    // 1. Retrieve active OAuth access token from Supabase/Vault
    // 2. Fetch reviews from Google Business Profile API v1
    // Endpoint: GET https://mybusiness.googleapis.com/v4/{parent=accounts/*/locations/*}/reviews
    
    // Abstracted return structure matching Postgres schema:
    return []
  }

  async sendReply(reviewExternalId: string, replyText: string, accessToken: string): Promise<boolean> {
    // Endpoint: POST https://mybusiness.googleapis.com/v4/{name=accounts/*/locations/*/reviews/*}/reply
    try {
      const response = await fetch(
        `https://mybusiness.googleapis.com/v4/${reviewExternalId}/reply`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment: replyText }),
        }
      )
      return response.ok
    } catch (error) {
      console.error('Failed to dispatch reply to Google GBP:', error)
      return false
    }
  }
}